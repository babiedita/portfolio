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


  const rotation =
    (
      (seed % 9) -
      4
    ) * 0.8;


  const offsetY =
    (
      (
        Math.floor(seed / 11)
      ) %
      19
    ) -
    9;


  const fontSize =
    18 +
    (
      (
        Math.floor(seed / 29)
      ) %
      9
    );


  element.style.setProperty(
    '--nick-rotate',
    `${rotation}deg`
  );


  element.style.setProperty(
    '--nick-y',
    `${offsetY}px`
  );


  element.style.setProperty(
    '--nick-size',
    `${fontSize}px`
  );


  return element;
}


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
