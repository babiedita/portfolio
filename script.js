const videos = [
  {
    id: 1,
    type: "curto",
    home: true,
    title: "A MELHOR IA DO MUNDO!",
    subtitle: "dev.pedroca",
    youtube: "https://youtube.com/shorts/_DPBiqax3RI?feature=share"
  },
  {
    id: 2,
    type: "curto",
    home: true,
    title: "Minha FADE tá CLUTCHZERA!",
    subtitle: "bombazero",
    youtube: "COLE_AQUI_O_LINK_DO_YOUTUBE_2"
  },
  {
    id: 3,
    type: "curto",
    home: true,
    title: "Short / Reel 03",
    subtitle: "cliente",
    youtube: "COLE_AQUI_O_LINK_DO_YOUTUBE_3"
  },
  {
    id: 4,
    type: "curto",
    home: true,
    title: "Short / Reel 04",
    subtitle: "cliente",
    youtube: "COLE_AQUI_O_LINK_DO_YOUTUBE_4"
  },
  {
    id: 5,
    type: "curto",
    home: false,
    title: "Short / Reel 05",
    subtitle: "cliente",
    youtube: "COLE_AQUI_O_LINK_DO_YOUTUBE_5"
  },
  {
    id: 6,
    type: "curto",
    home: false,
    title: "Short / Reel 06",
    subtitle: "cliente",
    youtube: "COLE_AQUI_O_LINK_DO_YOUTUBE_6"
  },
  {
    id: 7,
    type: "longo",
    home: true,
    title: "MATEI 20 e PERDI de JETT!",
    subtitle: "marcafatal",
    youtube: "https://www.youtube.com/watch?v=b_JcHN8aElA"
  },
  {
    id: 8,
    type: "longo",
    home: true,
    title: "Vídeo Longform 02",
    subtitle: "cliente",
    youtube: "COLE_AQUI_O_LINK_DO_YOUTUBE_8"
  },
  {
    id: 9,
    type: "longo",
    home: true,
    title: "Vídeo Longform 03",
    subtitle: "cliente",
    youtube: "COLE_AQUI_O_LINK_DO_YOUTUBE_9"
  },
  {
    id: 10,
    type: "longo",
    home: true,
    title: "Vídeo Longform 04",
    subtitle: "cliente",
    youtube: "COLE_AQUI_O_LINK_DO_YOUTUBE_10"
  }
];

const page = document.body.dataset.page || "home";
const grid = document.getElementById("videoGrid");
const filterButtons = [...document.querySelectorAll(".filter-btn")];
const modal = document.getElementById("videoModal");
const modalInner = document.getElementById("modalInner");

const videoPlayer =
  document.getElementById("youtubePlayer") ||
  document.getElementById("vimeoPlayer");

const modalClose = document.getElementById("modalClose");

let currentFilter = "curto";

function getYoutubeId(value) {
  if (!value) return null;

  value = value.trim();

  if (value.startsWith("COLE_AQUI")) {
    return null;
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);

    if (
      url.hostname === "youtu.be" ||
      url.hostname === "www.youtu.be"
    ) {
      return url.pathname.split("/").filter(Boolean)[0] || null;
    }

    const watchId = url.searchParams.get("v");

    if (watchId) {
      return watchId;
    }

    const parts = url.pathname.split("/").filter(Boolean);

    const shortsIndex = parts.indexOf("shorts");

    if (
      shortsIndex !== -1 &&
      parts[shortsIndex + 1]
    ) {
      return parts[shortsIndex + 1];
    }

    const embedIndex = parts.indexOf("embed");

    if (
      embedIndex !== -1 &&
      parts[embedIndex + 1]
    ) {
      return parts[embedIndex + 1];
    }

    const liveIndex = parts.indexOf("live");

    if (
      liveIndex !== -1 &&
      parts[liveIndex + 1]
    ) {
      return parts[liveIndex + 1];
    }
  } catch (error) {
    return null;
  }

  return null;
}

function getYoutubeThumbnail(value) {
  const id = getYoutubeId(value);

  if (!id) {
    return (
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(`
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1280"
          height="720"
          viewBox="0 0 1280 720"
        >
          <rect
            width="1280"
            height="720"
            fill="#e8e8e8"
          />
        </svg>
      `)
    );
  }

  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

function handleThumbnailError(image, youtubeValue) {
  const id = getYoutubeId(youtubeValue);

  if (!id) return;

  if (image.dataset.fallbackApplied === "true") {
    return;
  }

  image.dataset.fallbackApplied = "true";
  image.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function filteredVideos() {
  return videos.filter(
    video => video.type === currentFilter
  );
}

function createVideoCard(video) {
  const card = document.createElement("article");

  card.className =
    `video-card ${
      video.type === "curto"
        ? "is-curto"
        : "is-longo"
    }`;

  card.dataset.id = video.id;
  card.dataset.type = video.type;

  const thumbnail = getYoutubeThumbnail(video.youtube);

  card.innerHTML = `
    <img
      class="video-thumb"
      src="${thumbnail}"
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

  const image = card.querySelector(".video-thumb");

  image.addEventListener(
    "error",
    () => {
      handleThumbnailError(
        image,
        video.youtube
      );
    }
  );

  card.addEventListener(
    "click",
    () => openVideo(video)
  );

  return card;
}

function renderVideos() {
  if (!grid) return;

  const list = filteredVideos();

  const visible =
    page === "home"
      ? list
          .filter(video => video.home === true)
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

function setFilter(filter) {
  currentFilter = filter;

  filterButtons.forEach(
    button => {
      button.classList.toggle(
        "active",
        button.dataset.filter === filter
      );
    }
  );

  renderVideos();
}

filterButtons.forEach(
  button => {
    button.addEventListener(
      "click",
      () => {
        setFilter(
          button.dataset.filter
        );
      }
    );
  }
);

function getYoutubeEmbedUrl(value) {
  const id = getYoutubeId(value);

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
      iv_load_policy: "3",
      modestbranding: "1"
    });

  return (
    `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
  );
}

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
      `Coloque um link válido do YouTube no vídeo ${video.id}.`
    );

    return;
  }

musicWasPlayingBeforeVideo =
  backgroundAudio &&
  !backgroundAudio.paused;

if (musicWasPlayingBeforeVideo) {
  backgroundAudio.pause();
}
  
  modalInner.classList.toggle(
    "is-vertical",
    video.type === "curto"
  );

  videoPlayer.src = embedUrl;

  modal.classList.add("open");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow = "hidden";
}

function closeVideo() {
  if (
    !modal ||
    !videoPlayer ||
    !modalInner
  ) {
    return;
  }

  videoPlayer.src = "";

  modalInner.classList.remove(
    "is-vertical"
  );

  modal.classList.remove("open");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow = "";
}

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
      if (event.target === modal) {
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

const playlist = [
  {
    title: "Mii Maker Editing Mii",
    src: "music/miimaker.mp3",
    cover: "covers/miimaker.png"
  },
  {
    title: "Wii Party",
    src: "music/wiiparty.mp3",
    cover: "covers/wiiparty.png"
  },
  {
    title: "Aquatic Ambience",
    src: "music/aquatic.mp3",
    cover: "covers/aquatic.png"
  }
];

const backgroundAudio =
  document.getElementById("backgroundAudio");

const musicPlayer =
  document.getElementById("musicPlayer");

const musicCover =
  document.getElementById("musicCover");

const musicTitle =
  document.getElementById("musicTitle");

const musicPrev =
  document.getElementById("musicPrev");

const musicPlay =
  document.getElementById("musicPlay");

const musicNext =
  document.getElementById("musicNext");

const musicClose =
  document.getElementById("musicClose");


let currentTrack =
  Number(
    localStorage.getItem("babiMusicTrack")
  ) || 0;


let musicWasPlayingBeforeVideo =
  false;


function loadTrack(index, restoreTime = false) {

  currentTrack =
    (
      index +
      playlist.length
    ) % playlist.length;


  const track =
    playlist[currentTrack];


  backgroundAudio.src =
    track.src;


  musicCover.src =
    track.cover;


  musicTitle.textContent =
    track.title;


  localStorage.setItem(
    "babiMusicTrack",
    currentTrack
  );


  if (restoreTime) {

    const savedTime =
      Number(
        localStorage.getItem(
          "babiMusicTime"
        )
      );


    if (
      Number.isFinite(savedTime) &&
      savedTime > 0
    ) {

      backgroundAudio.addEventListener(
        "loadedmetadata",
        () => {

          if (
            savedTime <
            backgroundAudio.duration
          ) {

            backgroundAudio.currentTime =
              savedTime;

          }

        },
        {
          once: true
        }
      );

    }

  }

}


function updatePlayButton() {

  musicPlay.textContent =
    backgroundAudio.paused
      ? "▶"
      : "❚❚";

}


async function playMusic() {

  try {

    await backgroundAudio.play();

    localStorage.setItem(
      "babiMusicPlaying",
      "true"
    );

  } catch (error) {

    localStorage.setItem(
      "babiMusicPlaying",
      "false"
    );

  }


  updatePlayButton();

}


function pauseMusic() {

  backgroundAudio.pause();

  localStorage.setItem(
    "babiMusicPlaying",
    "false"
  );

  updatePlayButton();

}


function nextTrack() {

  loadTrack(
    currentTrack + 1
  );

  playMusic();

}


function previousTrack() {

  loadTrack(
    currentTrack - 1
  );

  playMusic();

}


musicPlay?.addEventListener(
  "click",
  () => {

    if (backgroundAudio.paused) {

      playMusic();

    } else {

      pauseMusic();

    }

  }
);


musicNext?.addEventListener(
  "click",
  nextTrack
);


musicPrev?.addEventListener(
  "click",
  previousTrack
);


backgroundAudio?.addEventListener(
  "ended",
  nextTrack
);


backgroundAudio?.addEventListener(
  "timeupdate",
  () => {

    localStorage.setItem(
      "babiMusicTime",
      backgroundAudio.currentTime
    );

  }
);


backgroundAudio?.addEventListener(
  "play",
  updatePlayButton
);


backgroundAudio?.addEventListener(
  "pause",
  updatePlayButton
);


musicClose?.addEventListener(
  "click",
  () => {

    pauseMusic();

    musicPlayer.classList.add(
      "is-hidden"
    );

    localStorage.setItem(
      "babiMusicHidden",
      "true"
    );

  }
);


loadTrack(
  currentTrack,
  true
);


if (
  localStorage.getItem(
    "babiMusicHidden"
  ) === "true"
) {

  musicPlayer?.classList.add(
    "is-hidden"
  );

}


const shouldResume =
  localStorage.getItem(
    "babiMusicPlaying"
  ) === "true";


if (shouldResume) {

  playMusic();

}


document.addEventListener(
  "pointerdown",
  () => {

    if (
      shouldResume &&
      backgroundAudio.paused &&
      !musicPlayer?.classList.contains(
        "is-hidden"
      )
    ) {

      playMusic();

    }

  },
  {
    once: true
  }
);

renderVideos();
