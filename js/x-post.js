// x-post.js — Tweet Preview app logic
document.addEventListener('DOMContentLoaded', function () {

  const MAX_CHARS = 280;
  const RING_RADIUS = 15;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
  const STORAGE_KEY = 'previewer-x-post-draft';

  // --- elements ---
  const fieldName = document.getElementById('fieldName');
  const fieldHandle = document.getElementById('fieldHandle');
  const fieldVerified = document.getElementById('fieldVerified');
  const fieldText = document.getElementById('fieldText');

  const avatarUploadBtn = document.getElementById('avatarUploadBtn');
  const avatarRemoveBtn = document.getElementById('avatarRemoveBtn');
  const avatarInput = document.getElementById('avatarInput');

  const dropzone = document.getElementById('dropzone');
  const dropzoneLabel = document.getElementById('dropzoneLabel');
  const imageInput = document.getElementById('imageInput');
  const imagePreviewRow = document.getElementById('imagePreviewRow');
  const imagePreviewThumb = document.getElementById('imagePreviewThumb');
  const imageRemoveBtn = document.getElementById('imageRemoveBtn');

  const themeToggle = document.getElementById('themeToggle');
  const previewStage = document.getElementById('previewStage');
  const previewModeLabel = document.getElementById('previewModeLabel');

  const charRing = document.getElementById('charRing');
  const charCount = document.getElementById('charCount');

  const resetBtn = document.getElementById('resetBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  const xCard = document.getElementById('xCard');
  const xAvatar = document.getElementById('xAvatar');
  const xName = document.getElementById('xName');
  const xHandle = document.getElementById('xHandle');
  const xBadge = document.getElementById('xBadge');
  const xText = document.getElementById('xText');
  const xImageWrap = document.getElementById('xImageWrap');
  const xImage = document.getElementById('xImage');

  if (!fieldText || !xCard) return; // safety guard for shared main.js coexistence

  if (charRing) {
    charRing.style.strokeDasharray = String(RING_CIRCUMFERENCE);
  }

  // --- defaults ---
  const DEFAULTS = {
    name: 'Your Brand',
    handle: 'yourbrand',
    verified: false,
    text: 'Launching our summer collection this Friday ☀️ Tap the link to get early access before it sells out.',
    theme: 'light'
  };

  /* ---------------------------------------------------------
     Draft persistence (text fields only — never images)
  --------------------------------------------------------- */
  function saveDraft() {
    try {
      const draft = {
        name: fieldName.value,
        handle: fieldHandle.value,
        verified: fieldVerified.checked,
        text: fieldText.value,
        theme: previewStage.classList.contains('is-dark') ? 'dark' : 'light'
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch (e) {
      /* localStorage unavailable — fail silently, app still works */
    }
  }

  function loadDraft() {
    let draft = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) draft = JSON.parse(raw);
    } catch (e) {
      draft = null;
    }
    return Object.assign({}, DEFAULTS, draft || {});
  }

  /* ---------------------------------------------------------
     Rendering
  --------------------------------------------------------- */
  function getInitials(name) {
    if (!name) return 'YB';
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map(function (p) { return p.charAt(0).toUpperCase(); }).join('') || 'YB';
  }

  function renderName() {
    const name = fieldName.value.trim() || DEFAULTS.name;
    xName.textContent = name;
    if (!xAvatar.style.backgroundImage || xAvatar.style.backgroundImage === '') {
      xAvatar.textContent = getInitials(name);
    }
  }

  function renderHandle() {
    const raw = fieldHandle.value.trim() || DEFAULTS.handle;
    xHandle.textContent = '@' + raw.replace(/^@/, '');
  }

  function renderVerified() {
    xBadge.hidden = !fieldVerified.checked;
  }

  function renderText() {
    const len = fieldText.value.length;
    xText.textContent = fieldText.value || DEFAULTS.text;

    const remaining = MAX_CHARS - len;
    const ratio = Math.min(len / MAX_CHARS, 1);
    const offset = RING_CIRCUMFERENCE * (1 - ratio);

    if (charRing) {
      charRing.style.strokeDashoffset = String(offset);
      charRing.style.stroke = remaining < 0 ? 'var(--red)' : (remaining <= 20 ? 'var(--amber)' : 'var(--blue)');
    }

    if (charCount) {
      charCount.textContent = remaining >= 0
        ? remaining + ' characters left'
        : Math.abs(remaining) + ' characters over the limit';
      charCount.classList.toggle('is-warn', remaining >= 0 && remaining <= 20);
      charCount.classList.toggle('is-over', remaining < 0);
    }
  }

  function setTheme(theme) {
    const isDark = theme === 'dark';
    previewStage.classList.toggle('is-dark', isDark);
    xCard.classList.toggle('is-dark', isDark);
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
  fieldName.addEventListener('input', function () { renderName(); saveDraft(); });
  fieldHandle.addEventListener('input', function () { renderHandle(); saveDraft(); });
  fieldVerified.addEventListener('change', function () { renderVerified(); saveDraft(); });
  fieldText.addEventListener('input', function () { renderText(); saveDraft(); });

  if (themeToggle) {
    themeToggle.querySelectorAll('.segmented__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTheme(btn.dataset.theme);
        saveDraft();
      });
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
        xAvatar.style.backgroundImage = 'url(' + e.target.result + ')';
        xAvatar.textContent = '';
      };
      reader.readAsDataURL(file);
    });
  }
  if (avatarRemoveBtn) {
    avatarRemoveBtn.addEventListener('click', function () {
      xAvatar.style.backgroundImage = '';
      avatarInput.value = '';
      renderName();
    });
  }

  /* ---------------------------------------------------------
     Post image upload (click + drag/drop)
  --------------------------------------------------------- */
  function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      xImage.src = e.target.result;
      xImageWrap.hidden = false;
      imagePreviewThumb.src = e.target.result;
      imagePreviewRow.hidden = false;
      dropzoneLabel.textContent = file.name;
    };
    reader.readAsDataURL(file);
  }

  if (dropzone && imageInput) {
    dropzone.addEventListener('click', function () { imageInput.click(); });
    imageInput.addEventListener('change', function () {
      const file = imageInput.files && imageInput.files[0];
      handleImageFile(file);
    });
    ['dragenter', 'dragover'].forEach(function (evt) {
      dropzone.addEventListener(evt, function (e) {
        e.preventDefault();
        dropzone.classList.add('is-dragover');
      });
    });
    ['dragleave', 'drop'].forEach(function (evt) {
      dropzone.addEventListener(evt, function (e) {
        e.preventDefault();
        dropzone.classList.remove('is-dragover');
      });
    });
    dropzone.addEventListener('drop', function (e) {
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      handleImageFile(file);
    });
  }

  if (imageRemoveBtn) {
    imageRemoveBtn.addEventListener('click', function () {
      xImage.src = '';
      xImageWrap.hidden = true;
      imagePreviewRow.hidden = true;
      imageInput.value = '';
      dropzoneLabel.textContent = 'Click or drop an image here';
    });
  }

  /* ---------------------------------------------------------
     Reset
  --------------------------------------------------------- */
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      fieldName.value = '';
      fieldHandle.value = '';
      fieldVerified.checked = false;
      fieldText.value = DEFAULTS.text;
      xAvatar.style.backgroundImage = '';
      avatarInput.value = '';
      xImage.src = '';
      xImageWrap.hidden = true;
      imagePreviewRow.hidden = true;
      imageInput.value = '';
      dropzoneLabel.textContent = 'Click or drop an image here';
      setTheme('light');
      renderName();
      renderHandle();
      renderVerified();
      renderText();
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
        link.download = 'x-post-preview.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }).catch(function () {
        /* download best-effort; fail silently if canvas rendering is blocked */
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
  fieldName.value = draft.name === DEFAULTS.name ? '' : draft.name;
  fieldHandle.value = draft.handle === DEFAULTS.handle ? '' : draft.handle;
  fieldVerified.checked = !!draft.verified;
  fieldText.value = draft.text || DEFAULTS.text;
  setTheme(draft.theme === 'dark' ? 'dark' : 'light');

  renderName();
  renderHandle();
  renderVerified();
  renderText();
});
