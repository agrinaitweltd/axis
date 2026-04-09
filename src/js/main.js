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

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
  }

  /* --- Mobile sub-menu toggles --- */
  document.querySelectorAll('.mobile-sub-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sub = document.getElementById(btn.dataset.target);
      if (sub) sub.classList.toggle('open');
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
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        if (hamburger) hamburger.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

})();
