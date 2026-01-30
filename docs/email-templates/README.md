# Email Templates

This directory contains email templates for Supabase authentication emails.

## Templates

### Confirmation Email
- **HTML**: `confirmation-email.html` - Rich HTML template with branding
- **Text**: `confirmation-email-text.txt` - Plain text fallback version

## How to Use

1. **Access Supabase Dashboard**:
   - Go to your Supabase project dashboard
   - Navigate to **Authentication** → **Email Templates**
   - Select **Confirm signup** template

2. **Copy the HTML Template**:
   - Open `confirmation-email.html`
   - Copy the entire content
   - Paste it into the **HTML** field in Supabase

3. **Copy the Text Template** (Optional but recommended):
   - Open `confirmation-email-text.txt`
   - Copy the entire content
   - Paste it into the **Plain text** field in Supabase

4. **Save**:
   - Click **Save** in the Supabase dashboard

## Template Variables

Supabase will automatically replace these variables:
- `{{ .ConfirmationURL }}` - The confirmation link URL
- `{{ .Email }}` - User's email address (if needed)
- `{{ .Token }}` - Confirmation token (if needed)

## Customization

You can customize these templates by:
- Changing colors to match your brand
- Updating the support email address
- Modifying the messaging
- Adding your logo (as an image URL)

## Notes

- The HTML template uses inline styles for maximum email client compatibility
- The template is mobile-responsive
- Colors match the Pacto P2P emerald/green theme
- The confirmation link expires in 24 hours (configured in Supabase)
