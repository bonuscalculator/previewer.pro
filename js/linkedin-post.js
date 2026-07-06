// =========================================================
// LINKEDIN-POST.JS — LinkedIn Post Preview Tool
// =========================================================

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // --- DOM refs ---
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // Form fields
  const fieldName = $('#fieldName');
  const fieldHeadline = $('#fieldHeadline');
  const fieldTime = $('#fieldTime');
  const fieldText = $('#fieldText');
  const fieldLikes = $('#fieldLikes');
  const fieldComments = $('#fieldComments');
  const fieldReposts = $('#fieldReposts');
  const fieldLinkUrl = $('#fieldLinkUrl');
  const fieldLinkTitle = $('#fieldLinkTitle');
  const fieldLinkDesc = $('#fieldLinkDesc');

  // Preview elements
  const linkedinCard = $('#linkedinCard');
  const linkedinAvatar = $('#linkedinAvatar');
  const linkedinName = $('#linkedinName');
  const linkedinHeadline = $('#linkedinHeadline');
  const linkedinTime = $('#linkedinTime');
  const linkedinText = $('#linkedinText');
  const linkedinMediaWrap = $('#linkedinMediaWrap');
  const linkedinImage = $('#linkedinImage');
  const linkedinLinkWrap = $('#linkedinLinkWrap');
  const linkedinLinkImg = $('#linkedinLinkImg');
  const linkedinLinkTitle = $('#linkedinLinkTitle');
  const linkedinLinkDesc = $('#linkedinLinkDesc');
  const linkedinLinkDomain = $('#linkedinLinkDomain');
  const linkedinLikes = $('#linkedinLikes');
  const linkedinComments = $('#linkedinComments');
  const linkedinReposts = $('#linkedinReposts');

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
    linkedinName.textContent = name;

    // Headline
    const headline = fieldHeadline.value.trim() || 'Product Manager at Company';
    linkedinHeadline.textContent = headline;

    // Time
    const time = fieldTime.value.trim() || '2h';
    linkedinTime.textContent = time;

    // Text
    const text = fieldText.value.trim() || 'Sharing some thoughts on the future of product-led growth…';
    linkedinText.textContent = text;

    // Stats
    linkedinLikes.textContent = fieldLikes.value || '0';
    linkedinComments.textContent = fieldComments.value || '0';
    linkedinReposts.textContent = fieldReposts.value || '0';

    // Avatar
    if (uploadedAvatarData) {
      linkedinAvatar.style.backgroundImage = 'url(' + uploadedAvatarData + ')';
      linkedinAvatar.textContent = '';
    } else {
      linkedinAvatar.style.backgroundImage = '';
      linkedinAvatar.textContent = name.charAt(0).toUpperCase() || 'YB';
    }

    // Post type sections
    linkedinMediaWrap.hidden = true;
    linkedinLinkWrap.hidden = true;

    if (currentType === 'image' && uploadedImageData) {
      linkedinImage.src = uploadedImageData;
      linkedinMediaWrap.hidden = false;
    } else if (currentType === 'link') {
      const url = fieldLinkUrl.value.trim() || 'https://example.com';
      const title = fieldLinkTitle.value.trim() || 'Page title';
      const desc = fieldLinkDesc.value.trim() || 'A short description of the link';
      const domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      linkedinLinkTitle.textContent = title;
      linkedinLinkDesc.textContent = desc;
      linkedinLinkDomain.textContent = domain;
      if (uploadedLinkImageData) {
        linkedinLinkImg.style.backgroundImage = 'url(' + uploadedLinkImageData + ')';
      } else {
        linkedinLinkImg.style.backgroundImage = 'repeating-linear-gradient(135deg,#F2F4F7,#F2F4F7 8px,#E6EAEF 8px,#E6EAEF 16px)';
      }
      linkedinLinkWrap.hidden = false;
    }

    // Character ring (max 3000 chars)
    const maxChars = 3000;
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
    } else if (remaining < 100) {
      charRing.style.stroke = '#C77A1F';
      charCount.textContent = remaining + ' characters left';
      charCount.className = 'char-count mono is-warn';
    } else {
      charRing.style.stroke = '#0A66C2';
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
    linkedinCard.classList.toggle('is-dark', isDark);
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
    fieldHeadline.value = '';
    fieldTime.value = '';
    fieldText.value = '';
    fieldLikes.value = '';
    fieldComments.value = '';
    fieldReposts.value = '';
    fieldLinkUrl.value = '';
    fieldLinkTitle.value = '';
    fieldLinkDesc.value = '';

    uploadedImageData = null;
    uploadedLinkImageData = null;
    uploadedAvatarData = null;
    imagePreviewRow.hidden = true;
    imagePreviewThumb.src = '';
    dropzone.querySelector('p').textContent = 'Click or drop an image here';
    linkImagePreviewRow.hidden = true;
    linkImagePreviewThumb.src = '';
    linkDropzone.querySelector('p').textContent = 'Click or drop an image for the link card';
    linkedinAvatar.style.backgroundImage = '';

    setPostType('text');
    setTheme('light');
    try { localStorage.removeItem('linkedin-post-draft'); } catch(e) {}
    updatePreview();
  }

  // --- Save/Load draft ---
  function saveDraft() {
    try {
      const data = {
        name: fieldName.value,
        headline: fieldHeadline.value,
        time: fieldTime.value,
        text: fieldText.value,
        likes: fieldLikes.value,
        comments: fieldComments.value,
        reposts: fieldReposts.value,
        linkUrl: fieldLinkUrl.value,
        linkTitle: fieldLinkTitle.value,
        linkDesc: fieldLinkDesc.value,
        type: currentType,
        theme: currentTheme
      };
      localStorage.setItem('linkedin-post-draft', JSON.stringify(data));
    } catch(e) {}
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem('linkedin-post-draft');
      if (!raw) return;
      const data = JSON.parse(raw);
      fieldName.value = data.name || '';
      fieldHeadline.value = data.headline || '';
      fieldTime.value = data.time || '';
      fieldText.value = data.text || '';
      fieldLikes.value = data.likes || '';
      fieldComments.value = data.comments || '';
      fieldReposts.value = data.reposts || '';
      fieldLinkUrl.value = data.linkUrl || '';
      fieldLinkTitle.value = data.linkTitle || '';
      fieldLinkDesc.value = data.linkDesc || '';
      if (data.type) setPostType(data.type);
      if (data.theme) setTheme(data.theme);
      updatePreview();
    } catch(e) {}
  }

  // --- Download preview ---
  async function downloadPreview() {
    const card = linkedinCard;
    if (!card) return;
    try {
      const canvas = await html2canvas(card, {
        scale: 2,
        backgroundColor: isDark ? '#1D2226' : '#ffffff',
        allowTaint: false,
        useCORS: true,
        logging: false,
        width: card.scrollWidth,
        height: card.scrollHeight
      });
      const link = document.createElement('a');
      link.download = 'linkedin-preview-' + (isDark ? 'dark' : 'light') + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch(err) {
      console.warn('Download failed:', err);
      alert('Could not generate preview image. Please try again or use screenshot.');
    }
  }

  // --- Event listeners ---

  // Input fields
  [fieldName, fieldHeadline, fieldTime, fieldText, fieldLikes,
   fieldComments, fieldReposts, fieldLinkUrl, fieldLinkTitle, fieldLinkDesc].forEach(el => {
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
    linkedinAvatar.style.backgroundImage = '';
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
  if (!localStorage.getItem('linkedin-post-draft')) {
    // Set defaults
    fieldName.value = 'Jane Doe';
    fieldHeadline.value = 'Product Manager at Acme Corp';
    fieldTime.value = '2h';
    fieldText.value = 'Sharing some thoughts on the future of product-led growth…\n\nWe\'ve seen a shift from feature-heavy roadmaps to outcome-driven experiments. The best PMs I know spend more time defining the problem than designing the solution.';
    fieldLikes.value = '128';
    fieldComments.value = '42';
    fieldReposts.value = '18';
    fieldLinkUrl.value = 'https://example.com';
    fieldLinkTitle.value = 'The Future of Product-Led Growth';
    fieldLinkDesc.value = 'A deep dive into how leading companies are shifting their product strategies.';
    setPostType('text');
    setTheme('light');
    updatePreview();
  }

  console.log('LinkedIn Post Preview Tool initialized.');
});
