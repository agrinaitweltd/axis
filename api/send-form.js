import { Resend } from 'resend';
import axios from 'axios';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY);

// Verify reCAPTCHA token
async function verifyRecaptcha(token) {
  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY || process.env.VITE_RECAPTCHA_SECRET_KEY,
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
    .logo { max-height: 80px; margin-bottom: 20px; }
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
      <img src="https://axisagro.co.uk/public/logo.png" alt="Axis Agro International Limited" class="logo" />
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
  // Group form fields into sections for better readability
  const contactFields = ['firstName', 'lastName', 'email', 'phone', 'company', 'country'];
  const businessFields = ['businessType'];
  const otherFields = Object.keys(formData).filter(
    k => !contactFields.includes(k) && !businessFields.includes(k)
  );

  const renderSection = (title, fields) => {
    const rows = fields
      .filter(key => formData[key])
      .map((key, idx) => {
        const displayKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
        const bgColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
        return `<tr style="background:${bgColor};">
          <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #0b1f14; width: 35%;">${displayKey}</td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; color: #333;">${formData[key] || '—'}</td>
        </tr>`;
      });
    
    return rows.length > 0 ? `
      <div style="margin-bottom: 24px;">
        <h3 style="color: #0b1f14; font-size: 14px; font-weight: 700; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #27864f;">${title}</h3>
        <table style="width:100%; border-collapse:collapse;">
          ${rows.join('')}
        </table>
      </div>
    ` : '';
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 700px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; }
    .header { background: linear-gradient(135deg, #0b1f14 0%, #14352a 100%); padding: 40px 20px; text-align: center; }
    .logo { max-height: 80px; margin-bottom: 20px; }
    .header h1 { color: #ffffff; margin: 0 0 8px 0; font-size: 26px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.85); margin: 0; font-size: 14px; }
    .badge { display: inline-block; background: #27864f; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 10px; }
    .content { padding: 40px; }
    .quick-info { background: #f0f9f5; border-left: 4px solid #27864f; padding: 16px; margin-bottom: 24px; border-radius: 4px; }
    .quick-info-row { display: flex; gap: 30px; margin-bottom: 10px; }
    .quick-info-row:last-child { margin-bottom: 0; }
    .quick-label { font-weight: 600; color: #0b1f14; font-size: 13px; min-width: 100px; }
    .quick-value { color: #27864f; font-weight: 600; }
    .footer { background: #f3f4f6; padding: 24px 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    .footer a { color: #27864f; text-decoration: none; }
    .footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://axisagro.co.uk/public/logo.png" alt="Axis Agro International Limited" class="logo" />
      <h1>📨 New Form Submission</h1>
      <p>Axis Agro International Limited</p>
      <div class="badge">Action Required</div>
    </div>
    
    <div class="content">
      <!-- Quick Info Snapshot -->
      <div class="quick-info">
        <div class="quick-info-row">
          <span class="quick-label">From:</span>
          <span class="quick-value">${formData.firstName || ''} ${formData.lastName || ''}</span>
        </div>
        <div class="quick-info-row">
          <span class="quick-label">Email:</span>
          <span class="quick-value"><a href="mailto:${formData.email || ''}" style="color: #27864f; text-decoration: none;">${formData.email || '—'}</a></span>
        </div>
        <div class="quick-info-row">
          <span class="quick-label">Type:</span>
          <span class="quick-value">${formData.businessType ? formData.businessType.replace(/-/g, ' ').toUpperCase() : '—'}</span>
        </div>
      </div>

      <!-- Contact Details -->
      ${renderSection('📋 Contact Information', contactFields)}

      <!-- Business Type -->
      ${formData.businessType ? `
        <div style="margin-bottom: 24px;">
          <h3 style="color: #0b1f14; font-size: 14px; font-weight: 700; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #27864f;">🏢 Business Type</h3>
          <table style="width:100%; border-collapse:collapse;">
            <tr style="background:#f9fafb;">
              <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #0b1f14; width: 35%;">Business Type</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; color: #333;">${formData.businessType || '—'}</td>
            </tr>
          </table>
        </div>
      ` : ''}

      <!-- Other Details -->
      ${renderSection('📝 Additional Information', otherFields)}

      <!-- Submission Timestamp -->
      <div style="background: #faf9f7; padding: 16px; border-radius: 4px; text-align: center; color: #6b7280; font-size: 13px;">
        <strong>Submitted on:</strong> ${new Date().toLocaleString('en-GB', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'UTC'
        })} UTC
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 8px 0;"><strong>Quick Actions:</strong></p>
      <p style="margin: 0 0 12px 0;">
        <a href="mailto:${formData.email || ''}">Reply to ${formData.firstName || 'Enquirer'}</a> | 
        <a href="https://axisagro.co.uk">View Website</a>
      </p>
      <p style="margin: 0;">Axis Agro International Limited | Registered in England & Wales and Uganda</p>
      <p style="margin: 8px 0 0 0;">© 2025 Axis Agro International Limited. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
</html>
  `;
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Received form submission request');
    const { formData, recaptchaToken } = req.body;

    // Validate required fields
    if (!formData || !recaptchaToken) {
      console.error('Missing required fields:', { formData: !!formData, recaptchaToken: !!recaptchaToken });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check environment variables
    const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not set');
      return res.status(500).json({ error: 'Email service not configured (missing API key)' });
    }

    const senderEmail = process.env.SENDER_EMAIL || process.env.VITE_SENDER_EMAIL || 'noreply@axisagro.co.uk';
    
    console.log('Using sender email:', senderEmail);
    console.log('API Key present:', !!apiKey);

    const { email, firstName, lastName } = formData;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Verify reCAPTCHA
    const recaptchaResult = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaResult.valid) {
      console.warn('reCAPTCHA verification failed:', recaptchaResult);
      return res.status(403).json({ error: 'reCAPTCHA verification failed. Please try again.' });
    }

    console.log('Sending confirmation email to:', email);
    // Send confirmation email to user
    const senderEmail = process.env.SENDER_EMAIL || process.env.VITE_SENDER_EMAIL || 'noreply@axisagro.co.uk';
    
    try {
      const userEmailResult = await resend.emails.send({
        from: senderEmail,
        to: email,
        subject: 'We Received Your Enquiry - Axis Agro International Limited',
        html: getUserConfirmationEmail(formData),
      });

      console.log('User email result:', JSON.stringify(userEmailResult, null, 2));

      if (userEmailResult.error) {
        console.error('Error sending user confirmation email:', userEmailResult.error);
        return res.status(500).json({ error: 'Failed to send confirmation email: ' + (userEmailResult.error?.message || userEmailResult.error) });
      }
    } catch (emailErr) {
      console.error('Exception sending user email:', emailErr);
      return res.status(500).json({ error: 'Email service error: ' + (emailErr.message || String(emailErr)) });
    }

    // Send admin notification emails to hardcoded addresses
    const adminEmails = ['oliver.amanya1@gmail.com'];

    console.log('Sending admin notifications to:', adminEmails);

    const adminResults = [];

    for (const adminEmail of adminEmails) {
      try {
        const adminEmailResult = await resend.emails.send({
          from: senderEmail,
          to: adminEmail,
          subject: `New Form Submission from ${firstName} ${lastName}`,
          html: getAdminNotificationEmail(formData),
        });

        console.log(`Admin email response for ${adminEmail}:`, JSON.stringify(adminEmailResult, null, 2));

        if (adminEmailResult && adminEmailResult.error) {
          console.error(`Error sending admin email to ${adminEmail}:`, adminEmailResult.error);
          adminResults.push({ to: adminEmail, success: false, error: adminEmailResult.error });
        } else {
          console.log(`Successfully sent admin email to ${adminEmail}`);
          adminResults.push({ to: adminEmail, success: true });
        }
      } catch (err) {
        console.error(`Exception sending admin email to ${adminEmail}:`, err);
        adminResults.push({ to: adminEmail, success: false, error: err.message || String(err) });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully. Confirmation email sent.',
      recaptchaScore: recaptchaResult.score,
      adminResults,
    });
  } catch (error) {
    console.error('Form submission error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Server error: ' + (error.message || String(error)),
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
