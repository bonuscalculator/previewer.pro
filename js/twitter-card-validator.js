// =========================================================
// TWITTER-CARD-VALIDATOR.JS — Twitter Card Validator Tool
// =========================================================

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // --- DOM refs ---
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // Form fields
  const fieldUrl = $('#fieldUrl');
  const validateBtn = $('#validateBtn');
  const cardTypeToggle = $('#cardTypeToggle');
  const themeToggle = $('#themeToggle');

  // Preview elements
  const previewStage = $('#previewStage');
  const previewModeLabel = $('#previewModeLabel');
  const twitterCard = $('#twitterCard');
  const cardImage = $('#cardImage');
  const cardDomain = $('#cardDomain');
  const cardTitle = $('#cardTitle');
  const cardDesc = $('#cardDescription');
  const validationList = $('#validationList');
  const rawTags = $('#rawTags');
  const detectedCardType = $('#detectedCardType');

  // Buttons
  const resetBtn = $('#resetBtn');
  const downloadBtn = $('#downloadBtn');

  // --- State ---
  let currentTheme = 'light';
  let isDark = false;
  let selectedCardType = 'auto';
  let currentCardData = null;

  // --- Helper: format meta tag for display ---
  function formatMetaTag(name, content) {
    if (!content) return null;
    return `<span class="tag">&lt;meta</span> <span class="attr">name</span>=<span class="value">"${name}"</span> <span class="attr">content</span>=<span class="value">"${escapeHtml(content)}"</span> <span class="tag">/&gt;</span>`;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Validate URL ---
  async function validateUrl() {
    const url = fieldUrl.value.trim();
    if (!url) {
      alert('Please enter a URL to validate.');
      return;
    }

    // Show loading state
    validationList.innerHTML = `
      <div class="validation-item validation-item--loading">
        <span class="validation-icon">⟳</span>
        <div>
          <strong>Validating...</strong>
          <span class="validation-detail">Fetching meta tags from ${escapeHtml(url)}</span>
        </div>
      </div>
    `;
    rawTags.textContent = '<!-- Fetching tags... -->';

    try {
      // Use a proxy to fetch the page content (CORS bypass)
      const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch URL: ' + response.status);
      }

      const html = await response.text();

      // Parse meta tags
      const metaTags = parseMetaTags(html);
      const twitterTags = metaTags.filter(t => t.name && t.name.startsWith('twitter:'));
      const ogTags = metaTags.filter(t => t.property && t.property.startsWith('og:'));

      // Build validation results
      const results = validateTwitterTags(twitterTags, ogTags);
      renderValidationResults(results, twitterTags, ogTags);

      // Render card preview
      renderCardPreview(results, twitterTags, ogTags, url);

      // Render raw tags
      renderRawTags(twitterTags, ogTags);

      // Store for download
      currentCardData = {
        results,
        twitterTags,
        ogTags,
        url
      };

    } catch (err) {
      console.error('Validation error:', err);
      validationList.innerHTML = `
        <div class="validation-item validation-item--error">
          <span class="validation-icon">✕</span>
          <div>
            <strong>Error</strong>
            <span class="validation-detail">${escapeHtml(err.message || 'Failed to fetch URL. Make sure the URL is accessible.')}</span>
          </div>
        </div>
      `;
      rawTags.textContent = '<!-- Error fetching tags -->';
    }
  }

  // --- Parse meta tags from HTML ---
  function parseMetaTags(html) {
    const tags = [];
    const metaRegex = /<meta\s+([^>]*?)>/gi;
    let match;

    while ((match = metaRegex.exec(html)) !== null) {
      const attrs = match[1];
      const nameMatch = attrs.match(/name=["']([^"']*)["']/i);
      const propertyMatch = attrs.match(/property=["']([^"']*)["']/i);
      const contentMatch = attrs.match(/content=["']([^"']*)["']/i);
      
      if (contentMatch) {
        const tag = {
          content: contentMatch[1]
        };
        if (nameMatch) {
          tag.name = nameMatch[1];
        }
        if (propertyMatch) {
          tag.property = propertyMatch[1];
        }
        if (tag.name || tag.property) {
          tags.push(tag);
        }
      }
    }

    return tags;
  }

  // --- Validate Twitter tags ---
  function validateTwitterTags(twitterTags, ogTags) {
    const results = [];
    const requiredTags = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];
    const tagMap = {};

    twitterTags.forEach(t => {
      if (t.name) {
        tagMap[t.name] = t.content;
      }
    });

    // Check required tags
    requiredTags.forEach(tag => {
      const content = tagMap[tag];
      if (content) {
        results.push({
          tag: tag,
          status: 'success',
          message: 'Present',
          detail: content
        });
      } else {
        // Check if Open Graph fallback exists
        const ogFallback = tag.replace('twitter:', 'og:');
        const ogContent = ogTags.find(t => t.property === ogFallback);
        if (ogContent) {
          results.push({
            tag: tag,
            status: 'warning',
            message: 'Using Open Graph fallback',
            detail: ogContent.content
          });
        } else {
          results.push({
            tag: tag,
            status: 'error',
            message: 'Missing',
            detail: 'Required tag not found'
          });
        }
      }
    });

    // Detect card type
    const cardType = tagMap['twitter:card'] || 'summary';
    results.push({
      tag: 'Card Type',
      status: 'success',
      message: cardType,
      detail: cardType
    });

    return results;
  }

  // --- Render validation results ---
  function renderValidationResults(results, twitterTags, ogTags) {
    let html = '';
    const statusIcons = {
      success: '✓',
      warning: '⚠',
      error: '✕'
    };
    const statusClasses = {
      success: 'validation-item--success',
      warning: 'validation-item--warning',
      error: 'validation-item--error'
    };

    // Show card type first
    const cardTypeResult = results.find(r => r.tag === 'Card Type');
    if (cardTypeResult) {
      detectedCardType.textContent = cardTypeResult.message;
    }

    results.forEach(r => {
      const icon = statusIcons[r.status] || '•';
      const cls = statusClasses[r.status] || '';
      const tagDisplay = r.tag === 'Card Type' ? r.tag : r.tag;
      html += `
        <div class="validation-item ${cls}">
          <span class="validation-icon">${icon}</span>
          <div>
            <strong>${escapeHtml(tagDisplay)}</strong>
            <span class="validation-detail">${escapeHtml(r.message)}${r.detail && r.tag !== 'Card Type' ? ' — ' + escapeHtml(r.detail) : ''}</span>
          </div>
        </div>
      `;
    });

    // Show count
    const total = results.length;
    const successCount = results.filter(r => r.status === 'success').length;
    html += `
      <div class="validation-item" style="border-color: var(--border-strong); background: var(--bg);">
        <span class="validation-icon" style="background: ${successCount === total ? 'var(--green)' : 'var(--amber)'}; color:#fff;">${successCount === total ? '✓' : 'ℹ'}</span>
        <div>
          <strong>Summary</strong>
          <span class="validation-detail">${successCount}/${total} tags valid ${successCount === total ? '— All good!' : '— ' + (total - successCount) + ' issue(s) to fix'}</span>
        </div>
      </div>
    `;

    validationList.innerHTML = html;
  }

  // --- Render card preview ---
  function renderCardPreview(results, twitterTags, ogTags, url) {
    const tagMap = {};
    twitterTags.forEach(t => {
      if (t.name) tagMap[t.name] = t.content;
    });
    const ogMap = {};
    ogTags.forEach(t => {
      if (t.property) ogMap[t.property] = t.content;
    });

    // Get values with fallbacks
    const title = tagMap['twitter:title'] || ogMap['og:title'] || 'Untitled Page';
    const description = tagMap['twitter:description'] || ogMap['og:description'] || '';
    const image = tagMap['twitter:image'] || ogMap['og:image'] || '';
    const domain = new URL(url).hostname.replace(/^www\./, '');

    cardTitle.textContent = title;
    cardDesc.textContent = description || 'No description available';
    cardDomain.textContent = domain;

    // Try to load image
    if (image) {
      cardImage.src = image;
      cardImage.alt = title;
      cardImage.onerror = function() {
        this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'%3E%3Crect width='1200' height='630' fill='%23E8E8E8'/%3E%3Ctext x='50%25' y='50%25' font-family='monospace' font-size='36' fill='%23999' text-anchor='middle' dy='.3em'%3EImage failed to load%3C/text%3E%3C/svg%3E";
      };
    } else {
      cardImage.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'%3E%3Crect width='1200' height='630' fill='%23E8E8E8'/%3E%3Ctext x='50%25' y='50%25' font-family='monospace' font-size='36' fill='%23999' text-anchor='middle' dy='.3em'%3ENo image%3C/text%3E%3C/svg%3E";
    }
  }

  // --- Render raw tags ---
  function renderRawTags(twitterTags, ogTags) {
    let html = '<!-- Twitter Card Tags -->\n';
    if (twitterTags.length === 0) {
      html += '<!-- No Twitter Card tags found -->\n';
    } else {
      twitterTags.forEach(t => {
        if (t.name) {
          html += formatMetaTag(t.name, t.content) + '\n';
        }
      });
    }

    html += '\n<!-- Open Graph Tags (fallback) -->\n';
    if (ogTags.length === 0) {
      html += '<!-- No Open Graph tags found -->\n';
    } else {
      ogTags.forEach(t => {
        if (t.property) {
          html += formatMetaTag(t.property, t.content) + '\n';
        }
      });
    }

    rawTags.innerHTML = html;
  }

  // --- Theme switching ---
  function setTheme(theme) {
    currentTheme = theme;
    isDark = (theme === 'dark');
    $$('#themeToggle .segmented__btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.theme === theme);
    });
    twitterCard.classList.toggle('is-dark', isDark);
    previewStage.classList.toggle('is-dark', isDark);
    previewModeLabel.textContent = (isDark ? 'dark' : 'light') + '-preview.png';
  }

  // --- Reset ---
  function resetAll() {
    fieldUrl.value = 'https://previewer.pro/';
    setTheme('light');
    validationList.innerHTML = `
      <div class="validation-item validation-item--success">
        <span class="validation-icon">✓</span>
        <div>
          <strong>Card type detected</strong>
          <span class="validation-detail" id="detectedCardType">summary_large_image</span>
        </div>
      </div>
      <div class="validation-item validation-item--success">
        <span class="validation-icon">✓</span>
        <div>
          <strong>twitter:card</strong>
          <span class="validation-detail">Present</span>
        </div>
      </div>
      <div class="validation-item validation-item--success">
        <span class="validation-icon">✓</span>
        <div>
          <strong>twitter:title</strong>
          <span class="validation-detail">Present</span>
        </div>
      </div>
      <div class="validation-item validation-item--success">
        <span class="validation-icon">✓</span>
        <div>
          <strong>twitter:description</strong>
          <span class="validation-detail">Present</span>
        </div>
      </div>
      <div class="validation-item validation-item--success">
        <span class="validation-icon">✓</span>
        <div>
          <strong>twitter:image</strong>
          <span class="validation-detail">Present</span>
        </div>
      </div>
    `;
    rawTags.innerHTML = `<span class="comment">&lt;!-- No tags fetched yet. Enter a URL and click Validate. --&gt;</span>`;
    cardTitle.textContent = 'Previewer.pro — Social Media Post Preview Tool';
    cardDesc.textContent = 'Preview your social media posts before you publish. Free, no login required.';
    cardDomain.textContent = 'previewer.pro';
    cardImage.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'%3E%3Crect width='1200' height='630' fill='%23E8E8E8'/%3E%3Ctext x='50%25' y='50%25' font-family='monospace' font-size='36' fill='%23999' text-anchor='middle' dy='.3em'%3ENo image%3C/text%3E%3C/svg%3E";
    detectedCardType.textContent = 'summary_large_image';
    try { localStorage.removeItem('twitter-card-validator-draft'); } catch(e) {}
  }

  // --- Save/Load draft ---
  function saveDraft() {
    try {
      const data = {
        url: fieldUrl.value,
        theme: currentTheme
      };
      localStorage.setItem('twitter-card-validator-draft', JSON.stringify(data));
    } catch(e) {}
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem('twitter-card-validator-draft');
      if (!raw) return;
      const data = JSON.parse(raw);
      fieldUrl.value = data.url || 'https://previewer.pro/';
      if (data.theme) setTheme(data.theme);
    } catch(e) {}
  }

  // --- Download preview ---
  async function downloadPreview() {
    const card = twitterCard;
    if (!card) return;
    try {
      const canvas = await html2canvas(card, {
        scale: 2,
        backgroundColor: isDark ? '#0F0F0F' : '#ffffff',
        allowTaint: false,
        useCORS: true,
        logging: false,
        width: card.scrollWidth,
        height: card.scrollHeight
      });
      const link = document.createElement('a');
      link.download = 'twitter-card-preview-' + (isDark ? 'dark' : 'light') + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch(err) {
      console.warn('Download failed:', err);
      alert('Could not generate preview image. Please try again or use screenshot.');
    }
  }

  // --- Event listeners ---
  validateBtn.addEventListener('click', validateUrl);

  fieldUrl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateUrl();
    }
  });

  // Theme toggle
  $$('#themeToggle .segmented__btn').forEach(btn => {
    btn.addEventListener('click', function() {
      setTheme(this.dataset.theme);
      saveDraft();
    });
  });

  // Card type toggle (for future manual override)
  $$('#cardTypeToggle .segmented__btn').forEach(btn => {
    btn.addEventListener('click', function() {
      $$('#cardTypeToggle .segmented__btn').forEach(b => b.classList.remove('is-active'));
      this.classList.add('is-active');
      selectedCardType = this.dataset.type;
      // Note: Auto-detection uses the actual tag. Manual selection could be implemented here.
    });
  });

  // Reset & Download
  resetBtn.addEventListener('click', resetAll);
  downloadBtn.addEventListener('click', downloadPreview);

  // Auto-save
  document.addEventListener('click', function() { saveDraft(); });
  document.addEventListener('focusout', function(e) {
    if (e.target.closest('input, textarea')) saveDraft();
  });

  // --- Init ---
  loadDraft();
  
  // Auto-validate on load if URL is present
  if (fieldUrl.value && fieldUrl.value !== '') {
    setTimeout(validateUrl, 500);
  }

  console.log('Twitter Card Validator initialized.');
});
