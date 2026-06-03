# Axis Agro International Limited - Setup Guide

## Overview
This is a static website with a backend API for form submissions using Resend email service.

## New Changes

### 1. reCAPTCHA Display Fix
- The reCAPTCHA badge now shows only the logo by default
- When hovered, the full badge pops out from the edge of the screen
- Improved user experience with smooth animations

### 2. Resend Email Functionality
**IMPORTANT:** The resend functionality now requires running a separate backend server.

#### Prerequisites
- Ensure your `.env` file is properly configured with:
  - `RESEND_API_KEY` - Your Resend API key
  - `SENDER_EMAIL` - Verified sender email (e.g., no-reply@axisagro.co.uk)
  - `ADMIN_EMAIL_1` - Primary admin email
  - `ADMIN_EMAIL_2` - Secondary admin email
  - `RECAPTCHA_SECRET_KEY` - Google reCAPTCHA secret key
  - `VITE_RECAPTCHA_SITE_KEY` - Google reCAPTCHA site key

#### Running the Development Server

**Option 1: Run both Vite and API server separately**
```bash
# Terminal 1: Start the API server
npm run server

# Terminal 2: Start the Vite dev server
npm run dev
```

**Option 2: Run both simultaneously (recommended)**
```bash
npm run dev:server
```

The API server will run on `http://localhost:3001` and Vite will proxy `/api` requests to it.

### 3. Header Improvements
- Enhanced desktop navigation with better hover effects and spacing
- Improved mobile navigation with better touch targets and animations
- Better CTA button styling with subtle shadows
- Smoother scroll effects with backdrop blur

### 4. Footer Contact Information
All contact information has been standardized across all pages:
- Email: info@axisagro.co.uk
- Phone: +44 7418 354137
- Company: Axis Agro International Limited
- Registration: Registered in England & Wales and Uganda

## Environment Variables

Copy `.env.example` to `.env` and fill in your actual values:

```bash
cp .env.example .env
```

Required variables:
- `RESEND_API_KEY` - Get from https://resend.com/api-keys
- `SENDER_EMAIL` - Must be verified in your Resend dashboard
- `ADMIN_EMAIL_1` - Primary recipient for form submissions
- `ADMIN_EMAIL_2` - Secondary recipient (optional)
- `RECAPTCHA_SECRET_KEY` - Get from https://www.google.com/recaptcha/admin
- `VITE_RECAPTCHA_SITE_KEY` - Client-side reCAPTCHA key

## Development

### Start Development
```bash
npm run dev:server
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Production Deployment

For production deployment, you'll need to:

1. **Static Site Hosting:** Deploy the `dist/` folder to platforms like:
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - GitHub Pages

2. **API Deployment:** Deploy the `api/send-form.js` as a serverless function:
   - Vercel Functions
   - Netlify Functions
   - AWS Lambda
   - Or use a separate Node.js server

3. **Environment Variables:** Set all required environment variables in your hosting platform.

## Troubleshooting

### Form submissions not working
1. Check that the API server is running on port 3001
2. Verify environment variables are set correctly
3. Check browser console for errors
4. Verify Resend API key is valid and sender email is verified

### reCAPTCHA not working
1. Verify your reCAPTCHA keys are correct
2. Check that the domain is registered in reCAPTCHA admin console
3. Ensure reCAPTCHA script is loading properly

## Dependencies

Key dependencies added:
- `axios` - For HTTP requests (reCAPTCHA verification)
- `express` - Backend server for API routes
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `concurrently` - Run multiple commands simultaneously

## Support

For issues or questions, please check the console logs for detailed error messages.