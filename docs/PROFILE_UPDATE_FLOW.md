# Profile Update Data Flow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                         │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Click "Edit Profile"  │
                    └────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   isEditing = true     │
                    │   Enable form fields   │
                    └────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FIELD EDITING PHASE                         │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌───────────────────┐    ┌───────────────────┐
        │  User types in    │    │  handleFieldChange│
        │  input field      │───▶│  updates local    │
        └───────────────────┘    │  state            │
                                 └───────────────────┘
                                          │
                                          ▼
                                 ┌───────────────────┐
                                 │  validateField()  │
                                 │  runs validation  │
                                 └───────────────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │                                           │
                    ▼                                           ▼
        ┌───────────────────┐                      ┌───────────────────┐
        │  Valid: Clear     │                      │  Invalid: Show    │
        │  error message    │                      │  red border +     │
        └───────────────────┘                      │  error message    │
                                                   └───────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SAVE PHASE                               │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌───────────────────┐    ┌───────────────────┐
        │  Click "Save      │    │  Click "Cancel"   │
        │  Changes"         │    │                   │
        └───────────────────┘    └───────────────────┘
                    │                         │
                    │                         ▼
                    │            ┌───────────────────┐
                    │            │  setUserData(null)│
                    │            │  Discard changes  │
                    │            │  Exit edit mode   │
                    │            └───────────────────┘
                    │
                    ▼
        ┌───────────────────┐
        │  handleSave()     │
        │  isLoading = true │
        └───────────────────┘
                    │
                    ▼
        ┌───────────────────┐
        │  Build payload    │
        │  from userData    │
        └───────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OPTIMISTIC UPDATE                             │
└─────────────────────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────┐
        │  updateProfile()  │
        │  in use-auth.ts   │
        └───────────────────┘
                    │
                    ▼
        ┌───────────────────┐
        │  Store original   │
        │  user state       │
        └───────────────────┘
                    │
                    ▼
        ┌───────────────────┐
        │  setUser() with   │
        │  new data         │
        │  (Optimistic UI)  │
        └───────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER VALIDATION                             │
└─────────────────────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────┐
        │  AuthService      │
        │  .updateUser      │
        │  Profile()        │
        └───────────────────┘
                    │
                    ▼
        ┌───────────────────┐
        │  Zod validation   │
        │  validateProfile  │
        │  Update()         │
        └───────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐      ┌──────────────┐
│  Valid ✓     │      │  Invalid ✗   │
└──────────────┘      └──────────────┘
        │                       │
        │                       ▼
        │            ┌───────────────────┐
        │            │  Throw error with │
        │            │  formatted message│
        │            └───────────────────┘
        │                       │
        │                       └──────────┐
        ▼                                  │
┌─────────────────────────────────────────────────────────────────┐
│                    UNIQUENESS CHECKS                             │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────┐
│  Check if email   │
│  already exists   │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Check if username│
│  already exists   │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Check if stellar │
│  address exists   │
└───────────────────┘
        │
┌───────┴───────┐
│               │
▼               ▼
┌──────────┐  ┌──────────┐
│ Unique ✓ │  │ Exists ✗ │
└──────────┘  └──────────┘
│               │
│               ▼
│    ┌───────────────────┐
│    │  Throw error:     │
│    │  "Already in use" │
│    └───────────────────┘
│               │
│               └──────────┐
▼                          │
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE UPDATE                               │
└─────────────────────────────────────────────────────────────────┘
│
▼
┌───────────────────┐
│  Supabase UPDATE  │
│  users table      │
│  SET ...          │
│  WHERE id = ?     │
└───────────────────┘
│
┌───────┴───────┐
│               │
▼               ▼
┌──────────┐  ┌──────────┐
│Success ✓ │  │ Error ✗  │
└──────────┘  └──────────┘
│               │
│               ▼
│    ┌───────────────────┐
│    │  Handle DB errors │
│    │  23505, 23503,    │
│    │  PGRST116         │
│    └───────────────────┘
│               │
│               └──────────┐
▼                          │
┌─────────────────────────────────────────────────────────────────┐
│                    REFETCH & UPDATE UI                           │
└─────────────────────────────────────────────────────────────────┘
│
▼
┌───────────────────┐
│  getUserProfile() │
│  Fetch fresh data │
└───────────────────┘
│
▼
┌───────────────────┐
│  setUser() with   │
│  fresh data       │
└───────────────────┘
│
▼
┌───────────────────┐
│  setUserData(null)│
│  Reset local state│
└───────────────────┘
│
▼
┌───────────────────┐
│  toast.success()  │
│  "Profile updated"│
└───────────────────┘
│
▼
┌───────────────────┐
│  setIsEditing     │
│  (false)          │
│  Exit edit mode   │
└───────────────────┘
│
▼
┌───────────────────┐
│  isLoading = false│
└───────────────────┘
│
│
│  ┌─────────────────────────────────────┐
│  │         ERROR PATH                  │
│  └─────────────────────────────────────┘
│                    │
└────────────────────┤
                     ▼
          ┌───────────────────┐
          │  Rollback: setUser│
          │  (originalUser)   │
          └───────────────────┘
                     │
                     ▼
          ┌───────────────────┐
          │  toast.error()    │
          │  Show error msg   │
          └───────────────────┘
                     │
                     ▼
          ┌───────────────────┐
          │  Keep edit mode   │
          │  active for fix   │
          └───────────────────┘
                     │
                     ▼
          ┌───────────────────┐
          │  isLoading = false│
          └───────────────────┘
```

## State Management

### Component State (page.tsx)
```typescript
const [isEditing, setIsEditing] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [userData, setUserData] = useState<UserData | null>(null);
```

### Global State (use-auth.ts)
```typescript
const [user, setUser] = useState<User | null>(null);
```

### Field State (ProfileInfo.tsx)
```typescript
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
```

## Data Transformations

### 1. User Input → Local State
```typescript
handleFieldChange('email', 'user@example.com')
  ↓
setUserData({ ...userData, email: 'user@example.com' })
```

### 2. Local State → Payload
```typescript
{
  email: hydratedUserData.email,
  full_name: hydratedUserData.full_name,
  username: hydratedUserData.username,
  // ... other fields
}
```

### 3. Payload → Validation
```typescript
validateProfileUpdate(payload)
  ↓
Zod schema validation
  ↓
{ success: true, data: {...} } or { success: false, error: {...} }
```

### 4. Validated Data → Database
```typescript
supabase
  .from('users')
  .update({ ...updates, updated_at: new Date().toISOString() })
  .eq('id', userId)
```

### 5. Database → UI
```typescript
getUserProfile(userId)
  ↓
setUser(freshProfile)
  ↓
UI re-renders with new data
```

## Error Flow

```
Error Occurs
    │
    ├─ Validation Error
    │   └─ formatValidationErrors()
    │       └─ "field: message; field2: message2"
    │
    ├─ Uniqueness Error
    │   └─ "This email/username is already in use"
    │
    ├─ Database Error
    │   ├─ 23505: "Field already exists"
    │   ├─ 23503: "Invalid reference"
    │   ├─ PGRST116: "User not found"
    │   └─ Other: "Failed to update: [message]"
    │
    └─ Network Error
        └─ "Failed to update profile"
```

## Success Flow

```
Valid Data
    ↓
Optimistic Update (UI shows new data)
    ↓
Database Update
    ↓
Refetch Fresh Data
    ↓
Update UI with Fresh Data
    ↓
Show Success Toast
    ↓
Exit Edit Mode
    ↓
User sees updated profile
```

## Key Decision Points

### 1. Should validate?
- **When**: On field change (if editing)
- **How**: Client-side regex validation
- **Why**: Immediate feedback

### 2. Should save?
- **When**: User clicks "Save Changes"
- **Check**: All fields valid
- **Action**: Proceed to server validation

### 3. Should rollback?
- **When**: Any error occurs
- **Action**: Revert to original user state
- **Why**: Maintain data consistency

### 4. Should refetch?
- **When**: After successful save
- **Why**: Ensure UI matches database
- **How**: getUserProfile(userId)

## Performance Considerations

### Optimistic Updates
- **Benefit**: Instant UI feedback
- **Cost**: Potential rollback on error
- **Trade-off**: Better UX worth the complexity

### Validation Timing
- **Client-side**: On field change (debounced)
- **Server-side**: Before database update
- **Why**: Catch errors early, prevent bad data

### Refetch Strategy
- **When**: After successful save only
- **Why**: Avoid unnecessary network calls
- **Alternative**: Trust optimistic update (not used for data integrity)

## Security Considerations

### RLS Policies
- Users can only update their own profile
- Enforced at database level
- `auth.uid() = id` check

### Validation
- Client-side: UX improvement
- Server-side: Security enforcement
- Never trust client data

### Uniqueness
- Checked before database update
- Prevents race conditions
- Database constraints as final guard

## Monitoring Points

1. **Validation Failures**: Track which fields fail most
2. **Uniqueness Conflicts**: Monitor duplicate attempts
3. **Database Errors**: Alert on unexpected errors
4. **Update Success Rate**: Track save success/failure
5. **Performance**: Monitor update latency
