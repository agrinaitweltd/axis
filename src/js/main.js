/* ============================================================
   Axis International Limited  Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* --- Navbar scroll behaviour --- */
  const navbar = document.getElementById('navbar');

  function handleScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* --- Dropdown menus (desktop) --- */
  document.querySelectorAll('.has-dropdown').forEach(function (li) {
    var btn = li.querySelector('.dropdown-trigger');

    li.addEventListener('mouseenter', function () {
      li.classList.add('open');
    });

    li.addEventListener('mouseleave', function () {
      li.classList.remove('open');
    });

    if (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        li.classList.toggle('open');
      });
    }
  });

  /* --- Mobile nav toggle --- */
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobileNav');
  var mobileNavClose = document.getElementById('mobileNavClose');

  function closeMobileNav() {
    if (mobileNav) mobileNav.classList.remove('open');
    if (hamburger) hamburger.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
  }

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', closeMobileNav);
  }

  /* Close when clicking backdrop (outside nav links) */
  if (mobileNav) {
    mobileNav.addEventListener('click', function (e) {
      if (e.target === mobileNav) closeMobileNav();
    });
  }

  /* --- Mobile sub-menu toggles --- */
  document.querySelectorAll('.mobile-sub-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sub = document.getElementById(btn.dataset.target);
      if (sub) sub.classList.toggle('open');
      btn.classList.toggle('open');
    });
  });

  /* --- Active nav link highlighting --- */
  var path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href) return;
    var linkPath = href.replace(/\.html$/,'').replace(/\/index$/,'').replace(/\/$/,'') || '/';
    var currentPath = path.replace(/\.html$/,'').replace(/\/index$/,'').replace(/\/$/,'') || '/';
    if (linkPath === currentPath) {
      link.classList.add('active');
    }
  });

  /* --- Scroll-triggered animations (fade-up, slide-in, scale-in) --- */
  var animObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          animObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );

  document.querySelectorAll('.fade-up, .slide-in-left, .slide-in-right, .scale-in').forEach(function (el) {
    animObserver.observe(el);
  });

  /* --- Counter animation --- */
  var counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var counters = entry.target.querySelectorAll('.counter-num');
          counters.forEach(function (counter) {
            var target = parseInt(counter.getAttribute('data-target'), 10);
            var duration = 2000;
            var start = 0;
            var startTime = null;

            function easeOutQuart(t) {
              return 1 - Math.pow(1 - t, 4);
            }

            function animate(timestamp) {
              if (!startTime) startTime = timestamp;
              var progress = Math.min((timestamp - startTime) / duration, 1);
              var easedProgress = easeOutQuart(progress);
              counter.textContent = Math.floor(easedProgress * target);
              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                counter.textContent = target;
              }
            }

            requestAnimationFrame(animate);
          });
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  var statsSection = document.querySelector('.stats-counter');
  if (statsSection) {
    counterObserver.observe(statsSection);
  }

  /* --- Parallax hero background --- */
  var heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', function () {
      var scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroBg.style.transform = 'scale(' + (1 + scrolled * 0.0003) + ') translateY(' + (scrolled * 0.3) + 'px)';
      }
    }, { passive: true });
  }

  /* --- Contact form handler --- */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = contactForm.querySelector('.form-submit');
      var originalText = btn.textContent;
      btn.textContent = 'Message Sent!';
      btn.style.background = 'var(--green-700)';
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
        contactForm.reset();
      }, 3000);
    });
  }

  /* --- Close mobile nav on link click --- */
  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobileNav);
    });
  }

  /* --- Business type card selector & conditional fields --- */
  var bizTypeGrid = document.getElementById('bizTypeGrid');
  if (bizTypeGrid) {
    var allConditionalSections = [
      'fields-farmer', 'fields-cooperative', 'fields-wholesale',
      'fields-importer', 'fields-exporter', 'fields-retailer',
      'fields-manufacturer', 'fields-trader', 'fields-logistics'
    ];
    var commonFields = document.getElementById('commonFields');

    function showConditionalSection(value) {
      // Hide all conditional sections
      allConditionalSections.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });

      // Show matching section
      var sectionMap = {
        farmer: 'fields-farmer',
        cooperative: 'fields-cooperative',
        wholesale: 'fields-wholesale',
        importer: 'fields-importer',
        exporter: 'fields-exporter',
        retailer: 'fields-retailer',
        manufacturer: 'fields-manufacturer',
        trader: 'fields-trader',
        logistics: 'fields-logistics'
      };

      if (sectionMap[value]) {
        var target = document.getElementById(sectionMap[value]);
        if (target) {
          target.style.display = 'block';
          target.classList.remove('cond-animate');
          // Force reflow then re-add class to re-trigger animation
          void target.offsetWidth;
          target.classList.add('cond-animate');
        }
      }

      // Show common fields for any selection
      if (commonFields) {
        commonFields.style.display = value ? 'block' : 'none';
      }
    }

    // Handle card radio click — add .selected to parent label
    var bizCards = bizTypeGrid.querySelectorAll('.biz-card input[type="radio"]');
    bizCards.forEach(function(radio) {
      radio.addEventListener('change', function() {
        // Remove selected from all cards
        bizTypeGrid.querySelectorAll('.biz-card').forEach(function(card) {
          card.classList.remove('selected');
        });
        // Mark chosen card
        this.closest('.biz-card').classList.add('selected');
        showConditionalSection(this.value);
      });
    });
  }

  /* --- reCAPTCHA success callback --- */
  window.onRecaptchaSuccess = function() {
    var submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  };

  /* --- Form submission handler --- */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    var submitBtn = document.getElementById('submitBtn');
    
    // Enable submit button by default
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
    
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      
      // Check if reCAPTCHA is verified (only if reCAPTCHA is loaded)
      if (typeof grecaptcha !== 'undefined') {
        var recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
          alert('Please complete the reCAPTCHA verification.');
          return;
        }
      }

      // Show success state
      if (submitBtn) {
        var originalText = submitBtn.textContent;
        submitBtn.textContent = 'Message Sent! ✓';
        submitBtn.style.background = 'var(--green-700)';
        submitBtn.disabled = true;

        setTimeout(function () {
          submitBtn.textContent = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
          contactForm.reset();
          if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset();
          }
        }, 3000);
      }
    });
  }

})();
