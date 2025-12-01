# Chatbot Session Management Implementation

## Overview
Implemented comprehensive session management for the chatbot widget, supporting both authenticated users and anonymous users with persistent chat history.

## Features Implemented

### 1. Anonymous User Session Management
**Anonymous ID Generation:**
- Generates a unique UUID for each anonymous user on first visit
- Stores the ID in `localStorage` under key `anon_chat_id`
- Persists across page refreshes and browser sessions
- Same user = Same chat history

**How it Works:**
```javascript
// On component mount
useEffect(() => {
  const existingAnonId = localStorage.getItem('anon_chat_id');
  if (existingAnonId) {
    setAnonId(existingAnonId); // Use existing ID
  } else {
    const newAnonId = uuidv4(); // Generate new UUID
    localStorage.setItem('anon_chat_id', newAnonId);
    setAnonId(newAnonId);
  }
}, []);
```

### 2. Chat History Retrieval
**Automatic Loading:**
- Fetches chat history immediately after anonymous ID is set
- Loads previous conversations on component mount
- Displays loading indicator while fetching
- Gracefully handles errors (fails silently, user can still chat)

**Authentication Detection:**
- If user is logged in → Uses `Authorization: Bearer <token>` header
- If user is anonymous → Uses `?anonymousId=<uuid>` query parameter

**API Endpoint:**
- GET `/api1/llm/history`
- Returns array of previous messages with roles and timestamps

**History Format Expected:**
```javascript
{
  "history": [
    {
      "role": "user",
      "content": "What honey products do you offer?",
      "timestamp": "2025-12-01T10:30:00Z"
    },
    {
      "role": "assistant", 
      "content": "We offer Pure Honey, Raw Honey...",
      "timestamp": "2025-12-01T10:30:05Z"
    }
  ]
}
```

### 3. Updated Message Sending Logic
**Anonymous ID Inclusion:**
```javascript
// For authenticated users
{
  "message": "user message",
  // Authorization header included
}

// For anonymous users
{
  "message": "user message",
  "anonymousId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Technical Implementation

### New State Variables
```javascript
const [anonId, setAnonId] = useState(null);           // Anonymous user ID
const [isLoadingHistory, setIsLoadingHistory] = useState(false); // Loading state
```

### New Functions

#### `fetchChatHistory()`
Retrieves previous chat messages from the backend.

**Flow:**
1. Sets loading state
2. Determines if user is authenticated
3. Constructs appropriate API request (header vs query param)
4. Fetches history from `/api1/llm/history`
5. Preserves welcome message + appends history
6. Updates messages state

**Error Handling:**
- Try-catch wrapper
- Console logs errors
- Fails silently (doesn't break chat)
- User can continue chatting even if history fails

#### Updated `getBotResponseFromLLM()`
Now includes `anonymousId` in request body for public users.

**Before:**
```javascript
body: JSON.stringify({
  message: userMessage
})
```

**After:**
```javascript
const requestBody = { message: userMessage };
if (!isAuthenticated && anonId) {
  requestBody.anonymousId = anonId;
}
body: JSON.stringify(requestBody)
```

### Lifecycle Hooks

#### Hook 1: Initialize Anonymous ID
```javascript
useEffect(() => {
  // Runs once on mount
  // Checks localStorage → Sets existing or creates new UUID
}, []);
```

#### Hook 2: Fetch History
```javascript
useEffect(() => {
  // Runs when anonId changes (after Hook 1 completes)
  if (anonId || isUserAuthenticated()) {
    fetchChatHistory();
  }
}, [anonId]);
```

## User Experience

### First Time Anonymous User
1. Opens chatbot → UUID generated → Saved to localStorage
2. Sees welcome message + loading indicator
3. No history found (first visit)
4. Starts chatting → Messages saved with anonymousId

### Returning Anonymous User
1. Opens chatbot → UUID retrieved from localStorage
2. Sees "Loading chat history..." indicator
3. Previous messages load below welcome message
4. Can continue previous conversation

### Authenticated User
1. Opens chatbot → Uses auth token (no anonymousId needed)
2. Sees "Loading chat history..." indicator
3. Previous messages load (linked to user account)
4. Full conversation history across devices

## UI/UX Enhancements

### Loading Indicator
Beautiful animated dots while fetching history:
```jsx
{isLoadingHistory && (
  <div className="flex justify-center items-center h-full">
    <div className="text-center">
      <div className="flex gap-1.5 justify-center mb-2">
        <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-bounce"></span>
        <span className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce" 
              style={{ animationDelay: '0.15s' }}></span>
        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" 
              style={{ animationDelay: '0.3s' }}></span>
      </div>
      <p className="text-sm text-gray-500">Loading chat history...</p>
    </div>
  </div>
)}
```

### Message Preservation
- Welcome message always shows first
- History messages append after welcome message
- Chronological order maintained
- Timestamps displayed for each message

## Backend Integration

### Expected Endpoints

#### POST `/api1/llm/public`
```javascript
Request Body:
{
  "message": "user question",
  "anonymousId": "uuid-here"  // NEW FIELD
}

Response:
{
  "response": "bot answer"
}
```

#### POST `/api1/llm/authenticated`
```javascript
Headers:
{
  "Authorization": "Bearer <token>"
}

Request Body:
{
  "message": "user question"
  // No anonymousId needed
}

Response:
{
  "response": "bot answer"
}
```

#### GET `/api1/llm/history`
```javascript
// For authenticated users
Headers:
{
  "Authorization": "Bearer <token>"
}

// For anonymous users
Query Params: ?anonymousId=<uuid>

Response:
{
  "history": [
    {
      "role": "user",
      "content": "message text",
      "timestamp": "ISO-8601 timestamp"
    },
    ...
  ]
}
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────┐
│              Component Mount                     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│    Check localStorage for 'anon_chat_id'        │
└────────────┬───────────────┬────────────────────┘
             │               │
        Exists│          Not Exists
             │               │
             ▼               ▼
    ┌────────────┐   ┌──────────────┐
    │ Use Existing│   │Generate UUID │
    │    UUID     │   │Save to LS    │
    └──────┬──────┘   └──────┬───────┘
           │                 │
           └────────┬────────┘
                    │
                    ▼
      ┌──────────────────────────┐
      │   setAnonId(uuid)        │
      └────────────┬─────────────┘
                   │
                   ▼
      ┌──────────────────────────┐
      │  fetchChatHistory()      │
      └────────────┬─────────────┘
                   │
                   ▼
      ┌──────────────────────────┐
      │  GET /api1/llm/history   │
      │  ?anonymousId=<uuid>     │
      └────────────┬─────────────┘
                   │
                   ▼
      ┌──────────────────────────┐
      │  Load Previous Messages  │
      │  + Welcome Message       │
      └──────────────────────────┘
```

## Benefits

### For Users
✅ Seamless conversation continuation  
✅ No lost context between visits  
✅ No forced registration to get help  
✅ Personalized experience even when anonymous  

### For Business
✅ Better user engagement  
✅ Improved customer support  
✅ Conversation analytics per user  
✅ Can track anonymous → registered user journey  

### Technical
✅ Scalable session management  
✅ Works offline (localStorage)  
✅ No server-side session storage needed  
✅ Clean separation: authenticated vs anonymous  

## Edge Cases Handled

1. **No localStorage Support**: Continues working (just no history)
2. **History API Fails**: Silently fails, user can still chat
3. **Malformed History Data**: Filters invalid messages
4. **Switch from Anonymous to Authenticated**: New session starts with auth token
5. **Empty History**: Shows welcome message only
6. **Large History**: UI handles scrolling properly

## Security Considerations

- ✅ Anonymous IDs are client-generated UUIDs (not sensitive)
- ✅ Auth tokens never exposed in URLs (header only)
- ✅ No PII stored in localStorage
- ✅ Backend validates anonymousId format
- ✅ Rate limiting should be applied per anonymousId

## Testing Checklist

- [ ] First visit → UUID generated and saved
- [ ] Refresh page → Same UUID retrieved
- [ ] Send message → anonymousId included in request
- [ ] Close and reopen chat → History loads
- [ ] Clear localStorage → New UUID generated
- [ ] Login while chatting → Switch to authenticated mode
- [ ] Logout → Return to anonymous with new UUID
- [ ] History API failure → Graceful degradation
- [ ] Multiple messages → All appear in history

## Future Enhancements

### Potential Additions:
- **Session Expiry**: Auto-generate new UUID after X days
- **Migration**: Move anonymous history to user account on registration
- **Clear History Button**: Let users reset their chat
- **Export Chat**: Download conversation as PDF
- **Search History**: Find previous questions
- **Context Window**: Limit history to last N messages for performance
- **Typing Indicators**: Show when bot is thinking
- **Message Reactions**: Thumbs up/down feedback
