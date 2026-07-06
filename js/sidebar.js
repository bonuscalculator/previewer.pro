/**
 * Previewer.pro — sidebar.js
 * Injects a fixed dynamic sidebar for all social media preview tools
 * Theme: Editorial / Ink-on-paper aesthetic matching Previewer.pro
 */

(function () {
  // 1. Array list of all preview tools matching the website
  const toolsList = [
    { 
      name: "Facebook Post", 
      icon: "f", 
      url: "/fb-post", 
      desc: "Preview Facebook posts with images, links, and reactions.",
      color: "#1877F2"
    },
    { 
      name: "X (Twitter) Post", 
      icon: "𝕏", 
      url: "/x-post", 
      desc: "Check character limits, images, and dark mode for X posts.",
      color: "#111318"
    },
    { 
      name: "LinkedIn Post", 
      icon: "in", 
      url: "/linkedin-post", 
      desc: "Preview long-form posts with link cards and images.",
      color: "#0A66C2"
    },
    { 
      name: "Reddit Post", 
      icon: "R", 
      url: "/reddit-post", 
      desc: "Preview titles, text/image/link posts, and NSFW tags.",
      color: "#FF4500"
    },
    { 
      name: "Pinterest Pin", 
      icon: "P", 
      url: "/pinterest-pin", 
      desc: "Preview pin titles, descriptions, and image crops.",
      color: "#E60023"
    },
    { 
      name: "Threads Post", 
      icon: "@", 
      url: "/threads-post", 
      desc: "Check 500-character limits, images, and link previews.",
      color: "#111318"
    },
    { 
      name: "YouTube Video", 
      icon: "▶", 
      url: "/yt-video", 
      desc: "Preview thumbnails, titles, and channel info.",
      color: "#FF0000"
    },
    { 
      name: "Instagram Post", 
      icon: "IG", 
      url: "/insta-post", 
      desc: "Preview feed posts, carousels, and Stories.",
      color: "#833AB4"
    },
    { 
      name: "Twitter Card Validator", 
      icon: "🐦", 
      url: "/twitter-card-validator", 
      desc: "Validate Twitter Card meta tags and preview cards.",
      color: "#1DA1F2"
    },
    { 
      name: "WhatsApp Link Preview", 
      icon: "💬", 
      url: "/whatsapp-preview", 
      desc: "See how your URL looks when shared on WhatsApp.",
      color: "#25D366"
    },
    { 
      name: "SERP Preview", 
      icon: "🔍", 
      url: "/serp-preview", 
      desc: "Preview Google search results for your page.",
      color: "#4285F4"
    }
  ];

  // 2. Inject CSS Styles matching Previewer.pro theme
  const cssStyles = `
    /* Floating Launch Trigger Button */
    .tools-floating-trigger {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      width: 56px;
      height: 56px;
      background: var(--ink, #1E2328);
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      box-shadow: 0 4px 20px rgba(30,35,40,0.25);
      cursor: pointer;
      border: none;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease, box-shadow 0.2s ease;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .tools-floating-trigger:hover {
      transform: scale(1.1) rotate(-5deg);
      background: #000;
      box-shadow: 0 8px 30px rgba(30,35,40,0.35);
    }
    .tools-floating-trigger.active {
      transform: scale(0.9) rotate(90deg);
      background: var(--bg, #FAFAF9);
      color: var(--ink, #1E2328);
      box-shadow: 0 2px 10px rgba(30,35,40,0.1);
    }

    /* Fixed Sidebar Layout Container */
    .tools-fixed-sidebar {
      position: fixed;
      top: 0;
      right: -380px;
      width: 360px;
      height: 100vh;
      background: var(--surface, #FFFFFF);
      border-left: 1px solid var(--border, #E4E1DA);
      box-shadow: 0 0 60px rgba(30,35,40,0.15);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .tools-fixed-sidebar.open {
      right: 0;
    }

    /* Dimmed Background Backdrop Overlay */
    .tools-sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(30,35,40,0.4);
      backdrop-filter: blur(4px);
      z-index: 9999;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    .tools-sidebar-overlay.visible {
      opacity: 1;
      pointer-events: auto;
    }

    /* Sidebar Header */
    .tools-sb-header {
      padding: 20px 24px 16px;
      border-bottom: 1px solid var(--border, #E4E1DA);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--surface, #FFFFFF);
      flex-shrink: 0;
    }
    .tools-sb-header h2 {
      font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--ink, #1E2328);
      margin: 0;
      letter-spacing: -0.01em;
    }
    .tools-sb-header h2 span {
      color: var(--blue-ink, #1B4FBF);
    }
    .tools-sb-header .tools-sb-badge {
      font-size: 0.6rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted, #63697A);
      background: var(--bg, #FAFAF9);
      padding: 2px 10px;
      border-radius: 20px;
      border: 1px solid var(--border, #E4E1DA);
      font-family: 'JetBrains Mono', monospace;
    }
    .tools-sb-close {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      font-size: 1.1rem;
      color: var(--muted, #63697A);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Inter', sans-serif;
    }
    .tools-sb-close:hover {
      color: var(--ink, #1E2328);
      background: var(--bg, #FAFAF9);
    }

    /* Search / Filter */
    .tools-sb-search {
      padding: 12px 20px;
      border-bottom: 1px solid var(--border, #E4E1DA);
      flex-shrink: 0;
    }
    .tools-sb-search input {
      width: 100%;
      padding: 8px 14px;
      border: 1px solid var(--border, #E4E1DA);
      border-radius: 8px;
      font-size: 0.85rem;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg, #FAFAF9);
      color: var(--ink, #1E2328);
      outline: none;
      transition: border-color 0.2s ease;
    }
    .tools-sb-search input:focus {
      border-color: var(--blue, #2F6FED);
    }
    .tools-sb-search input::placeholder {
      color: var(--muted, #63697A);
    }

    /* Scrollable items menu wrapper */
    .tools-sb-body {
      flex: 1;
      overflow-y: auto;
      padding: 12px 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    /* Single Tool Items Card Styling */
    .tools-sb-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 10px 14px;
      border-radius: 10px;
      text-decoration: none;
      color: var(--ink, #1E2328);
      border: 1px solid transparent;
      background: transparent;
      transition: all 0.2s ease;
      opacity: 0;
      transform: translateX(20px);
      position: relative;
    }
    .tools-fixed-sidebar.open .tools-sb-item {
      animation: slideInItem 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    .tools-sb-item:hover {
      background: var(--bg, #FAFAF9);
      border-color: var(--border, #E4E1DA);
      transform: translateX(4px);
    }
    .tools-sb-item-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      transition: transform 0.2s ease;
    }
    .tools-sb-item:hover .tools-sb-item-icon {
      transform: scale(1.05);
    }
    .tools-sb-item-details {
      flex: 1;
      min-width: 0;
    }
    .tools-sb-item-name {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--ink, #1E2328);
      margin-bottom: 1px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .tools-sb-item-desc {
      font-size: 0.75rem;
      color: var(--muted, #63697A);
      line-height: 1.3;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .tools-sb-item-status {
      font-size: 0.6rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--green, #17845A);
      background: #EAF7F1;
      padding: 2px 8px;
      border-radius: 12px;
      border: 1px solid #CDEBDB;
      font-family: 'JetBrains Mono', monospace;
      flex-shrink: 0;
    }
    .tools-sb-item-status.soon {
      color: var(--amber, #C77A1F);
      background: #FBF1E7;
      border-color: #F0DFC7;
    }

    /* Hide items on search */
    .tools-sb-item.hidden {
      display: none;
    }

    /* Keyframe Animations */
    @keyframes slideInItem {
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    /* Scrollbar styling */
    .tools-sb-body::-webkit-scrollbar {
      width: 4px;
    }
    .tools-sb-body::-webkit-scrollbar-track {
      background: transparent;
    }
    .tools-sb-body::-webkit-scrollbar-thumb {
      background: var(--border-strong, #D2CFC7);
      border-radius: 4px;
    }
    .tools-sb-body::-webkit-scrollbar-thumb:hover {
      background: var(--muted, #63697A);
    }

    /* Responsive */
    @media (max-width: 480px) {
      .tools-fixed-sidebar {
        width: 100%;
        right: -100%;
      }
      .tools-sb-header h2 {
        font-size: 1rem;
      }
      .tools-sb-item {
        padding: 8px 12px;
      }
      .tools-sb-item-icon {
        width: 32px;
        height: 32px;
        font-size: 0.65rem;
      }
      .tools-sb-item-name {
        font-size: 0.82rem;
      }
      .tools-sb-item-desc {
        font-size: 0.7rem;
      }
    }
  `;

  // 3. Inject styles into document head
  const styleEl = document.createElement("style");
  styleEl.textContent = cssStyles;
  document.head.appendChild(styleEl);

  // 4. Generate the complete DOM structural markup
  const rootContainer = document.getElementById("tools-sidebar-root");
  if (!rootContainer) {
    // Create root if it doesn't exist
    const newRoot = document.createElement("div");
    newRoot.id = "tools-sidebar-root";
    document.body.appendChild(newRoot);
  }

  const root = document.getElementById("tools-sidebar-root");
  
  // Render the floating toggle, backdrop, and sidebar
  root.innerHTML = `
    <div class="tools-sidebar-overlay" id="toolsSidebarOverlay"></div>
    <button class="tools-floating-trigger" id="toolsSidebarTrigger" title="Open Preview Tools" aria-label="Toggle preview tools sidebar">🔍</button>
    <aside class="tools-fixed-sidebar" id="toolsFixedSidebar" aria-label="Previewer.pro Tools Sidebar">
      <div class="tools-sb-header">
        <div>
          <h2>Previewer<span>.</span>pro <span style="font-weight:400;font-size:0.7rem;color:var(--muted);">tools</span></h2>
        </div>
        <button class="tools-sb-close" id="toolsSidebarClose" aria-label="Close sidebar">✕</button>
      </div>
      <div class="tools-sb-search">
        <input type="text" id="toolsSidebarSearch" placeholder="Filter tools..." aria-label="Filter tools">
      </div>
      <div class="tools-sb-body" id="toolsSidebarBody"></div>
    </aside>
  `;

  const sidebarBody = document.getElementById("toolsSidebarBody");
  const sidebar = document.getElementById("toolsFixedSidebar");
  const trigger = document.getElementById("toolsSidebarTrigger");
  const overlay = document.getElementById("toolsSidebarOverlay");
  const closeBtn = document.getElementById("toolsSidebarClose");
  const searchInput = document.getElementById("toolsSidebarSearch");

  // 5. Populate list items with staggered animation
  toolsList.forEach((tool, idx) => {
    const item = document.createElement("a");
    item.href = tool.url;
    item.className = "tools-sb-item";
    item.style.animationDelay = `${idx * 0.025}s`;
    item.dataset.toolName = tool.name.toLowerCase();

    // Determine if tool is "coming soon" (for future expansion)
    const isSoon = tool.url === "#" || tool.url.includes("coming-soon");

    item.innerHTML = `
      <div class="tools-sb-item-icon" style="background:${tool.color};">${tool.icon}</div>
      <div class="tools-sb-item-details">
        <div class="tools-sb-item-name">${tool.name}</div>
        <div class="tools-sb-item-desc">${tool.desc}</div>
      </div>
      ${isSoon ? '<span class="tools-sb-item-status soon">Soon</span>' : '<span class="tools-sb-item-status">Live</span>'}
    `;
    sidebarBody.appendChild(item);
  });

  // 6. Search / Filter functionality
  searchInput.addEventListener("input", function() {
    const query = this.value.toLowerCase().trim();
    const items = sidebarBody.querySelectorAll(".tools-sb-item");
    items.forEach(item => {
      const name = item.dataset.toolName || "";
      const desc = item.querySelector(".tools-sb-item-desc")?.textContent?.toLowerCase() || "";
      const match = name.includes(query) || desc.includes(query);
      item.classList.toggle("hidden", !match);
    });
  });

  // 7. Sidebar Controls
  function toggleSidebar() {
    const isOpen = sidebar.classList.toggle("open");
    trigger.classList.toggle("active", isOpen);
    overlay.classList.toggle("visible", isOpen);
    trigger.textContent = isOpen ? "✕" : "🔍";
    if (isOpen) {
      // Focus search on open
      setTimeout(() => searchInput.focus(), 400);
    } else {
      searchInput.value = "";
      sidebarBody.querySelectorAll(".tools-sb-item").forEach(el => el.classList.remove("hidden"));
    }
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    trigger.classList.remove("active");
    overlay.classList.remove("visible");
    trigger.textContent = "🔍";
    searchInput.value = "";
    sidebarBody.querySelectorAll(".tools-sb-item").forEach(el => el.classList.remove("hidden"));
  }

  // 8. Bind Event Listeners
  trigger.addEventListener("click", toggleSidebar);
  overlay.addEventListener("click", closeSidebar);
  closeBtn.addEventListener("click", closeSidebar);

  // Close via Escape key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });

  // Close on route change (for SPA-like behavior)
  document.addEventListener("click", (e) => {
    const item = e.target.closest(".tools-sb-item");
    if (item) {
      // Let the navigation happen, close sidebar after a tiny delay
      setTimeout(closeSidebar, 150);
    }
  });

  console.log(`✅ Previewer.pro Sidebar loaded with ${toolsList.length} tools.`);
})();
