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
      // Show loading state
      this.setFormLoading(form, true);

      // Get reCAPTCHA token
      const token = await window.grecaptcha.execute(this.siteKey, {
        action: 'submit',
      });

      // Collect form data
      const formData = this.collectFormData(form);

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

      // Show success message
      this.showSuccess(form, result.message);

      // Reset form
      form.reset();

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

    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      submitBtn.style.opacity = '0.6';
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Send Enquiry';
      submitBtn.style.opacity = '1';
    }
  }

  showSuccess(form, message) {
    this.clearMessages(form);

    const successDiv = document.createElement('div');
    successDiv.className = 'form-success-message';
    successDiv.setAttribute('role', 'alert');
    successDiv.innerHTML = `
      <div style="background: #d5f0dc; border: 1px solid #27864f; border-radius: 6px; padding: 12px 16px; color: #0b1f14; margin-bottom: 20px;">
        <strong>✓ Success!</strong> ${message}
      </div>
    `;

    form.insertBefore(successDiv, form.firstChild);

    // Auto-remove after 6 seconds
    setTimeout(() => {
      successDiv.remove();
    }, 6000);
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
    // Add CSS to ensure reCAPTCHA badge is always visible
    const style = document.createElement('style');
    style.textContent = `
      .grecaptcha-badge {
        visibility: visible !important;
        opacity: 1 !important;
        display: block !important;
        pointer-events: auto !important;
        z-index: 99999 !important;
        right: 20px !important;
        bottom: 20px !important;
        position: fixed !important;
      }
      
      /* Ensure badge is not covered by fixed footers */
      body {
        padding-bottom: 0;
      }
      
      footer {
        position: relative;
        z-index: 10;
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
