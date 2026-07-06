// insta-post.js — Instagram Post Preview app logic
document.addEventListener('DOMContentLoaded', function () {

  const MAX_CHARS = 2200;
  const FOLD_LENGTH = 125;
  const RING_RADIUS = 15;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
  const STORAGE_KEY = 'previewer-insta-post-draft';

  // --- elements ---
  const fieldUsername = document.getElementById('fieldUsername');
  const fieldLocation = document.getElementById('fieldLocation');
  const fieldVerified = document.getElementById('fieldVerified');
  const fieldCaption = document.getElementById('fieldCaption');
  const fieldLikes = document.getElementById('fieldLikes');
  const fieldComments = document.getElementById('fieldComments');

  const avatarUploadBtn = document.getElementById('avatarUploadBtn');
  const avatarRemoveBtn = document.getElementById('avatarRemoveBtn');
  const avatarInput = document.getElementById('avatarInput');

  const dropzone = document.getElementById('dropzone');
  const dropzoneLabel = document.getElementById('dropzoneLabel');
  const imageInput = document.getElementById('imageInput');
  const imagePreviewRow = document.getElementById('imagePreviewRow');
  const imagePreviewThumb = document.getElementById('imagePreviewThumb');
  const imageRemoveBtn = document.getElementById('imageRemoveBtn');

  const ratioToggle = document.getElementById('ratioToggle');
  const themeToggle = document.getElementById('themeToggle');
  const previewStage = document.getElementById('previewStage');
  const previewModeLabel = document.getElementById('previewModeLabel');

  const charRing = document.getElementById('charRing');
  const charCount = document.getElementById('charCount');

  const resetBtn = document.getElementById('resetBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  const instaCard = document.getElementById('instaCard');
  const instaAvatar = document.getElementById('instaAvatar');
  const instaUsername = document.getElementById('instaUsername');
  const instaLocation = document.getElementById('instaLocation');
  const instaBadge = document.getElementById('instaBadge');
  const instaMedia = document.getElementById('instaMedia');
  const instaImage = document.getElementById('instaImage');
  const instaPlaceholder = document.getElementById('instaPlaceholder');
  const instaLikes = document.getElementById('instaLikes');
  const instaCaption = document.getElementById('instaCaption');
  const instaCaptionUser = document.getElementById('instaCaptionUser');
  const instaCaptionText = document.getElementById('instaCaptionText');
  const instaCommentsLine = document.getElementById('instaCommentsLine');

  if (!fieldCaption || !instaCard) return; // safety guard

  if (charRing) {
    charRing.style.strokeDasharray = String(RING_CIRCUMFERENCE);
  }

  const DEFAULTS = {
    username: 'yourbrand',
    location: '',
    verified: false,
    caption: 'Launching our summer collection this Friday ☀️ Tap the link in bio to get early access before it sells out. #summer #newdrop #earlyaccess',
    likes: 1204,
    comments: 38,
    ratio: 'square',
    theme: 'light'
  };

  let captionExpanded = false;

  /* ---------------------------------------------------------
     Draft persistence (text fields only — never images)
  --------------------------------------------------------- */
  function saveDraft() {
    try {
      const draft = {
        username: fieldUsername.value,
        location: fieldLocation.value,
        verified: fieldVerified.checked,
        caption: fieldCaption.value,
        likes: fieldLikes.value,
        comments: fieldComments.value,
        ratio: instaMedia.dataset.ratio,
        theme: previewStage.classList.contains('is-dark') ? 'dark' : 'light'
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch (e) { /* fail silently */ }
  }

  function loadDraft() {
    let draft = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) draft = JSON.parse(raw);
    } catch (e) { draft = null; }
    return Object.assign({}, DEFAULTS, draft || {});
  }

  /* ---------------------------------------------------------
     Helpers
  --------------------------------------------------------- */
  function getInitials(name) {
    if (!name) return 'YB';
    const parts = name.trim().split(/[\s._]+/).slice(0, 2);
    return parts.map(function (p) { return p.charAt(0).toUpperCase(); }).join('') || 'YB';
  }

  function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function countHashtags(text) {
    const matches = text.match(/#[^\s#]+/g);
    return matches ? matches.length : 0;
  }

  function formatNumber(n) {
    const num = parseInt(n, 10);
    if (isNaN(num) || num < 0) return '0';
    return num.toLocaleString('en-US');
  }

  /* ---------------------------------------------------------
     Rendering
  --------------------------------------------------------- */
  function renderUsername() {
    const name = fieldUsername.value.trim() || DEFAULTS.username;
    instaUsername.textContent = name;
    instaCaptionUser.textContent = name;
    if (!instaAvatar.style.backgroundImage) {
      instaAvatar.textContent = getInitials(name);
    }
  }

  function renderLocation() {
    const loc = fieldLocation.value.trim();
    if (loc) {
      instaLocation.textContent = loc;
      instaLocation.hidden = false;
    } else {
      instaLocation.hidden = true;
    }
  }

  function renderVerified() {
    instaBadge.hidden = !fieldVerified.checked;
  }

  function renderCaption() {
    const raw = fieldCaption.value || DEFAULTS.caption;
    const len = raw.length;

    if (len <= FOLD_LENGTH || captionExpanded) {
      instaCaptionText.innerHTML = escapeHTML(raw) +
        (len > FOLD_LENGTH ? ' <span class="more-toggle" id="captionToggle">less</span>' : '');
    } else {
      instaCaptionText.innerHTML = escapeHTML(raw.slice(0, FOLD_LENGTH)) +
        '&hellip; <span class="more-toggle" id="captionToggle">more</span>';
    }

    const toggle = document.getElementById('captionToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        captionExpanded = !captionExpanded;
        renderCaption();
      });
    }

    // character ring + hashtag count
    const remaining = MAX_CHARS - len;
    const ratio = Math.min(len / MAX_CHARS, 1);
    const offset = RING_CIRCUMFERENCE * (1 - ratio);
    if (charRing) {
      charRing.style.strokeDashoffset = String(offset);
      charRing.style.stroke = remaining < 0 ? 'var(--red)' : (remaining <= 100 ? 'var(--amber)' : 'var(--blue)');
    }
    if (charCount) {
      const hashtags = countHashtags(raw);
      charCount.textContent = (remaining >= 0
        ? remaining.toLocaleString('en-US') + ' characters left'
        : Math.abs(remaining).toLocaleString('en-US') + ' characters over the limit')
        + ' · ' + hashtags + ' hashtag' + (hashtags === 1 ? '' : 's');
      charCount.classList.toggle('is-warn', remaining >= 0 && remaining <= 100);
      charCount.classList.toggle('is-over', remaining < 0);
    }
  }

  function renderLikes() {
    const val = fieldLikes.value !== '' ? fieldLikes.value : DEFAULTS.likes;
    instaLikes.textContent = formatNumber(val) + ' likes';
  }

  function renderComments() {
    const val = fieldComments.value !== '' ? fieldComments.value : DEFAULTS.comments;
    instaCommentsLine.textContent = 'View all ' + formatNumber(val) + ' comments';
  }

  function setRatio(ratio) {
    instaMedia.dataset.ratio = ratio;
    if (ratioToggle) {
      ratioToggle.querySelectorAll('.segmented__btn').forEach(function (btn) {
        btn.classList.toggle('is-active', btn.dataset.ratio === ratio);
      });
    }
  }

  function setTheme(theme) {
    const isDark = theme === 'dark';
    previewStage.classList.toggle('is-dark', isDark);
    instaCard.classList.toggle('is-dark', isDark);
    if (previewModeLabel) previewModeLabel.textContent = isDark ? 'dark-preview.png' : 'light-preview.png';
    if (themeToggle) {
      themeToggle.querySelectorAll('.segmented__btn').forEach(function (btn) {
        btn.classList.toggle('is-active', btn.dataset.theme === theme);
      });
    }
  }

  /* ---------------------------------------------------------
     Wire up inputs
  --------------------------------------------------------- */
  fieldUsername.addEventListener('input', function () { renderUsername(); saveDraft(); });
  fieldLocation.addEventListener('input', function () { renderLocation(); saveDraft(); });
  fieldVerified.addEventListener('change', function () { renderVerified(); saveDraft(); });
  fieldCaption.addEventListener('input', function () { captionExpanded = false; renderCaption(); saveDraft(); });
  fieldLikes.addEventListener('input', function () { renderLikes(); saveDraft(); });
  fieldComments.addEventListener('input', function () { renderComments(); saveDraft(); });

  if (ratioToggle) {
    ratioToggle.querySelectorAll('.segmented__btn').forEach(function (btn) {
      btn.addEventListener('click', function () { setRatio(btn.dataset.ratio); saveDraft(); });
    });
  }
  if (themeToggle) {
    themeToggle.querySelectorAll('.segmented__btn').forEach(function (btn) {
      btn.addEventListener('click', function () { setTheme(btn.dataset.theme); saveDraft(); });
    });
  }

  /* ---------------------------------------------------------
     Avatar upload
  --------------------------------------------------------- */
  if (avatarUploadBtn && avatarInput) {
    avatarUploadBtn.addEventListener('click', function () { avatarInput.click(); });
    avatarInput.addEventListener('change', function () {
      const file = avatarInput.files && avatarInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        instaAvatar.style.backgroundImage = 'url(' + e.target.result + ')';
        instaAvatar.textContent = '';
      };
      reader.readAsDataURL(file);
    });
  }
  if (avatarRemoveBtn) {
    avatarRemoveBtn.addEventListener('click', function () {
      instaAvatar.style.backgroundImage = '';
      avatarInput.value = '';
      renderUsername();
    });
  }

  /* ---------------------------------------------------------
     Photo upload (click + drag/drop)
  --------------------------------------------------------- */
  function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      instaImage.src = e.target.result;
      instaImage.hidden = false;
      instaPlaceholder.hidden = true;
      imagePreviewThumb.src = e.target.result;
      imagePreviewRow.hidden = false;
      dropzoneLabel.textContent = file.name;
    };
    reader.readAsDataURL(file);
  }

  if (dropzone && imageInput) {
    dropzone.addEventListener('click', function () { imageInput.click(); });
    imageInput.addEventListener('change', function () {
      handleImageFile(imageInput.files && imageInput.files[0]);
    });
    ['dragenter', 'dragover'].forEach(function (evt) {
      dropzone.addEventListener(evt, function (e) { e.preventDefault(); dropzone.classList.add('is-dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (evt) {
      dropzone.addEventListener(evt, function (e) { e.preventDefault(); dropzone.classList.remove('is-dragover'); });
    });
    dropzone.addEventListener('drop', function (e) {
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      handleImageFile(file);
    });
  }

  if (imageRemoveBtn) {
    imageRemoveBtn.addEventListener('click', function () {
      instaImage.src = '';
      instaImage.hidden = true;
      instaPlaceholder.hidden = false;
      imagePreviewRow.hidden = true;
      imageInput.value = '';
      dropzoneLabel.textContent = 'Click or drop a photo here';
    });
  }

  /* ---------------------------------------------------------
     Reset
  --------------------------------------------------------- */
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      fieldUsername.value = '';
      fieldLocation.value = '';
      fieldVerified.checked = false;
      fieldCaption.value = DEFAULTS.caption;
      fieldLikes.value = '';
      fieldComments.value = '';
      captionExpanded = false;

      instaAvatar.style.backgroundImage = '';
      avatarInput.value = '';
      instaImage.src = '';
      instaImage.hidden = true;
      instaPlaceholder.hidden = false;
      imagePreviewRow.hidden = true;
      imageInput.value = '';
      dropzoneLabel.textContent = 'Click or drop a photo here';

      setRatio('square');
      setTheme('light');
      renderUsername();
      renderLocation();
      renderVerified();
      renderCaption();
      renderLikes();
      renderComments();

      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    });
  }

  /* ---------------------------------------------------------
     Download preview as PNG (html2canvas)
  --------------------------------------------------------- */
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function () {
      if (typeof html2canvas === 'undefined') {
        downloadBtn.textContent = 'Still loading…';
        setTimeout(function () { downloadBtn.textContent = 'Download preview'; }, 1500);
        return;
      }
      const isDark = previewStage.classList.contains('is-dark');
      downloadBtn.disabled = true;
      const originalLabel = downloadBtn.textContent;
      downloadBtn.textContent = 'Rendering…';

      html2canvas(previewStage, {
        backgroundColor: isDark ? '#000000' : '#FAFAF9',
        scale: 2,
        useCORS: true
      }).then(function (canvas) {
        const link = document.createElement('a');
        link.download = 'instagram-post-preview.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }).catch(function () {
        /* download best-effort */
      }).finally(function () {
        downloadBtn.disabled = false;
        downloadBtn.textContent = originalLabel;
      });
    });
  }

  /* ---------------------------------------------------------
     Init from saved draft
  --------------------------------------------------------- */
  const draft = loadDraft();
  fieldUsername.value = draft.username === DEFAULTS.username ? '' : draft.username;
  fieldLocation.value = draft.location || '';
  fieldVerified.checked = !!draft.verified;
  fieldCaption.value = draft.caption || DEFAULTS.caption;
  fieldLikes.value = (draft.likes && draft.likes != DEFAULTS.likes) ? draft.likes : '';
  fieldComments.value = (draft.comments && draft.comments != DEFAULTS.comments) ? draft.comments : '';
  setRatio(draft.ratio || 'square');
  setTheme(draft.theme === 'dark' ? 'dark' : 'light');

  renderUsername();
  renderLocation();
  renderVerified();
  renderCaption();
  renderLikes();
  renderComments();
});
