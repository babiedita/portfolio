(() => {
  const PREVIEW_CLASS = "autoplay-card-preview";

  function getYoutubeId(value) {
    if (!value) return null;

    const clean = String(value).trim();

    if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
      return clean;
    }

    try {
      const url = new URL(clean);

      if (url.hostname.includes("youtu.be")) {
        return url.pathname.split("/").filter(Boolean)[0] || null;
      }

      const watchId = url.searchParams.get("v");
      if (watchId) return watchId;

      const parts = url.pathname.split("/").filter(Boolean);

      for (const marker of ["shorts", "embed", "live"]) {
        const i = parts.indexOf(marker);
        if (i !== -1 && parts[i + 1]) {
          return parts[i + 1];
        }
      }
    } catch (_) {}

    return null;
  }

  function injectStyles() {
    if (document.getElementById("autoplay-preview-styles")) return;

    const style = document.createElement("style");
    style.id = "autoplay-preview-styles";
    style.textContent = `
      .autoplay-preview-media {
        position: relative !important;
        overflow: hidden !important;
      }

      .autoplay-card-preview {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        border: 0 !important;
        display: block !important;
        object-fit: cover !important;
        pointer-events: none !important;
        z-index: 2 !important;
        background: #111 !important;
      }

      .project-card .project-play,
      .project-card .play-icon,
      .project-card .play-button,
      .project-card .video-play,
      .tutorial-card .tutorial-play,
      .tutorial-card .play-icon,
      .tutorial-card .play-button,
      .tutorial-card .video-play,
      #projectGrid .project-play,
      #projectGrid .play-icon,
      #tutorialGrid .tutorial-play,
      #tutorialGrid .play-icon {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
      }
    `;

    document.head.appendChild(style);
  }

  function makePreview(video) {
    const id = getYoutubeId(video?.youtube);
    if (!id) return null;

    const params = new URLSearchParams({
      autoplay: "1",
      mute: "1",
      controls: "0",
      loop: "1",
      playlist: id,
      playsinline: "1",
      rel: "0",
      modestbranding: "1",
      iv_load_policy: "3",
      disablekb: "1",
      fs: "0"
    });

    const iframe = document.createElement("iframe");
    iframe.className = PREVIEW_CLASS;
    iframe.src =
      `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
    iframe.title = "";
    iframe.tabIndex = -1;
    iframe.setAttribute("aria-hidden", "true");
    iframe.setAttribute("allow", "autoplay; encrypted-media");
    iframe.setAttribute("loading", "eager");

    return iframe;
  }

  function mediaOf(card) {
    return (
      card.querySelector(
        ".project-media, .tutorial-media, .video-media, .project-thumb-wrap, .tutorial-thumb-wrap"
      ) ||
      card.querySelector("img")?.parentElement ||
      card
    );
  }

  function removePlayIcon(card) {
    [
      ".project-play",
      ".tutorial-play",
      ".play-icon",
      ".play-button",
      ".video-play"
    ].forEach(selector => {
      card.querySelectorAll(selector).forEach(node => node.remove());
    });
  }

  function applyPreview(card, video) {
    if (!card || !video?.youtube) return;

    const media = mediaOf(card);
    if (!media) return;

    const id = getYoutubeId(video.youtube);
    if (!id) return;

    if (
      media.querySelector(`.${PREVIEW_CLASS}`)?.dataset.youtubeId === id
    ) {
      removePlayIcon(card);
      return;
    }

    media.querySelectorAll(`.${PREVIEW_CLASS}`).forEach(node => node.remove());

    const iframe = makePreview(video);
    if (!iframe) return;

    iframe.dataset.youtubeId = id;

    media.classList.add("autoplay-preview-media");
    media.appendChild(iframe);

    removePlayIcon(card);
  }

  function currentProjectVideos() {
    if (typeof videos === "undefined" || !Array.isArray(videos)) {
      return [];
    }

    const active =
      document.querySelector(
        '#projetos [data-filter][aria-pressed="true"], #projetos .filter-button.active'
      );

    const filter = active?.dataset?.filter || "short";

    return videos
      .filter(video => video && video.type === filter && video.youtube)
      .sort((a, b) => (a.order ?? a.id ?? 0) - (b.order ?? b.id ?? 0));
  }

  function currentTutorialVideos() {
    if (
      typeof tutorialVideos !== "undefined" &&
      Array.isArray(tutorialVideos)
    ) {
      return tutorialVideos
        .filter(video => video && video.youtube)
        .sort((a, b) => (a.order ?? a.id ?? 0) - (b.order ?? b.id ?? 0));
    }

    return [];
  }

  function enhanceProjects() {
    const grid = document.getElementById("projectGrid");
    if (!grid) return;

    const cards = [
      ...grid.querySelectorAll(
        ":scope > .project-card, :scope > article, :scope > button, :scope > a"
      )
    ];

    const list = currentProjectVideos();

    cards.forEach((card, index) => {
      const byId =
        list.find(
          video =>
            String(video.id) === String(card.dataset.id || card.dataset.videoId)
        ) || list[index];

      applyPreview(card, byId);
    });
  }

  function enhanceTutorials() {
    const grid = document.getElementById("tutorialGrid");
    if (!grid) return;

    const cards = [
      ...grid.querySelectorAll(
        ":scope > .tutorial-card, :scope > .project-card, :scope > article, :scope > button, :scope > a"
      )
    ];

    const list = currentTutorialVideos();

    cards.forEach((card, index) => {
      const byId =
        list.find(
          video =>
            String(video.id) === String(card.dataset.id || card.dataset.videoId)
        ) || list[index];

      applyPreview(card, byId);
    });
  }

  function enhanceAll() {
    injectStyles();
    enhanceProjects();
    enhanceTutorials();
  }

  let queued = false;

  function queueEnhance() {
    if (queued) return;

    queued = true;

    requestAnimationFrame(() => {
      queued = false;
      enhanceAll();
    });
  }

  const observer = new MutationObserver(queueEnhance);

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  document.addEventListener("click", event => {
    if (event.target.closest("[data-filter]")) {
      setTimeout(queueEnhance, 0);
      setTimeout(queueEnhance, 80);
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhanceAll, { once: true });
  } else {
    enhanceAll();
  }

  setTimeout(enhanceAll, 250);
  setTimeout(enhanceAll, 900);
})();