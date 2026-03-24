/* header.js — Injects the site header as a reusable component */
(function () {
  const header = document.getElementById('site-header');
  if (!header) return;

  header.innerHTML = `
    <header class="header" role="banner" aria-label="Site header">
      <a href="/" class="header__logo" aria-label="Previewer.pro — go to homepage">
        <div class="header__logo-mark" aria-hidden="true">🔍</div>
        <span class="header__logo-text">previewer<span>.pro</span></span>
      </a>

      <nav class="header__nav" aria-label="Primary navigation">
        <a href="/#home">Home</a>
        <a href="/#tools">Tools</a>
        <a href="/#how-it-works">How It Works</a>
        <a href="/#why-us">Why Us</a>
        <a href="/#faq">FAQ</a>
        <a href="/blog">Blog</a>
      </nav>

      <div class="header__tools" aria-label="Quick tool links">
        <a href="/mobile-viewer"  class="header__tool-btn header__tool-btn--mobile"  aria-label="Open Mobile Viewer tool">📱 Mobile</a>
        <a href="/social-preview" class="header__tool-btn header__tool-btn--social" aria-label="Open Social Media Preview tool">📲 Social</a>
        <a href="/serp-preview"   class="header__tool-btn header__tool-btn--serp"   aria-label="Open SERP Preview tool">🔍 SERP</a>
      </div>

      <button
        class="header__hamburger"
        aria-label="Toggle mobile menu"
        aria-expanded="false"
        aria-controls="mobile-menu"
        id="hamburger-btn"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>

    <nav
      class="header__mobile-menu"
      id="mobile-menu"
      aria-label="Mobile navigation"
      role="navigation"
    >
      <a href="/#home">Home</a>
      <a href="/#tools">Tools</a>
      <a href="/#how-it-works">How It Works</a>
      <a href="/#why-us">Why Us</a>
      <a href="/#faq">FAQ</a>
      <a href="/blog">Blog</a>
      <a href="/mobile-viewer">📱 Mobile Viewer</a>
      <a href="/social-preview">📲 Social Media Preview</a>
      <a href="/serp-preview">🔍 SERP Preview</a>
    </nav>
  `;

  /* Hamburger toggle */
  const btn  = document.getElementById('hamburger-btn');
  const menu = document.getElementById('mobile-menu');

  btn.addEventListener('click', function () {
    const isOpen = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
    /* Animate hamburger → X */
    const spans = btn.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });

  /* Close menu on nav link click */
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      const spans = btn.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    });
  });

  /* Highlight active nav link */
  const currentPath = window.location.pathname;
  header.querySelectorAll('a[href]').forEach(function (link) {
    try {
      const href = new URL(link.getAttribute('href'), window.location.origin).pathname;
      if (href === currentPath && href !== '/') {
        link.setAttribute('aria-current', 'page');
        link.style.color = 'var(--clr-text)';
      }
    } catch (e) { /* ignore */ }
  });
})();
