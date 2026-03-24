/* footer.js — Injects the site footer as a reusable component */
(function () {
  const footerEl = document.getElementById('site-footer');
  if (!footerEl) return;

  const year = new Date().getFullYear();

  footerEl.innerHTML = `
    <footer class="footer" role="contentinfo" aria-label="Site footer">
      <div class="container">
        <div class="footer__top">

          <!-- Brand -->
          <div class="footer__brand">
            <a href="/" class="header__logo" aria-label="Previewer.pro home" style="display:inline-flex;align-items:center;gap:.55rem;text-decoration:none;margin-bottom:.75rem;">
              <div class="header__logo-mark" aria-hidden="true">🔍</div>
              <span class="header__logo-text" style="font-family:var(--ff-display);font-weight:800;font-size:1.1rem;color:#fff;">previewer<span style="color:var(--clr-accent2)">.pro</span></span>
            </a>
            <p>Free online preview tools for mobile responsiveness, social media post sharing, and Google SERP snippets. Build and publish with confidence.</p>
          </div>

          <!-- Tools -->
          <div class="footer__col">
            <h4>Tools</h4>
            <ul>
              <li><a href="/mobile-viewer">Mobile Viewer</a></li>
              <li><a href="/social-preview">Social Media Preview</a></li>
              <li><a href="/serp-preview">SERP Preview</a></li>
              <li><a href="/mobile-viewer#devices">Device List</a></li>
              <li><a href="/social-preview#platforms">Platform Support</a></li>
            </ul>
          </div>

          <!-- Resources -->
          <div class="footer__col">
            <h4>Resources</h4>
            <ul>
              <li><a href="/blog">Blog &amp; Guides</a></li>
              <li><a href="/blog/open-graph-guide">Open Graph Guide</a></li>
              <li><a href="/blog/meta-title-tips">Meta Title Tips</a></li>
              <li><a href="/blog/mobile-seo">Mobile SEO Checklist</a></li>
              <li><a href="/blog/serp-ctr">Improve SERP CTR</a></li>
            </ul>
          </div>

          <!-- Company -->
          <div class="footer__col">
            <h4>Company</h4>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Use</a></li>
              <li><a href="/sitemap.xml">Sitemap</a></li>
            </ul>
          </div>

        </div>

        <div class="footer__bottom">
          <p>&copy; ${year} <a href="/" style="color:inherit;text-decoration:none;font-weight:600;">Previewer.pro</a> — All rights reserved.</p>
          <div class="footer__social" aria-label="Social media links">
            <a href="https://twitter.com/previewerpro" rel="noopener noreferrer" target="_blank" aria-label="Follow Previewer.pro on Twitter">Twitter / X</a>
            <a href="https://linkedin.com/company/previewerpro" rel="noopener noreferrer" target="_blank" aria-label="Follow Previewer.pro on LinkedIn">LinkedIn</a>
            <a href="https://github.com/previewerpro" rel="noopener noreferrer" target="_blank" aria-label="View Previewer.pro on GitHub">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  `;
})();
