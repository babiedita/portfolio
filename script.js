/* =========================================================
   VÍDEOS INDEXADOS — YOUTUBE

   type: "curto"  = Shorts/Reels
   type: "longo"  = Longform

   home: true  = pode aparecer na home
   home: false = só aparece em videos.html

   A HOME mostra no máximo:
   - 4 Shorts/Reels
   - 4 Longform

   videos.html mostra TODOS os vídeos do filtro.

   LINKS ACEITOS:

   https://www.youtube.com/watch?v=XXXXXXXXXXX
   https://youtu.be/XXXXXXXXXXX
   https://www.youtube.com/shorts/XXXXXXXXXXX
   https://www.youtube.com/embed/XXXXXXXXXXX
========================================================= */


const videos = [

  {
    id: 1,
    type: "curto",
    home: true,

    title: "Matando 20 e perdendo",
    subtitle: "mercafatal",

    thumb: "video1.png",

    youtube: "COLE_AQUI_O_LINK_DO_YOUTUBE_1"
  },

  {
    id: 2,
    type: "curto",
    home: true,

    title: "Minha FADE tá CLUTCHZERA!",
    subtitle: "bombazero",

    thumb: "video2.png",

    youtube: "COLE_AQUI_O_LINK_DO_YOUTUBE_2"
  },

  {
    id: 3,
    type: "curto",
    home: true,

    title: "Short/Reel 03",
    subtitle: "cliente",

    thumb: "video3.png",

    youtube: "COLE_AQUI_O_LINK_DO_YOUTUBE_3"
  },

  {
    id: 4,
    type: "curto",
    home: true,

    title: "Short/Reel 04",
    subtitle: "cliente",

    thumb: "video4.png",

    youtube: "COLE_AQUI_O_LINK_DO_YOUTUBE_4"
  },

  {
    id: 5,
    type: "curto",
    home: false,

    title: "Short/Reel 05",
    subtitle: "cliente",

    thumb: "video5.png",

    youtube: "COLE_AQUI_O_LINK_DO_YOUTUBE_5"
  },

  {
    id: 6,
    type: "curto",
    home: false,

    title: "Short/Reel 06",
    subtitle: "cliente",

    thumb: "video6.png",

    youtube: "COLE_AQUI_O_LINK_DO_YOUTUBE_6"
  },

  {
    id: 7,
    type: "longo",
    home: true,

    title: "Vídeo Longform 01",
    subtitle: "cliente",

    thumb: "video7.png",

    youtube: "COLE_AQUI_O_LINK_DO_YOUTUBE_7"
  },

  {
    id: 8,
    type: "longo",
    home: true,

    title: "Vídeo Longform 02",
    subtitle: "cliente",

    thumb: "video8.png",

    youtube: "COLE_AQUI_O_LINK_DO_YOUTUBE_8"
  },

  {
    id: 9,
    type: "longo",
    home: true,

    title: "Vídeo Longform 03",
    subtitle: "cliente",

    thumb: "video9.png",

    youtube: "COLE_AQUI_O_LINK_DO_YOUTUBE_9"
  },

  {
    id: 10,
    type: "longo",
    home: true,

    title: "Vídeo Longform 04",
    subtitle: "cliente",

    thumb: "video10.png",

    youtube: "COLE_AQUI_O_LINK_DO_YOUTUBE_10"
  }

];


/* =========================================================
   ELEMENTOS DA PÁGINA
========================================================= */

const page =
  document.body.dataset.page || "home";

const grid =
  document.getElementById("videoGrid");

const filterButtons =
  [...document.querySelectorAll(".filter-btn")];

const modal =
  document.getElementById("videoModal");

const modalInner =
  document.getElementById("modalInner");

/*
  O HTML ainda chama o iframe de vimeoPlayer.
  Não tem problema.
  Ele agora vai tocar YouTube.
*/
const videoPlayer =
  document.getElementById("vimeoPlayer");

const modalClose =
  document.getElementById("modalClose");


let currentFilter = "curto";


/* =========================================================
   FILTRAR
========================================================= */

function filteredVideos() {

  return videos.filter(
    video => video.type === currentFilter
  );

}


/* =========================================================
   CRIAR CARD
========================================================= */

function createVideoCard(video) {

  const card =
    document.createElement("article");


  card.className =
    `video-card ${
      video.type === "curto"
        ? "is-curto"
        : "is-longo"
    }`;


  card.dataset.id =
    video.id;


  card.dataset.type =
    video.type;


  card.innerHTML = `

    <img
      class="video-thumb"
      src="${video.thumb}"
      alt="${video.title}"
      loading="lazy"
    >

    <div class="video-meta">

      <span class="video-title">
        ${video.title}
      </span>

      <span class="video-subtitle">
        ${video.subtitle}
      </span>

    </div>

  `;


  card.addEventListener(
    "click",
    () => openVideo(video)
  );


  return card;

}


/* =========================================================
   RENDERIZAR
========================================================= */

function renderVideos() {

  if (!grid) return;


  const list =
    filteredVideos();


  /*
    HOME:
    pega somente home:true
    e limita em 4
  */

  const visible =
    page === "home"

      ? list
          .filter(
            video =>
              video.home === true
          )
          .slice(0, 4)

      : list;


  grid.classList.toggle(
    "is-curto-grid",
    currentFilter === "curto"
  );


  grid.classList.toggle(
    "is-longo-grid",
    currentFilter === "longo"
  );


  grid.innerHTML = "";


  visible.forEach(
    video => {

      grid.appendChild(
        createVideoCard(video)
      );

    }
  );

}


/* =========================================================
   FILTROS
========================================================= */

function setFilter(filter) {

  currentFilter =
    filter;


  filterButtons.forEach(
    btn => {

      btn.classList.toggle(
        "active",
        btn.dataset.filter === filter
      );

    }
  );


  renderVideos();

}


filterButtons.forEach(
  btn => {

    btn.addEventListener(
      "click",
      () => setFilter(
        btn.dataset.filter
      )
    );

  }
);


/* =========================================================
   PEGAR ID DO YOUTUBE
========================================================= */

function getYoutubeId(value) {

  if (
    !value ||
    value.startsWith("COLE_AQUI")
  ) {

    return null;

  }


  /*
    aceita somente o ID puro também
  */

  if (
    /^[a-zA-Z0-9_-]{11}$/.test(value)
  ) {

    return value;

  }


  try {

    const url =
      new URL(value);


    /*
      youtu.be/ID
    */

    if (
      url.hostname.includes("youtu.be")
    ) {

      return url.pathname
        .split("/")
        .filter(Boolean)[0];

    }


    /*
      youtube.com/watch?v=ID
    */

    const watchId =
      url.searchParams.get("v");


    if (watchId) {

      return watchId;

    }


    /*
      youtube.com/shorts/ID
      youtube.com/embed/ID
    */

    const parts =
      url.pathname
        .split("/")
        .filter(Boolean);


    const shortsIndex =
      parts.indexOf("shorts");


    if (
      shortsIndex !== -1 &&
      parts[shortsIndex + 1]
    ) {

      return parts[shortsIndex + 1];

    }


    const embedIndex =
      parts.indexOf("embed");


    if (
      embedIndex !== -1 &&
      parts[embedIndex + 1]
    ) {

      return parts[embedIndex + 1];

    }

  }

  catch (error) {

    return null;

  }


  return null;

}


/* =========================================================
   GERAR EMBED
========================================================= */

function getYoutubeEmbedUrl(value) {

  const id =
    getYoutubeId(value);


  if (!id) {

    return null;

  }


  const params =
    new URLSearchParams({

      autoplay: "1",

      rel: "0",

      playsinline: "1",

      controls: "1",

      fs: "1",

      iv_load_policy: "3"

    });


  return (
    `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
  );

}


/* =========================================================
   ABRIR VÍDEO
========================================================= */

function openVideo(video) {

  if (
    !modal ||
    !videoPlayer ||
    !modalInner
  ) {

    return;

  }


  const embedUrl =
    getYoutubeEmbedUrl(
      video.youtube
    );


  if (!embedUrl) {

    console.warn(
      `Adicione um link válido do YouTube ao vídeo ${video.id}.`
    );

    return;

  }


  /*
    SHORTS = vertical
    LONGFORM = horizontal
  */

  modalInner.classList.toggle(
    "is-vertical",
    video.type === "curto"
  );


  videoPlayer.src =
    embedUrl;


  modal.classList.add(
    "open"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.overflow =
    "hidden";

}


/* =========================================================
   FECHAR VÍDEO
========================================================= */

function closeVideo() {

  if (
    !modal ||
    !videoPlayer ||
    !modalInner
  ) {

    return;

  }


  /*
    limpa o iframe:
    o YouTube para imediatamente
  */

  videoPlayer.src =
    "";


  modalInner.classList.remove(
    "is-vertical"
  );


  modal.classList.remove(
    "open"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.style.overflow =
    "";

}


/* =========================================================
   EVENTOS DO MODAL
========================================================= */

if (modalClose) {

  modalClose.addEventListener(
    "click",
    closeVideo
  );

}


if (modal) {

  modal.addEventListener(
    "click",
    event => {

      if (
        event.target === modal
      ) {

        closeVideo();

      }

    }
  );

}


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      modal?.classList.contains("open")
    ) {

      closeVideo();

    }

  }
);


/* =========================================================
   INICIAR
========================================================= */

renderVideos();
