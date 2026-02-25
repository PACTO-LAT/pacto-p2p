# Merchant Applications Testing Checklist

Use this checklist to quickly verify all features are working correctly.

## Setup ✓

- [ ] Created `apps/web/.env.local` with Supabase credentials
- [ ] Set `NEXT_PUBLIC_USE_MOCK=0` in `.env.local`
- [ ] Started Supabase: `npm run db:start`
- [ ] Reset database with seed data: `npm run db:reset`
- [ ] Started dev server: `npm run dev`
- [ ] Opened `http://localhost:3000/dashboard/admin`

## UI Components ✓

- [ ] "Merchant Applications" tab is visible
- [ ] Tab switches correctly when clicked
- [ ] Filter buttons are displayed (All, Pending, Verified, Rejected, Revoked)
- [ ] Application cards are displayed in a grid
- [ ] Cards show: name, slug, email, date, status badge
- [ ] Grid is responsive (1/2/3 columns based on screen size)

## Filtering ✓

- [ ] "All" filter shows 5 merchants (3 verified + 2 pending)
- [ ] "Pending" filter shows 2 merchants (Charlie, Eve)
- [ ] "Verified" filter shows 3 merchants (Alice, Bob, Diana)
- [ ] "Rejected" filter shows empty state
- [ ] "Revoked" filter shows empty state
- [ ] Active filter button has different styling

## Application Details Modal ✓

- [ ] Clicking a card opens the modal
- [ ] Modal displays merchant display name
- [ ] Modal shows slug with @ prefix
- [ ] Status badge is visible with correct color
- [ ] User Information section shows:
  - [ ] Email
  - [ ] Full name
  - [ ] User since date
  - [ ] Application date
- [ ] Merchant Profile section shows:
  - [ ] Bio
  - [ ] Location (if available)
  - [ ] Languages (if available)
- [ ] Social Links section shows links (if available)
- [ ] Trading Statistics section shows:
  - [ ] Rating
  - [ ] Total trades
  - [ ] Volume traded
- [ ] Action buttons are visible and appropriate for status

## Approve Action ✓

- [ ] "Approve" button is visible for pending applications
- [ ] Clicking "Approve" shows loading state
- [ ] Button text changes to "Approving..."
- [ ] Button is disabled during operation
- [ ] Success toast notification appears
- [ ] Modal closes automatically
- [ ] Application list refreshes
- [ ] Merchant moves to "Verified" filter
- [ ] Merchant removed from "Pending" filter
- [ ] Re-opening shows "verified" status badge
- [ ] Re-opening shows "Revoke Verification" button

## Reject Action ✓

- [ ] "Reject" button is visible for pending applications
- [ ] Clicking "Reject" shows loading state
- [ ] Button text changes to "Rejecting..."
- [ ] Button is disabled during operation
- [ ] Success toast notification appears
- [ ] Modal closes automatically
- [ ] Application list refreshes
- [ ] Merchant moves to "Rejected" filter
- [ ] Merchant removed from "Pending" filter
- [ ] Re-opening shows "rejected" status badge
- [ ] Re-opening shows "Approve" button (for re-approval)

## Revoke Action ✓

- [ ] "Revoke Verification" button visible for verified merchants
- [ ] Clicking "Revoke" shows loading state
- [ ] Button text changes to "Revoking..."
- [ ] Button is disabled during operation
- [ ] Success toast notification appears
- [ ] Modal closes automatically
- [ ] Application list refreshes
- [ ] Merchant moves to "Revoked" filter
- [ ] Merchant removed from "Verified" filter
- [ ] Re-opening shows "revoked" status badge
- [ ] Re-opening shows "Approve" button (for re-approval)

## Re-approval ✓

- [ ] Can approve a rejected merchant
- [ ] Can approve a revoked merchant
- [ ] Status changes to "verified"
- [ ] Merchant moves to "Verified" filter

## Loading States ✓

- [ ] Initial page load shows spinner
- [ ] Filter changes show loading state
- [ ] Action buttons show loading state during operations
- [ ] All action buttons disabled during any operation
- [ ] Modal cannot be closed during operation

## Error Handling ✓

- [ ] Error toast appears if operation fails
- [ ] Modal remains open on error
- [ ] Button returns to normal state on error
- [ ] User can retry after error

## Empty States ✓

- [ ] Empty state message shows when no applications match filter
- [ ] Message includes the filter name
- [ ] Empty state is styled appropriately

## Responsive Design ✓

- [ ] Mobile (375px): 1 column grid
- [ ] Tablet (768px): 2 column grid
- [ ] Desktop (1024px+): 3 column grid
- [ ] Modal is scrollable on small screens
- [ ] Filter buttons wrap on small screens
- [ ] All text is readable on all screen sizes

## Data Persistence ✓

- [ ] Status changes persist after page refresh
- [ ] Database reflects the changes
- [ ] Multiple browser windows show consistent data (after refresh)

## Performance ✓

- [ ] Page loads quickly
- [ ] Filter changes are instant
- [ ] Modal opens smoothly
- [ ] No console errors
- [ ] No console warnings (except expected TypeScript environment issues)

## Accessibility ✓

- [ ] Can navigate with keyboard
- [ ] Focus states are visible
- [ ] Modal can be closed with Escape key
- [ ] Screen reader friendly (semantic HTML)

## Summary

**Total Tests:** 100+
**Passed:** ___
**Failed:** ___
**Blocked:** ___

## Notes

Add any issues or observations here:

---

## Quick Test (5 minutes)

If you're short on time, test these critical paths:

1. [ ] Open Merchant Applications tab
2. [ ] Filter by "Pending"
3. [ ] Click on a pending merchant
4. [ ] Click "Approve"
5. [ ] Verify success toast and modal closes
6. [ ] Filter by "Verified" and confirm merchant appears
7. [ ] Click on the approved merchant
8. [ ] Click "Revoke Verification"
9. [ ] Verify success toast and modal closes
10. [ ] Filter by "Revoked" and confirm merchant appears

If all 10 steps pass, the core functionality is working! ✅
