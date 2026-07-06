// header.js — injects the site header component
(function () {
  const HEADER_HTML = `
  <header class="site-header">
    <div class="site-header__inner">
      <a href="/" class="site-header__logo">
        <span class="logo-mark">&gt;_</span>
        Post<span class="accent">Preview Tool</span>
      </a>

      <nav class="site-header__nav" id="siteNav">
        <a href="/#features">Features</a>
        <a href="/#platforms">Preview apps</a>
        <a href="/#how">How it works</a>
        <a href="/#specs">Platform specs</a>
        <a href="/#faq">FAQ</a>
      </nav>

      <div class="site-header__actions">
        <a href="/#platforms" class="btn btn--ghost">Preview apps</a>
        <button class="site-header__burger" id="navToggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="siteNav">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>`;

  const mount = document.getElementById('site-header');
  if (mount) {
    mount.outerHTML = HEADER_HTML;
  }

  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('siteNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();
