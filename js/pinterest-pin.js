// =========================================================
// PINTEREST-PIN.JS — Pinterest Pin Preview Tool
// =========================================================

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // --- DOM refs ---
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // Form fields
  const fieldBoard = $('#fieldBoard');
  const fieldTitle = $('#fieldTitle');
  const fieldDesc = $('#fieldDesc');
  const fieldSaves = $('#fieldSaves');
  const fieldComments = $('#fieldComments');

  // Preview elements
  const pinterestCard = $('#pinterestCard');
  const pinAvatar = $('#pinAvatar');
  const pinBoard = $('#pinBoard');
  const pinImage = $('#pinImage');
  const pinTitle = $('#pinTitle');
  const pinDesc = $('#pinDesc');
  const pinSaves = $('#pinSaves');
  const pinComments = $('#pinComments');

  // UI controls
  const titleRing = $('#titleRing');
  const titleCount = $('#titleCount');
  const descRing = $('#descRing');
  const descCount = $('#descCount');
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
  let uploadedImageData = null;
  let uploadedAvatarData = null;
  let isDark = false;

  // --- Helper: update a single ring ---
  function updateRing(ring, count, max, labelEl, isWarnThreshold = 20) {
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
      ring.style.stroke = '#E60023'; // Pinterest red
      labelEl.textContent = remaining + ' characters left';
      labelEl.className = 'char-count mono';
    }
  }

  // --- Update preview ---
  function updatePreview() {
    // Board
    const board = fieldBoard.value.trim() || 'Design Inspiration';
    pinBoard.textContent = board;

    // Title
    const title = fieldTitle.value.trim() || 'Your Pin title here';
    pinTitle.textContent = title;

    // Description
    const desc = fieldDesc.value.trim() || 'Write your Pin description here…';
    pinDesc.textContent = desc;

    // Stats
    pinSaves.textContent = fieldSaves.value || '0';
    pinComments.textContent = fieldComments.value || '0';

    // Image
    if (uploadedImageData) {
      pinImage.src = uploadedImageData;
    } else {
      pinImage.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23F0F0F0'/%3E%3Ctext x='50%25' y='50%25' font-family='monospace' font-size='24' fill='%23B0B0B0' text-anchor='middle' dy='.3em'%3EPin image%3C/text%3E%3C/svg%3E";
    }

    // Avatar
    if (uploadedAvatarData) {
      pinAvatar.style.backgroundImage = 'url(' + uploadedAvatarData + ')';
      pinAvatar.textContent = '';
    } else {
      pinAvatar.style.backgroundImage = '';
      pinAvatar.textContent = board.charAt(0).toUpperCase() || 'DI';
    }

    // Character rings
    const titleMax = 100;
    const descMax = 500;
    updateRing(titleRing, fieldTitle.value.length, titleMax, titleCount, 15);
    updateRing(descRing, fieldDesc.value.length, descMax, descCount, 40);
  }

  // --- Theme switching ---
  function setTheme(theme) {
    currentTheme = theme;
    isDark = (theme === 'dark');
    $$('#themeToggle .segmented__btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.theme === theme);
    });
    pinterestCard.classList.toggle('is-dark', isDark);
    previewStage.classList.toggle('is-dark', isDark);
    previewModeLabel.textContent = (isDark ? 'dark' : 'light') + '-preview.png';
  }

  // --- Image upload handlers ---
  function handleImageUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedImageData = e.target.result;
      imagePreviewThumb.src = uploadedImageData;
      imagePreviewRow.hidden = false;
      dropzone.querySelector('p').textContent = 'Image uploaded ✓';
      updatePreview();
    };
    reader.readAsDataURL(file);
  }

  function handleAvatarUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedAvatarData = e.target.result;
      updatePreview();
    };
    reader.readAsDataURL(file);
  }

  // --- Reset ---
  function resetAll() {
    fieldBoard.value = '';
    fieldTitle.value = '';
    fieldDesc.value = '';
    fieldSaves.value = '';
    fieldComments.value = '';

    uploadedImageData = null;
    uploadedAvatarData = null;
    imagePreviewRow.hidden = true;
    imagePreviewThumb.src = '';
    dropzone.querySelector('p').textContent = 'Click or drop an image here';
    pinAvatar.style.backgroundImage = '';

    setTheme('light');
    try { localStorage.removeItem('pinterest-pin-draft'); } catch(e) {}
    updatePreview();
  }

  // --- Save/Load draft ---
  function saveDraft() {
    try {
      const data = {
        board: fieldBoard.value,
        title: fieldTitle.value,
        desc: fieldDesc.value,
        saves: fieldSaves.value,
        comments: fieldComments.value,
        theme: currentTheme
      };
      localStorage.setItem('pinterest-pin-draft', JSON.stringify(data));
    } catch(e) {}
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem('pinterest-pin-draft');
      if (!raw) return;
      const data = JSON.parse(raw);
      fieldBoard.value = data.board || '';
      fieldTitle.value = data.title || '';
      fieldDesc.value = data.desc || '';
      fieldSaves.value = data.saves || '';
      fieldComments.value = data.comments || '';
      if (data.theme) setTheme(data.theme);
      updatePreview();
    } catch(e) {}
  }

  // --- Download preview ---
  async function downloadPreview() {
    const card = pinterestCard;
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
      link.download = 'pinterest-pin-' + (isDark ? 'dark' : 'light') + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch(err) {
      console.warn('Download failed:', err);
      alert('Could not generate preview image. Please try again or use screenshot.');
    }
  }

  // --- Event listeners ---

  // Input fields
  [fieldBoard, fieldTitle, fieldDesc, fieldSaves, fieldComments].forEach(el => {
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

  // Dropzone for image
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
    uploadedImageData = null;
    imagePreviewRow.hidden = true;
    imagePreviewThumb.src = '';
    dropzone.querySelector('p').textContent = 'Click or drop an image here';
    updatePreview();
    saveDraft();
  });

  // Avatar upload
  avatarUploadBtn.addEventListener('click', function() { avatarInput.click(); });
  avatarInput.addEventListener('change', function() {
    if (this.files.length > 0) handleAvatarUpload(this.files[0]);
    this.value = '';
  });
  avatarRemoveBtn.addEventListener('click', function() {
    uploadedAvatarData = null;
    pinAvatar.style.backgroundImage = '';
    updatePreview();
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
  if (!localStorage.getItem('pinterest-pin-draft')) {
    // Set defaults
    fieldBoard.value = 'Design Inspiration';
    fieldTitle.value = '10 Stunning Minimalist Logo Designs';
    fieldDesc.value = 'A curated collection of minimalist logo designs that balance simplicity and impact. Perfect for branding inspiration.';
    fieldSaves.value = '128';
    fieldComments.value = '42';
    setTheme('light');
    updatePreview();
  }

  console.log('Pinterest Pin Preview Tool initialized.');
});
