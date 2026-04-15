import React, { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import mpesaService from '../../services/mpesaService'
import toast from 'react-hot-toast'
import { XMarkIcon, PhoneIcon, CreditCardIcon, BanknotesIcon } from '@heroicons/react/24/outline'

const PaymentModal = ({ booking, onClose, onSuccess }) => {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone || '')
  const [paymentStep, setPaymentStep] = useState('select')
  const pollingIntervalRef = useRef(null)

  // Clean up polling on unmount
  React.useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  const pollPaymentStatus = (checkoutRequestId, transactionId) => {
    console.log('🔄 Starting polling for:', checkoutRequestId)
    
    let attempts = 0
    const maxAttempts = 30

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    pollingIntervalRef.current = setInterval(async () => {
      attempts++
      
      try {
        console.log(`🔄 Polling attempt ${attempts} for:`, checkoutRequestId)
        
        const status = await mpesaService.checkStatus(checkoutRequestId)
        
        console.log(`🔄 Polling attempt ${attempts} result:`, status)
        
        // CHECK FOR CANCELLATION BY RESULT CODE FIRST
        const isCancelled = status.resultCode === 1032 || 
                            status.status === 'Cancelled' ||
                            (status.status === 'Failed' && status.message?.includes('Cancelled'))
        
        const isSuccess = status.resultCode === 0 || status.status === 'Success'
        
        const isFailed = (status.resultCode === 1) || 
                        (status.status === 'Failed' && !isCancelled)
        
        const isTimeout = status.resultCode === 1037 || status.status === 'Timeout'
        
        const isPending = status.resultCode === 4999 || status.status === 'Pending'
        
        console.log('📊 Status analysis:', { isSuccess, isCancelled, isFailed, isTimeout, isPending })
        
        if (isSuccess) {
          console.log('✅ Payment successful!')
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
          
          if (transactionId) {
            try {
              await mpesaService.updateTransaction(transactionId, {
                status: 'completed',
                mpesa_receipt: status.mpesaReceiptNumber,
                payment_date: new Date().toISOString()
              })
            } catch (e) {
              console.warn('Transaction update warning:', e)
            }
          }

          await mpesaService.updateBookingPayment(booking.id, {
            payment_method: 'mpesa',
            payment_status: 'completed',
            mpesa_receipt: status.mpesaReceiptNumber,
            mpesa_transaction_id: checkoutRequestId,
            amount: booking.total_amount
          })

          setPaymentStep('complete')
          toast.success('Payment successful!')
          
          setTimeout(() => {
            onSuccess?.()
            onClose()
          }, 2000)
          
        } else if (isCancelled) {
          console.log('❌ Payment cancelled detected!')
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
          
          if (transactionId) {
            try {
              await mpesaService.updateTransaction(transactionId, {
                status: 'cancelled',
                result_description: status.message || 'Transaction cancelled'
              })
            } catch (e) {
              console.warn('Transaction update warning:', e)
            }
          }

          toast.error('Payment was cancelled.')
          setPaymentStep('select')
          setLoading(false)
          
        } else if (isFailed) {
          console.log('❌ Payment failed:', status.message)
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
          
          if (transactionId) {
            try {
              await mpesaService.updateTransaction(transactionId, {
                status: 'failed',
                result_description: status.message
              })
            } catch (e) {
              console.warn('Transaction update warning:', e)
            }
          }

          toast.error(status.message || 'Payment failed. Please try again.')
          setPaymentStep('select')
          setLoading(false)
          
        } else if (isTimeout) {
          console.log('⏱️ Payment timeout')
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
          
          if (transactionId) {
            try {
              await mpesaService.updateTransaction(transactionId, {
                status: 'timeout',
                result_description: status.message
              })
            } catch (e) {
              console.warn('Transaction update warning:', e)
            }
          }

          toast.error('Payment timed out. Please try again.')
          setPaymentStep('select')
          setLoading(false)
          
        } else if (attempts >= maxAttempts) {
          console.log('⏱️ Max polling attempts reached')
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
          
          toast.error('Unable to confirm payment status. Please check your M-Pesa message.')
          setPaymentStep('select')
          setLoading(false)
        }
        
      } catch (error) {
        console.error('❌ Polling error:', error)
        if (attempts >= maxAttempts) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
          toast.error('Unable to verify payment. Please contact support.')
          setPaymentStep('select')
          setLoading(false)
        }
      }
    }, 2000)
  }

  const handleMpesaPayment = async () => {
    if (!phoneNumber) {
      toast.error('Please enter your phone number')
      return
    }

    const phoneRegex = /^(\+?254|0)?[71]\d{8}$/
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      toast.error('Please enter a valid Kenyan phone number')
      return
    }

    setLoading(true)
    setPaymentStep('processing')

    try {
      console.log('📱 Starting M-Pesa payment...')
      
      const result = await mpesaService.stkPush(
        phoneNumber,
        booking.total_amount,
        booking.booking_reference || `BK${Date.now()}`,
        `Room Booking`,
        booking.id,
        booking.guest_id
      )

      console.log('📱 STK Push FULL result:', JSON.stringify(result, null, 2))
      console.log('📱 result.success =', result.success, 'type:', typeof result.success)
      console.log('📱 result.checkoutRequestId =', result.checkoutRequestId)

      // Check for success in multiple ways
      const isSuccessful = result.success === true || 
                          result.success === 'true' || 
                          result.ResponseCode === '0' ||
                          result.ResponseCode === 0 ||
                          (result.checkoutRequestId && result.checkoutRequestId.startsWith('ws_CO_'))

      console.log('📱 isSuccessful =', isSuccessful)

      if (isSuccessful && result.checkoutRequestId) {
        console.log('✅ STK Push successful, starting polling...')
        console.log('CheckoutRequestID:', result.checkoutRequestId)
        console.log('TransactionID:', result.transactionId)
        
        toast.success('Payment request sent to your phone. Please enter your M-Pesa PIN.')
        
        // FORCE START POLLING
        pollPaymentStatus(result.checkoutRequestId, result.transactionId)
        
      } else {
        console.log('❌ STK Push failed:', result.responseDescription)
        toast.error(result.responseDescription || 'Failed to initiate payment')
        setPaymentStep('select')
        setLoading(false)
      }
    } catch (error) {
      console.error('❌ Payment error:', error)
      toast.error('Payment failed: ' + error.message)
      setPaymentStep('select')
      setLoading(false)
    }
  }

  const handleCashPayment = async () => {
    setLoading(true)
    try {
      await mpesaService.updateBookingPayment(booking.id, {
        payment_method: 'cash',
        payment_status: 'pending',
        amount: booking.total_amount
      })

      toast.success('Cash payment recorded. Please pay at reception.')
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error('Failed to record payment')
      setLoading(false)
    }
  }

  const handleCardPayment = () => {
    toast.error('Card payments coming soon!')
  }

  const handleCancelPayment = () => {
    stopPolling()
    setPaymentStep('select')
    setLoading(false)
    toast.error('Payment cancelled')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">
              {paymentStep === 'complete' ? 'Payment Complete' : 'Make Payment'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {paymentStep === 'select' && (
            <>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600">Booking Reference</p>
                <p className="font-mono font-semibold text-lg">{booking.booking_reference || 'N/A'}</p>
                <p className="text-sm text-gray-600 mt-2">Amount Due</p>
                <p className="text-2xl font-bold text-blue-600">
                  KES {booking.total_amount?.toLocaleString()}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Payment Method
                </label>
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`w-full p-4 border-2 rounded-lg flex items-center gap-3 transition ${
                    paymentMethod === 'mpesa' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xl">📱</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">M-Pesa</p>
                    <p className="text-sm text-gray-600">Pay via M-Pesa mobile money</p>
                  </div>
                  {paymentMethod === 'mpesa' && (
                    <div className="w-4 h-4 bg-green-600 rounded-full" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full p-4 border-2 rounded-lg flex items-center gap-3 transition ${
                    paymentMethod === 'cash' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <BanknotesIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">Cash</p>
                    <p className="text-sm text-gray-600">Pay at the hotel reception</p>
                  </div>
                  {paymentMethod === 'cash' && (
                    <div className="w-4 h-4 bg-blue-600 rounded-full" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-4 border-2 rounded-lg flex items-center gap-3 transition ${
                    paymentMethod === 'card' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <CreditCardIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">Credit/Debit Card</p>
                    <p className="text-sm text-gray-600">Pay with Visa, Mastercard</p>
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="w-4 h-4 bg-purple-600 rounded-full" />
                  )}
                </button>
              </div>

              {paymentMethod === 'mpesa' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    M-Pesa Phone Number
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g., 0712345678"
                      className="input pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the phone number registered with M-Pesa
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (paymentMethod === 'mpesa') handleMpesaPayment()
                  else if (paymentMethod === 'cash') handleCashPayment()
                  else if (paymentMethod === 'card') handleCardPayment()
                }}
                disabled={loading}
                className="btn btn-primary w-full disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  paymentMethod === 'mpesa' ? 'Pay with M-Pesa' :
                  paymentMethod === 'cash' ? 'Confirm Cash Payment' :
                  'Pay with Card'
                )}
              </button>
            </>
          )}

          {paymentStep === 'processing' && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mb-4" />
              <h4 className="text-lg font-semibold mb-2">Processing Payment</h4>
              <p className="text-gray-600 mb-4">
                Please check your phone and enter your M-Pesa PIN to complete the payment.
              </p>
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> If you don't receive the prompt, ensure your phone is on and has network coverage.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancelPayment}
                className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
              >
                Cancel Payment
              </button>
            </div>
          )}

          {paymentStep === 'complete' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2">Payment Successful!</h4>
              <p className="text-gray-600">Your booking has been confirmed.</p>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-primary mt-6"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentModal