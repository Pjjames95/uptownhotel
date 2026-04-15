// M-Pesa Result Codes and their meanings
export const MPESA_RESULT_CODES = {
  '0': 'Success',
  '1': 'Insufficient Funds',
  '2': 'Less Than Minimum Transaction Value',
  '3': 'More Than Maximum Transaction Value',
  '4': 'Would Exceed Daily Transfer Limit',
  '5': 'Would Exceed Minimum Balance',
  '6': 'Unresolved Primary Party',
  '7': 'Unresolved Receiver Party',
  '8': 'Would Exceed Maximum Balance',
  '11': 'Debit Account Invalid',
  '12': 'Credit Account Invalid',
  '13': 'Unresolved Debit Account',
  '14': 'Unresolved Credit Account',
  '15': 'Duplicate Detected',
  '17': 'Internal Failure',
  '20': 'Insufficient Funds',
  '21': 'Would Exceed Limit',
  '26': 'Transaction Rate Limit',
  '1032': 'Request Cancelled by User',
  '1037': 'Timeout',
  '2001': 'Invalid Initiator Information',
  '2006': 'Invalid Transaction Reference',
  '2050': 'Invalid Amount',
  '404': 'Transaction Not Found'
}

export const getResultMessage = (code) => {
  return MPESA_RESULT_CODES[code] || `Unknown Error (${code})`
}