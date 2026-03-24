/* main.js — Previewer.pro interaction layer */
(function () {
  'use strict';

  /* ─── FAQ Accordion ─── */
  document.querySelectorAll('.faq-item__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const answer    = document.getElementById(btn.getAttribute('aria-controls'));
      const isOpen    = btn.getAttribute('aria-expanded') === 'true';
      const allBtns   = document.querySelectorAll('.faq-item__q');

      /* Close all */
      allBtns.forEach(function (b) {
        const a = document.getElementById(b.getAttribute('aria-controls'));
        b.setAttribute('aria-expanded', 'false');
        if (a) a.hidden = true;
      });

      /* Open clicked if it was closed */
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        if (answer) answer.hidden = false;
      }
    });
  });

  /* ─── Scroll Reveal ─── */
  function initReveal () {
    const revealEls = document.querySelectorAll(
      '.tool-card, .why-card, .uc-card, .step, .stat-block__item, ' +
      '.feature-section__copy, .feature-section__visual, ' +
      '.content-section__copy, .content-section__aside, ' +
      '.faq-item, .hero__stats .stat'
    );

    revealEls.forEach(function (el) { el.classList.add('reveal'); });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  if ('IntersectionObserver' in window) {
    initReveal();
  } else {
    /* Fallback: show everything */
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ─── Staggered card delays ─── */
  document.querySelectorAll('.tools-nav__grid, .why-grid, .uc-grid').forEach(function (grid) {
    grid.querySelectorAll(':scope > *').forEach(function (card, i) {
      card.style.transitionDelay = (i * 0.08) + 's';
    });
  });

  /* ─── Smooth anchor scroll with header offset ─── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const id  = anchor.getAttribute('href').slice(1);
      const el  = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const headerHeight = document.querySelector('.header') ? 74 : 0;
      const top = el.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ─── Active section highlight in nav ─── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.header__nav a[href^="/#"]');

  if (sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(function (link) {
              const href = link.getAttribute('href');
              if (href === '/#' + id) {
                link.style.color = 'var(--clr-text)';
              } else {
                link.style.color = '';
              }
            });
          }
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ─── Hero SERP pixel bar animation ─── */
  const fill = document.querySelector('.serp-pixel-fill');
  if (fill) {
    fill.style.width = '0%';
    setTimeout(function () {
      fill.style.transition = 'width 1.2s cubic-bezier(.4,0,.2,1)';
      fill.style.width = '72%';
    }, 800);
  }

  /* ─── Mock tool demo click — redirect to tools ─── */
  document.querySelectorAll('.serp-result__title, .mockup-phone, .social-card').forEach(function (el) {
    el.style.cursor = 'pointer';
    el.addEventListener('click', function () {
      const section = el.closest('[id]');
      if (!section) return;
      const id = section.id;
      if (id === 'serp-preview')   window.location.href = '/serp-preview';
      if (id === 'social-preview') window.location.href = '/social-preview';
      if (id === 'mobile-viewer')  window.location.href = '/mobile-viewer';
    });
  });

})();
