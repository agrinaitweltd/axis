# Vercel Deployment Setup

## Environment Variables

For the contact form and reCAPTCHA to work on Vercel, you must set the following environment variables in your Vercel project settings:

### Required Environment Variables

1. **RESEND_API_KEY** - Your Resend API key for sending emails
   - Get from: https://resend.com/api-keys
   - Example: `re_xxxxxxxxxxxxxxxxxxxxxxxx`

2. **SENDER_EMAIL** - The email address to send from (must be verified in Resend)
   - Example: `no-reply@axisagro.co.uk`

3. **ADMIN_EMAIL_1** - First admin email to receive form submissions
   - Example: `oliver@axisagro.co.uk`

4. **ADMIN_EMAIL_2** - Second admin email to receive form submissions (optional)
   - Example: `info@axisagro.co.uk`

5. **RECAPTCHA_SECRET_KEY** - Your reCAPTCHA v3 secret key
   - Get from: https://www.google.com/recaptcha/admin
   - Example: `6Lep0wUtAAAAALJ5vMlCrp5RIIceiizU8Km9bNrE`

### Client-Side Environment Variables (for build time)

6. **VITE_RECAPTCHA_SITE_KEY** - Your reCAPTCHA v3 site key
   - Get from: https://www.google.com/recaptcha/admin
   - Example: `6Lep0wUtAAAAACeFsAAPhGjt6xcNyA5OYojAptei`

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with its corresponding value
4. Make sure to select the appropriate environments (Production, Preview, Development)

## Important Notes

- The `VITE_` prefixed variables are used at build time by Vite
- The non-prefixed variables are used at runtime by the serverless functions
- Both versions are included in `.env` for local development
- In production, only the runtime variables (non-VITE_) are critical for the API
- The client-side variables (VITE_) must be set for the build to work properly
- Vercel auto-detects Node.js serverless functions in the `api/` directory

## Resend Domain Verification

Make sure to verify your domain in Resend before sending emails:
1. Go to https://resend.com/domains
2. Add your domain (e.g., `axisagro.co.uk`)
3. Add the DNS records provided by Resend to your domain's DNS settings
4. Wait for DNS propagation (usually 24-48 hours)
5. Once verified, you can send emails from your domain

## Testing the Deployment

1. Deploy your project to Vercel
2. Visit the contact page
3. Fill out the form and submit
4. Check that:
   - The reCAPTCHA badge appears in the bottom right corner
   - Form submission succeeds
   - Confirmation email is sent to the submitter
   - Admin notification emails are received