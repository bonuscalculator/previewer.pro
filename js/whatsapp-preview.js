// =========================================================
// WHATSAPP-PREVIEW.JS — WhatsApp Link Preview Tool
// =========================================================

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // --- DOM refs ---
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // Form fields
  const fieldUrl = $('#fieldUrl');
  const fieldTitle = $('#fieldTitle');
  const fieldDesc = $('#fieldDesc');
  const previewBtn = $('#previewBtn');
  const themeToggle = $('#themeToggle');

  // Preview elements
  const previewStage = $('#previewStage');
  const previewModeLabel = $('#previewModeLabel');
  const whatsappMessage = $('#whatsappMessage');
  const whatsappCard = $('#whatsappCard');
  const cardImage = $('#cardImage');
  const cardDomain = $('#cardDomain');
  const cardTitle = $('#cardTitle');
  const cardDesc = $('#cardDesc');
  const validationList = $('#validationList');
  const rawTags = $('#rawTags');

  // Dropzone
  const dropzone = $('#dropzone');
  const imageInput = $('#imageInput');
  const imagePreviewRow = $('#imagePreviewRow');
  const imagePreviewThumb = $('#imagePreviewThumb');
  const imageRemoveBtn = $('#imageRemoveBtn');

  // Buttons
  const resetBtn = $('#resetBtn');
  const downloadBtn = $('#downloadBtn');

  // --- State ---
  let currentTheme = 'light';
  let isDark = false;
  let uploadedImageData = null;
  let currentCardData = null;

  // --- Helper: format meta tag for display ---
  function formatMetaTag(name, content) {
    if (!content) return null;
    return `<span class="tag">&lt;meta</span> <span class="attr">property</span>=<span class="value">"${name}"</span> <span class="attr">content</span>=<span class="value">"${escapeHtml(content)}"</span> <span class="tag">/&gt;</span>`;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Preview URL ---
  async function previewUrl() {
    const url = fieldUrl.value.trim();
    if (!url) {
      alert('Please enter a URL to preview.');
      return;
    }

    // Show loading state
    validationList.innerHTML = `
      <div class="validation-item validation-item--loading">
        <span class="validation-icon">⟳</span>
        <div>
          <strong>Loading...</strong>
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
      const ogTags = metaTags.filter(t => t.property && t.property.startsWith('og:'));

      // Build validation results
      const results = validateTags(ogTags);
      renderValidationResults(results, ogTags);

      // Render card preview
      renderCardPreview(results, ogTags, url);

      // Render raw tags
      renderRawTags(ogTags);

      // Store for download
      currentCardData = {
        results,
        ogTags,
        url
      };

    } catch (err) {
      console.error('Preview error:', err);
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
      const propertyMatch = attrs.match(/property=["']([^"']*)["']/i);
      const nameMatch = attrs.match(/name=["']([^"']*)["']/i);
      const contentMatch = attrs.match(/content=["']([^"']*)["']/i);
      
      if (contentMatch) {
        const tag = {
          content: contentMatch[1]
        };
        if (propertyMatch) {
          tag.property = propertyMatch[1];
        }
        if (nameMatch) {
          tag.name = nameMatch[1];
        }
        if (tag.property || tag.name) {
          tags.push(tag);
        }
      }
    }

    return tags;
  }

  // --- Validate Open Graph tags ---
  function validateTags(ogTags) {
    const results = [];
    const requiredTags = ['og:title', 'og:description', 'og:image'];
    const tagMap = {};

    ogTags.forEach(t => {
      if (t.property) {
        tagMap[t.property] = t.content;
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
        results.push({
          tag: tag,
          status: 'error',
          message: 'Missing',
          detail: 'Required tag not found'
        });
      }
    });

    return results;
  }

  // --- Render validation results ---
  function renderValidationResults(results, ogTags) {
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

    results.forEach(r => {
      const icon = statusIcons[r.status] || '•';
      const cls = statusClasses[r.status] || '';
      html += `
        <div class="validation-item ${cls}">
          <span class="validation-icon">${icon}</span>
          <div>
            <strong>${escapeHtml(r.tag)}</strong>
            <span class="validation-detail">${escapeHtml(r.message)}${r.detail && r.status !== 'error' ? ' — ' + escapeHtml(r.detail) : ''}</span>
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
  function renderCardPreview(results, ogTags, url) {
    const tagMap = {};
    ogTags.forEach(t => {
      if (t.property) tagMap[t.property] = t.content;
    });

    // Get values with fallbacks
    const title = tagMap['og:title'] || fieldTitle.value.trim() || 'Untitled Page';
    const description = tagMap['og:description'] || fieldDesc.value.trim() || '';
    const image = tagMap['og:image'] || '';
    const domain = new URL(url).hostname.replace(/^www\./, '');

    cardTitle.textContent = title;
    cardDesc.textContent = description || 'No description available';
    cardDomain.textContent = domain;

    // Use custom uploaded image if available
    if (uploadedImageData) {
      cardImage.src = uploadedImageData;
      cardImage.alt = title;
    } else if (image) {
      cardImage.src = image;
      cardImage.alt = title;
      cardImage.onerror = function() {
        this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='209'%3E%3Crect width='400' height='209' fill='%23E8E8E8'/%3E%3Ctext x='50%25' y='50%25' font-family='monospace' font-size='24' fill='%23999' text-anchor='middle' dy='.3em'%3ENo image%3C/text%3E%3C/svg%3E";
      };
    } else {
      cardImage.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='209'%3E%3Crect width='400' height='209' fill='%23E8E8E8'/%3E%3Ctext x='50%25' y='50%25' font-family='monospace' font-size='24' fill='%23999' text-anchor='middle' dy='.3em'%3ENo image%3C/text%3E%3C/svg%3E";
    }
  }

  // --- Render raw tags ---
  function renderRawTags(ogTags) {
    let html = '<!-- Open Graph Tags -->\n';
    if (ogTags.length === 0) {
      html += '<!-- No Open Graph tags found -->\n';
    } else {
      ogTags.forEach(t => {
        if (t.property) {
          html += formatMetaTag(t.property, t.content) + '\n';
        }
      });
    }

    html += '\n<!-- WhatsApp uses og:title, og:description, og:image -->\n';
    html += '<!-- Image should be at least 200×200px, 1.91:1 ratio recommended -->\n';

    rawTags.innerHTML = html;
  }

  // --- Theme switching ---
  function setTheme(theme) {
    currentTheme = theme;
    isDark = (theme === 'dark');
    $$('#themeToggle .segmented__btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.theme === theme);
    });
    whatsappMessage.classList.toggle('is-dark', isDark);
    whatsappCard.classList.toggle('is-dark', isDark);
    previewStage.classList.toggle('is-dark', isDark);
    previewModeLabel.textContent = (isDark ? 'dark' : 'light') + '-preview.png';
  }

  // --- Update preview from manual inputs ---
  function updateManualPreview() {
    if (currentCardData) {
      // Re-render with manual overrides
      const tagMap = {};
      currentCardData.ogTags.forEach(t => {
        if (t.property) tagMap[t.property] = t.content;
      });
      const url = currentCardData.url || fieldUrl.value;

      const title = fieldTitle.value.trim() || tagMap['og:title'] || 'Untitled Page';
      const description = fieldDesc.value.trim() || tagMap['og:description'] || '';
      const domain = new URL(url).hostname.replace(/^www\./, '');

      cardTitle.textContent = title;
      cardDesc.textContent = description || 'No description available';
      cardDomain.textContent = domain;

      if (uploadedImageData) {
        cardImage.src = uploadedImageData;
        cardImage.alt = title;
      }
    }
  }

  // --- Image upload ---
  function handleImageUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedImageData = e.target.result;
      imagePreviewThumb.src = uploadedImageData;
      imagePreviewRow.hidden = false;
      dropzone.querySelector('p').textContent = 'Image uploaded ✓';
      updateManualPreview();
    };
    reader.readAsDataURL(file);
  }

  // --- Reset ---
  function resetAll() {
    fieldUrl.value = 'https://previewer.pro/';
    fieldTitle.value = '';
    fieldDesc.value = '';
    uploadedImageData = null;
    imagePreviewRow.hidden = true;
    imagePreviewThumb.src = '';
    dropzone.querySelector('p').textContent = 'Click or drop an image here';

    setTheme('light');

    validationList.innerHTML = `
      <div class="validation-item validation-item--success">
        <span class="validation-icon">✓</span>
        <div>
          <strong>og:title</strong>
          <span class="validation-detail">Present</span>
        </div>
      </div>
      <div class="validation-item validation-item--success">
        <span class="validation-icon">✓</span>
        <div>
          <strong>og:description</strong>
          <span class="validation-detail">Present</span>
        </div>
      </div>
      <div class="validation-item validation-item--success">
        <span class="validation-icon">✓</span>
        <div>
          <strong>og:image</strong>
          <span class="validation-detail">Present</span>
        </div>
      </div>
    `;
    rawTags.innerHTML = `<span class="comment">&lt;!-- No tags fetched yet. Enter a URL and click Preview. --&gt;</span>`;
    cardTitle.textContent = 'Previewer.pro — Social Media Post Preview Tool';
    cardDesc.textContent = 'Preview your social media posts before you publish. Free, no login required.';
    cardDomain.textContent = 'previewer.pro';
    cardImage.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='209'%3E%3Crect width='400' height='209' fill='%23E8E8E8'/%3E%3Ctext x='50%25' y='50%25' font-family='monospace' font-size='24' fill='%23999' text-anchor='middle' dy='.3em'%3ENo image%3C/text%3E%3C/svg%3E";

    currentCardData = null;
    try { localStorage.removeItem('whatsapp-preview-draft'); } catch(e) {}
  }

  // --- Save/Load draft ---
  function saveDraft() {
    try {
      const data = {
        url: fieldUrl.value,
        title: fieldTitle.value,
        desc: fieldDesc.value,
        theme: currentTheme
      };
      localStorage.setItem('whatsapp-preview-draft', JSON.stringify(data));
    } catch(e) {}
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem('whatsapp-preview-draft');
      if (!raw) return;
      const data = JSON.parse(raw);
      fieldUrl.value = data.url || 'https://previewer.pro/';
      fieldTitle.value = data.title || '';
      fieldDesc.value = data.desc || '';
      if (data.theme) setTheme(data.theme);
    } catch(e) {}
  }

  // --- Download preview ---
  async function downloadPreview() {
    const card = whatsappMessage;
    if (!card) return;
    try {
      const canvas = await html2canvas(card, {
        scale: 2,
        backgroundColor: isDark ? '#1A1A1A' : '#ffffff',
        allowTaint: false,
        useCORS: true,
        logging: false,
        width: card.scrollWidth,
        height: card.scrollHeight
      });
      const link = document.createElement('a');
      link.download = 'whatsapp-preview-' + (isDark ? 'dark' : 'light') + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch(err) {
      console.warn('Download failed:', err);
      alert('Could not generate preview image. Please try again or use screenshot.');
    }
  }

  // --- Event listeners ---
  previewBtn.addEventListener('click', previewUrl);

  fieldUrl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      previewUrl();
    }
  });

  // Manual override inputs
  fieldTitle.addEventListener('input', function() {
    updateManualPreview();
    saveDraft();
  });

  fieldDesc.addEventListener('input', function() {
    updateManualPreview();
    saveDraft();
  });

  // Theme toggle
  $$('#themeToggle .segmented__btn').forEach(btn => {
    btn.addEventListener('click', function() {
      setTheme(this.dataset.theme);
      saveDraft();
    });
  });

  // Dropzone for image
  dropzone.addEventListener('click', function(e) {
    if (e.target.closest('p')) imageInput.click();
  });
  dropzone.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('is-dragover');
  });
  dropzone.addEventListener('dragleave', function(e) {
    e.preventDefault();
    this.classList.remove('is-dragover');
  });
  dropzone.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('is-dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleImageUpload(files[0]);
    }
  });
  imageInput.addEventListener('change', function() {
    if (this.files.length > 0) handleImageUpload(this.files[0]);
    this.value = '';
  });
  imageRemoveBtn.addEventListener('click', function() {
    uploadedImageData = null;
    imagePreviewRow.hidden = true;
    imagePreviewThumb.src = '';
    dropzone.querySelector('p').textContent = 'Click or drop an image here';
    updateManualPreview();
    saveDraft();
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

  // Auto-preview on load if URL is present
  if (fieldUrl.value && fieldUrl.value !== '') {
    setTimeout(previewUrl, 500);
  }

  console.log('WhatsApp Link Preview Tool initialized.');
});
