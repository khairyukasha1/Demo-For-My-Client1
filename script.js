/* ==========================================================================
   NEXORA — script.js
   Vanilla JS: navbar scroll state, mobile menu, smooth scroll,
   scroll-reveal, animated counters, FAQ accordion, form validation.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- Navbar scroll state ---------------- */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  const onScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }

    if (window.scrollY > 600) {
      backToTop.classList.add('is-visible');
    } else {
      backToTop.classList.remove('is-visible');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------------- Mobile hamburger menu ---------------- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  const closeMobileMenu = () => {
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
  };

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    hamburger.classList.toggle('is-active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu when a link is tapped
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  /* ---------------- Smooth scroll for in-page anchors ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = navbar.offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;

      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  });

  /* ---------------- Scroll reveal ---------------- */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Stagger siblings slightly for a smoother group reveal
        const delay = Array.from(entry.target.parentElement.children)
          .filter((el) => el.classList.contains('reveal'))
          .indexOf(entry.target) * 80;

        setTimeout(() => entry.target.classList.add('is-visible'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------------- Animated counters ---------------- */
  const statEls = document.querySelectorAll('.stat__value');

  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target + suffix;
      }
    };

    requestAnimationFrame(tick);
  };

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statEls.forEach((el) => statObserver.observe(el));

  /* ---------------- FAQ accordion ---------------- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-item__question');
    const answer = item.querySelector('.faq-item__answer');

    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      // Close all other items
      faqItems.forEach((other) => {
        if (other !== item) {
          other.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-item__answer').style.maxHeight = null;
        }
      });

      // Toggle current item
      question.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? null : `${answer.scrollHeight}px`;
    });
  });

  /* ---------------- Contact form validation ---------------- */
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  const fields = {
    name: {
      input: document.getElementById('name'),
      error: document.getElementById('nameError'),
      validate: (value) => value.trim().length >= 2,
      message: 'Please enter your name (at least 2 characters).'
    },
    email: {
      input: document.getElementById('email'),
      error: document.getElementById('emailError'),
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
      message: 'Please enter a valid email address.'
    },
    projectType: {
      input: document.getElementById('projectType'),
      error: document.getElementById('projectTypeError'),
      validate: (value) => value !== '',
      message: 'Please select a project type.'
    },
    message: {
      input: document.getElementById('message'),
      error: document.getElementById('messageError'),
      validate: (value) => value.trim().length >= 10,
      message: 'Please tell us a bit more (at least 10 characters).'
    }
  };

  const validateField = (key) => {
    const field = fields[key];
    const value = field.input.value;
    const isValid = field.validate(value);
    const group = field.input.closest('.form-group');

    if (isValid) {
      group.classList.remove('has-error');
      field.error.textContent = '';
    } else {
      group.classList.add('has-error');
      field.error.textContent = field.message;
    }

    return isValid;
  };

  // Live validation after first interaction
  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    field.input.addEventListener('blur', () => validateField(key));
    field.input.addEventListener('input', () => {
      if (field.input.closest('.form-group').classList.contains('has-error')) {
        validateField(key);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const results = Object.keys(fields).map((key) => validateField(key));
    const allValid = results.every(Boolean);

    if (!allValid) {
      formSuccess.classList.remove('is-visible');
      const firstInvalid = Object.keys(fields).find((key) => !fields[key].validate(fields[key].input.value));
      if (firstInvalid) fields[firstInvalid].input.focus();
      return;
    }

    // Simulate a successful send (demo only — no backend attached)
    formSuccess.classList.add('is-visible');
    form.reset();
    Object.keys(fields).forEach((key) => {
      fields[key].input.closest('.form-group').classList.remove('has-error');
      fields[key].error.textContent = '';
    });

    setTimeout(() => formSuccess.classList.remove('is-visible'), 6000);
  });

});
