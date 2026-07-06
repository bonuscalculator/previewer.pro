// footer.js — injects the site footer component
(function () {
  const YEAR = new Date().getFullYear();

  const FOOTER_HTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="site-footer__top">
        <div class="site-footer__brand">
          <a href="/" class="site-footer__logo">
            <span class="logo-mark" style="width:26px;height:26px;border-radius:7px;background:#1E2328;color:#fff;font-family:'JetBrains Mono',monospace;font-size:.7rem;display:inline-flex;align-items:center;justify-content:center;">&gt;_</span>
            Post Preview Tool
          </a>
          <p>A free, no-login preview tool for social media posts — see exactly how your caption will look before you publish it.</p>
        </div>

        <div>
          <h4>// product</h4>
          <ul>
            <li><a href="/#features">Features</a></li>
            <li><a href="/#platforms">Preview apps</a></li>
            <li><a href="/#how">How it works</a></li>
            <li><a href="/#specs">Platform specs</a></li>
            <li><a href="/#faq">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h4>// preview apps</h4>
          <ul>
            <li><a href="/fb-post">Facebook</a></li>
            <li><a href="/x-post">X (formerly Twitter)</a></li>
            <li><a href="/reddit-post">LinkedIn</a></li>
            <li><a href="/pinterest-pin">Pinterest</a></li>
            <li><a href="/linkedin-post">Threads</a></li>
            <li><a href="/insta-post">Threads</a></li>
            <li><a href="/youtube-video">Threads</a></li>
            <li><a href="/threads-post">Threads</a></li>
          </ul>
        </div>

        <div>
          <h4>// pages</h4>
          <ul>            
            <li><a href="/privacy">Privacy policy</a></li>
            <li><a href="/terms">Terms of use</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/cookies">Cookies Policy</a></li>
            <li><a href="mailto:hello@previewer.pro">Email</a></li>
          </ul>
        </div>
      </div>

      <div class="site-footer__bottom">
        <span>© ${YEAR} Previewer.pro. All rights reserved.</span>
        <span class="mono">built for people who ship</span>
      </div>
    </div>
  </footer>`;

  const mount = document.getElementById('site-footer');
  if (mount) {
    mount.outerHTML = FOOTER_HTML;
  }
})();
