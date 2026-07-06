// =========================================================
// SERP-PREVIEW.JS — SERP Preview Tool
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
  const fieldBreadcrumb = $('#fieldBreadcrumb');
  const fieldDate = $('#fieldDate');
  const deviceToggle = $('#deviceToggle');

  // Preview elements
  const previewStage = $('#previewStage');
  const previewModeLabel = $('#previewModeLabel');
  const googleSnippet = $('#googleSnippet');
  const snippetUrl = $('#snippetUrl');
  const snippetPath = $('#snippetPath');
  const snippetTitle = $('#snippetTitle');
  const snippetDesc = $('#snippetDesc');
  const snippetDate = $('#snippetDate');
  const snippetBreadcrumb = $('#snippetBreadcrumb');
  const validationList = $('#validationList');

  // Stats
  const statTitleLength = $('#statTitleLength');
  const statDescLength = $('#statDescLength');
  const statUrlLength = $('#statUrlLength');
  const statTitleBar = $('#statTitleBar');
  const statDescBar = $('#statDescBar');
  const statUrlBar = $('#statUrlBar');

  // Character rings
  const titleRing = $('#titleRing');
  const titleCount = $('#titleCount');
  const descRing = $('#descRing');
  const descCount = $('#descCount');

  // Buttons
  const resetBtn = $('#resetBtn');
  const downloadBtn = $('#downloadBtn');

  // --- State ---
  let currentDevice = 'desktop';

  // --- Helper: update character ring ---
  function updateRing(ring, count, max, labelEl, optimalMin, optimalMax) {
    const pct = Math.min(count / max, 1);
    const circumference = 94.2;
    const offset = circumference * (1 - pct);
    ring.style.strokeDashoffset = offset;
    const remaining = max - count;

    // Determine status
    let status = 'optimal';
    let statusText = '';

    if (remaining < 0) {
      status = 'over';
      statusText = 'Over limit by ' + Math.abs(remaining) + ' chars';
      ring.style.stroke = '#E5484D';
    } else if (count < optimalMin) {
      status = 'warn';
      statusText = count + ' chars — ' + (optimalMin - count) + ' more recommended';
      ring.style.stroke = '#C77A1F';
    } else if (count > optimalMax) {
      status = 'warn';
      statusText = count + ' chars — ' + (count - optimalMax) + ' over recommended';
      ring.style.stroke = '#C77A1F';
    } else {
      status = 'optimal';
      statusText = count + ' chars (optimal)';
      ring.style.stroke = '#2F6FED';
    }

    labelEl.textContent = statusText;
    labelEl.className = 'char-count mono';

    if (status === 'over') {
      labelEl.classList.add('is-over');
    } else if (status === 'warn') {
      labelEl.classList.add('is-warn');
    } else {
      labelEl.classList.add('is-optimal');
    }

    return status;
  }

  // --- Update preview ---
  function updatePreview() {
    // Get values
    const url = fieldUrl.value.trim() || 'https://example.com/blog/post';
    const title = fieldTitle.value.trim() || 'SEO Best Practices for 2024: A Complete Guide';
    const desc = fieldDesc.value.trim() || 'A comprehensive guide to SEO best practices for 2024. Learn about keyword research, on-page optimization, technical SEO, and content strategy to rank higher in Google.';
    const breadcrumb = fieldBreadcrumb.value.trim() || '';
    const date = fieldDate.value.trim() || '';

    // Update snippet
    try {
      const urlObj = new URL(url);
      snippetUrl.innerHTML = `<span class="google-snippet__domain">${urlObj.hostname.replace(/^www\./, '')}</span>`;
      const path = urlObj.pathname.replace(/\/$/, '');
      const pathParts = path.split('/').filter(p => p);
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1].replace(/-/g, ' ');
        snippetPath.textContent = '› ' + pathParts.slice(0, -1).join(' › ') + (pathParts.length > 1 ? ' › ' : '') + lastPart;
      } else {
        snippetPath.textContent = '';
      }
    } catch (e) {
      snippetUrl.innerHTML = `<span class="google-snippet__domain">example.com</span>`;
      snippetPath.textContent = '› blog › seo-best-practices';
    }

    snippetTitle.textContent = title;
    snippetDesc.textContent = desc;
    snippetDate.textContent = date;
    snippetBreadcrumb.textContent = breadcrumb;

    // Show/hide optional elements
    snippetDate.style.display = date ? 'block' : 'none';
    snippetBreadcrumb.style.display = breadcrumb ? 'block' : 'none';

    // Update character rings
    const titleOptimalMin = 50;
    const titleOptimalMax = 60;
    const descOptimalMin = 150;
    const descOptimalMax = 160;

    const titleStatus = updateRing(titleRing, title.length, 80, titleCount, titleOptimalMin, titleOptimalMax);
    const descStatus = updateRing(descRing, desc.length, 200, descCount, descOptimalMin, descOptimalMax);

    // Update stats
    statTitleLength.textContent = title.length;
    statDescLength.textContent = desc.length;
    statUrlLength.textContent = url.length;

    // Update bars
    const titlePct = Math.min((title.length / 80) * 100, 100);
    const descPct = Math.min((desc.length / 200) * 100, 100);
    const urlPct = Math.min((url.length / 100) * 100, 100);

    statTitleBar.style.width = titlePct + '%';
    statDescBar.style.width = descPct + '%';
    statUrlBar.style.width = urlPct + '%';

    // Color bars
    const getBarColor = (status) => {
      if (status === 'over') return '#E5484D';
      if (status === 'warn') return '#C77A1F';
      return '#2F6FED';
    };

    statTitleBar.style.background = getBarColor(titleStatus);
    statDescBar.style.background = getBarColor(descStatus);

    // Update validation
    updateValidation(title.length, desc.length, url);
  }

  // --- Update validation ---
  function updateValidation(titleLen, descLen, url) {
    const results = [];

    // Title validation
    if (titleLen >= 50 && titleLen <= 60) {
      results.push({ status: 'success', label: 'Title length', detail: titleLen + ' characters (optimal)' });
    } else if (titleLen > 60 && titleLen <= 70) {
      results.push({ status: 'warning', label: 'Title length', detail: titleLen + ' characters (slightly long — consider 50-60)' });
    } else if (titleLen > 70) {
      results.push({ status: 'error', label: 'Title length', detail: titleLen + ' characters (too long — will be truncated)' });
    } else if (titleLen < 30) {
      results.push({ status: 'warning', label: 'Title length', detail: titleLen + ' characters (too short — aim for 50-60)' });
    } else {
      results.push({ status: 'warning', label: 'Title length', detail: titleLen + ' characters (aim for 50-60)' });
    }

    // Description validation
    if (descLen >= 150 && descLen <= 160) {
      results.push({ status: 'success', label: 'Description length', detail: descLen + ' characters (optimal)' });
    } else if (descLen >= 140 && descLen < 150) {
      results.push({ status: 'warning', label: 'Description length', detail: descLen + ' characters (slightly short — aim for 150-160)' });
    } else if (descLen > 160 && descLen <= 180) {
      results.push({ status: 'warning', label: 'Description length', detail: descLen + ' characters (slightly long — may be truncated)' });
    } else if (descLen > 180) {
      results.push({ status: 'error', label: 'Description length', detail: descLen + ' characters (too long — will be truncated)' });
    } else if (descLen < 120) {
      results.push({ status: 'warning', label: 'Description length', detail: descLen + ' characters (too short — aim for 150-160)' });
    } else {
      results.push({ status: 'warning', label: 'Description length', detail: descLen + ' characters (aim for 150-160)' });
    }

    // URL validation
    let urlStatus = 'success';
    let urlDetail = 'Valid URL format';
    try {
      new URL(url);
    } catch (e) {
      urlStatus = 'warning';
      urlDetail = 'Invalid URL format (using example.com)';
    }
    results.push({ status: urlStatus, label: 'URL format', detail: urlDetail });

    // Render validation
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
            <strong>${r.label}</strong>
            <span class="validation-detail">${r.detail}</span>
          </div>
        </div>
      `;
    });

    // Summary
    const total = results.length;
    const successCount = results.filter(r => r.status === 'success').length;
    html += `
      <div class="validation-item" style="border-color: var(--border-strong); background: var(--bg);">
        <span class="validation-icon" style="background: ${successCount === total ? 'var(--green)' : 'var(--amber)'}; color:#fff;">${successCount === total ? '✓' : 'ℹ'}</span>
        <div>
          <strong>Summary</strong>
          <span class="validation-detail">${successCount}/${total} checks passed ${successCount === total ? '— All good!' : '— ' + (total - successCount) + ' issue(s) to fix'}</span>
        </div>
      </div>
    `;

    validationList.innerHTML = html;
  }

  // --- Device switching ---
  function setDevice(device) {
    currentDevice = device;
    $$('#deviceToggle .segmented__btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.device === device);
    });
    googleSnippet.classList.toggle('is-mobile', device === 'mobile');
    previewModeLabel.textContent = device + '-preview.png';
  }

  // --- Reset ---
  function resetAll() {
    fieldUrl.value = '';
    fieldTitle.value = 'SEO Best Practices for 2024: A Complete Guide';
    fieldDesc.value = 'A comprehensive guide to SEO best practices for 2024. Learn about keyword research, on-page optimization, technical SEO, and content strategy to rank higher in Google.';
    fieldBreadcrumb.value = '';
    fieldDate.value = '';

    setDevice('desktop');
    updatePreview();

    try { localStorage.removeItem('serp-preview-draft'); } catch(e) {}
  }

  // --- Save/Load draft ---
  function saveDraft() {
    try {
      const data = {
        url: fieldUrl.value,
        title: fieldTitle.value,
        desc: fieldDesc.value,
        breadcrumb: fieldBreadcrumb.value,
        date: fieldDate.value,
        device: currentDevice
      };
      localStorage.setItem('serp-preview-draft', JSON.stringify(data));
    } catch(e) {}
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem('serp-preview-draft');
      if (!raw) return;
      const data = JSON.parse(raw);
      fieldUrl.value = data.url || '';
      fieldTitle.value = data.title || 'SEO Best Practices for 2024: A Complete Guide';
      fieldDesc.value = data.desc || 'A comprehensive guide to SEO best practices for 2024. Learn about keyword research, on-page optimization, technical SEO, and content strategy to rank higher in Google.';
      fieldBreadcrumb.value = data.breadcrumb || '';
      fieldDate.value = data.date || '';
      if (data.device) setDevice(data.device);
      updatePreview();
    } catch(e) {}
  }

  // --- Download preview ---
  async function downloadPreview() {
    const snippet = googleSnippet;
    if (!snippet) return;

    // Create a wrapper for clean screenshot
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'padding:20px;background:#fff;display:inline-block;';
    const clone = snippet.cloneNode(true);
    // Remove mobile class for clean screenshot if needed
    if (currentDevice === 'mobile') {
      clone.classList.add('is-mobile');
    } else {
      clone.classList.remove('is-mobile');
    }
    wrapper.appendChild(clone);

    // Temporarily add to DOM
    document.body.appendChild(wrapper);

    try {
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        backgroundColor: '#ffffff',
        allowTaint: false,
        useCORS: true,
        logging: false,
        width: wrapper.scrollWidth,
        height: wrapper.scrollHeight
      });
      const link = document.createElement('a');
      link.download = 'serp-preview-' + currentDevice + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch(err) {
      console.warn('Download failed:', err);
      alert('Could not generate preview image. Please try again or use screenshot.');
    } finally {
      document.body.removeChild(wrapper);
    }
  }

  // --- Event listeners ---

  // Input fields
  [fieldUrl, fieldTitle, fieldDesc, fieldBreadcrumb, fieldDate].forEach(el => {
    el.addEventListener('input', function() {
      updatePreview();
      saveDraft();
    });
  });

  // Device toggle
  $$('#deviceToggle .segmented__btn').forEach(btn => {
    btn.addEventListener('click', function() {
      setDevice(this.dataset.device);
      saveDraft();
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
  updatePreview();

  console.log('SERP Preview Tool initialized.');
});
