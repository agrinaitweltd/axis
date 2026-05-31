import { Resend } from 'resend';
import axios from 'axios';

const resend = new Resend(process.env.VITE_RESEND_API_KEY);

// Verify reCAPTCHA token
async function verifyRecaptcha(token) {
  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.VITE_RECAPTCHA_SECRET_KEY,
          response: token,
        },
      }
    );

    const { success, score } = response.data;
    
    // reCAPTCHA v3 returns a score from 0.0 to 1.0
    // Higher scores indicate more likely to be legitimate
    if (success && score >= 0.5) {
      return { valid: true, score };
    }
    
    return { valid: false, score, reason: 'Failed reCAPTCHA verification' };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return { valid: false, reason: 'reCAPTCHA service error' };
  }
}

// Email template for user confirmation
function getUserConfirmationEmail(formData) {
  const { email, firstName, lastName, company } = formData;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #0b1f14 0%, #14352a 100%); padding: 40px 20px; text-align: center; }
    .logo { max-height: 60px; margin-bottom: 15px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 40px 20px; }
    .greeting { color: #0b1f14; font-size: 18px; font-weight: 600; margin-bottom: 20px; }
    .body-text { color: #555; margin-bottom: 20px; line-height: 1.8; }
    .highlight { color: #27864f; font-weight: 600; }
    .footer { background: #f7faf8; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e2e8e4; }
    .footer a { color: #27864f; text-decoration: none; }
    .button { display: inline-block; background: #27864f; color: #ffffff; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You!</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">Axis Agro International Limited</p>
    </div>
    
    <div class="content">
      <div class="greeting">Hello ${firstName} ${lastName},</div>
      
      <p class="body-text">
        Thank you for contacting <span class="highlight">Axis Agro International Limited</span>. We have received your enquiry and it is very important to us.
      </p>
      
      <p class="body-text">
        Our team will review your submission and get back to you shortly. We typically respond to enquiries within one business day.
      </p>
      
      <p class="body-text">
        If you have any urgent questions in the meantime, please feel free to contact us:
      </p>
      
      <p style="color: #27864f;">
        <strong>Phone:</strong> +44 7418 354137<br>
        <strong>Email:</strong> info@axisagro.co.uk
      </p>
      
      <p class="body-text">
        We look forward to working with you!
      </p>
      
      <p style="color: #27864f; font-weight: 600; margin-top: 30px;">
        Best regards,<br>
        The Axis Agro Team
      </p>
    </div>
    
    <div class="footer">
      <p>Axis Agro International Limited | Registered in England & Wales and Uganda</p>
      <p>© 2025 Axis Agro International Limited. All rights reserved.</p>
      <p><a href="https://axisagro.co.uk">Visit our website</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

// Email template for admin notification
function getAdminNotificationEmail(formData) {
  const formFields = Object.entries(formData)
    .map(([key, value]) => {
      const displayKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
      return `<tr><td style="padding: 8px; border-bottom: 1px solid #e2e8e4;"><strong>${displayKey}:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e2e8e4;">${value || 'N/A'}</td></tr>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 700px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #0b1f14 0%, #14352a 100%); padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
    .content { padding: 30px 20px; }
    .section-title { color: #0b1f14; font-size: 16px; font-weight: 700; margin: 20px 0 10px 0; border-bottom: 2px solid #27864f; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; }
    .footer { background: #f7faf8; padding: 15px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #e2e8e4; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Form Submission</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">Axis Agro International Limited</p>
    </div>
    
    <div class="content">
      <div class="section-title">📋 Form Details</div>
      
      <table>
        ${formFields}
      </table>
      
      <div class="section-title">⏰ Submission Time</div>
      <p>${new Date().toLocaleString()}</p>
    </div>
    
    <div class="footer">
      <p>This is an automated notification. Please do not reply to this email.</p>
      <p>© 2025 Axis Agro International Limited. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { formData, recaptchaToken } = req.body;

    // Validate required fields
    if (!formData || !recaptchaToken) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify reCAPTCHA
    const recaptchaResult = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaResult.valid) {
      console.warn('reCAPTCHA verification failed:', recaptchaResult);
      return res.status(403).json({ error: 'reCAPTCHA verification failed. Please try again.' });
    }

    const { email, firstName, lastName } = formData;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Send confirmation email to user
    const userEmailResult = await resend.emails.send({
      from: process.env.VITE_SENDER_EMAIL,
      to: email,
      subject: 'We Received Your Enquiry - Axis Agro International Limited',
      html: getUserConfirmationEmail(formData),
    });

    if (userEmailResult.error) {
      console.error('Error sending user confirmation email:', userEmailResult.error);
      return res.status(500).json({ error: 'Failed to send confirmation email' });
    }

    // Send admin notification emails
    const adminEmails = [
      process.env.VITE_ADMIN_EMAIL_1,
      process.env.VITE_ADMIN_EMAIL_2,
    ].filter(Boolean);

    for (const adminEmail of adminEmails) {
      const adminEmailResult = await resend.emails.send({
        from: process.env.VITE_SENDER_EMAIL,
        to: adminEmail,
        subject: `New Form Submission from ${firstName} ${lastName}`,
        html: getAdminNotificationEmail(formData),
      });

      if (adminEmailResult.error) {
        console.error(`Error sending admin email to ${adminEmail}:`, adminEmailResult.error);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully. Confirmation email sent.',
      recaptchaScore: recaptchaResult.score,
    });
  } catch (error) {
    console.error('Form submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
