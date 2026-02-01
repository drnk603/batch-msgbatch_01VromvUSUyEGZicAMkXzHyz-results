(function() {
  'use strict';

  if (typeof window.__app === 'undefined') {
    window.__app = {};
  }

  var app = window.__app;

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  function throttle(func, limit) {
    var inThrottle;
    return function() {
      var args = arguments;
      var context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  }

  function initBurgerMenu() {
    if (app.burgerInitialized) return;
    app.burgerInitialized = true;

    var toggle = document.querySelector('.c-nav__toggle, .navbar-toggler');
    var menu = document.querySelector('.navbar-collapse, .c-nav__menu');
    var body = document.body;

    if (!toggle || !menu) return;

    var isOpen = false;

    function openMenu() {
      isOpen = true;
      menu.classList.add('show', 'is-open');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
      trapFocus();
    }

    function closeMenu() {
      isOpen = false;
      menu.classList.remove('show', 'is-open');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
    }

    function trapFocus() {
      var focusableElements = menu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
      if (focusableElements.length === 0) return;

      var firstElement = focusableElements[0];
      var lastElement = focusableElements[focusableElements.length - 1];

      function handleTabKey(e) {
        if (!isOpen) return;
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }

      document.addEventListener('keydown', handleTabKey);
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    });

    document.addEventListener('click', function(e) {
      if (isOpen && !menu.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    var navLinks = document.querySelectorAll('.c-nav__link, .nav-link');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        closeMenu();
      });
    }

    window.addEventListener('resize', debounce(function() {
      if (window.innerWidth >= 1024 && isOpen) {
        closeMenu();
      }
    }, 150));
  }

  function initSmoothScroll() {
    if (app.smoothScrollInitialized) return;
    app.smoothScrollInitialized = true;

    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target) return;

      var href = target.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      var hashIndex = href.indexOf('#');
      if (hashIndex === -1) return;

      var sectionId = href.substring(hashIndex + 1);
      var section = document.getElementById(sectionId);
      if (!section) return;

      e.preventDefault();

      var header = document.querySelector('.l-header, header');
      var headerHeight = header ? header.offsetHeight : 80;
      var targetPosition = section.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', '#' + sectionId);
      }
    });
  }

  function initScrollSpy() {
    if (app.scrollSpyInitialized) return;
    app.scrollSpyInitialized = true;

    var navLinks = document.querySelectorAll('.c-nav__link[href*="#"], .nav-link[href*="#"]');
    if (navLinks.length === 0) return;

    var sections = [];
    for (var i = 0; i < navLinks.length; i++) {
      var href = navLinks[i].getAttribute('href');
      if (!href || href === '#' || href === '#!') continue;
      
      var hashIndex = href.indexOf('#');
      if (hashIndex === -1) continue;
      
      var sectionId = href.substring(hashIndex + 1);
      var section = document.getElementById(sectionId);
      if (section) {
        sections.push({ link: navLinks[i], section: section });
      }
    }

    if (sections.length === 0) return;

    function updateActiveLink() {
      var scrollPosition = window.pageYOffset;
      var header = document.querySelector('.l-header, header');
      var headerHeight = header ? header.offsetHeight : 80;

      for (var i = sections.length - 1; i >= 0; i--) {
        var sectionTop = sections[i].section.offsetTop - headerHeight - 100;
        
        if (scrollPosition >= sectionTop) {
          for (var j = 0; j < sections.length; j++) {
            sections[j].link.classList.remove('active');
            sections[j].link.removeAttribute('aria-current');
          }
          
          sections[i].link.classList.add('active');
          sections[i].link.setAttribute('aria-current', 'page');
          return;
        }
      }
    }

    window.addEventListener('scroll', throttle(updateActiveLink, 100));
    updateActiveLink();
  }

  function initActiveMenuState() {
    if (app.activeMenuInitialized) return;
    app.activeMenuInitialized = true;

    var pathname = window.location.pathname;
    var navLinks = document.querySelectorAll('.c-nav__link, .nav-link');

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var linkHref = link.getAttribute('href');

      if (!linkHref || linkHref.indexOf('#') === 0) continue;

      link.classList.remove('active');
      link.removeAttribute('aria-current');

      if (linkHref === pathname ||
          (pathname === '/' && linkHref === '/index.html') ||
          (pathname === '/index.html' && linkHref === '/')) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      } else if (linkHref && linkHref !== '/' && linkHref !== '/index.html' && pathname.indexOf(linkHref) === 0) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      }
    }
  }

  function initImageHandling() {
    if (app.imagesInitialized) return;
    app.imagesInitialized = true;

    var images = document.querySelectorAll('img');

    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      if (!img.hasAttribute('loading') && !img.classList.contains('c-logo__img') && !img.hasAttribute('data-critical')) {
        img.setAttribute('loading', 'lazy');
      }

      img.addEventListener('error', function() {
        var svgPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e9ecef" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" fill="%236c757d" font-family="sans-serif" font-size="18" text-anchor="middle" dominant-baseline="middle"%3EImage not available%3C/text%3E%3C/svg%3E';
        this.src = svgPlaceholder;
      });
    }
  }

  function initForms() {
    if (app.formsInitialized) return;
    app.formsInitialized = true;

    var forms = document.querySelectorAll('form.c-form, form[data-form-contact]');

    app.notify = function(message, type) {
      var container = document.querySelector('.toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
      }

      var toastEl = document.createElement('div');
      toastEl.className = 'toast align-items-center text-white bg-' + (type === 'error' ? 'danger' : 'success') + ' border-0';
      toastEl.setAttribute('role', 'alert');
      toastEl.setAttribute('aria-live', 'assertive');
      toastEl.setAttribute('aria-atomic', 'true');

      toastEl.innerHTML = '<div class="d-flex"><div class="toast-body">' + message + '</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>';

      container.appendChild(toastEl);

      if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
        var toast = new bootstrap.Toast(toastEl, { delay: 5000 });
        toast.show();
        toastEl.addEventListener('hidden.bs.toast', function() {
          toastEl.remove();
        });
      } else {
        setTimeout(function() {
          toastEl.remove();
        }, 5000);
      }
    };

    function validateField(field) {
      var value = field.value.trim();
      var type = field.type;
      var name = field.name;
      var errorContainer = field.parentElement.querySelector('.c-form__error, .invalid-feedback');
      var isValid = true;
      var errorMessage = '';

      if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required.';
      } else if (value) {
        if (type === 'email' || name === 'email') {
          var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address.';
          }
        } else if (type === 'tel' || name === 'phone') {
          var phonePattern = /^[\d\s\+\-\(\)]{10,20}$/;
          if (!phonePattern.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number.';
          }
        } else if (name === 'firstName' || name === 'lastName') {
          var namePattern = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
          if (!namePattern.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid name (2-50 characters).';
          }
        } else if (field.tagName === 'TEXTAREA' && name === 'message') {
          if (value.length < 10) {
            isValid = false;
            errorMessage = 'Message must be at least 10 characters long.';
          }
        }
      }

      if (field.type === 'checkbox' && field.hasAttribute('required')) {
        if (!field.checked) {
          isValid = false;
          errorMessage = 'You must accept this to continue.';
        }
      }

      if (isValid) {
        field.classList.remove('is-invalid', 'has-error');
        if (errorContainer) {
          errorContainer.classList.remove('is-visible', 'd-block');
          errorContainer.textContent = '';
        }
      } else {
        field.classList.add('is-invalid', 'has-error');
        if (errorContainer) {
          errorContainer.classList.add('is-visible', 'd-block');
          errorContainer.textContent = errorMessage;
        }
      }

      return isValid;
    }

    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];

      var formFields = form.querySelectorAll('input, textarea, select');
      for (var j = 0; j < formFields.length; j++) {
        formFields[j].addEventListener('blur', function() {
          if (this.value.trim()) {
            validateField(this);
          }
        });

        formFields[j].addEventListener('input', function() {
          if (this.classList.contains('is-invalid')) {
            validateField(this);
          }
        });
      }

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var allFields = this.querySelectorAll('input, textarea, select');
        var isFormValid = true;

        for (var k = 0; k < allFields.length; k++) {
          if (!validateField(allFields[k])) {
            isFormValid = false;
          }
        }

        if (!isFormValid) {
          app.notify('Please correct the errors in the form.', 'error');
          return;
        }

        var submitBtn = this.querySelector('button[type="submit"]');
        var originalText = submitBtn ? submitBtn.innerHTML : '';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...';
        }

        var formData = new FormData(this);
        var data = {};
        formData.forEach(function(value, key) {
          data[key] = value;
        });

        var self = this;

        setTimeout(function() {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }

          app.notify('Your message has been sent successfully!', 'success');
          self.reset();
          
          var invalidFields = self.querySelectorAll('.is-invalid, .has-error');
          for (var m = 0; m < invalidFields.length; m++) {
            invalidFields[m].classList.remove('is-invalid', 'has-error');
          }
          
          var errorContainers = self.querySelectorAll('.is-visible, .d-block');
          for (var n = 0; n < errorContainers.length; n++) {
            errorContainers[n].classList.remove('is-visible', 'd-block');
          }

          setTimeout(function() {
            window.location.href = '/thank_you.html';
          }, 1000);
        }, 1500);
      });
    }
  }

  function initBackToTop() {
    if (app.backToTopInitialized) return;
    app.backToTopInitialized = true;

    var backToTopBtn = document.querySelector('.back-to-top');
    if (!backToTopBtn) {
      backToTopBtn = document.createElement('button');
      backToTopBtn.className = 'back-to-top';
      backToTopBtn.setAttribute('aria-label', 'Back to top');
      backToTopBtn.innerHTML = '↑';
      document.body.appendChild(backToTopBtn);
    }

    function toggleBackToTop() {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    }

    backToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    window.addEventListener('scroll', throttle(toggleBackToTop, 100));
    toggleBackToTop();
  }

  function initHeaderScroll() {
    if (app.headerScrollInitialized) return;
    app.headerScrollInitialized = true;

    var header = document.querySelector('.l-header, header');
    if (!header) return;

    function updateHeaderState() {
      if (window.pageYOffset > 50) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    window.addEventListener('scroll', throttle(updateHeaderState, 100));
    updateHeaderState();
  }

  function initAccordions() {
    if (app.accordionsInitialized) return;
    app.accordionsInitialized = true;

    var accordionButtons = document.querySelectorAll('.accordion-button');

    for (var i = 0; i < accordionButtons.length; i++) {
      accordionButtons[i].addEventListener('click', function() {
        var target = this.getAttribute('data-bs-target');
        if (!target) return;

        var collapse = document.querySelector(target);
        if (!collapse) return;

        var isExpanded = this.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
          collapse.classList.remove('show');
          this.classList.add('collapsed');
          this.setAttribute('aria-expanded', 'false');
        } else {
          collapse.classList.add('show');
          this.classList.remove('collapsed');
          this.setAttribute('aria-expanded', 'true');
        }
      });
    }
  }

  function initCountUp() {
    if (app.countUpInitialized) return;
    app.countUpInitialized = true;

    var counters = document.querySelectorAll('[data-counter]');
    if (counters.length === 0) return;

    function animateCounter(element) {
      var target = parseInt(element.getAttribute('data-counter'), 10);
      var duration = parseInt(element.getAttribute('data-duration'), 10) || 2000;
      var start = 0;
      var startTime = null;

      function updateCounter(currentTime) {
        if (!startTime) startTime = currentTime;
        var progress = Math.min((currentTime - startTime) / duration, 1);
        var current = Math.floor(progress * target);
        
        element.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target.toLocaleString();
        }
      }

      requestAnimationFrame(updateCounter);
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });

    for (var i = 0; i < counters.length; i++) {
      observer.observe(counters[i]);
    }
  }

  function initPrivacyModal() {
    if (app.privacyModalInitialized) return;
    app.privacyModalInitialized = true;

    var privacyLinks = document.querySelectorAll('a[href*="privacy"], a[href*="Privacy"]');

    for (var i = 0; i < privacyLinks.length; i++) {
      var link = privacyLinks[i];
      var href = link.getAttribute('href');
      
      if (href && (href === '/privacy.html' || href === 'privacy.html' || href.indexOf('privacy') !== -1)) {
        continue;
      }
    }
  }

  app.init = function() {
    if (app.initialized) return;
    app.initialized = true;

    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initActiveMenuState();
    initImageHandling();
    initForms();
    initBackToTop();
    initHeaderScroll();
    initAccordions();
    initCountUp();
    initPrivacyModal();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})();