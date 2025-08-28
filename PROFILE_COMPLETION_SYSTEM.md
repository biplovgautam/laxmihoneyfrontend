# Profile Completion System Documentation

## Overview
This system ensures users complete their profiles (phone number and address) before placing orders, with automatic prompts every 12 hours if they skip completion.

## Features

### 1. Profile Completion Modal (`ProfileCompletionModal.jsx`)
- **Purpose**: Prompts users to complete their profile with phone number and address
- **Triggers**: 
  - New users without complete profiles
  - Existing users every 12 hours if profile is incomplete
- **Validation**:
  - Phone number: 10-digit Indian format
  - Phone uniqueness: Prevents duplicate phone numbers across accounts
  - Address: Minimum 10 characters for complete address
- **Actions**: Users can complete profile or skip (with 12-hour timer)

### 2. Enhanced AuthContext
- **New State Variables**:
  - `needsProfileCompletion`: Boolean indicating if modal should show
  - Profile completion tracking functions

- **New Functions**:
  - `skipProfileCompletion()`: Records skip timestamp, hides modal for 12 hours
  - `markProfileComplete(profileData)`: Saves profile data, marks as complete
  - `checkIfCanOrder()`: Returns true only if user has phone and address

- **Automatic Checks**: 
  - On login/signup: Checks if profile is complete
  - Timer-based: Shows modal every 12 hours if incomplete

### 3. Order Protection (`OrderButton.jsx`)
- **Purpose**: Protects order functionality until profile is complete
- **Features**:
  - Visual indicator (red "!" badge) when profile incomplete
  - Automatic redirection to login for unauthenticated users
  - Alert message for incomplete profiles
  - Disabled state when profile requirements not met

### 4. 12-Hour Prompt System
- **Storage**: Uses localStorage to track prompt timestamps
- **Key Format**: `lastProfilePrompt_{userId}`
- **Logic**: 
  - Shows modal if no timestamp exists OR last prompt was >12 hours ago
  - Resets timer when user completes profile
  - Continues prompting until profile is completed

## Integration Points

### App.jsx
```jsx
// Profile completion modal integration
<ProfileCompletionModal 
  isOpen={needsProfileCompletion}
  onClose={() => {}} // Can only be closed by completing or skipping
/>
```

### Products Component
```jsx
// Replace regular buttons with OrderButton
<OrderButton
  onClick={() => addToCart(item)}
  className="your-styling-classes"
>
  Add to Cart
</OrderButton>
```

## Database Schema Updates

### Users Collection
New fields added to user documents:
- `phoneNumber`: String (10-digit number)
- `address`: String (complete address)
- `profileCompleted`: Boolean
- `profileCompletedAt`: Timestamp

## User Experience Flow

1. **New User Registration**:
   - User signs up → Profile incomplete → Modal shows immediately
   - User can complete or skip → If skipped, timer starts

2. **Existing User Login**:
   - Check profile completeness → If incomplete, check last prompt time
   - If >12 hours since last prompt → Show modal

3. **Ordering Attempt**:
   - User clicks order button → Check profile completeness
   - If incomplete → Alert message, no order processing
   - If complete → Normal order flow

4. **Profile Completion**:
   - Modal validates input → Checks phone uniqueness → Saves to database
   - Updates local state → Removes timer → Enables ordering

## Phone Number Validation

### Format Validation
- Must be exactly 10 digits
- Strips all non-numeric characters
- Indian mobile number format

### Uniqueness Validation
- Real-time checking while typing
- Debounced to prevent excessive API calls
- Excludes current user's existing phone
- Shows error message if duplicate found

## Error Handling

### Phone Number Errors
- "Phone number is required"
- "Please enter a valid 10-digit phone number"
- "This phone number is already registered with another account"

### Address Errors
- "Address is required"
- "Please enter a complete address (minimum 10 characters)"

### Network Errors
- "Failed to update profile. Please try again."

## Testing Scenarios

1. **New User Flow**:
   - Register → Modal appears → Complete profile → Modal closes → Can order

2. **Skip Functionality**:
   - Register → Modal appears → Skip → Modal closes → Try ordering → Alert shown

3. **12-Hour Timer**:
   - Skip profile → Wait/simulate 12 hours → Modal appears again

4. **Phone Uniqueness**:
   - Try using existing phone number → Error message shown

5. **Order Protection**:
   - Incomplete profile → Order button shows badge → Click shows alert

## Configuration

### Timer Duration
To change the prompt interval, modify this line in AuthContext.jsx:
```jsx
const twelveHoursAgo = Date.now() - (12 * 60 * 60 * 1000); // 12 hours
```

### Phone Number Format
To support different countries, modify the validation regex:
```jsx
const phoneRegex = /^[0-9]{10}$/; // Current: 10-digit Indian format
```

### Minimum Address Length
To change address requirements:
```jsx
formData.address.trim().length < 10 // Current: minimum 10 characters
```

## Future Enhancements

1. **Email Notifications**: Send reminders for incomplete profiles
2. **Progressive Disclosure**: Ask for basic info first, then additional details
3. **Address Validation**: Integrate with address validation services
4. **Multiple Phone Numbers**: Support for home/work numbers
5. **Profile Completion Incentives**: Offer discounts for completed profiles
