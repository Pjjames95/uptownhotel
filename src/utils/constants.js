/**
 * Application Constants
 * All constants used throughout the application
 */

// ============================================================================
// ROOM CONSTANTS
// ============================================================================

// Room types
export const ROOM_TYPES = {
  single: { label: 'Single', beds: 1, description: 'Perfect for solo travelers' },
  double: { label: 'Double', beds: 2, description: 'Ideal for couples' },
  twin: { label: 'Twin', beds: 2, description: 'Two single beds' },
  suite: { label: 'Suite', beds: 2, description: 'Spacious suite with living area' },
  presidential: { label: 'Presidential', beds: 2, description: 'Ultimate luxury experience' },
  family: { label: 'Family', beds: 4, description: 'Perfect for families' },
  deluxe: { label: 'Deluxe', beds: 2, description: 'Premium comfort and amenities' },
  studio: { label: 'Studio', beds: 2, description: 'Open plan living space' },
  penthouse: { label: 'Penthouse', beds: 2, description: 'Top-floor luxury with views' },
}

// Room status
export const ROOM_STATUS = {
  available: { label: 'Available', color: 'green', icon: '✅' },
  occupied: { label: 'Occupied', color: 'red', icon: '🚫' },
  maintenance: { label: 'Maintenance', color: 'orange', icon: '🔧' },
  cleaning: { label: 'Cleaning', color: 'blue', icon: '🧹' },
  reserved: { label: 'Reserved', color: 'purple', icon: '📅' },
  out_of_order: { label: 'Out of Order', color: 'gray', icon: '⚠️' },
}

// Room amenities
export const ROOM_AMENITIES = [
  'WiFi',
  'TV',
  'Air Conditioning',
  'Heating',
  'Mini Bar',
  'Safe',
  'Hair Dryer',
  'Shower',
  'Bathtub',
  'Gym Access',
  'Room Service',
  'Balcony',
  'City View',
  'Garden View',
  'Ocean View',
  'Beach Access',
  'Coffee Maker',
  'Iron',
  'Desk',
  'Sitting Area',
  'Telephone',
  'Bathrobe',
  'Slippers',
  'Toiletries',
]

// ============================================================================
// BOOKING CONSTANTS
// ============================================================================

// Booking status
export const BOOKING_STATUS = {
  pending: { label: 'Pending', color: 'yellow', description: 'Awaiting confirmation' },
  confirmed: { label: 'Confirmed', color: 'green', description: 'Booking confirmed' },
  checked_in: { label: 'Checked In', color: 'blue', description: 'Guest has arrived' },
  checked_out: { label: 'Checked Out', color: 'gray', description: 'Stay completed' },
  cancelled: { label: 'Cancelled', color: 'red', description: 'Booking cancelled' },
  no_show: { label: 'No Show', color: 'orange', description: 'Guest did not arrive' },
}

// Reservation status (for restaurant)
export const RESERVATION_STATUS = {
  pending: { label: 'Pending', color: 'yellow' },
  confirmed: { label: 'Confirmed', color: 'green' },
  seated: { label: 'Seated', color: 'blue' },
  completed: { label: 'Completed', color: 'gray' },
  cancelled: { label: 'Cancelled', color: 'red' },
  no_show: { label: 'No Show', color: 'orange' },
}

// ============================================================================
// EVENT CONSTANTS
// ============================================================================

// Event types
// Event types - MUST match database enum values exactly
export const EVENT_TYPES = {
  wedding: 'Wedding',
  conference: 'Conference',
  party: 'Party',
  meeting: 'Meeting',
  corporate: 'Corporate Event',
  seminar: 'Seminar',
  workshop: 'Workshop',
  birthday: 'Birthday Party',
  anniversary: 'Anniversary',
  gala: 'Gala Dinner',
  exhibition: 'Exhibition',
  concert: 'Concert',
  other: 'Other',
}

// Event status
export const EVENT_STATUS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  postponed: 'Postponed',
}

// ============================================================================
// USER & ROLE CONSTANTS
// ============================================================================

// User roles
export const USER_ROLES = {
  super_admin: { 
    label: 'Super Admin', 
    permissions: ['all'],
    description: 'Full system access'
  },
  hotel_manager: { 
    label: 'Hotel Manager', 
    permissions: ['rooms', 'bookings', 'revenue', 'staff', 'reports'],
    description: 'Manages hotel operations'
  },
  receptionist: { 
    label: 'Receptionist', 
    permissions: ['bookings', 'checkin', 'billing', 'guests'],
    description: 'Front desk operations'
  },
  restaurant_manager: { 
    label: 'Restaurant Manager', 
    permissions: ['reservations', 'menu', 'kitchen', 'staff'],
    description: 'Manages restaurant operations'
  },
  kitchen_staff: { 
    label: 'Kitchen Staff', 
    permissions: ['orders', 'inventory'],
    description: 'Food preparation'
  },
  housekeeping_staff: { 
    label: 'Housekeeping Staff', 
    permissions: ['tasks', 'cleaning'],
    description: 'Room cleaning and maintenance'
  },
  maintenance_staff: {
    label: 'Maintenance Staff',
    permissions: ['maintenance', 'repairs'],
    description: 'Building maintenance'
  },
  guest: { 
    label: 'Guest', 
    permissions: ['bookings', 'reservations', 'profile'],
    description: 'Hotel guest'
  },
}

// Departments
export const DEPARTMENTS = [
  'Front Office',
  'Housekeeping',
  'Food & Beverage',
  'Kitchen',
  'Maintenance',
  'Sales & Marketing',
  'Finance',
  'Human Resources',
  'Security',
  'Spa & Wellness',
]

// ============================================================================
// RESTAURANT CONSTANTS
// ============================================================================

// Table locations
export const TABLE_LOCATIONS = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  patio: 'Patio',
  private: 'Private Room',
  bar: 'Bar Area',
  terrace: 'Terrace',
  garden: 'Garden',
}

// Dietary tags
export const DIETARY_TAGS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Halal',
  'Kosher',
  'Spicy',
  'Low-Carb',
  'Keto',
  'Paleo',
  'Organic',
]

// Allergens
export const ALLERGENS = [
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Tree Nuts',
  'Peanuts',
  'Wheat',
  'Soybeans',
  'Sesame',
  'Sulfites',
  'Mustard',
  'Celery',
]

// Menu categories
export const MENU_CATEGORIES = [
  'Appetizers',
  'Soups',
  'Salads',
  'Main Course',
  'Pasta',
  'Seafood',
  'Grill',
  'Pizza',
  'Burgers',
  'Sandwiches',
  'Sides',
  'Desserts',
  'Beverages',
  'Wine List',
  'Cocktails',
  'Breakfast',
  'Brunch',
  'Kids Menu',
]

// ============================================================================
// PAYMENT CONSTANTS
// ============================================================================

// Payment methods
export const PAYMENT_METHODS = {
  cash: 'Cash',
  card: 'Credit/Debit Card',
  mobile_money: 'Mobile Money (M-Pesa)',
  bank_transfer: 'Bank Transfer',
  invoice: 'Invoice',
  online: 'Online Payment',
}

// Payment status
export const PAYMENT_STATUS = {
  pending: 'Pending',
  completed: 'Completed',
  failed: 'Failed',
  refunded: 'Refunded',
  partially_refunded: 'Partially Refunded',
  disputed: 'Disputed',
}

// Currencies
export const CURRENCIES = {
  KES: { symbol: 'KSh', name: 'Kenyan Shilling' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
}

// ============================================================================
// HOUSEKEEPING CONSTANTS
// ============================================================================

// Task types
export const TASK_TYPES = {
  cleaning: 'Full Cleaning',
  turnover: 'Turnover Service',
  deep_clean: 'Deep Clean',
  inspection: 'Inspection',
  maintenance: 'Maintenance Check',
  restock: 'Restock Amenities',
  linen_change: 'Linen Change',
}

// Task status
export const TASK_STATUS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  skipped: 'Skipped',
  cancelled: 'Cancelled',
}

// ============================================================================
// SHIFT CONSTANTS
// ============================================================================

// Shift types
export const SHIFT_TYPES = {
  morning: 'Morning (6AM - 2PM)',
  afternoon: 'Afternoon (2PM - 10PM)',
  evening: 'Evening (4PM - 12AM)',
  night: 'Night (10PM - 6AM)',
  split: 'Split Shift',
  flexible: 'Flexible',
}

// ============================================================================
// SYSTEM CONSTANTS
// ============================================================================

// Session timeout (30 minutes)
export const SESSION_TIMEOUT = 30 * 60 * 1000

// Session warning (5 minutes before timeout)
export const SESSION_WARNING_TIME = 25 * 60 * 1000

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// Date formats
export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  full: 'MMMM dd, yyyy',
  short: 'MM/dd/yyyy',
  iso: 'yyyy-MM-dd',
  time: 'HH:mm',
  datetime: 'MMM dd, yyyy HH:mm',
}

// File upload limits
export const FILE_LIMITS = {
  image: { maxSize: 5 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp'] },
  pdf: { maxSize: 2 * 1024 * 1024, types: ['application/pdf'] },
  document: { maxSize: 10 * 1024 * 1024, types: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
}

// API response codes
export const API_CODES = {
  success: 200,
  created: 201,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  serverError: 500,
}

// ============================================================================
// BUSINESS RULES
// ============================================================================

// Booking rules
export const BOOKING_RULES = {
  maxAdvanceDays: 365,
  maxStayDays: 90,
  minStayDays: 1,
  cancellationFreeHours: 48,
  checkInTime: '14:00',
  checkOutTime: '11:00',
}

// Restaurant rules
export const RESTAURANT_RULES = {
  maxPartySize: 12,
  reservationAdvanceDays: 30,
  minNoticeMinutes: 30,
  operatingHours: {
    start: '06:00',
    end: '22:00',
  },
}

// ============================================================================
// UI CONSTANTS
// ============================================================================

// Toast durations
export const TOAST_DURATION = {
  short: 2000,
  default: 4000,
  long: 6000,
  persistent: 10000,
}

// Animation durations
export const ANIMATION_DURATION = {
  fast: 150,
  default: 300,
  slow: 500,
}

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Get label by value from constant object
export const getLabel = (constantObject, value) => {
  if (!constantObject || !value) return value
  const item = constantObject[value]
  return typeof item === 'object' ? item.label : item || value
}

// Get color by value from constant object
export const getColor = (constantObject, value) => {
  if (!constantObject || !value) return 'gray'
  const item = constantObject[value]
  return typeof item === 'object' ? item.color : 'gray'
}

// Get options array for select inputs
export const getOptions = (constantObject) => {
  if (!constantObject) return []
  return Object.entries(constantObject).map(([value, label]) => ({
    value,
    label: typeof label === 'object' ? label.label : label,
  }))
}

// Get array of keys
export const getKeys = (constantObject) => {
  if (!constantObject) return []
  return Object.keys(constantObject)
}

// Get array of values
export const getValues = (constantObject) => {
  if (!constantObject) return []
  return Object.values(constantObject).map(item => 
    typeof item === 'object' ? item.label : item
  )
}