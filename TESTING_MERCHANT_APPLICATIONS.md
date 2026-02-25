# Testing Merchant Applications Feature

## Overview
This guide will help you test the newly implemented Merchant Applications management feature in the Admin Dashboard.

## Prerequisites

### 1. Environment Setup
Create `apps/web/.env.local` file with the following content:

```env
# Supabase (local)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase-start
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase-start
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase-start

# App Configuration
NEXT_PUBLIC_USE_MOCK=0
NEXT_PUBLIC_ENV=development

# Trustless Work (optional for this test)
NEXT_PUBLIC_TLW_API_KEY=test-key
NEXT_PUBLIC_ROLE_ADDRESS=test-address
NEXT_PUBLIC_PLATFORM_FEE=2
```

### 2. Start Supabase
```bash
npm run db:start
```

After Supabase starts, it will print the local keys. Copy them to your `.env.local` file.

### 3. Reset Database with Seed Data
```bash
npm run db:reset
```

This will create test merchants with different verification statuses:
- **Alice OTC** - verified
- **Bob Exchange** - verified
- **Diana Premium Trading** - verified
- **Charlie Trader** 
- pending (NEW)
- **Eve Crypto Exchange** - pending (NEW)

### 4. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Test Scenarios

### Scenario 1: View Merchant Applications Tab

1. Navigate to `http://localhost:3000/dashboard/admin`
2. You should see a new tab called "Merchant Applications"
3. Click on the "Merchant Applications" tab

**Expected Result:**
- Tab switches to show the Merchant Applications view
- You should see a filter bar with buttons: All, Pending, Verified, Rejected, Revoked
- Applications are displayed in a responsive grid (1 column on mobile, 2 on tablet, 3 on desktop)

### Scenario 2: Filter Applications by Status

1. Click on "All" filter (default)
   - **Expected:** Shows all 5 merchants (3 verified + 2 pending)

2. Click on "Pending" filter
   - **Expected:** Shows only 2 merchants (Charlie Trader, Eve Crypto Exchange)

3. Click on "Verified" filter
   - **Expected:** Shows only 3 merchants (Alice OTC, Bob Exchange, Diana Premium Trading)

4. Click on "Rejected" filter
   - **Expected:** Shows empty state message "No merchant applications found with status 'rejected'"

5. Click on "Revoked" filter
   - **Expected:** Shows empty state message

### Scenario 3: View Application Details

1. Filter by "Pending" status
2. Click on "Charlie Trader" card

**Expected Result:**
- Modal opens with full application details
- Shows:
  - Display name: "Charlie Trader"
  - Slug: "@charlie-trader"
  - Status badge: "pending" (yellow)
  - User Information section:
    - Email: charlie@example.com
    - Name: Charlie Demo
    - User Since: (date)
    - Applied: (date)
  - Merchant Profile section:
    - Bio: "New merchant application..."
    - Location: New York, US
    - Languages: en
  - Social Links section:
    - Website link
  - Trading Statistics section:
    - Rating: 0.0
    - Total Trades: 0
    - Volume Traded: $0
  - Action buttons: "Approve" (green) and "Reject" (red)

### Scenario 4: Approve a Merchant Application

1. Open "Charlie Trader" application modal
2. Click the "Approve" button

**Expected Result:**
- Button shows loading state: "Approving..." with spinner
- Success toast notification appears: "Merchant application approved successfully"
- Modal closes automatically
- Application list refreshes
- Charlie Trader now appears in "Verified" filter
- Charlie Trader no longer appears in "Pending" filter

**Verification:**
1. Click "Verified" filter
2. Find "Charlie Trader" in the list
3. Click on the card
4. Status badge should now show "verified" (green)
5. Action button should now show "Revoke Verification" (red)

### Scenario 5: Reject a Merchant Application

1. Filter by "Pending" status
2. Click on "Eve Crypto Exchange" card
3. Click the "Reject" button

**Expected Result:**
- Button shows loading state: "Rejecting..." with spinner
- Success toast notification: "Merchant application rejected"
- Modal closes automatically
- Application list refreshes
- Eve Crypto Exchange now appears in "Rejected" filter
- Eve Crypto Exchange no longer appears in "Pending" filter

**Verification:**
1. Click "Rejected" filter
2. Find "Eve Crypto Exchange" in the list
3. Click on the card
4. Status badge should show "rejected" (red)
5. Action button should show "Approve" (green) - allowing re-approval

### Scenario 6: Revoke a Verified Merchant

1. Filter by "Verified" status
2. Click on "Alice OTC" card
3. Click the "Revoke Verification" button

**Expected Result:**
- Button shows loading state: "Revoking..." with spinner
- Success toast notification: "Merchant verification revoked"
- Modal closes automatically
- Application list refreshes
- Alice OTC now appears in "Revoked" filter
- Alice OTC no longer appears in "Verified" filter

**Verification:**
1. Click "Revoked" filter
2. Find "Alice OTC" in the list
3. Status badge should show "revoked" (gray)
4. Action button should show "Approve" (green) - allowing re-approval

### Scenario 7: Re-approve a Rejected/Revoked Merchant

1. Filter by "Rejected" or "Revoked" status
2. Click on a rejected/revoked merchant card
3. Click the "Approve" button

**Expected Result:**
- Merchant status changes to "verified"
- Merchant moves to "Verified" filter
- Success toast notification appears

### Scenario 8: Loading States

1. Open any application modal
2. Click an action button (Approve/Reject/Revoke)
3. Observe the loading state

**Expected Result:**
- Button is disabled during the operation
- Button text changes to show action in progress (e.g., "Approving...")
- Spinner icon appears
- Other action buttons are also disabled
- User cannot close modal during operation

### Scenario 9: Error Handling

To test error handling, you can temporarily modify the service to throw an error:

1. Open `apps/web/lib/services/admin.ts`
2. In `approveMerchant`, add: `throw new Error('Test error');` at the beginning
3. Try to approve a merchant

**Expected Result:**
- Error toast notification appears: "Failed to approve merchant application"
- Modal remains open
- Button returns to normal state
- User can try again or close modal

### Scenario 10: Responsive Design

1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different screen sizes:
   - Mobile (375px): 1 column grid
   - Tablet (768px): 2 column grid
   - Desktop (1024px+): 3 column grid

**Expected Result:**
- Layout adapts smoothly to different screen sizes
- Modal is scrollable on small screens
- All content remains readable and accessible
- Filter buttons wrap on small screens

### Scenario 11: Real-time Updates

1. Open two browser windows side by side
2. Navigate both to the Merchant Applications tab
3. In window 1, approve a pending merchant
4. In window 2, manually refresh or switch filters

**Expected Result:**
- Changes are reflected after query invalidation
- Both windows show consistent data after refresh

## Database Verification

You can verify the changes directly in the database:

```bash
# Connect to Supabase Studio
# Open http://127.0.0.1:54323 in your browser

# Or use psql
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Query merchants
SELECT id, display_name, verification_status, updated_at 
FROM merchants 
ORDER BY created_at DESC;
```

## Troubleshooting

### Issue: "Failed to load merchant applications"
- Check that Supabase is running: `npm run db:start`
- Verify `.env.local` has correct Supabase credentials
- Check browser console for detailed error messages

### Issue: TypeScript errors in IDE
- Run `npm install` to ensure all dependencies are installed
- Restart TypeScript server in your IDE
- The errors shown earlier are environment-related and won't affect runtime

### Issue: Empty applications list
- Ensure database was seeded: `npm run db:reset`
- Check that `NEXT_PUBLIC_USE_MOCK=0` in `.env.local`
- Verify RLS policies allow reading merchants table

### Issue: Actions don't work
- Check browser console for errors
- Verify Supabase service role key is set correctly
- Ensure user has admin permissions (may need to implement admin check)

## Success Criteria

✅ All 5 test merchants are visible in the applications list
✅ Filters work correctly for all statuses
✅ Application cards display all required information
✅ Modal opens and shows comprehensive details
✅ Approve action changes status to "verified"
✅ Reject action changes status to "rejected"
✅ Revoke action changes status to "revoked"
✅ Success/error notifications appear appropriately
✅ Loading states display during operations
✅ Modal closes after successful actions
✅ Application list refreshes without page reload
✅ Responsive design works on all screen sizes
✅ Empty states show helpful messages

## Next Steps

After successful testing, consider:

1. **Add admin authentication check** - Ensure only admins can access this feature
2. **Add audit logging** - Track who approved/rejected which merchants
3. **Add email notifications** - Notify merchants when their status changes
4. **Add bulk actions** - Allow approving/rejecting multiple applications at once
5. **Add search/sort** - Help admins find specific applications quickly
6. **Add notes/comments** - Allow admins to add notes to applications
7. **Add application history** - Show status change timeline

## Cleanup

After testing, you can stop Supabase:

```bash
npm run db:stop
```

To reset everything:

```bash
npm run db:reset
```
