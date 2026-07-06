// =========================================================
// REDDIT-POST.JS — Reddit Post Preview Tool
// =========================================================

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // --- DOM refs ---
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // Form fields
  const fieldSubreddit = $('#fieldSubreddit');
  const fieldUsername = $('#fieldUsername');
  const fieldFlair = $('#fieldFlair');
  const fieldNsfw = $('#fieldNsfw');
  const fieldSpoiler = $('#fieldSpoiler');
  const fieldTitle = $('#fieldTitle');
  const fieldBody = $('#fieldBody');
  const fieldScore = $('#fieldScore');
  const fieldUpvoted = $('#fieldUpvoted');
  const fieldComments = $('#fieldComments');
  const fieldLinkUrl = $('#fieldLinkUrl');
  const fieldLinkTitle = $('#fieldLinkTitle');

  // Preview elements
  const redditCard = $('#redditCard');
  const redditAvatar = $('#redditAvatar');
  const redditSub = $('#redditSub');
  const redditUsername = $('#redditUsername');
  const redditFlair = $('#redditFlair');
  const redditNsfw = $('#redditNsfw');
  const redditSpoiler = $('#redditSpoiler');
  const redditTitle = $('#redditTitle');
  const redditBodyText = $('#redditBodyText');
  const redditBody = $('#redditBody');
  const redditMediaWrap = $('#redditMediaWrap');
  const redditImage = $('#redditImage');
  const redditLinkWrap = $('#redditLinkWrap');
  const redditLinkTitle = $('#redditLinkTitle');
  const redditLinkDomain = $('#redditLinkDomain');
  const redditScore = $('#redditScore');
  const redditUpvoted = $('#redditUpvoted');
  const redditComments = $('#redditComments');

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
  const avatarInput = $('#avatarInput');
  const avatarUploadBtn = $('#avatarUploadBtn');
  const avatarRemoveBtn = $('#avatarRemoveBtn');
  const resetBtn = $('#resetBtn');
  const downloadBtn = $('#downloadBtn');
  const bodyField = $('#bodyField');
  const imageField = $('#imageField');
  const linkField = $('#linkField');

  // --- State ---
  let currentType = 'text'; // 'text' | 'image' | 'link'
  let currentTheme = 'light';
  let uploadedImageData = null;
  let uploadedAvatarData = null;
  let isDark = false;

  // --- Helper: format score (e.g., 1204 -> 1.2k) ---
  function formatScore(num) {
    if (!num) return '0';
    const n = parseInt(num, 10);
    if (isNaN(n)) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
  }

  // --- Update preview ---
  function updatePreview() {
    // Subreddit
    const sub = fieldSubreddit.value.trim() || 'marketing';
    redditSub.textContent = 'r/' + sub;

    // Username
    const user = fieldUsername.value.trim() || 'yourname';
    redditUsername.textContent = 'u/' + user;

    // Flair
    const flair = fieldFlair.value.trim();
    if (flair) {
      redditFlair.textContent = flair;
      redditFlair.hidden = false;
    } else {
      redditFlair.hidden = true;
    }

    // NSFW
    redditNsfw.hidden = !fieldNsfw.checked;

    // Spoiler
    redditSpoiler.hidden = !fieldSpoiler.checked;

    // Title
    const title = fieldTitle.value.trim() || 'What\'s the one marketing tactic that actually moved the needle for you this year?';
    redditTitle.textContent = title;

    // Body text
    const body = fieldBody.value.trim();
    if (body && currentType === 'text') {
      redditBodyText.textContent = body;
      redditBodyText.hidden = false;
    } else {
      redditBodyText.textContent = '';
      redditBodyText.hidden = true;
    }

    // Post type: show/hide appropriate sections
    redditMediaWrap.hidden = true;
    redditLinkWrap.hidden = true;
    redditBodyText.hidden = true;

    if (currentType === 'text') {
      if (body) {
        redditBodyText.textContent = body;
        redditBodyText.hidden = false;
      }
    } else if (currentType === 'image') {
      if (uploadedImageData) {
        redditImage.src = uploadedImageData;
        redditMediaWrap.hidden = false;
      }
    } else if (currentType === 'link') {
      const url = fieldLinkUrl.value.trim() || 'example.com';
      const linkTitle = fieldLinkTitle.value.trim() || 'Page title shown in the card';
      redditLinkDomain.textContent = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      redditLinkTitle.textContent = linkTitle;
      redditLinkWrap.hidden = false;
    }

    // Score
    const scoreVal = fieldScore.value;
    redditScore.textContent = scoreVal ? formatScore(scoreVal) : '0';

    // Upvoted %
    const upvotedVal = fieldUpvoted.value;
    if (upvotedVal) {
      redditUpvoted.textContent = upvotedVal + '% Upvoted';
    } else {
      redditUpvoted.textContent = '—';
    }

    // Comments
    const commentsVal = fieldComments.value;
    if (commentsVal) {
      redditComments.textContent = parseInt(commentsVal, 10) + ' Comments';
    } else {
      redditComments.textContent = '0 Comments';
    }

    // Avatar
    if (uploadedAvatarData) {
      redditAvatar.style.backgroundImage = 'url(' + uploadedAvatarData + ')';
      redditAvatar.textContent = '';
    } else {
      redditAvatar.style.backgroundImage = '';
      redditAvatar.textContent = sub.charAt(0).toUpperCase() || 'r';
    }

    // Character ring
    const maxChars = 300;
    const currentLength = fieldTitle.value.length;
    const remaining = maxChars - currentLength;
    const pct = Math.min(currentLength / maxChars, 1);

    const circumference = 94.2; // 2 * PI * 15
    const offset = circumference * (1 - pct);
    charRing.style.strokeDashoffset = offset;

    // Color
    if (remaining < 0) {
      charRing.style.stroke = '#E5484D';
      charCount.textContent = 'Over limit by ' + Math.abs(remaining) + ' chars';
      charCount.className = 'char-count mono is-over';
    } else if (remaining < 20) {
      charRing.style.stroke = '#C77A1F';
      charCount.textContent = remaining + ' characters left';
      charCount.className = 'char-count mono is-warn';
    } else {
      charRing.style.stroke = '#2F6FED';
      charCount.textContent = remaining + ' characters left';
      charCount.className = 'char-count mono';
    }
  }

  // --- Post type switching ---
  function setPostType(type) {
    currentType = type;

    // Update toggle buttons
    $$('#typeToggle .segmented__btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.type === type);
    });

    // Show/hide fields
    bodyField.hidden = (type !== 'text');
    imageField.hidden = (type !== 'image');
    linkField.hidden = (type !== 'link');

    // Reset visibility of preview sections (they'll be set in updatePreview)
    updatePreview();
  }

  // --- Theme switching ---
  function setTheme(theme) {
    currentTheme = theme;
    isDark = (theme === 'dark');

    $$('#themeToggle .segmented__btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.theme === theme);
    });

    redditCard.classList.toggle('is-dark', isDark);
    previewStage.classList.toggle('is-dark', isDark);
    previewModeLabel.textContent = (isDark ? 'dark' : 'light') + '-preview.png';
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
    fieldSubreddit.value = '';
    fieldUsername.value = '';
    fieldFlair.value = '';
    fieldNsfw.checked = false;
    fieldSpoiler.checked = false;
    fieldTitle.value = '';
    fieldBody.value = '';
    fieldScore.value = '';
    fieldUpvoted.value = '';
    fieldComments.value = '';
    fieldLinkUrl.value = '';
    fieldLinkTitle.value = '';

    uploadedImageData = null;
    uploadedAvatarData = null;
    imagePreviewRow.hidden = true;
    imagePreviewThumb.src = '';
    dropzone.querySelector('p').textContent = 'Click or drop an image here';
    redditAvatar.style.backgroundImage = '';

    // Reset to text type
    setPostType('text');
    setTheme('light');

    // Clear localStorage
    try { localStorage.removeItem('reddit-post-draft'); } catch(e) {}

    updatePreview();
  }

  // --- Save draft to localStorage ---
  function saveDraft() {
    try {
      const data = {
        subreddit: fieldSubreddit.value,
        username: fieldUsername.value,
        flair: fieldFlair.value,
        nsfw: fieldNsfw.checked,
        spoiler: fieldSpoiler.checked,
        title: fieldTitle.value,
        body: fieldBody.value,
        score: fieldScore.value,
        upvoted: fieldUpvoted.value,
        comments: fieldComments.value,
        linkUrl: fieldLinkUrl.value,
        linkTitle: fieldLinkTitle.value,
        type: currentType,
        theme: currentTheme
      };
      localStorage.setItem('reddit-post-draft', JSON.stringify(data));
    } catch(e) {}
  }

  // --- Load draft from localStorage ---
  function loadDraft() {
    try {
      const raw = localStorage.getItem('reddit-post-draft');
      if (!raw) return;
      const data = JSON.parse(raw);

      fieldSubreddit.value = data.subreddit || '';
      fieldUsername.value = data.username || '';
      fieldFlair.value = data.flair || '';
      fieldNsfw.checked = !!data.nsfw;
      fieldSpoiler.checked = !!data.spoiler;
      fieldTitle.value = data.title || '';
      fieldBody.value = data.body || '';
      fieldScore.value = data.score || '';
      fieldUpvoted.value = data.upvoted || '';
      fieldComments.value = data.comments || '';
      fieldLinkUrl.value = data.linkUrl || '';
      fieldLinkTitle.value = data.linkTitle || '';

      if (data.type) setPostType(data.type);
      if (data.theme) setTheme(data.theme);
      updatePreview();
    } catch(e) {}
  }

  // --- Download preview ---
  async function downloadPreview() {
    const card = redditCard;
    if (!card) return;

    try {
      // html2canvas is loaded from CDN
      const canvas = await html2canvas(card, {
        scale: 2,
        backgroundColor: isDark ? '#1A1A1B' : '#ffffff',
        allowTaint: false,
        useCORS: true,
        logging: false,
        width: card.scrollWidth,
        height: card.scrollHeight
      });

      const link = document.createElement('a');
      link.download = 'reddit-preview-' + (isDark ? 'dark' : 'light') + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch(err) {
      console.warn('Download failed:', err);
      alert('Could not generate preview image. Please try again or use screenshot.');
    }
  }

  // --- Event listeners ---

  // Text inputs
  [fieldSubreddit, fieldUsername, fieldFlair, fieldTitle, fieldBody,
   fieldScore, fieldUpvoted, fieldComments, fieldLinkUrl, fieldLinkTitle].forEach(el => {
    el.addEventListener('input', function() {
      updatePreview();
      saveDraft();
    });
  });

  // Checkboxes
  [fieldNsfw, fieldSpoiler].forEach(el => {
    el.addEventListener('change', function() {
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

  // Dropzone for image upload
  dropzone.addEventListener('click', function(e) {
    if (e.target.closest('p')) {
      imageInput.click();
    }
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
    if (this.files.length > 0) {
      handleImageUpload(this.files[0]);
    }
    this.value = '';
  });

  // Image remove
  imageRemoveBtn.addEventListener('click', function() {
    uploadedImageData = null;
    imagePreviewRow.hidden = true;
    imagePreviewThumb.src = '';
    dropzone.querySelector('p').textContent = 'Click or drop an image here';
    updatePreview();
    saveDraft();
  });

  // Avatar upload
  avatarUploadBtn.addEventListener('click', function() {
    avatarInput.click();
  });

  avatarInput.addEventListener('change', function() {
    if (this.files.length > 0) {
      handleAvatarUpload(this.files[0]);
    }
    this.value = '';
  });

  avatarRemoveBtn.addEventListener('click', function() {
    uploadedAvatarData = null;
    redditAvatar.style.backgroundImage = '';
    updatePreview();
    saveDraft();
  });

  // Reset
  resetBtn.addEventListener('click', resetAll);

  // Download
  downloadBtn.addEventListener('click', downloadPreview);

  // --- Init ---
  loadDraft();

  // If no draft, set defaults
  if (!localStorage.getItem('reddit-post-draft')) {
    fieldSubreddit.value = 'marketing';
    fieldUsername.value = 'yourname';
    fieldTitle.value = 'What\'s the one marketing tactic that actually moved the needle for you this year?';
    fieldScore.value = '1204';
    fieldUpvoted.value = '94';
    fieldComments.value = '86';
    fieldLinkUrl.value = 'example.com';
    fieldLinkTitle.value = 'Page title shown in the card';
    setPostType('text');
    setTheme('light');
    updatePreview();
  }

  // Auto-save on any change
  document.addEventListener('click', function() {
    saveDraft();
  });

  // Also save on blur of any input
  document.addEventListener('focusout', function(e) {
    if (e.target.closest('input, textarea')) {
      saveDraft();
    }
  });

  console.log('Reddit Post Preview Tool initialized.');
});
