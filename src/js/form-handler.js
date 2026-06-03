/**
 * Axis Agro Form and reCAPTCHA Handler
 * Handles form submissions with reCAPTCHA v3 protection and email notifications
 */

class AxisAgroFormHandler {
  constructor() {
    this.siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    this.recaptchaLoaded = false;
    this.init();
  }

  async init() {
    // Load reCAPTCHA script
    this.loadRecaptcha();
    
    // Setup form handlers
    this.setupFormHandlers();
    
    // Ensure badge is visible
    this.ensureBadgeVisibility();
  }

  loadRecaptcha() {
    if (window.grecaptcha) {
      this.recaptchaLoaded = true;
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.recaptchaLoaded = true;
    };
    script.onerror = () => {
      console.error('Failed to load reCAPTCHA');
    };
    document.head.appendChild(script);
  }

  setupFormHandlers() {
    // Get all form elements that should have reCAPTCHA protection
    const forms = document.querySelectorAll('[data-recaptcha="true"]');
    
    forms.forEach((form) => {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e, form));
    });
  }

  async handleFormSubmit(event, form) {
    event.preventDefault();

    // Check if reCAPTCHA is loaded
    if (!this.recaptchaLoaded || !window.grecaptcha) {
      this.showError(form, 'Security verification is loading. Please wait.');
      return;
    }

    try {
      // Collect form data first (don't disable inputs before collecting)
      const formData = this.collectFormData(form);

      // Show loading state (this will disable controls)
      this.setFormLoading(form, true);

      // Get reCAPTCHA token
      const token = await window.grecaptcha.execute(this.siteKey, {
        action: 'submit',
      });

      // Submit form to API
      const response = await fetch('/api/send-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          recaptchaToken: token,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Form submission failed');
      }

      // If backend included admin send results, log any failures for debugging
      if (result.adminResults && Array.isArray(result.adminResults)) {
        const failed = result.adminResults.filter(r => !r.success);
        if (failed.length) {
          console.warn('Admin email failures:', failed);
        }
      }

      // Show success UI and remove the form, passing adminResults for visibility
      this.showSuccess(form, result.message, result.adminResults);

      // Clear any error messages
      this.clearError(form);
    } catch (error) {
      console.error('Form submission error:', error);
      this.showError(form, error.message || 'An error occurred. Please try again.');
    } finally {
      this.setFormLoading(form, false);
    }
  }

  collectFormData(form) {
    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
      if (data[key]) {
        // Handle multiple values with same name (checkboxes, multi-select)
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    });

    return data;
  }

  setFormLoading(form, isLoading) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    // store original text
    if (!submitBtn.getAttribute('data-original-text')) {
      submitBtn.setAttribute('data-original-text', submitBtn.textContent.trim() || 'Send Enquiry');
    }

    // create or find overlay
    let overlay = form.querySelector('.form-loading-overlay');
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';

      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'form-loading-overlay';
        overlay.innerHTML = `
          <div class="form-loading-inner">
            <div class="spinner" aria-hidden="true"></div>
            <div class="loading-text">Sending your message…</div>
          </div>
        `;
        form.style.position = 'relative';
        form.appendChild(overlay);
      }

      // disable all form controls while sending
      Array.from(form.querySelectorAll('input, select, textarea, button')).forEach((el) => el.disabled = true);
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Send Enquiry';
      submitBtn.style.opacity = '1';

      if (overlay) overlay.remove();
      Array.from(form.querySelectorAll('input, select, textarea, button')).forEach((el) => el.disabled = false);
    }
  }

  showSuccess(form, message, adminResults) {
    // Remove the form completely and show a compact success banner where it was
    const banner = document.createElement('div');
    banner.className = 'form-success-banner';
    banner.setAttribute('role', 'status');

    // Build admin results debug block if provided
    let adminDebugBlock = '';
    if (adminResults && Array.isArray(adminResults)) {
      const adminSummary = adminResults.map(r => {
        const status = r.success ? '✓' : '✗';
        const errorText = r.error ? ` — ${r.error}` : '';
        return `${status} ${r.to}${errorText}`;
      }).join('<br>');
      adminDebugBlock = `<div style="margin-top:12px;padding:8px;background:rgba(0,0,0,0.04);border-radius:4px;font-size:0.85rem;color:var(--text-600);font-family:monospace;">${adminSummary}</div>`;
    }

    banner.innerHTML = `
      <div style="background:#eaf6ef;border:1px solid var(--green-200);padding:14px;border-radius:8px;display:flex;gap:12px;align-items:center;">
        <div style="width:44px;height:44px;border-radius:50%;background:var(--green-100);color:var(--green-700);display:flex;align-items:center;justify-content:center;font-weight:800;">✓</div>
        <div style="flex:1;">
          <div style="font-weight:700;">Thanks — we've received your message</div>
          <div style="color:var(--text-500);font-size:0.95rem;margin-top:4px;">${message || 'A confirmation email has been sent. We will reply within one business day.'}</div>
          ${adminDebugBlock}
        </div>
      </div>
    `;

    // Find wrapper and remove it entirely, inserting banner in same position
    const wrapper = form.closest('.contact-form-wrapper') || form.parentElement;
    if (wrapper && wrapper.parentNode) {
      wrapper.parentNode.insertBefore(banner, wrapper);
      wrapper.remove();
    } else if (form.parentNode) {
      form.parentNode.insertBefore(banner, form);
      form.remove();
    }
  }

  showError(form, message) {
    this.clearMessages(form);

    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error-message';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.innerHTML = `
      <div style="background: #fee; border: 1px solid #c33; border-radius: 6px; padding: 12px 16px; color: #c00; margin-bottom: 20px;">
        <strong>✗ Error:</strong> ${message}
      </div>
    `;

    form.insertBefore(errorDiv, form.firstChild);
  }

  clearError(form) {
    const errorDiv = form.querySelector('.form-error-message');
    if (errorDiv) {
      errorDiv.remove();
    }
  }

  clearMessages(form) {
    const messages = form.querySelectorAll('.form-error-message, .form-success-message');
    messages.forEach((msg) => msg.remove());
  }

  ensureBadgeVisibility() {
    // Add CSS to show only reCAPTCHA logo, pop out full badge on hover
    const style = document.createElement('style');
    style.textContent = `
      .grecaptcha-badge {
        visibility: visible !important;
        opacity: 1 !important;
        display: block !important;
        pointer-events: auto !important;
        z-index: 99999 !important;
        right: 0 !important;
        bottom: 0 !important;
        position: fixed !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        transform: translateX(100%) !important;
        width: 70px !important;
        overflow: hidden !important;
      }
      
      .grecaptcha-badge:hover {
        box-shadow: 0 8px 24px rgba(0,0,0,0.25) !important;
        transform: translateX(0) !important;
        width: auto !important;
        border-radius: 4px !important;
        right: 20px !important;
        bottom: 20px !important;
      }
      
      /* Hide the text content by default, show only logo */
      .grecaptcha-badge:not(:hover) .grecaptcha-badge-text,
      .grecaptcha-badge:not(:hover) .grecaptcha-badge-paragraph {
        display: none !important;
      }
      
      /* Make the badge container blend better with the site design */
      .grecaptcha-badge::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(247,250,248,0.95)) !important;
        border-radius: 4px !important;
        z-index: -1 !important;
      }
      
      /* Responsive positioning for mobile */
      @media (max-width: 768px) {
        .grecaptcha-badge {
          right: 0 !important;
          bottom: 0 !important;
          transform: translateX(100%) !important;
          width: 60px !important;
        }
        
        .grecaptcha-badge:hover {
          transform: translateX(0) !important;
          width: auto !important;
          right: 10px !important;
          bottom: 10px !important;
        }
      }
      
      /* Ensure badge is not covered by fixed footers */
      body {
        padding-bottom: 0;
      }
      
      footer {
        position: relative;
        z-index: 10;
      }
      
      /* Add a subtle privacy text link styling */
      .grecaptcha-badge a {
        color: #27864f !important;
        text-decoration: none !important;
        transition: color 0.2s ease !important;
      }
      
      .grecaptcha-badge a:hover {
        color: #1e6b42 !important;
        text-decoration: underline !important;
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AxisAgroFormHandler();
  });
} else {
  new AxisAgroFormHandler();
}

export default AxisAgroFormHandler;
