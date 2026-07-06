// main.js — homepage interactions for previewer.pro
document.addEventListener('DOMContentLoaded', function () {

  /* ---------------------------------------------------------
     Scroll-reveal animations (IntersectionObserver)
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------
     Hero typewriter effect
  --------------------------------------------------------- */
  const typewriterEl = document.getElementById('typewriter');
  const sampleLines = [
    'Launching our summer collection',
    'this Friday ☀️ Tap the link to',
    'get early access before it',
    'sells out.',
    ''
  ];
  const fullText = sampleLines.join('\n');

  if (typewriterEl) {
    let i = 0;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      typewriterEl.textContent = fullText;
    } else {
      function typeChar() {
        if (i <= fullText.length) {
          typewriterEl.innerHTML = escapeHTML(fullText.slice(0, i)) + '<span class="tw-cursor"></span>';
          i++;
          setTimeout(typeChar, 22);
        }
      }
      typeChar();
    }
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ---------------------------------------------------------
     Platform preview switcher (auto-cycle + manual click)
  --------------------------------------------------------- */
  const platformData = {
    facebook: {
      label: 'Facebook',
      accent: '#1877F2',
      text: 'Launching our summer collection this Friday ☀️ Tap the link to get early access before it sells out.',
      showLink: true
    },
    x: {
      label: 'X',
      accent: '#111318',
      text: 'Summer collection drops Friday. Early access link in bio 👇',
      showLink: true
    },
    linkedin: {
      label: 'LinkedIn',
      accent: '#0A66C2',
      text: "Thrilled to share that our summer collection launches this Friday. It's the result of six months of work from our design and ops teams — early access link below.",
      showLink: true
    },
    pinterest: {
      label: 'Pinterest',
      accent: '#E60023',
      text: 'Summer Collection 2026 — Early Access Guide',
      showLink: true
    },
    threads: {
      label: 'Threads',
      accent: '#111318',
      text: 'our summer collection launches friday. early access link is in the thread below 🧵',
      showLink: false
    }
  };

  const order = ['facebook', 'x', 'linkedin', 'pinterest', 'threads'];
  const switchTabs = document.querySelectorAll('.switch-tab');
  const previewText = document.getElementById('previewText');
  const platformLabel = document.getElementById('platformLabel');
  const previewCard = document.getElementById('previewCard');
  const linkBlock = previewCard ? previewCard.querySelector('.preview-card__link') : null;

  let currentIndex = 0;
  let autoCycleTimer = null;

  function renderPlatform(key) {
    const data = platformData[key];
    if (!data || !previewText || !platformLabel) return;

    previewText.textContent = data.text;
    platformLabel.textContent = data.label;

    if (linkBlock) {
      linkBlock.style.display = data.showLink ? 'flex' : 'none';
    }

    switchTabs.forEach(function (tab) {
      tab.classList.toggle('is-active', tab.dataset.platform === key);
    });
  }

  function goToPlatform(key) {
    currentIndex = order.indexOf(key);
    renderPlatform(key);
  }

  function startAutoCycle() {
    stopAutoCycle();
    autoCycleTimer = setInterval(function () {
      currentIndex = (currentIndex + 1) % order.length;
      renderPlatform(order[currentIndex]);
    }, 3200);
  }

  function stopAutoCycle() {
    if (autoCycleTimer) clearInterval(autoCycleTimer);
  }

  if (switchTabs.length) {
    switchTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        goToPlatform(tab.dataset.platform);
        startAutoCycle();
      });
    });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      startAutoCycle();
    }
  }

  /* ---------------------------------------------------------
     Close mobile nav on outside click (defense in depth,
     header.js handles the toggle itself)
  --------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    const nav = document.getElementById('siteNav');
    const toggle = document.getElementById('navToggle');
    if (!nav || !toggle) return;
    if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
});
