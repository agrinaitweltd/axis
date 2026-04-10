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
      'fields-manufacturer', 'fields-trader', 'fields-logistics',
      'fields-other'
    ];
    var commonFields = document.getElementById('commonFields');
    var budgetGroup = document.getElementById('budgetGroup');
    var showBudgetFor = ['wholesale', 'importer', 'exporter', 'retailer', 'manufacturer', 'trader'];
    var sectionMap = {
      farmer:       'fields-farmer',
      cooperative:  'fields-cooperative',
      wholesale:    'fields-wholesale',
      importer:     'fields-importer',
      exporter:     'fields-exporter',
      retailer:     'fields-retailer',
      manufacturer: 'fields-manufacturer',
      trader:       'fields-trader',
      logistics:    'fields-logistics',
      other:        'fields-other'
    };

    function showConditionalSection(value) {
      allConditionalSections.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });

      if (sectionMap[value]) {
        var target = document.getElementById(sectionMap[value]);
        if (target) {
          target.style.display = 'block';
          target.classList.remove('cond-animate');
          void target.offsetWidth;
          target.classList.add('cond-animate');
        }
      }

      // Hide commonFields for 'other' (has its own enquiry textarea)
      if (commonFields) {
        commonFields.style.display = (value && value !== 'other') ? 'block' : 'none';
      }

      // Budget only for buyer / trade types
      if (budgetGroup) {
        budgetGroup.style.display = showBudgetFor.indexOf(value) !== -1 ? 'block' : 'none';
      }
    }

    var bizCards = bizTypeGrid.querySelectorAll('.biz-card input[type="radio"]');
    bizCards.forEach(function(radio) {
      radio.addEventListener('change', function() {
        var val = this.value;
        bizTypeGrid.querySelectorAll('.biz-card').forEach(function(card) {
          card.classList.remove('selected');
        });
        this.closest('.biz-card').classList.add('selected');
        showConditionalSection(val);

        // Auto-scroll to the revealed section
        setTimeout(function() {
          var scrollTarget = sectionMap[val] ? document.getElementById(sectionMap[val]) : null;
          if (!scrollTarget && val !== 'other') scrollTarget = commonFields;
          if (scrollTarget) {
            var navbar = document.getElementById('navbar');
            var offset = navbar ? navbar.offsetHeight + 20 : 90;
            var top = scrollTarget.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
          }
        }, 60);
      });
    });
  }

  /* --- Country/state/city/town from synced site database --- */
  var countrySelect = document.getElementById('country');
  var regionRow = document.getElementById('regionRow');
  var stateSelect = document.getElementById('stateSelect');
  var regionSelect = document.getElementById('regionSelect');
  var citySelect = document.getElementById('citySelect');
  var townSelect = document.getElementById('townSelect');

  function fillSelect(el, values, placeholder, valueKey, labelKey) {
    if (!el) return;
    el.innerHTML = '';
    var first = document.createElement('option');
    first.value = '';
    first.textContent = placeholder;
    el.appendChild(first);

    values.forEach(function(v) {
      var opt = document.createElement('option');
      if (typeof v === 'string') {
        opt.value = v;
        opt.textContent = v;
      } else {
        opt.value = v[valueKey] || v[labelKey] || '';
        opt.textContent = v[labelKey] || '';
      }
      el.appendChild(opt);
    });
  }

  if (countrySelect && regionRow && stateSelect && regionSelect && citySelect && townSelect) {
    fetch('/data/location-db.json')
      .then(function(res) { return res.json(); })
      .then(function(db) {
        var countries = Array.isArray(db.countries) ? db.countries : [];
        var countryByIso2 = {};
        countries.forEach(function(c) {
          if (c.iso2) countryByIso2[c.iso2] = c;
        });

        var priority = ['GB', 'UG', 'KE', 'TZ', 'ET', 'RW', 'BI'];

        function populateCountrySelect() {
          countrySelect.innerHTML = '';

          var first = document.createElement('option');
          first.value = '';
          first.textContent = 'Where are you based?';
          first.disabled = true;
          first.selected = true;
          countrySelect.appendChild(first);

          var priorityGroup = document.createElement('optgroup');
          priorityGroup.label = 'Priority Markets';
          priority.forEach(function(iso) {
            var c = countryByIso2[iso];
            if (!c) return;
            var opt = document.createElement('option');
            opt.value = c.iso2;
            opt.textContent = c.name;
            priorityGroup.appendChild(opt);
          });
          countrySelect.appendChild(priorityGroup);

          var allGroup = document.createElement('optgroup');
          allGroup.label = 'All Countries';
          countries
            .slice()
            .sort(function(a, b) { return a.name.localeCompare(b.name); })
            .forEach(function(c) {
              if (priority.indexOf(c.iso2) !== -1) return;
              var opt = document.createElement('option');
              opt.value = c.iso2;
              opt.textContent = c.name;
              allGroup.appendChild(opt);
            });
          countrySelect.appendChild(allGroup);
        }

        // Hide region/town selects — data source only has country→state→city
        var regionGroup = regionSelect ? regionSelect.closest('.form-group') : null;
        var townGroup = townSelect ? townSelect.closest('.form-group') : null;
        if (regionGroup) regionGroup.style.display = 'none';
        if (townGroup) townGroup.style.display = 'none';

        function resetLocality() {
          fillSelect(stateSelect, [], 'Select state or county...');
          fillSelect(citySelect, [], 'Select city...');
        }

        populateCountrySelect();
        resetLocality();

        countrySelect.addEventListener('change', function() {
          var country = countryByIso2[this.value] || null;
          regionRow.style.display = country ? 'block' : 'none';

          if (!country) {
            resetLocality();
            return;
          }

          var sortedStates = (country.states || []).slice().sort(function(a, b) {
            return a.name.localeCompare(b.name);
          });
          var sortedCities = (country.cities || []).slice().sort();

          fillSelect(stateSelect, sortedStates, 'Select state or county...', 'code', 'name');
          fillSelect(citySelect, sortedCities, 'Select city...');
        });

        stateSelect.addEventListener('change', function() {
          var country = countryByIso2[countrySelect.value] || null;
          if (!country) return;

          var selectedState = (country.states || []).find(function(s) {
            return s.code === stateSelect.value || s.name === stateSelect.value;
          });

          // Use state-level cities if available, otherwise fall back to all country cities
          var cities = selectedState && Array.isArray(selectedState.cities) && selectedState.cities.length > 0
            ? selectedState.cities.slice().sort()
            : (country.cities || []).slice().sort();

          fillSelect(citySelect, cities, 'Select city...');
        });

        if (countrySelect.value) {
          countrySelect.dispatchEvent(new Event('change'));
        }
      })
      .catch(function() {
        // If sync file is unavailable, just show/hide the region row
        regionRow.style.display = 'none';
        countrySelect.addEventListener('change', function() {
          regionRow.style.display = this.value ? 'block' : 'none';
        });
      });
  }

  /* --- Product picker: populate grade sub-dropdown on selection --- */
  var productGradeMap = {
    'coffee-arabica':  ['Washed / Fully Washed', 'Natural / Dry Process', 'Honey Process', 'Specialty Grade (SCA 80+)', 'Fine Cup (SCA 75–79)', 'Commercial Grade'],
    'coffee-robusta':  ['Robusta Grade 1 (Screen 15+)', 'Robusta Grade 2', 'FAQ (Fair Average Quality)', 'Washed Robusta', 'Natural Robusta'],
    'coffee-specialty':['Single Origin Micro-lot', 'Competition Grade (SCA 85+)', 'Cupping Score 80–84'],
    'avocado':         ['Grade 1 Export — Hass', 'Grade 2 Export — Hass', 'Fuerte Grade 1', 'Mixed / Open to Spec'],
    'mango':           ['Grade A Export (Tommy Atkins)', 'Grade A Export (Apple Mango)', 'Grade A Export (Kent / Ngowe)', 'Grade B / Processing'],
    'pineapple':       ['Grade A Export — Smooth Cayenne', 'Grade A Export — MD2', 'Grade B'],
    'banana':          ['Class 1 Export (Cavendish)', 'Class 2', 'Green / Unripe Export Ready'],
    'passion-fruit':   ['Grade A — Purple Passion', 'Grade A — Yellow Passion', 'Grade B'],
    'jackfruit':       ['Young Green (culinary use)', 'Ripe Grade A', 'Processing Grade'],
    'papaya':          ['Grade A Export (Solo / Sunrise)', 'Grade B', 'Processing Grade'],
    'maize':           ['White Maize Grade 1 (≤12.5% moisture)', 'Yellow Maize Grade 1', 'Grade 2', 'Feed Grade'],
    'sorghum':         ['White Sorghum Grade 1', 'White Sorghum Grade 2', 'Red Sorghum', 'Tannin-free Sorghum'],
    'millet':          ['Finger Millet Grade 1', 'Pearl Millet Grade 1', 'Grade 2'],
    'sesame':          ['Hulled White Grade 1', 'Hulled White Grade 2', 'Unhulled Natural', 'Black Sesame Grade 1'],
    'beans':           ['Rose Coco Grade 1', 'Red Kidney Beans Grade 1', 'Black-eye Peas Grade 1', 'Green Grams (Mung) Grade 1'],
    'groundnuts':      ['Runner Grade 1 (Blanched)', 'Virginia Grade 1', 'Grade 2', 'Oil Grade'],
    'cowpeas':         ['Grade 1', 'Grade 2', 'Mixed'],
    'soybeans':        ['Non-GMO Grade 1', 'Grade 1', 'Oil Grade'],
    'rice':            ['Long Grain White — Grade A', 'Parboiled Grade 1', 'Brown Rice Grade 1'],
    'vanilla':         ['Grade A — Gourmet (Whole Pods)', 'Grade B — Extract Quality', 'Green / Fresh Vanilla'],
    'ginger':          ['Fresh Grade 1', 'Dried Grade 1 (Sliced)', 'Ground / Powder Grade 1'],
    'turmeric':        ['Grade 1 (≥3% curcumin)', 'Grade 2', 'Organic Certified'],
    'chilli':          ['Fresh Grade A', 'Dried Whole Grade 1', 'Crushed / Flakes Grade 1'],
    'coriander':       ['Whole Seeds Grade 1', 'Ground Grade 1'],
    'moringa':         ['Leaf Powder Grade 1', 'Dried Leaves Grade 1', 'Seed Grade 1'],
    'cardamom':        ['Small Green Grade 1', 'Bold Green Grade 1', 'Bleached White'],
    'shea':            ['Grade A Refined (RBD)', 'Grade B Unrefined (Raw)', 'Raw Shea Nuts'],
    'sunflower':       ['Sunflower Seeds Grade 1', 'Crude Sunflower Oil (CSO)'],
    'palm':            ['Crude Palm Oil (CPO)', 'Refined Palm Oil (RBD)'],
    'cassava':         ['Fresh Grade A', 'Dried / Chips Grade 1', 'Tapioca Starch Grade 1'],
    'sweet-potato':    ['Grade A Export', 'Grade B'],
    'plantain':        ['Green Grade A Export', 'Grade B'],
    'cocoa':           ['Grade 1 Fermented', 'Grade 2 Fermented', 'Unfermented'],
    'tea':             ['BP1', 'PF1', 'Dust', 'Orthodox Grade'],
    'macadamia':       ['Kernel Style 1', 'Kernel Style 2', 'In-shell Grade'],
    'cashew':          ['WW180', 'WW240', 'WW320', 'LP / Pieces'],
    'chia':            ['Purity 99.9%', 'Purity 99.5%', 'Conventional'],
    'quinoa':          ['White Quinoa Grade 1', 'Red Quinoa Grade 1', 'Mixed Grade'],
    'lentils':         ['Premium Grade', 'Standard Grade']
  };

  var additionalProducts = [
    { group: 'Coffee', value: 'coffee-gc', label: 'Green Coffee (Generic)' },
    { group: 'Fresh Fruits', value: 'orange', label: 'Oranges' },
    { group: 'Fresh Fruits', value: 'lemon', label: 'Lemons / Limes' },
    { group: 'Fresh Fruits', value: 'watermelon', label: 'Watermelon' },
    { group: 'Grains, Seeds & Legumes', value: 'wheat', label: 'Wheat' },
    { group: 'Grains, Seeds & Legumes', value: 'barley', label: 'Barley' },
    { group: 'Grains, Seeds & Legumes', value: 'lentils', label: 'Lentils' },
    { group: 'Grains, Seeds & Legumes', value: 'chia', label: 'Chia Seeds' },
    { group: 'Spices & Botanicals', value: 'black-pepper', label: 'Black Pepper' },
    { group: 'Spices & Botanicals', value: 'cinnamon', label: 'Cinnamon' },
    { group: 'Oils & Other', value: 'cocoa', label: 'Cocoa Beans' },
    { group: 'Oils & Other', value: 'tea', label: 'Tea (Black / Green)' },
    { group: 'Oils & Other', value: 'macadamia', label: 'Macadamia Nuts' },
    { group: 'Oils & Other', value: 'cashew', label: 'Cashew Nuts' }
  ];

  function ensureExtraProductOptions(selectEl) {
    if (!selectEl) return;
    if (!selectEl.hasAttribute('multiple')) {
      selectEl.setAttribute('multiple', 'multiple');
      selectEl.setAttribute('size', '8');
      selectEl.setAttribute('data-enhanced', 'true');
    }

    if (selectEl.options.length) {
      selectEl.options[0].disabled = true;
      selectEl.options[0].selected = false;
      selectEl.selectedIndex = -1;
    }

    additionalProducts.forEach(function(item) {
      if (selectEl.querySelector('option[value="' + item.value + '"]')) return;
      var group = null;
      var groups = selectEl.querySelectorAll('optgroup');
      groups.forEach(function(g) {
        if (g.getAttribute('label') === item.group) group = g;
      });
      var opt = document.createElement('option');
      opt.value = item.value;
      opt.textContent = item.label;
      if (group) {
        group.appendChild(opt);
      } else {
        selectEl.appendChild(opt);
      }
    });

    if (!selectEl.nextElementSibling || !selectEl.nextElementSibling.classList || !selectEl.nextElementSibling.classList.contains('multi-select-hint')) {
      var hint = document.createElement('small');
      hint.className = 'multi-select-hint';
      hint.textContent = 'Select one or more products. Use Ctrl (Windows) to select multiple items.';
      selectEl.insertAdjacentElement('afterend', hint);
    }
  }

  var productFormEl = document.getElementById('contactForm');
  if (productFormEl) {
    productFormEl.querySelectorAll('.product-select').forEach(function(sel) {
      ensureExtraProductOptions(sel);
    });

    productFormEl.addEventListener('change', function(e) {
      if (!e.target.classList.contains('product-select')) return;
      var sel = e.target;
      var pfx = sel.id.replace(/-product$/, '');
      var gradeWrap = document.getElementById(pfx + '-grade-wrap');
      var gradeSelect = document.getElementById(pfx + '-grade');
      if (!gradeWrap || !gradeSelect) return;
      var selected = sel.selectedOptions ? Array.from(sel.selectedOptions).map(function(o) { return o.value; }) : [];
      var primary = selected.length ? selected[0] : '';
      var grades = productGradeMap[primary];
      if (grades && grades.length) {
        gradeSelect.innerHTML = '<option value="">Select grade...</option>' +
          grades.map(function(g) { return '<option value="' + g + '">' + g + '</option>'; }).join('');
        gradeWrap.style.display = '';
      } else {
        gradeWrap.style.display = 'none';
        gradeSelect.innerHTML = '<option value="">Select grade...</option>';
      }
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
    var contactFormWrapper = document.querySelector('.contact-form-wrapper');
    
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

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      if (typeof grecaptcha !== 'undefined') {
        grecaptcha.reset();
      }

      // Replace form with thank-you panel
      if (contactFormWrapper) {
        contactForm.remove();
        var thanksPanel = document.createElement('div');
        thanksPanel.className = 'contact-thank-you';
        thanksPanel.innerHTML =
          '<p style="margin:0 0 0.75rem;font-weight:700;color:var(--green-800);">Thank you. We have received your enquiry.</p>' +
          '<p style="margin:0 0 0.75rem;">Our team will review your details and get back to you within one business day.</p>' +
          '<p style="margin:0 0 1.2rem;">If it is urgent, please call +44 (0) 000 000 0000.</p>' +
          '<div class="btn-group" style="gap:0.75rem;">' +
            '<a href="/" class="btn btn-primary">Back to Home</a>' +
            '<a href="/products/coffee" class="btn btn-outline">Explore Products</a>' +
          '</div>';
        contactFormWrapper.appendChild(thanksPanel);
      }
    });
  }

})();
