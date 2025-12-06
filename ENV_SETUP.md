# Environment Variables Setup Guide

## Required Environment Variables

To connect your frontend to Supabase, you need to add the following environment variables to your `.env.local` file in `apps/web/`.

### Supabase Configuration

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Current value: `https://knjslypucnkxeijphpvc.supabase.co`
   - Get from: Supabase Dashboard > Settings > API > Project URL

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous/public key (safe to expose in client-side code)
   - Current legacy anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuanNseXB1Y25reGVpanBocHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTAwMDUsImV4cCI6MjA4MDQ4NjAwNX0.ZwUjMULjygdoyNr4T3uGiUpDm2kWgE5-0gP7GHU2qQc`
   - Or use publishable key: `sb_publishable_Pf7VJ5hIbYrkbgiaBz4NEA_EviYeCb6`
   - Get from: Supabase Dashboard > Settings > API > anon/public key

3. **SUPABASE_SERVICE_ROLE_KEY** (Server-side only)
   - ⚠️ **SECRET** - Never expose in client-side code!
   - Used for admin operations and server-side API routes
   - Get from: Supabase Dashboard > Settings > API > service_role key

### Trustless Work Configuration

4. **NEXT_PUBLIC_TLW_API_KEY**
   - Your Trustless Work API key
   - Get from: Trustless Work Dashboard

5. **NEXT_PUBLIC_ROLE_ADDRESS**
   - Your platform's Stellar address (for escrow roles)
   - This is the address that will be used as `platformAddress` and `disputeResolver` in escrows

6. **NEXT_PUBLIC_PLATFORM_FEE**
   - Platform fee as a decimal (e.g., 0.05 for 5%)
   - Default: `0.05`

### Environment Configuration

7. **NEXT_PUBLIC_ENV**
   - Environment: `development` or `production`
   - Default: `development`

8. **NEXT_PUBLIC_USE_MOCK** (Optional)
   - Set to `1` to use mock data instead of real APIs
   - Set to `0` or omit to use real Supabase APIs
   - Default: `0`

## Setup Instructions

1. **Create `.env.local` file** in `apps/web/` directory:
   ```bash
   cd apps/web
   touch .env.local
   ```

2. **Add the environment variables** to `.env.local`:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://knjslypucnkxeijphpvc.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuanNseXB1Y25reGVpanBocHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTAwMDUsImV4cCI6MjA4MDQ4NjAwNX0.ZwUjMULjygdoyNr4T3uGiUpDm2kWgE5-0gP7GHU2qQc
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # Trustless Work
   NEXT_PUBLIC_TLW_API_KEY=your_api_key_here
   NEXT_PUBLIC_ROLE_ADDRESS=your_stellar_address_here
   NEXT_PUBLIC_PLATFORM_FEE=0.05

   # Environment
   NEXT_PUBLIC_ENV=development
   NEXT_PUBLIC_USE_MOCK=0
   ```

3. **Get your Service Role Key**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to Settings > API
   - Copy the `service_role` key (⚠️ Keep this secret!)
   - Replace `your_service_role_key_here` in `.env.local`

4. **Restart your dev server**:
   ```bash
   npm run dev
   ```

## File Locations

- **`.env.local`** - Local development (gitignored, safe for secrets)
- **`.env.example`** - Example template (committed to git, no secrets)

## Security Notes

- ✅ `NEXT_PUBLIC_*` variables are safe to expose in client-side code
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` is **SECRET** - never commit to git or expose in client-side code
- 🔒 `.env.local` is gitignored - your secrets are safe
- 📝 Use `.env.example` as a template (without real secrets)

## Verification

After setting up, verify the connection:

1. Check that Supabase client initializes without errors
2. Try creating a test user or listing
3. Check browser console for any Supabase connection errors

## Troubleshooting

- **"Missing Supabase URL"**: Make sure `NEXT_PUBLIC_SUPABASE_URL` is set
- **"Missing Supabase key"**: Make sure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- **RLS errors**: Check that your RLS policies are correctly configured
- **Service role errors**: Make sure `SUPABASE_SERVICE_ROLE_KEY` is set for server-side operations
