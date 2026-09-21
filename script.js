const videos = [
  {
    id: 1,
    type: "curto",
    home: true,
    title: "Matando 20 e perdendo",
    subtitle: "mercafatal",
    youtube: "COLE_AQUI_O_LINK_DO_YOUTUBE_1"
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
    title: "Vídeo Longform 01",
    subtitle: "cliente",
    youtube: "COLE_AQUI_O_LINK_DO_YOUTUBE_7"
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


const videoPlayer =
  document.getElementById("youtubePlayer");


const modalClose =
  document.getElementById("modalClose");


const backgroundAudio =
  document.getElementById("backgroundAudio");


const musicPlayer =
  document.getElementById("musicPlayer");


const musicPlayerMini =
  document.getElementById("musicPlayerMini");


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


const musicMiniPrev =
  document.getElementById("musicMiniPrev");


const musicMiniPlay =
  document.getElementById("musicMiniPlay");


const musicMiniNext =
  document.getElementById("musicMiniNext");


let currentFilter =
  "curto";


let currentTrack =
  parseInt(
    localStorage.getItem(
      "babiMusicTrackV2"
    ) || "0",
    10
  );


if (
  !Number.isFinite(currentTrack) ||
  currentTrack < 0 ||
  currentTrack >= playlist.length
) {
  currentTrack = 0;
}


let musicDesiredPlaying =
  localStorage.getItem(
    "babiMusicWantedV2"
  ) !== "false";


let musicWasPlayingBeforeVideo =
  false;



function getYoutubeId(value) {
  if (!value) {
    return null;
  }

  value =
    value.trim();

  if (
    value.startsWith(
      "COLE_AQUI"
    )
  ) {
    return null;
  }

  if (
    /^[a-zA-Z0-9_-]{11}$/.test(
      value
    )
  ) {
    return value;
  }

  try {
    const url =
      new URL(value);

    if (
      url.hostname === "youtu.be" ||
      url.hostname === "www.youtu.be"
    ) {
      return (
        url.pathname
          .split("/")
          .filter(Boolean)[0]
        || null
      );
    }

    const watchId =
      url.searchParams.get("v");

    if (watchId) {
      return watchId;
    }

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
      return parts[
        shortsIndex + 1
      ];
    }

    const embedIndex =
      parts.indexOf("embed");

    if (
      embedIndex !== -1 &&
      parts[embedIndex + 1]
    ) {
      return parts[
        embedIndex + 1
      ];
    }

    const liveIndex =
      parts.indexOf("live");

    if (
      liveIndex !== -1 &&
      parts[liveIndex + 1]
    ) {
      return parts[
        liveIndex + 1
      ];
    }
  }

  catch (error) {
    return null;
  }

  return null;
}



function getYoutubeThumbnail(
  value
) {
  const id =
    getYoutubeId(value);

  if (!id) {
    return (
      "data:image/svg+xml;charset=UTF-8,"
      +
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

  return (
    `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
  );
}



function handleThumbnailError(
  image,
  youtubeValue
) {
  const id =
    getYoutubeId(
      youtubeValue
    );

  if (!id) {
    return;
  }

  if (
    image.dataset
      .fallbackApplied ===
    "true"
  ) {
    return;
  }

  image.dataset
    .fallbackApplied =
    "true";

  image.src =
    `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}



function filteredVideos() {
  return videos.filter(
    video =>
      video.type ===
      currentFilter
  );
}



function createVideoCard(video) {
  const card =
    document.createElement(
      "article"
    );

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

  const thumbnail =
    getYoutubeThumbnail(
      video.youtube
    );

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

  const image =
    card.querySelector(
      ".video-thumb"
    );

  image?.addEventListener(
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
    () => {
      openVideo(video);
    }
  );

  return card;
}



function renderVideos() {
  if (!grid) {
    return;
  }

  const list =
    filteredVideos();

  const visible =
    page === "home"
      ?
      list
        .filter(
          video =>
            video.home === true
        )
        .slice(0,4)
      :
      list;

  grid.classList.toggle(
    "is-curto-grid",
    currentFilter === "curto"
  );

  grid.classList.toggle(
    "is-longo-grid",
    currentFilter === "longo"
  );

  grid.innerHTML =
    "";

  visible.forEach(
    video => {
      grid.appendChild(
        createVideoCard(video)
      );
    }
  );
}



function setFilter(filter) {
  currentFilter =
    filter;

  filterButtons.forEach(
    button => {
      button.classList.toggle(
        "active",
        button.dataset.filter ===
          filter
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



function getYoutubeEmbedUrl(
  value
) {
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



/* =========================================
   MÚSICA
========================================= */


function updateMusicButton() {
  if (!backgroundAudio) {
    return;
  }

  const symbol =
    backgroundAudio.paused
      ? "▶"
      : "❚❚";

  if (musicPlay) {
    musicPlay.textContent =
      symbol;
  }

  if (musicMiniPlay) {
    musicMiniPlay.textContent =
      symbol;
  }
}



function saveMusicState() {
  if (!backgroundAudio) {
    return;
  }

  localStorage.setItem(
    "babiMusicTrackV2",
    String(currentTrack)
  );

  localStorage.setItem(
    "babiMusicTimeV2",
    String(
      backgroundAudio
        .currentTime || 0
    )
  );

  localStorage.setItem(
    "babiMusicWantedV2",
    musicDesiredPlaying
      ? "true"
      : "false"
  );
}



function loadMusic(
  index,
  restoreTime = false
) {
  if (!backgroundAudio) {
    return;
  }

  currentTrack =
    (
      index +
      playlist.length
    ) %
    playlist.length;

  const track =
    playlist[currentTrack];

  backgroundAudio.pause();

  backgroundAudio.src =
    track.src;

  backgroundAudio.preload =
    "auto";

  if (musicCover) {
    musicCover.src =
      track.cover;
  }

  if (musicTitle) {
    musicTitle.textContent =
      track.title;
  }

  localStorage.setItem(
    "babiMusicTrackV2",
    String(currentTrack)
  );

  if (restoreTime) {

    const savedTime =
      parseFloat(
        localStorage.getItem(
          "babiMusicTimeV2"
        ) || "0"
      );

    backgroundAudio
      .addEventListener(
        "loadedmetadata",
        () => {

          if (
            savedTime > 0 &&
            savedTime <
              backgroundAudio
                .duration
          ) {
            backgroundAudio
              .currentTime =
              savedTime;
          }

        },
        {
          once: true
        }
      );

  }

  else {
    localStorage.setItem(
      "babiMusicTimeV2",
      "0"
    );
  }

  backgroundAudio.load();

  updateMusicButton();
}



async function playMusic() {
  if (!backgroundAudio) {
    return;
  }

  musicDesiredPlaying =
    true;

  localStorage.setItem(
    "babiMusicWantedV2",
    "true"
  );

  try {

    await backgroundAudio.play();

  }

  catch (error) {
  }

  updateMusicButton();
}



function pauseMusic() {
  if (!backgroundAudio) {
    return;
  }

  musicDesiredPlaying =
    false;

  localStorage.setItem(
    "babiMusicWantedV2",
    "false"
  );

  backgroundAudio.pause();

  updateMusicButton();
}



function nextMusic(
  forcePlay = false
) {
  const shouldPlay =
    forcePlay ||
    musicDesiredPlaying;

  loadMusic(
    currentTrack + 1,
    false
  );

  if (shouldPlay) {

    backgroundAudio
      ?.addEventListener(
        "canplay",
        () => {
          playMusic();
        },
        {
          once: true
        }
      );

  }
}



function previousMusic() {
  const shouldPlay =
    musicDesiredPlaying;

  loadMusic(
    currentTrack - 1,
    false
  );

  if (shouldPlay) {

    backgroundAudio
      ?.addEventListener(
        "canplay",
        () => {
          playMusic();
        },
        {
          once: true
        }
      );

  }
}



function toggleMusic() {
  if (!backgroundAudio) {
    return;
  }

  if (
    backgroundAudio.paused
  ) {
    playMusic();
  }

  else {
    pauseMusic();
  }
}



/* =========================================
   PLAYER GRANDE / MINI
========================================= */


function showMiniPlayer() {
  if (
    !musicPlayer ||
    !musicPlayerMini
  ) {
    return;
  }

  localStorage.setItem(
    "babiMusicMinimizedV2",
    "true"
  );

  musicPlayer.classList.add(
    "is-fading-out"
  );

  setTimeout(
    () => {

      musicPlayer.classList.add(
        "is-hidden"
      );

      musicPlayer.classList.remove(
        "is-fading-out"
      );

      musicPlayerMini
        .classList.remove(
          "is-hidden"
        );

      musicPlayerMini
        .classList.remove(
          "is-rising"
        );

      musicPlayerMini
        .classList.add(
          "is-dropping"
        );

      setTimeout(
        () => {
          musicPlayerMini
            .classList.remove(
              "is-dropping"
            );
        },
        350
      );

    },
    180
  );
}



function showMainPlayer() {
  if (
    !musicPlayer ||
    !musicPlayerMini
  ) {
    return;
  }

  localStorage.setItem(
    "babiMusicMinimizedV2",
    "false"
  );

  musicPlayerMini
    .classList.remove(
      "is-dropping"
    );

  musicPlayerMini
    .classList.add(
      "is-rising"
    );

  setTimeout(
    () => {

      musicPlayerMini
        .classList.add(
          "is-hidden"
        );

      musicPlayerMini
        .classList.remove(
          "is-rising"
        );

      musicPlayer
        .classList.remove(
          "is-hidden"
        );

      musicPlayer
        .classList.add(
          "is-fading-in"
        );

      setTimeout(
        () => {

          musicPlayer
            .classList.remove(
              "is-fading-in"
            );

        },
        300
      );

    },
    230
  );
}



musicPlay?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    event.stopPropagation();

    toggleMusic();

  }
);



musicMiniPlay
  ?.addEventListener(
    "click",
    event => {

      event.preventDefault();

      event.stopPropagation();

      toggleMusic();

    }
  );



musicNext?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    event.stopPropagation();

    nextMusic();

  }
);



musicMiniNext
  ?.addEventListener(
    "click",
    event => {

      event.preventDefault();

      event.stopPropagation();

      nextMusic();

    }
  );



musicPrev?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    event.stopPropagation();

    previousMusic();

  }
);



musicMiniPrev
  ?.addEventListener(
    "click",
    event => {

      event.preventDefault();

      event.stopPropagation();

      previousMusic();

    }
  );



musicClose?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    event.stopPropagation();

    showMiniPlayer();

  }
);



musicPlayerMini
  ?.addEventListener(
    "click",
    event => {

      if (
        event.target.closest(
          "button"
        )
      ) {
        return;
      }

      showMainPlayer();

    }
  );



backgroundAudio
  ?.addEventListener(
    "ended",
    () => {

      nextMusic(true);

    }
  );



backgroundAudio
  ?.addEventListener(
    "play",
    updateMusicButton
  );



backgroundAudio
  ?.addEventListener(
    "pause",
    updateMusicButton
  );



backgroundAudio
  ?.addEventListener(
    "timeupdate",
    saveMusicState
  );



/* =========================================
   VÍDEO
========================================= */


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
    return;
  }

  musicWasPlayingBeforeVideo =
    Boolean(
      backgroundAudio &&
      !backgroundAudio.paused
    );

  if (
    musicWasPlayingBeforeVideo &&
    backgroundAudio
  ) {
    backgroundAudio.pause();

    updateMusicButton();
  }

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



function closeVideo() {
  if (
    !modal ||
    !videoPlayer ||
    !modalInner
  ) {
    return;
  }

  videoPlayer.src =
    "";

  modalInner
    .classList.remove(
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

  if (
    musicWasPlayingBeforeVideo &&
    musicDesiredPlaying
  ) {
    playMusic();
  }

  musicWasPlayingBeforeVideo =
    false;
}



modalClose
  ?.addEventListener(
    "click",
    closeVideo
  );



modal
  ?.addEventListener(
    "click",
    event => {

      if (
        event.target === modal
      ) {
        closeVideo();
      }

    }
  );



document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      modal?.classList
        .contains("open")
    ) {
      closeVideo();
    }

  }
);



/* =========================================
   INICIAR MÚSICA
========================================= */


loadMusic(
  currentTrack,
  true
);



const isMinimized =
  localStorage.getItem(
    "babiMusicMinimizedV2"
  ) === "true";


if (isMinimized) {

  musicPlayer
    ?.classList.add(
      "is-hidden"
    );

  musicPlayerMini
    ?.classList.remove(
      "is-hidden"
    );

}

else {

  musicPlayer
    ?.classList.remove(
      "is-hidden"
    );

  musicPlayerMini
    ?.classList.add(
      "is-hidden"
    );

}



async function tryAutoplay() {
  if (
    !musicDesiredPlaying ||
    !backgroundAudio
  ) {
    return;
  }

  try {
    await backgroundAudio.play();
  }

  catch (error) {
  }

  updateMusicButton();
}



backgroundAudio
  ?.addEventListener(
    "canplay",
    () => {

      tryAutoplay();

    },
    {
      once: true
    }
  );



tryAutoplay();



async function unlockAudio() {
  if (
    !musicDesiredPlaying ||
    !backgroundAudio ||
    !backgroundAudio.paused
  ) {
    return;
  }

  try {

    await backgroundAudio.play();

    updateMusicButton();

    document
      .removeEventListener(
        "pointerdown",
        unlockAudio
      );

    document
      .removeEventListener(
        "keydown",
        unlockAudio
      );

  }

  catch (error) {
  }
}



document.addEventListener(
  "pointerdown",
  unlockAudio
);



document.addEventListener(
  "keydown",
  unlockAudio
);



window.addEventListener(
  "beforeunload",
  saveMusicState
);



renderVideos();
