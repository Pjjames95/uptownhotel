import { supabase } from '../lib/supabase'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

class MpesaService {
  formatPhoneNumber(phone) {
    if (!phone) return ''
    let cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('0')) cleaned = '254' + cleaned.slice(1)
    else if (cleaned.startsWith('254')) return cleaned
    else if (cleaned.length === 9) cleaned = '254' + cleaned
    return cleaned
  }

  async stkPush(phoneNumber, amount, accountReference, transactionDesc, bookingId, guestId) {
    try {
      console.log('Initiating STK Push via backend...')
      
      const response = await fetch(`${BACKEND_URL}/api/mpesa/stkpush`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber,
          amount,
          accountReference,
          transactionDesc,
          bookingId,
          guestId
        })
      })

      const data = await response.json()
      console.log('STK Push Response:', data)

      const isSuccess = data.ResponseCode === '0' || data.ResponseCode === 0
      
      console.log('📱 isSuccess =', isSuccess, 'ResponseCode =', data.ResponseCode)

      // ALWAYS return immediately with checkoutRequestId
      const result = {
        success: isSuccess,
        merchantRequestId: data.MerchantRequestID,
        checkoutRequestId: data.CheckoutRequestID,
        transactionId: null,
        responseCode: data.ResponseCode,
        responseDescription: data.ResponseDescription,
        customerMessage: data.CustomerMessage
      }

      // Save transaction in the background (don't await it)
      if (isSuccess) {
        // Fire and forget - don't block the return
        this.saveTransaction({
          booking_id: bookingId,
          guest_id: guestId,
          amount: amount,
          phone_number: this.formatPhoneNumber(phoneNumber),
          payment_method: 'mpesa',
          transaction_type: 'booking',
          status: 'pending',
          merchant_request_id: data.MerchantRequestID,
          checkout_request_id: data.CheckoutRequestID,
          response_code: data.ResponseCode,
          response_description: data.ResponseDescription
        }).then(savedTransaction => {
          console.log('📱 Transaction saved in background:', savedTransaction?.id)
        }).catch(e => {
          console.warn('Failed to save transaction in background:', e)
        })
      }
      
      console.log('📱 Returning from stkPush:', result)
      return result
      
    } catch (error) {
      console.error('STK Push Error:', error)
      return {
        success: false,
        error: error.message,
        responseDescription: 'Network error. Please try again.'
      }
    }
  }

  async queryStatus(checkoutRequestId) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/mpesa/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ checkoutRequestId })
      })

      const data = await response.json()
      console.log('Query Response:', data)

      return {
        success: data.ResultCode === '0',
        resultCode: data.ResultCode,
        resultDescription: data.ResultDesc,
        mpesaReceiptNumber: data.MpesaReceiptNumber
      }
    } catch (error) {
      console.error('Query Error:', error)
      return { success: false, error: error.message }
    }
  }

  async saveTransaction(transactionData) {
    try {
      console.log('Saving transaction...')
      const { data, error } = await supabase
        .from('payment_transactions')
        .insert([{
          ...transactionData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Save transaction error:', error)
        return null
      }
      console.log('Transaction saved:', data?.id)
      return data
    } catch (error) {
      console.error('Save transaction exception:', error)
      return null
    }
  }

  async updateTransaction(id, updates) {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Update transaction error:', error)
      return null
    }
  }

  async updateBookingPayment(bookingId, paymentData) {
    try {
      const { data, error } = await supabase
        .from('room_bookings')
        .update({
          payment_method: paymentData.payment_method,
          payment_status: paymentData.payment_status,
          mpesa_receipt: paymentData.mpesa_receipt || null,
          mpesa_transaction_id: paymentData.mpesa_transaction_id || null,
          payment_date: new Date().toISOString(),
          payment_amount: paymentData.amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Update booking payment error:', error)
      return null
    }
  }

  // async updateBookingPayment(bookingId, paymentData) {
  //   try {
  //     const { data, error } = await supabase
  //       .from('room_bookings')
  //       .update({
  //         payment_method: paymentData.payment_method,
  //         payment_status: paymentData.payment_status,
  //         mpesa_receipt: paymentData.mpesa_receipt,
  //         mpesa_transaction_id: paymentData.mpesa_transaction_id,
  //         payment_date: new Date().toISOString(),
  //         payment_amount: paymentData.amount,
  //         updated_at: new Date().toISOString()
  //       })
  //       .eq('id', bookingId)
  //       .select()
  //       .single()

  //     if (error) throw error
  //     return data
  //   } catch (error) {
  //     console.error('Update booking payment error:', error)
  //     return null
  //   }
  // }

  async checkStatus(checkoutRequestId) {
    try {
      console.log('Checking status for:', checkoutRequestId);
      
      const response = await fetch(`${BACKEND_URL}/api/mpesa/status/${checkoutRequestId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Status check response:', data);
      
      return {
        status: data.status, // 'Pending', 'Success', 'Failed', 'Cancelled', 'Timeout'
        message: data.message,
        resultCode: data.resultCode,
        mpesaReceiptNumber: data.mpesaReceiptNumber
      };
    } catch (error) {
      console.error('Status check error:', error);
      return {
        status: 'Error',
        message: 'Failed to check status'
      };
    }
  }
}

export default new MpesaService()