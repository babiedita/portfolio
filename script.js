/* =========================================================
   VÍDEOS INDEXADOS — VIMEO

   type: "curto"  = Shorts/Reels
   type: "longo"  = Longform

   home: true  = pode aparecer na home
   home: false = só aparece em videos.html

   A home sempre mostra no máximo 4 vídeos por filtro.
   videos.html mostra todos os vídeos daquele filtro.
========================================================= */

const videos = [
  {
    id: 1,
    type: "curto",
    home: true,
    title: "Matando 20 e perdendo",
    subtitle: "mercafatal",
    thumb: "video1.png",
    vimeo: "COLE_AQUI_O_LINK_DO_VIMEO_1"
  },
  {
    id: 2,
    type: "curto",
    home: true,
    title: "Minha FADE tá CLUTCHZERA!",
    subtitle: "bombazero",
    thumb: "video2.png",
    vimeo: "COLE_AQUI_O_LINK_DO_VIMEO_2"
  },
  {
    id: 3,
    type: "curto",
    home: true,
    title: "Short/Reel 03",
    subtitle: "cliente",
    thumb: "video3.png",
    vimeo: "COLE_AQUI_O_LINK_DO_VIMEO_3"
  },
  {
    id: 4,
    type: "curto",
    home: true,
    title: "Short/Reel 04",
    subtitle: "cliente",
    thumb: "video4.png",
    vimeo: "COLE_AQUI_O_LINK_DO_VIMEO_4"
  },
  {
    id: 5,
    type: "curto",
    home: false,
    title: "Short/Reel 05",
    subtitle: "cliente",
    thumb: "video5.png",
    vimeo: "COLE_AQUI_O_LINK_DO_VIMEO_5"
  },
  {
    id: 6,
    type: "curto",
    home: false,
    title: "Short/Reel 06",
    subtitle: "cliente",
    thumb: "video6.png",
    vimeo: "COLE_AQUI_O_LINK_DO_VIMEO_6"
  },
  {
    id: 7,
    type: "longo",
    home: true,
    title: "Vídeo Longform 01",
    subtitle: "cliente",
    thumb: "video7.png",
    vimeo: "COLE_AQUI_O_LINK_DO_VIMEO_7"
  },
  {
    id: 8,
    type: "longo",
    home: true,
    title: "Vídeo Longform 02",
    subtitle: "cliente",
    thumb: "video8.png",
    vimeo: "COLE_AQUI_O_LINK_DO_VIMEO_8"
  },
  {
    id: 9,
    type: "longo",
    home: true,
    title: "Vídeo Longform 03",
    subtitle: "cliente",
    thumb: "video9.png",
    vimeo: "COLE_AQUI_O_LINK_DO_VIMEO_9"
  },
  {
    id: 10,
    type: "longo",
    home: true,
    title: "Vídeo Longform 04",
    subtitle: "cliente",
    thumb: "video10.png",
    vimeo: "COLE_AQUI_O_LINK_DO_VIMEO_10"
  }
];

const page = document.body.dataset.page || "home";
const grid = document.getElementById("videoGrid");
const filterButtons = [...document.querySelectorAll(".filter-btn")];
const modal = document.getElementById("videoModal");
const modalInner = document.getElementById("modalInner");
const vimeoPlayer = document.getElementById("vimeoPlayer");
const modalClose = document.getElementById("modalClose");

let currentFilter = "curto";

function filteredVideos() {
  return videos.filter(video => video.type === currentFilter);
}

function createVideoCard(video) {
  const card = document.createElement("article");

  card.className = `video-card ${video.type === "curto" ? "is-curto" : "is-longo"}`;
  card.dataset.id = video.id;
  card.dataset.type = video.type;

  card.innerHTML = `
    <img
      class="video-thumb"
      src="${video.thumb}"
      alt="${video.title}"
      loading="lazy"
    >

    <div class="video-meta">
      <span class="video-title">${video.title}</span>
      <span class="video-subtitle">${video.subtitle}</span>
    </div>
  `;

  card.addEventListener("click", () => openVideo(video));

  return card;
}

function renderVideos() {
  if (!grid) return;

  const list = filteredVideos();

  const visible = page === "home"
    ? list.filter(video => video.home === true).slice(0, 4)
    : list;

  grid.classList.toggle("is-curto-grid", currentFilter === "curto");
  grid.classList.toggle("is-longo-grid", currentFilter === "longo");

  grid.innerHTML = "";

  visible.forEach(video => {
    grid.appendChild(createVideoCard(video));
  });
}

function setFilter(filter) {
  currentFilter = filter;

  filterButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });

  renderVideos();
}

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => setFilter(btn.dataset.filter));
});

function getVimeoEmbedUrl(value) {
  if (!value || value.startsWith("COLE_AQUI")) return null;

  const idMatch =
    value.match(/(?:vimeo\.com\/(?:video\/)?)(\d+)/i) ||
    value.match(/^(\d+)$/);

  if (!idMatch) return null;

  const id = idMatch[1];
  const hashMatch = value.match(/vimeo\.com\/(?:video\/)?\d+\/([a-zA-Z0-9]+)/i);
  const hash = hashMatch ? hashMatch[1] : null;

  const params = new URLSearchParams({
    autoplay: "1",
    title: "0",
    byline: "0",
    portrait: "0",
    dnt: "1"
  });

  if (hash) params.set("h", hash);

  return `https://player.vimeo.com/video/${id}?${params.toString()}`;
}

function openVideo(video) {
  if (!modal || !vimeoPlayer || !modalInner) return;

  const embedUrl = getVimeoEmbedUrl(video.vimeo);

  if (!embedUrl) {
    console.warn(`Adicione um link válido do Vimeo ao vídeo ${video.id} em script.js.`);
    return;
  }

  modalInner.classList.toggle("is-vertical", video.type === "curto");
  vimeoPlayer.src = embedUrl;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeVideo() {
  if (!modal || !vimeoPlayer || !modalInner) return;

  vimeoPlayer.src = "";
  modalInner.classList.remove("is-vertical");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

if (modalClose) {
  modalClose.addEventListener("click", closeVideo);
}

if (modal) {
  modal.addEventListener("click", event => {
    if (event.target === modal) closeVideo();
  });
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && modal?.classList.contains("open")) {
    closeVideo();
  }
});

renderVideos();
