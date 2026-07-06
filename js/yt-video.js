// =========================================================
// YT-VIDEO.JS — YouTube Video Preview Tool
// =========================================================

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // --- DOM refs ---
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // Form fields
  const fieldChannel = $('#fieldChannel');
  const fieldTitle = $('#fieldTitle');
  const fieldViews = $('#fieldViews');
  const fieldTime = $('#fieldTime');

  // Preview elements
  const ytCard = $('#ytCard');
  const ytThumbImg = $('#ytThumbImg');
  const ytTitle = $('#ytTitle');
  const ytChannel = $('#ytChannel');
  const ytViews = $('#ytViews');
  const ytTime = $('#ytTime');

  // UI controls
  const titleRing = $('#titleRing');
  const titleCount = $('#titleCount');
  const themeToggle = $('#themeToggle');
  const previewStage = $('#previewStage');
  const previewModeLabel = $('#previewModeLabel');

  const dropzone = $('#dropzone');
  const imageInput = $('#imageInput');
  const imagePreviewRow = $('#imagePreviewRow');
  const imagePreviewThumb = $('#imagePreviewThumb');
  const imageRemoveBtn = $('#imageRemoveBtn');

  const avatarInput = $('#avatarInput');
  const avatarUploadBtn = $('#avatarUploadBtn');
  const avatarRemoveBtn = $('#avatarRemoveBtn');

  const resetBtn = $('#resetBtn');
  const downloadBtn = $('#downloadBtn');

  // --- State ---
  let currentTheme = 'light';
  let uploadedThumbnailData = null;
  let uploadedAvatarData = null;
  let isDark = false;

  // --- Helper: update title ring ---
  function updateRing(ring, count, max, labelEl, isWarnThreshold = 10) {
    const pct = Math.min(count / max, 1);
    const circumference = 94.2;
    const offset = circumference * (1 - pct);
    ring.style.strokeDashoffset = offset;
    const remaining = max - count;
    if (remaining < 0) {
      ring.style.stroke = '#E5484D';
      labelEl.textContent = 'Over limit by ' + Math.abs(remaining) + ' chars';
      labelEl.className = 'char-count mono is-over';
    } else if (remaining < isWarnThreshold) {
      ring.style.stroke = '#C77A1F';
      labelEl.textContent = remaining + ' characters left';
      labelEl.className = 'char-count mono is-warn';
    } else {
      ring.style.stroke = '#FF0000'; // YouTube red
      labelEl.textContent = remaining + ' characters left';
      labelEl.className = 'char-count mono';
    }
  }

  // --- Update preview ---
  function updatePreview() {
    // Channel
    const channel = fieldChannel.value.trim() || 'Your Channel';
    ytChannel.textContent = channel;

    // Title
    const title = fieldTitle.value.trim() || 'Your video title here';
    ytTitle.textContent = title;

    // Views
    const views = fieldViews.value.trim() || '1.2M';
    ytViews.textContent = views + ' views';

    // Time
    const time = fieldTime.value.trim() || '2 days ago';
    ytTime.textContent = time;

    // Thumbnail
    if (uploadedThumbnailData) {
      ytThumbImg.src = uploadedThumbnailData;
    } else {
      ytThumbImg.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180'%3E%3Crect width='320' height='180' fill='%23D3D3D3'/%3E%3Ctext x='50%25' y='50%25' font-family='monospace' font-size='20' fill='%23999999' text-anchor='middle' dy='.3em'%3EThumbnail%3C/text%3E%3C/svg%3E";
    }

    // Channel avatar (we use a small icon on the card? Actually the card doesn't show avatar in this mockup; we can add it optionally)
    // For simplicity, we won't include avatar in the card, but we can store it for future use.

    // Character ring
    const maxChars = 100;
    updateRing(titleRing, fieldTitle.value.length, maxChars, titleCount, 10);
  }

  // --- Theme switching ---
  function setTheme(theme) {
    currentTheme = theme;
    isDark = (theme === 'dark');
    $$('#themeToggle .segmented__btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.theme === theme);
    });
    ytCard.classList.toggle('is-dark', isDark);
    previewStage.classList.toggle('is-dark', isDark);
    previewModeLabel.textContent = (isDark ? 'dark' : 'light') + '-preview.png';
  }

  // --- Image upload handlers ---
  function handleImageUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedThumbnailData = e.target.result;
      imagePreviewThumb.src = uploadedThumbnailData;
      imagePreviewRow.hidden = false;
      dropzone.querySelector('p').textContent = 'Thumbnail uploaded ✓';
      updatePreview();
    };
    reader.readAsDataURL(file);
  }

  function handleAvatarUpload(file) {
    // For now, we don't display avatar in the card, but we store it just in case.
    // Could be used to display a small avatar on the card later.
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedAvatarData = e.target.result;
      // Optionally, we could add an avatar element to the card, but we'll keep it simple.
    };
    reader.readAsDataURL(file);
  }

  // --- Reset ---
  function resetAll() {
    fieldChannel.value = '';
    fieldTitle.value = '';
    fieldViews.value = '';
    fieldTime.value = '';

    uploadedThumbnailData = null;
    uploadedAvatarData = null;
    imagePreviewRow.hidden = true;
    imagePreviewThumb.src = '';
    dropzone.querySelector('p').textContent = 'Click or drop an image here';

    setTheme('light');
    try { localStorage.removeItem('yt-video-draft'); } catch(e) {}
    updatePreview();
  }

  // --- Save/Load draft ---
  function saveDraft() {
    try {
      const data = {
        channel: fieldChannel.value,
        title: fieldTitle.value,
        views: fieldViews.value,
        time: fieldTime.value,
        theme: currentTheme
      };
      localStorage.setItem('yt-video-draft', JSON.stringify(data));
    } catch(e) {}
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem('yt-video-draft');
      if (!raw) return;
      const data = JSON.parse(raw);
      fieldChannel.value = data.channel || '';
      fieldTitle.value = data.title || '';
      fieldViews.value = data.views || '';
      fieldTime.value = data.time || '';
      if (data.theme) setTheme(data.theme);
      updatePreview();
    } catch(e) {}
  }

  // --- Download preview ---
  async function downloadPreview() {
    const card = ytCard;
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
      link.download = 'yt-preview-' + (isDark ? 'dark' : 'light') + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch(err) {
      console.warn('Download failed:', err);
      alert('Could not generate preview image. Please try again or use screenshot.');
    }
  }

  // --- Event listeners ---

  // Input fields
  [fieldChannel, fieldTitle, fieldViews, fieldTime].forEach(el => {
    el.addEventListener('input', function() {
      updatePreview();
      saveDraft();
    });
  });

  // Theme toggle
  $$('#themeToggle .segmented__btn').forEach(btn => {
    btn.addEventListener('click', function() {
      setTheme(this.dataset.theme);
      saveDraft();
    });
  });

  // Dropzone for thumbnail
  dropzone.addEventListener('click', function(e) {
    if (e.target.closest('p')) imageInput.click();
  });
  dropzone.addEventListener('dragover', function(e) {
    e.preventDefault(); this.classList.add('is-dragover');
  });
  dropzone.addEventListener('dragleave', function(e) {
    e.preventDefault(); this.classList.remove('is-dragover');
  });
  dropzone.addEventListener('drop', function(e) {
    e.preventDefault(); this.classList.remove('is-dragover');
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
    uploadedThumbnailData = null;
    imagePreviewRow.hidden = true;
    imagePreviewThumb.src = '';
    dropzone.querySelector('p').textContent = 'Click or drop an image here';
    updatePreview();
    saveDraft();
  });

  // Avatar upload (optional)
  avatarUploadBtn.addEventListener('click', function() { avatarInput.click(); });
  avatarInput.addEventListener('change', function() {
    if (this.files.length > 0) handleAvatarUpload(this.files[0]);
    this.value = '';
  });
  avatarRemoveBtn.addEventListener('click', function() {
    uploadedAvatarData = null;
    // No visual update needed since we don't display avatar
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
  if (!localStorage.getItem('yt-video-draft')) {
    // Set defaults
    fieldChannel.value = 'My Awesome Channel';
    fieldTitle.value = 'How to Build a YouTube Preview Tool in 10 Minutes';
    fieldViews.value = '1.2M';
    fieldTime.value = '2 days ago';
    setTheme('light');
    updatePreview();
  }

  console.log('YouTube Video Preview Tool initialized.');
});
