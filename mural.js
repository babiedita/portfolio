/* =========================================
   MURAL — SUPABASE
========================================= */

const MURAL_SUPABASE_URL =
  'https://abmpcxryhuhzmhtuztwn.supabase.co';

const MURAL_SUPABASE_KEY =
  'sb_publishable_Y9IpZKOBWY2j0SNWlBFZ8A_0A2kUghI';


const muralClient =
  window.supabase.createClient(
    MURAL_SUPABASE_URL,
    MURAL_SUPABASE_KEY
  );


/* =========================================
   ELEMENTOS
========================================= */

const muralForm =
  document.getElementById(
    'muralForm'
  );

const muralNickname =
  document.getElementById(
    'muralNickname'
  );

const muralSubmitButton =
  document.getElementById(
    'muralSubmitButton'
  );

const muralSubmitImage =
  document.getElementById(
    'muralSubmitImage'
  );

const muralFeedback =
  document.getElementById(
    'muralFeedback'
  );

const nickWall =
  document.getElementById(
    'nickWall'
  );

const muralEmpty =
  document.getElementById(
    'muralEmpty'
  );

const muralHomeButton =
  document.getElementById(
    'muralHomeButton'
  );

const muralHomeImage =
  document.getElementById(
    'muralHomeImage'
  );


const muralInfoButton =
  document.getElementById(
    'muralInfoButton'
  );

const muralInfoImage =
  document.getElementById(
    'muralInfoImage'
  );

const muralInfoBackdrop =
  document.getElementById(
    'muralInfoBackdrop'
  );

const muralInfoClose =
  document.getElementById(
    'muralInfoClose'
  );


/* =========================================
   IMAGENS DOS BOTÕES
========================================= */

const ESTIVE_AQUI_IMAGES = {
  normal:
    'estive-aqui-1.png',

  pressed:
    'estive-aqui-2.png'
};


const HOME_IMAGES = {
  normal:
    'home-1.png',

  pressed:
    'home-2.png'
};


const INFO_IMAGES = {
  normal:
    'info-1.png',

  pressed:
    'info-2.png'
};


/* =========================================
   IDENTIFICADOR DO NAVEGADOR
========================================= */

const MURAL_DEVICE_KEY =
  'babiMuralDeviceIdV1';

const MURAL_SUBMITTED_KEY =
  'babiMuralSubmittedV1';

const MURAL_NICK_KEY =
  'babiMuralNicknameV1';


function getMuralDeviceId() {
  let deviceId =
    localStorage.getItem(
      MURAL_DEVICE_KEY
    );


  if (!deviceId) {

    if (
      window.crypto &&
      typeof window.crypto.randomUUID ===
        'function'
    ) {
      deviceId =
        window.crypto.randomUUID();
    }

    else {
      deviceId =
        '00000000-0000-4000-8000-' +
        Math.random()
          .toString(16)
          .slice(2)
          .padEnd(12, '0')
          .slice(0, 12);
    }


    localStorage.setItem(
      MURAL_DEVICE_KEY,
      deviceId
    );
  }


  return deviceId;
}


const muralDeviceId =
  getMuralDeviceId();


/* =========================================
   SANITIZAÇÃO LEVE
========================================= */

function normalizeNickname(value) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 24);
}


function looksLikeUrl(value) {
  return (
    /https?:\/\//i.test(value) ||
    /www\./i.test(value) ||
    /\.[a-z]{2,}(\/|$)/i.test(value)
  );
}


/* =========================================
   ESTILO ESTÁVEL DOS NICKS
========================================= */

function hashString(value) {
  let hash = 0;


  for (
    let i = 0;
    i < value.length;
    i += 1
  ) {
    hash =
      (
        (hash << 5) -
        hash +
        value.charCodeAt(i)
      ) |
      0;
  }


  return Math.abs(hash);
}


function createNickElement(record) {
  const element =
    document.createElement(
      'span'
    );


  element.className =
    'mural-nick';


  element.textContent =
    record.nickname;


  const seed =
    hashString(
      String(record.id) +
      record.nickname
    );


  element.dataset.nickSeed =
    String(seed);


  const rotation =
    (
      (seed % 11) -
      5
    ) * 0.7;


  const fontSize =
    17 +
    (
      (
        Math.floor(seed / 31)
      ) %
      8
    );


  element.style.setProperty(
    '--nick-rotate',
    `${rotation}deg`
  );


  element.style.setProperty(
    '--nick-size',
    `${fontSize}px`
  );


  return element;
}


/* =========================================
   POSICIONAR NICKS LIVREMENTE
========================================= */

function seededRandom(seed) {
  let state =
    seed || 1;


  return () => {
    state =
      (
        state *
        1664525 +
        1013904223
      ) >>> 0;


    return (
      state /
      4294967296
    );
  };
}


function rectanglesOverlap(
  a,
  b,
  padding = 26
) {
  return !(
    a.right + padding < b.left ||
    a.left > b.right + padding ||
    a.bottom + padding < b.top ||
    a.top > b.bottom + padding
  );
}


function layoutNickWall() {
  if (!nickWall) return;


  const elements =
    Array.from(
      nickWall.querySelectorAll(
        '.mural-nick'
      )
    );


  if (!elements.length) {
    return;
  }


  const wallWidth =
    nickWall.clientWidth;


  const baseHeight =
    Math.max(
      430,
      window.innerHeight -
        345
    );


  const densityRows =
    Math.max(
      1,
      Math.ceil(
        elements.length /
        10
      )
    );


  const desiredHeight =
    Math.max(
      baseHeight,
      390 +
        densityRows *
        120
    );


  nickWall.style.minHeight =
    `${desiredHeight}px`;


  const wallHeight =
    nickWall.clientHeight;


  const paddingX =
    window.innerWidth <= 700
      ? 10
      : 20;


  const paddingY =
    window.innerWidth <= 700
      ? 18
      : 24;


  const placed = [];


  elements.forEach(
    (element, index) => {
      const seed =
        Number(
          element.dataset.nickSeed
        ) ||
        index + 1;


      const random =
        seededRandom(
          seed +
          elements.length *
          97
        );


      const width =
        Math.ceil(
          element.offsetWidth
        );


      const height =
        Math.ceil(
          element.offsetHeight
        );


      const maxX =
        Math.max(
          paddingX,
          wallWidth -
            width -
            paddingX
        );


      const maxY =
        Math.max(
          paddingY,
          wallHeight -
            height -
            paddingY
        );


      let chosen = null;
      let best = null;
      let bestDistance = -1;


      for (
        let attempt = 0;
        attempt < 140;
        attempt += 1
      ) {
        const x =
          paddingX +
          random() *
          Math.max(
            0,
            maxX -
              paddingX
          );


        const y =
          paddingY +
          random() *
          Math.max(
            0,
            maxY -
              paddingY
          );


        const candidate = {
          left: x,
          top: y,
          right: x + width,
          bottom: y + height
        };


        const collides =
          placed.some(
            box =>
              rectanglesOverlap(
                candidate,
                box,
                window.innerWidth <= 700
                  ? 16
                  : 24
              )
          );


        if (!collides) {
          chosen = candidate;
          break;
        }


        let minDistance =
          Infinity;


        placed.forEach(
          box => {
            const centerX =
              candidate.left +
              width / 2;


            const centerY =
              candidate.top +
              height / 2;


            const otherCenterX =
              (
                box.left +
                box.right
              ) / 2;


            const otherCenterY =
              (
                box.top +
                box.bottom
              ) / 2;


            const distance =
              Math.hypot(
                centerX -
                  otherCenterX,
                centerY -
                  otherCenterY
              );


            minDistance =
              Math.min(
                minDistance,
                distance
              );
          }
        );


        if (
          minDistance >
          bestDistance
        ) {
          bestDistance =
            minDistance;

          best = candidate;
        }
      }


      const position =
        chosen ||
        best || {
          left: paddingX,
          top: paddingY,
          right:
            paddingX +
            width,
          bottom:
            paddingY +
            height
        };


      placed.push(position);


      element.style.left =
        `${position.left}px`;


      element.style.top =
        `${position.top}px`;
    }
  );
}


let nickLayoutTimer = null;


window.addEventListener(
  'resize',
  () => {
    window.clearTimeout(
      nickLayoutTimer
    );


    nickLayoutTimer =
      window.setTimeout(
        layoutNickWall,
        120
      );
  }
);


/* =========================================
   CARREGAR MURAL
========================================= */

async function loadMuralNicks() {

  if (!nickWall) return;


  const {
    data,
    error
  } =
    await muralClient
      .from('mural_nicks')
      .select(
        'id,nickname,created_at'
      )
      .order(
        'created_at',
        {
          ascending: true
        }
      );


  if (error) {
    console.error(
      'Erro ao carregar mural:',
      error
    );


    if (muralFeedback) {
      muralFeedback.textContent =
        'não consegui carregar o mural agora :(';
    }


    return;
  }


  nickWall
    .querySelectorAll(
      '.mural-nick'
    )
    .forEach(
      item =>
        item.remove()
    );


  if (
    !data ||
    data.length === 0
  ) {
    muralEmpty?.removeAttribute(
      'hidden'
    );

    return;
  }


  if (muralEmpty) {
    muralEmpty.hidden =
      true;
  }


  data.forEach(
    record => {
      nickWall.appendChild(
        createNickElement(record)
      );
    }
  );


  window.requestAnimationFrame(
    layoutNickWall
  );
}


/* =========================================
   BLOQUEAR DEPOIS DE ENVIAR
========================================= */

function setMuralAlreadySubmitted() {
  if (
    !muralNickname ||
    !muralSubmitButton
  ) {
    return;
  }


  const savedNick =
    localStorage.getItem(
      MURAL_NICK_KEY
    );


  muralNickname.disabled =
    true;


  muralNickname.value =
    savedNick || '';


  muralNickname.placeholder =
    'você já deixou sua marca por aqui :)';


  muralSubmitButton.disabled =
    true;


  if (muralFeedback) {
    muralFeedback.textContent =
      'sua marquinha já ficou salva ♡';
  }
}


if (
  localStorage.getItem(
    MURAL_SUBMITTED_KEY
  ) === 'true'
) {
  setMuralAlreadySubmitted();
}


/* =========================================
   ENVIAR NICK
========================================= */

muralForm?.addEventListener(
  'submit',
  async event => {

    event.preventDefault();


    if (
      !muralNickname ||
      !muralSubmitButton
    ) {
      return;
    }


    if (
      localStorage.getItem(
        MURAL_SUBMITTED_KEY
      ) === 'true'
    ) {
      setMuralAlreadySubmitted();

      return;
    }


    const nickname =
      normalizeNickname(
        muralNickname.value
      );


    if (
      nickname.length < 2
    ) {
      if (muralFeedback) {
        muralFeedback.textContent =
          'coloca pelo menos 2 caracteres :)';
      }

      return;
    }


    if (
      looksLikeUrl(nickname)
    ) {
      if (muralFeedback) {
        muralFeedback.textContent =
          'sem links por aqui, só nome ou nick :)';
      }

      return;
    }


    muralSubmitButton.disabled =
      true;


    if (muralFeedback) {
      muralFeedback.textContent =
        'deixando sua marca...';
    }


    const {
      data,
      error
    } =
      await muralClient
        .from('mural_nicks')
        .insert({
          nickname,
          device_id:
            muralDeviceId
        })
        .select(
          'id,nickname,created_at'
        )
        .single();


    if (error) {

      console.error(
        'Erro ao enviar nick:',
        error
      );


      /*
        23505 = unique violation.
        Significa que esse device_id
        já deixou um nick antes.
      */

      if (
        error.code === '23505'
      ) {
        localStorage.setItem(
          MURAL_SUBMITTED_KEY,
          'true'
        );


        localStorage.setItem(
          MURAL_NICK_KEY,
          nickname
        );


        setMuralAlreadySubmitted();

        return;
      }


      muralSubmitButton.disabled =
        false;


      if (muralFeedback) {
        muralFeedback.textContent =
          'não consegui salvar agora. tenta de novo daqui a pouquinho :(';
      }


      return;
    }


    localStorage.setItem(
      MURAL_SUBMITTED_KEY,
      'true'
    );


    localStorage.setItem(
      MURAL_NICK_KEY,
      nickname
    );


    if (muralEmpty) {
      muralEmpty.hidden =
        true;
    }


    if (
      nickWall &&
      data
    ) {
      const newNick =
        createNickElement(data);


      newNick.classList.add(
        'is-new'
      );


      nickWall.appendChild(
        newNick
      );


      window.requestAnimationFrame(
        layoutNickWall
      );
    }


    setMuralAlreadySubmitted();

  }
);


/* =========================================
   MECÂNICA BOTÃO ESTIVE AQUI
========================================= */

function setSubmitPressed(
  pressed
) {
  if (
    !muralSubmitButton ||
    !muralSubmitImage ||
    muralSubmitButton.disabled
  ) {
    return;
  }


  muralSubmitButton.classList.toggle(
    'is-pressing',
    pressed
  );


  muralSubmitImage.src =
    pressed
      ? ESTIVE_AQUI_IMAGES.pressed
      : ESTIVE_AQUI_IMAGES.normal;
}


muralSubmitButton?.addEventListener(
  'pointerdown',
  () => {
    setSubmitPressed(true);
  }
);


muralSubmitButton?.addEventListener(
  'pointerup',
  () => {
    setSubmitPressed(false);
  }
);


muralSubmitButton?.addEventListener(
  'pointerleave',
  () => {
    setSubmitPressed(false);
  }
);


muralSubmitButton?.addEventListener(
  'pointercancel',
  () => {
    setSubmitPressed(false);
  }
);


/* =========================================
   MECÂNICA BOTÃO HOME
========================================= */

function setHomePressed(
  pressed
) {
  if (
    !muralHomeButton ||
    !muralHomeImage
  ) {
    return;
  }


  muralHomeButton.classList.toggle(
    'is-pressing',
    pressed
  );


  muralHomeImage.src =
    pressed
      ? HOME_IMAGES.pressed
      : HOME_IMAGES.normal;
}


muralHomeButton?.addEventListener(
  'pointerdown',
  () => {
    setHomePressed(true);
  }
);


muralHomeButton?.addEventListener(
  'pointerup',
  () => {
    setHomePressed(false);
  }
);


muralHomeButton?.addEventListener(
  'pointerleave',
  () => {
    setHomePressed(false);
  }
);


muralHomeButton?.addEventListener(
  'pointercancel',
  () => {
    setHomePressed(false);
  }
);


muralHomeButton?.addEventListener(
  'click',
  () => {
    window.location.href =
      'index.html';
  }
);


/* =========================================
   MECÂNICA BOTÃO INFO
========================================= */

function setInfoPressed(
  pressed
) {
  if (
    !muralInfoButton ||
    !muralInfoImage
  ) {
    return;
  }


  muralInfoButton.classList.toggle(
    'is-pressing',
    pressed
  );


  muralInfoImage.src =
    pressed
      ? INFO_IMAGES.pressed
      : INFO_IMAGES.normal;
}


function openMuralInfo() {
  if (
    !muralInfoBackdrop ||
    !muralInfoButton
  ) {
    return;
  }


  muralInfoBackdrop.classList.add(
    'is-open'
  );


  muralInfoBackdrop.setAttribute(
    'aria-hidden',
    'false'
  );


  muralInfoButton.setAttribute(
    'aria-expanded',
    'true'
  );
}


function closeMuralInfo() {
  if (
    !muralInfoBackdrop ||
    !muralInfoButton
  ) {
    return;
  }


  muralInfoBackdrop.classList.remove(
    'is-open'
  );


  muralInfoBackdrop.setAttribute(
    'aria-hidden',
    'true'
  );


  muralInfoButton.setAttribute(
    'aria-expanded',
    'false'
  );
}


muralInfoButton?.addEventListener(
  'pointerdown',
  () => {
    setInfoPressed(true);
  }
);


muralInfoButton?.addEventListener(
  'pointerup',
  () => {
    setInfoPressed(false);
  }
);


muralInfoButton?.addEventListener(
  'pointerleave',
  () => {
    setInfoPressed(false);
  }
);


muralInfoButton?.addEventListener(
  'pointercancel',
  () => {
    setInfoPressed(false);
  }
);


muralInfoButton?.addEventListener(
  'click',
  openMuralInfo
);


muralInfoClose?.addEventListener(
  'click',
  closeMuralInfo
);


muralInfoBackdrop?.addEventListener(
  'click',
  event => {

    if (
      event.target ===
      muralInfoBackdrop
    ) {
      closeMuralInfo();
    }

  }
);


document.addEventListener(
  'keydown',
  event => {

    if (
      event.key === 'Escape'
    ) {
      closeMuralInfo();
    }

  }
);


/* =========================================
   INICIAR
========================================= */

loadMuralNicks();
