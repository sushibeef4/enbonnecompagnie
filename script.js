/**
 * Compagnie & Stimulation à domicile - JavaScript Application
 * Features:
 * - Responsive Mobile Navigation Drawer & Hamburger Toggle
 * - Header Scroll Elevation & Active Link Highlighting
 * - Accessible Smooth Scrolling with Sticky Header Offset
 * - Interactive Pricing Plan Selection (pre-fills contact form)
 * - Functional Contact Form Validation & Mailto Action
 * - Legal Modal Dialog Controls
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- Element References ---
  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.nav-link');
  const planButtons = document.querySelectorAll('.select-plan-btn');
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const formSuccessMessage = document.getElementById('formSuccessMessage');
  const legalModal = document.getElementById('legalModal');
  const openLegalModalBtn = document.getElementById('openLegalModal');
  const closeLegalModalBtn = document.getElementById('closeLegalModal');

  // --------------------------------------------------------------------------
  // 1. Sticky Header Elevation on Scroll
  // --------------------------------------------------------------------------
  const handleHeaderScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // --------------------------------------------------------------------------
  // 2. Mobile Menu Toggle
  // --------------------------------------------------------------------------
  const toggleMobileNav = () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isExpanded));
    mainNav.classList.toggle('is-open', !isExpanded);
  };

  const closeMobileNav = () => {
    if (navToggle && mainNav) {
      navToggle.setAttribute('aria-expanded', 'false');
      mainNav.classList.remove('is-open');
    }
  };

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', toggleMobileNav);

    // Close when clicking outside of the nav
    document.addEventListener('click', (event) => {
      if (!mainNav.contains(event.target) && !navToggle.contains(event.target) && mainNav.classList.contains('is-open')) {
        closeMobileNav();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 3. Smooth Scrolling with Sticky Navbar Offset
  // --------------------------------------------------------------------------
  const getHeaderHeight = () => (header ? header.offsetHeight : 76);

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#' || targetId.startsWith('#mentions')) return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        closeMobileNav();

        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - getHeaderHeight() - 12;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --------------------------------------------------------------------------
  // 4. Active Nav Link on Scroll (Intersection Observer)
  // --------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  
  if ('IntersectionObserver' in window && sections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: `-${getHeaderHeight()}px 0px -50% 0px`,
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${currentId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((sec) => sectionObserver.observe(sec));
  }

  // --------------------------------------------------------------------------
  // 5. Pricing Plan Selection -> Pre-fill Contact Form
  // --------------------------------------------------------------------------
  planButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const planName = btn.getAttribute('data-plan');
      const besoinField = document.getElementById('besoinPrincipal');
      const nomField = document.getElementById('nomPrenom');

      if (besoinField && planName) {
        besoinField.value = `Formule souhaitée : ${planName}.\n`;
      }

      if (nomField) {
        setTimeout(() => nomField.focus(), 400);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 6. Functional Contact Form Validation & Submission
  // --------------------------------------------------------------------------
  if (contactForm) {
    const fields = {
      nomPrenom: {
        el: document.getElementById('nomPrenom'),
        errorEl: document.getElementById('nomPrenomError'),
        validate: (val) => val.trim().length >= 2
      },
      contactMoyen: {
        el: document.getElementById('contactMoyen'),
        errorEl: document.getElementById('contactMoyenError'),
        validate: (val) => {
          const trimmed = val.trim();
          // Checks either a valid email format or phone digits
          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
          const cleanedPhone = trimmed.replace(/[\s.-]/g, '');
          const isPhone = /^(?:(?:\+|00)33|0)[1-9]\d{8}$/.test(cleanedPhone) || cleanedPhone.length >= 10;
          return isEmail || isPhone;
        }
      },
      pourQui: {
        el: document.getElementById('pourQui'),
        errorEl: document.getElementById('pourQuiError'),
        validate: (val) => Boolean(val && val !== '')
      },
      residence: {
        el: document.getElementById('residence'),
        errorEl: document.getElementById('residenceError'),
        validate: (val) => Boolean(val && val !== '')
      },
      besoinPrincipal: {
        el: document.getElementById('besoinPrincipal'),
        errorEl: document.getElementById('besoinPrincipalError'),
        validate: (val) => val.trim().length >= 3
      }
    };

    // Real-time error removal when user types/changes a field
    Object.keys(fields).forEach((key) => {
      const field = fields[key];
      if (field.el) {
        const clearError = () => {
          field.el.classList.remove('has-error');
          if (field.errorEl) field.errorEl.classList.remove('visible');
        };
        field.el.addEventListener('input', clearError);
        field.el.addEventListener('change', clearError);
      }
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isFormValid = true;
      let firstInvalidField = null;

      // Validate each field
      Object.keys(fields).forEach((key) => {
        const field = fields[key];
        if (!field.el) return;

        const isValid = field.validate(field.el.value);
        if (!isValid) {
          isFormValid = false;
          field.el.classList.add('has-error');
          if (field.errorEl) field.errorEl.classList.add('visible');
          if (!firstInvalidField) firstInvalidField = field.el;
        } else {
          field.el.classList.remove('has-error');
          if (field.errorEl) field.errorEl.classList.remove('visible');
        }
      });

      if (!isFormValid) {
        if (firstInvalidField) firstInvalidField.focus();
        return;
      }

      // Collect values for mailto creation
      const nomPrenomVal = fields.nomPrenom.el.value.trim();
      const contactVal = fields.contactMoyen.el.value.trim();
      const pourQuiVal = fields.pourQui.el.value;
      const residenceVal = fields.residence.el.value;
      const besoinVal = fields.besoinPrincipal.el.value.trim();

      // Button loading state
      const originalBtnHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 0.8s linear infinite;">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          <line x1="2" y1="12" x2="6" y2="12"></line>
          <line x1="18" y1="12" x2="22" y2="12"></line>
        </svg>
        <span>Transmission en cours...</span>
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;

        // Display success banner
        if (formSuccessMessage) {
          formSuccessMessage.hidden = false;
          formSuccessMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Construct pre-filled email client link
        const emailSubject = encodeURIComponent(`Demande d'appel découverte - ${nomPrenomVal}`);
        const emailBody = encodeURIComponent(
          `Bonjour,\n\n` +
          `Je souhaite programmer un appel découverte gratuit de 10 minutes.\n\n` +
          `Voici les informations de ma demande :\n` +
          `- Nom et Prénom : ${nomPrenomVal}\n` +
          `- Téléphone ou Email : ${contactVal}\n` +
          `- Bénéficiaire : ${pourQuiVal}\n` +
          `- Lieu de résidence : ${residenceVal}\n` +
          `- Besoin principal :\n${besoinVal}\n\n` +
          `Merci pour votre retour !`
        );

        // Open user mail client with pre-filled content
        window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;

        // Reset form
        contactForm.reset();
      }, 600);
    });
  }

  // --------------------------------------------------------------------------
  // 7. Modal Cadre Légal & CESU
  // --------------------------------------------------------------------------
  if (legalModal) {
    if (openLegalModalBtn) {
      openLegalModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        legalModal.showModal();
      });
    }

    if (closeLegalModalBtn) {
      closeLegalModalBtn.addEventListener('click', () => {
        legalModal.close();
      });
    }

    // Close on backdrop click
    legalModal.addEventListener('click', (event) => {
      const rect = legalModal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        legalModal.close();
      }
    });
  }
});
