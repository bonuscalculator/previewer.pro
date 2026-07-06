// =========================================================
// THREADS-POST.JS — Threads Post Preview Tool
// =========================================================

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // --- DOM refs ---
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // Form fields
  const fieldName = $('#fieldName');
  const fieldHandle = $('#fieldHandle');
  const fieldTime = $('#fieldTime');
  const fieldText = $('#fieldText');
  const fieldReplies = $('#fieldReplies');
  const fieldReposts = $('#fieldReposts');
  const fieldLikes = $('#fieldLikes');
  const fieldLinkUrl = $('#fieldLinkUrl');
  const fieldLinkTitle = $('#fieldLinkTitle');

  // Preview elements
  const threadsCard = $('#threadsCard');
  const threadsAvatar = $('#threadsAvatar');
  const threadsName = $('#threadsName');
  const threadsHandle = $('#threadsHandle');
  const threadsTime = $('#threadsTime');
  const threadsText = $('#threadsText');
  const threadsMediaWrap = $('#threadsMediaWrap');
  const threadsImage = $('#threadsImage');
  const threadsLinkWrap = $('#threadsLinkWrap');
  const threadsLinkImg = $('#threadsLinkImg');
  const threadsLinkTitle = $('#threadsLinkTitle');
  const threadsLinkDomain = $('#threadsLinkDomain');
  const threadsReplies = $('#threadsReplies');
  const threadsReposts = $('#threadsReposts');
  const threadsLikes = $('#threadsLikes');

  // UI controls
  const charRing = $('#charRing');
  const charCount = $('#charCount');
  const typeToggle = $('#typeToggle');
  const themeToggle = $('#themeToggle');
  const previewStage = $('#previewStage');
  const previewModeLabel = $('#previewModeLabel');

  const dropzone = $('#dropzone');
  const imageInput = $('#imageInput');
  const imagePreviewRow = $('#imagePreviewRow');
  const imagePreviewThumb = $('#imagePreviewThumb');
  const imageRemoveBtn = $('#imageRemoveBtn');

  const linkDropzone = $('#linkDropzone');
  const linkImageInput = $('#linkImageInput');
  const linkImagePreviewRow = $('#linkImagePreviewRow');
  const linkImagePreviewThumb = $('#linkImagePreviewThumb');
  const linkImageRemoveBtn = $('#linkImageRemoveBtn');

  const avatarInput = $('#avatarInput');
  const avatarUploadBtn = $('#avatarUploadBtn');
  const avatarRemoveBtn = $('#avatarRemoveBtn');

  const resetBtn = $('#resetBtn');
  const downloadBtn = $('#downloadBtn');

  const imageField = $('#imageField');
  const linkField = $('#linkField');

  // --- State ---
  let currentType = 'text'; // 'text' | 'image' | 'link'
  let currentTheme = 'light';
  let uploadedImageData = null;
  let uploadedLinkImageData = null;
  let uploadedAvatarData = null;
  let isDark = false;

  // --- Update preview ---
  function updatePreview() {
    // Name
    const name = fieldName.value.trim() || 'Your Name';
    threadsName.textContent = name;

    // Handle
    const handle = fieldHandle.value.trim() || 'yourhandle';
    threadsHandle.textContent = '@' + handle;

    // Time
    const time = fieldTime.value.trim() || '2h';
    threadsTime.textContent = time;

    // Text
    const text = fieldText.value.trim() || 'Sharing some thoughts on the future of social media…';
    threadsText.textContent = text;

    // Stats
    threadsReplies.textContent = fieldReplies.value || '0';
    threadsReposts.textContent = fieldReposts.value || '0';
    threadsLikes.textContent = fieldLikes.value || '0';

    // Avatar
    if (uploadedAvatarData) {
      threadsAvatar.style.backgroundImage = 'url(' + uploadedAvatarData + ')';
      threadsAvatar.textContent = '';
    } else {
      threadsAvatar.style.backgroundImage = '';
      threadsAvatar.textContent = name.charAt(0).toUpperCase() || 'YB';
    }

    // Post type sections
    threadsMediaWrap.hidden = true;
    threadsLinkWrap.hidden = true;

    if (currentType === 'image' && uploadedImageData) {
      threadsImage.src = uploadedImageData;
      threadsMediaWrap.hidden = false;
    } else if (currentType === 'link') {
      const url = fieldLinkUrl.value.trim() || 'https://example.com';
      const title = fieldLinkTitle.value.trim() || 'Page title';
      const domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      threadsLinkTitle.textContent = title;
      threadsLinkDomain.textContent = domain;
      if (uploadedLinkImageData) {
        threadsLinkImg.style.backgroundImage = 'url(' + uploadedLinkImageData + ')';
      } else {
        threadsLinkImg.style.backgroundImage = 'repeating-linear-gradient(135deg,#F2F2F2,#F2F2F2 8px,#E5E5E5 8px,#E5E5E5 16px)';
      }
      threadsLinkWrap.hidden = false;
    }

    // Character ring (max 500 chars)
    const maxChars = 500;
    const currentLength = fieldText.value.length;
    const remaining = maxChars - currentLength;
    const pct = Math.min(currentLength / maxChars, 1);
    const circumference = 94.2;
    const offset = circumference * (1 - pct);
    charRing.style.strokeDashoffset = offset;

    if (remaining < 0) {
      charRing.style.stroke = '#E5484D';
      charCount.textContent = 'Over limit by ' + Math.abs(remaining) + ' chars';
      charCount.className = 'char-count mono is-over';
    } else if (remaining < 20) {
      charRing.style.stroke = '#C77A1F';
      charCount.textContent = remaining + ' characters left';
      charCount.className = 'char-count mono is-warn';
    } else {
      charRing.style.stroke = '#1E1E1E';
      charCount.textContent = remaining + ' characters left';
      charCount.className = 'char-count mono';
    }
  }

  // --- Post type switching ---
  function setPostType(type) {
    currentType = type;
    $$('#typeToggle .segmented__btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.type === type);
    });
    imageField.hidden = (type !== 'image');
    linkField.hidden = (type !== 'link');
    updatePreview();
  }

  // --- Theme switching ---
  function setTheme(theme) {
    currentTheme = theme;
    isDark = (theme === 'dark');
    $$('#themeToggle .segmented__btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.theme === theme);
    });
    threadsCard.classList.toggle('is-dark', isDark);
    previewStage.classList.toggle('is-dark', isDark);
    previewModeLabel.textContent = (isDark ? 'dark' : 'light') + '-preview.png';
  }

  // --- Image upload handlers ---
  function handleImageUpload(file, target) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const data = e.target.result;
      if (target === 'post') {
        uploadedImageData = data;
        imagePreviewThumb.src = data;
        imagePreviewRow.hidden = false;
        dropzone.querySelector('p').textContent = 'Image uploaded ✓';
      } else if (target === 'link') {
        uploadedLinkImageData = data;
        linkImagePreviewThumb.src = data;
        linkImagePreviewRow.hidden = false;
        linkDropzone.querySelector('p').textContent = 'Link image uploaded ✓';
      }
      updatePreview();
    };
    reader.readAsDataURL(file);
  }

  // --- Avatar upload ---
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
    fieldName.value = '';
    fieldHandle.value = '';
    fieldTime.value = '';
    fieldText.value = '';
    fieldReplies.value = '';
    fieldReposts.value = '';
    fieldLikes.value = '';
    fieldLinkUrl.value = '';
    fieldLinkTitle.value = '';

    uploadedImageData = null;
    uploadedLinkImageData = null;
    uploadedAvatarData = null;
    imagePreviewRow.hidden = true;
    imagePreviewThumb.src = '';
    dropzone.querySelector('p').textContent = 'Click or drop an image here';
    linkImagePreviewRow.hidden = true;
    linkImagePreviewThumb.src = '';
    linkDropzone.querySelector('p').textContent = 'Click or drop an image for the link card';
    threadsAvatar.style.backgroundImage = '';

    setPostType('text');
    setTheme('light');
    try { localStorage.removeItem('threads-post-draft'); } catch(e) {}
    updatePreview();
  }

  // --- Save/Load draft ---
  function saveDraft() {
    try {
      const data = {
        name: fieldName.value,
        handle: fieldHandle.value,
        time: fieldTime.value,
        text: fieldText.value,
        replies: fieldReplies.value,
        reposts: fieldReposts.value,
        likes: fieldLikes.value,
        linkUrl: fieldLinkUrl.value,
        linkTitle: fieldLinkTitle.value,
        type: currentType,
        theme: currentTheme
      };
      localStorage.setItem('threads-post-draft', JSON.stringify(data));
    } catch(e) {}
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem('threads-post-draft');
      if (!raw) return;
      const data = JSON.parse(raw);
      fieldName.value = data.name || '';
      fieldHandle.value = data.handle || '';
      fieldTime.value = data.time || '';
      fieldText.value = data.text || '';
      fieldReplies.value = data.replies || '';
      fieldReposts.value = data.reposts || '';
      fieldLikes.value = data.likes || '';
      fieldLinkUrl.value = data.linkUrl || '';
      fieldLinkTitle.value = data.linkTitle || '';
      if (data.type) setPostType(data.type);
      if (data.theme) setTheme(data.theme);
      updatePreview();
    } catch(e) {}
  }

  // --- Download preview ---
  async function downloadPreview() {
    const card = threadsCard;
    if (!card) return;
    try {
      const canvas = await html2canvas(card, {
        scale: 2,
        backgroundColor: isDark ? '#0A0A0A' : '#ffffff',
        allowTaint: false,
        useCORS: true,
        logging: false,
        width: card.scrollWidth,
        height: card.scrollHeight
      });
      const link = document.createElement('a');
      link.download = 'threads-preview-' + (isDark ? 'dark' : 'light') + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch(err) {
      console.warn('Download failed:', err);
      alert('Could not generate preview image. Please try again or use screenshot.');
    }
  }

  // --- Event listeners ---

  // Input fields
  [fieldName, fieldHandle, fieldTime, fieldText, fieldReplies,
   fieldReposts, fieldLikes, fieldLinkUrl, fieldLinkTitle].forEach(el => {
    el.addEventListener('input', function() {
      updatePreview();
      saveDraft();
    });
  });

  // Post type toggle
  $$('#typeToggle .segmented__btn').forEach(btn => {
    btn.addEventListener('click', function() {
      setPostType(this.dataset.type);
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

  // Dropzone for post image
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
      handleImageUpload(files[0], 'post');
    }
  });
  imageInput.addEventListener('change', function() {
    if (this.files.length > 0) handleImageUpload(this.files[0], 'post');
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

  // Link image dropzone
  linkDropzone.addEventListener('click', function(e) {
    if (e.target.closest('p')) linkImageInput.click();
  });
  linkDropzone.addEventListener('dragover', function(e) {
    e.preventDefault(); this.classList.add('is-dragover');
  });
  linkDropzone.addEventListener('dragleave', function(e) {
    e.preventDefault(); this.classList.remove('is-dragover');
  });
  linkDropzone.addEventListener('drop', function(e) {
    e.preventDefault(); this.classList.remove('is-dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleImageUpload(files[0], 'link');
    }
  });
  linkImageInput.addEventListener('change', function() {
    if (this.files.length > 0) handleImageUpload(this.files[0], 'link');
    this.value = '';
  });
  linkImageRemoveBtn.addEventListener('click', function() {
    uploadedLinkImageData = null;
    linkImagePreviewRow.hidden = true;
    linkImagePreviewThumb.src = '';
    linkDropzone.querySelector('p').textContent = 'Click or drop an image for the link card';
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
    threadsAvatar.style.backgroundImage = '';
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
  if (!localStorage.getItem('threads-post-draft')) {
    // Set defaults
    fieldName.value = 'Jane Doe';
    fieldHandle.value = 'janedoe';
    fieldTime.value = '2h';
    fieldText.value = 'Sharing some thoughts on the future of social media…\n\nThreads is evolving fast, and I\'m curious how it will differentiate from other platforms. The 500-character limit forces clarity.';
    fieldReplies.value = '42';
    fieldReposts.value = '18';
    fieldLikes.value = '128';
    fieldLinkUrl.value = 'https://example.com';
    fieldLinkTitle.value = 'The Future of Social Media';
    setPostType('text');
    setTheme('light');
    updatePreview();
  }

  console.log('Threads Post Preview Tool initialized.');
});
