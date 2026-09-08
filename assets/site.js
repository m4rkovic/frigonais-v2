(() => {
  'use strict';

  const translations = window.translations || { en: {} };
  const supportedLangs = ['en', 'sr', 'zh', 'ar'];
  const labelMap = { en: 'EN', sr: 'SR', zh: '中文', ar: 'عربي' };
  let currentLang = 'en';
  let activeProductId = '';
  let turnstileWidgetId = null;

  const byId = (id) => document.getElementById(id);
  const t = (key, fallback = '') => (translations[currentLang] && translations[currentLang][key]) || translations.en?.[key] || fallback;

  function applyLanguage(lang) {
    if (!supportedLangs.includes(lang)) lang = 'en';
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      const value = translations[lang]?.[key];
      if (value !== undefined) el.innerHTML = value;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const value = translations[lang]?.[el.dataset.i18nPlaceholder];
      if (value !== undefined) el.placeholder = value;
    });

    document.querySelectorAll('.lang-option').forEach((opt) => {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });
    document.querySelectorAll('.current-lang-label').forEach((el) => {
      el.textContent = labelMap[lang] || lang.toUpperCase();
    });
    document.querySelectorAll('.lang-picker').forEach((picker) => picker.classList.remove('open'));

    // Re-render open modal copy in the newly selected language.
    if (activeProductId && byId('productModal')?.classList.contains('open')) {
      populateProductModal(activeProductId);
    }
  }

  function languageFromPath() {
    const first = location.pathname.split('/').filter(Boolean)[0];
    return supportedLangs.includes(first) ? first : null;
  }

  function setLanguage(lang, persist = true) {
    applyLanguage(lang);
    if (persist) {
      try { localStorage.setItem('frigonais-lang', lang); } catch (_) {}
      const url = new URL(location.href);
      url.searchParams.set('lang', lang);
      history.replaceState({}, '', url);
    }
  }

  window.setLanguage = setLanguage;

  const urlLang = new URLSearchParams(location.search).get('lang');
  let savedLang = null;
  try { savedLang = localStorage.getItem('frigonais-lang'); } catch (_) {}
  const initialLang = supportedLangs.includes(urlLang) ? urlLang : (languageFromPath() || (supportedLangs.includes(savedLang) ? savedLang : 'en'));
  applyLanguage(initialLang);

  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-lang-toggle]');
    if (toggle) {
      event.preventDefault();
      const picker = byId(toggle.dataset.langToggle);
      if (picker) {
        const shouldOpen = !picker.classList.contains('open');
        document.querySelectorAll('.lang-picker').forEach((p) => p.classList.remove('open'));
        if (shouldOpen) picker.classList.add('open');
      }
      return;
    }

    const option = event.target.closest('[data-lang-select]');
    if (option) {
      event.preventDefault();
      setLanguage(option.dataset.langSelect);
      return;
    }

    if (!event.target.closest('.lang-picker')) {
      document.querySelectorAll('.lang-picker').forEach((p) => p.classList.remove('open'));
    }
  });

  // Reveal animations, with a graceful no-IntersectionObserver fallback.
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => observer.observe(el));

    const sepObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.5 });
    document.querySelectorAll('.sep-line').forEach((el) => sepObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('active'));
    document.querySelectorAll('.sep-line').forEach((el) => el.classList.add('active'));
  }

  // Sticky nav subtle elevation.
  const navbar = byId('navbar') || document.querySelector('nav.sticky');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('nav-scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Accessible mobile drawer shared by both pages.
  const menuToggle = byId('menuToggle');
  const mobileOverlay = byId('mobileOverlay');
  const menuClose = byId('menuClose');
  function setMobileMenu(open) {
    if (!mobileOverlay || !menuToggle) return;
    mobileOverlay.classList.toggle('open', open);
    mobileOverlay.setAttribute('aria-hidden', String(!open));
    mobileOverlay.inert = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) menuClose?.focus();
  }
  if (mobileOverlay) mobileOverlay.inert = true;
  menuToggle?.addEventListener('click', () => setMobileMenu(true));
  menuClose?.addEventListener('click', () => setMobileMenu(false));
  mobileOverlay?.addEventListener('click', (event) => { if (event.target === mobileOverlay) setMobileMenu(false); });
  document.querySelectorAll('.mob-link').forEach((link) => link.addEventListener('click', () => setMobileMenu(false)));

  // Same-page hash scrolling only. Cross-page hashes remain normal navigation.
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      let target = null;
      try { target = document.querySelector(href); } catch (_) { return; }
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState({}, '', href);
    });
  });

  document.querySelectorAll('#currentYear, #year').forEach((el) => { el.textContent = new Date().getFullYear(); });

  const productData = {
    iqf: { key: 'p1_name', descKey: 'p1_desc', facts: [['fact_processing','value_cold_iqf'],['fact_fruit_range','value_fruit_list'],['fact_positioning','value_b2b'],['fact_next_step','value_specs_request']] },
    jams: { key: 'p2_name', descKey: 'p2_desc', facts: [['fact_processing','value_hot_processing'],['fact_applications','value_bakery_dairy_retail'],['fact_format','value_industrial_jams'],['fact_next_step','value_specs_request']] },
    purees: { key: 'p3_name', descKey: 'p3_desc', facts: [['fact_applications','value_beverage_dairy_conf'],['fact_formats','value_single_blended'],['fact_positioning','value_b2b'],['fact_next_step','value_specs_request']] },
    thermostable: { key: 'p4_name', descKey: 'p4_desc', facts: [['fact_property','value_heat_resistant'],['fact_application','value_bakery'],['fact_designed','value_shape_color_flavor'],['fact_next_step','value_specs_request']] },
    yogurt: { key: 'p5_name', descKey: 'p5_desc', facts: [['fact_application','value_yogurt_dairy'],['fact_customizable','value_brix_viscosity'],['fact_format','value_fruit_preparation'],['fact_next_step','value_specs_request']] },
    fillings: { key: 'p6_name', descKey: 'p6_desc', facts: [['fact_applications','value_pastries'],['fact_customizable','value_recipe_texture_taste'],['fact_format','value_fruit_filling'],['fact_next_step','value_specs_request']] }
  };

  const modal = byId('productModal');
  const modalTitle = byId('modalTitle');
  const modalDescription = byId('modalDescription');
  const modalFacts = byId('modalFacts');

  function populateProductModal(productId) {
    const data = productData[productId];
    if (!data || !modal) return;
    activeProductId = productId;
    if (modalTitle) modalTitle.textContent = t(data.key, productId);
    if (modalDescription) modalDescription.textContent = t(data.descKey, '');
    if (modalFacts) {
      modalFacts.replaceChildren(...data.facts.map(([labelKey, valueKey]) => {
        const row = document.createElement('div');
        row.className = 'spec-chip';
        const label = document.createElement('b'); label.textContent = t(labelKey, labelKey);
        const value = document.createElement('span'); value.textContent = t(valueKey, valueKey);
        row.append(label, value);
        return row;
      }));
    }
  }

  function openProductModal(productId) {
    if (!modal || !productData[productId]) return;
    populateProductModal(productId);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    modal.inert = false;
    document.body.style.overflow = 'hidden';
    byId('modalClose')?.focus();
  }

  function closeProductModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modal.inert = true;
    if (!mobileOverlay?.classList.contains('open')) document.body.style.overflow = '';
  }
  window.closeProductModal = closeProductModal;
  if (modal) modal.inert = true;

  document.querySelectorAll('.spec-request[data-product-id]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openProductModal(button.dataset.productId);
    });
  });
  byId('modalClose')?.addEventListener('click', closeProductModal);
  byId('modalDismiss')?.addEventListener('click', closeProductModal);
  modal?.addEventListener('click', (event) => { if (event.target === modal) closeProductModal(); });
  byId('modalQuote')?.addEventListener('click', () => {
    const select = byId('productSelect');
    if (select && activeProductId) select.value = activeProductId;
    closeProductModal();
    byId('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMobileMenu(false);
      closeProductModal();
    }
  });

  // Product catalogue deep-link -> preselect relevant RFQ product on landing page.
  const productParam = new URLSearchParams(location.search).get('product');
  const productSelect = byId('productSelect');
  if (productSelect && productData[productParam]) productSelect.value = productParam;

  function renderFallbackMessage(container, message) {
    container.replaceChildren();
    container.append(document.createTextNode(message + ' '));
    const link = document.createElement('a');
    link.href = 'mailto:frigonais@gmail.com';
    link.className = 'font-semibold underline';
    link.textContent = 'frigonais@gmail.com';
    container.append(link);
  }

  // Turnstile is enabled only when TURNSTILE_SITE_KEY is present in generated runtime-config.js.
  function initTurnstile() {
    const siteKey = window.FRIGONAIS_CONFIG?.turnstileSiteKey;
    const container = byId('turnstileContainer');
    const widget = byId('turnstileWidget');
    if (!siteKey || !container || !widget || !window.turnstile || turnstileWidgetId !== null) return;
    container.hidden = false;
    turnstileWidgetId = window.turnstile.render(widget, { sitekey: siteKey, theme: 'light' });
  }
  window.frigonaisTurnstileReady = initTurnstile;
  window.addEventListener('load', initTurnstile);

  // Contact form -> Vercel /api/contact.
  const contactForm = byId('contactForm');
  const formStatus = byId('formStatus');
  contactForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const button = contactForm.querySelector('.submit-btn');
    const original = button?.innerHTML || '';
    if (button) {
      button.disabled = true;
      button.classList.add('opacity-60', 'cursor-not-allowed');
      button.textContent = t('form_sending', 'Sending…');
    }
    if (formStatus) formStatus.hidden = true;

    const payload = Object.fromEntries(new FormData(contactForm).entries());
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to send inquiry');
      if (formStatus) {
        formStatus.className = 'form-status text-sm rounded-lg px-4 py-3 mt-5 bg-brand-50 border border-brand-100 text-brand-800';
        formStatus.textContent = t('form_sent', 'Inquiry sent. Thank you.');
        formStatus.hidden = false;
      }
      contactForm.reset();
      if (turnstileWidgetId !== null && window.turnstile) window.turnstile.reset(turnstileWidgetId);
      if (productParam && productSelect && productData[productParam]) productSelect.value = productParam;
    } catch (error) {
      if (formStatus) {
        formStatus.className = 'form-status text-sm rounded-lg px-4 py-3 mt-5 bg-accent-50 border border-accent-100 text-accent-800';
        renderFallbackMessage(formStatus, t('form_error_fallback', 'The web form could not be sent. Please email'));
        formStatus.hidden = false;
      }
      if (turnstileWidgetId !== null && window.turnstile) window.turnstile.reset(turnstileWidgetId);
    } finally {
      if (button) {
        button.disabled = false;
        button.classList.remove('opacity-60', 'cursor-not-allowed');
        button.innerHTML = original;
      }
    }
  });
})();
