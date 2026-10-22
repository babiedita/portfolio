(() => {
  const likeButton =
    document.getElementById('likeButton');

  const footer =
    document.getElementById('siteFooter');


  /* =========================================
     CURTIR x RODAPÉ
  ========================================= */

  const likeGap = 14;

  function updateLikePosition() {
    if (!likeButton || !footer) {
      return;
    }

    const footerTop =
      footer.getBoundingClientRect().top;

    const buttonStyle =
      window.getComputedStyle(
        likeButton
      );

    const baseBottom =
      Number.parseFloat(
        buttonStyle.bottom
      ) || 0;

    const normalButtonBottom =
      window.innerHeight -
      baseBottom;

    const lift =
      Math.max(
        0,
        normalButtonBottom -
        footerTop +
        likeGap
      );

    likeButton.style.translate =
      `0 -${lift}px`;
  }


  /* =========================================
     SCROLLBAR CUSTOM
  ========================================= */

  const root =
    document.documentElement;

  const thumb =
    document.createElement('div');

  thumb.className =
    'custom-scrollbar-thumb';

  thumb.setAttribute(
    'aria-hidden',
    'true'
  );

  document.body.appendChild(
    thumb
  );

  root.classList.add(
    'custom-scrollbar-active'
  );


  const TRACK_GAP = 6;
  const MIN_THUMB = 38;
  const MAX_THUMB = 150;

  const GREEN =
    '#6bbc0e';

  const WHITE =
    '#ffffff';


  let currentThumbTop = TRACK_GAP;
  let currentThumbHeight = MIN_THUMB;
  let currentTrackHeight = 1;
  let currentMaxScroll = 0;

  let isDragging = false;
  let dragOffsetY = 0;


  function documentHeight() {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );
  }


  function isGreenUnderPoint(
    x,
    y
  ) {
    const elements =
      document.elementsFromPoint(
        x,
        y
      );

    for (const element of elements) {
      if (
        element === thumb ||
        element.closest?.(
          '.custom-scrollbar-thumb'
        )
      ) {
        continue;
      }

      if (
        element.closest?.(
          '.site-footer-body'
        )
      ) {
        return true;
      }

      if (
        element.matches?.(
          '.site-footer-wave path'
        )
      ) {
        return true;
      }

      const computed =
        window.getComputedStyle(
          element
        );

      const background =
        computed.backgroundColor;

      const fill =
        computed.fill;

      if (
        background ===
          'rgb(107, 188, 14)' ||
        fill ===
          'rgb(107, 188, 14)'
      ) {
        return true;
      }
    }

    return false;
  }


  function makeAdaptiveGradient(
    top,
    height
  ) {
    const sampleStep = 3;

    const sampleCount =
      Math.max(
        2,
        Math.ceil(
          height /
          sampleStep
        )
      );

    const x =
      Math.max(
        0,
        window.innerWidth - 3
      );

    const states = [];

    for (
      let i = 0;
      i < sampleCount;
      i += 1
    ) {
      const progress =
        (
          i + 0.5
        ) /
        sampleCount;

      const y =
        Math.min(
          window.innerHeight - 1,
          Math.max(
            0,
            top +
            progress *
            height
          )
        );

      states.push(
        isGreenUnderPoint(
          x,
          y
        )
      );
    }

    const stops = [];

    let runStart = 0;
    let runState =
      states[0];

    for (
      let i = 1;
      i <= states.length;
      i += 1
    ) {
      const changed =
        i === states.length ||
        states[i] !== runState;

      if (!changed) {
        continue;
      }

      const startPercent =
        (
          runStart /
          states.length
        ) * 100;

      const endPercent =
        (
          i /
          states.length
        ) * 100;

      const color =
        runState
          ? WHITE
          : GREEN;

      stops.push(
        `${color} ${startPercent}%`,
        `${color} ${endPercent}%`
      );

      runStart = i;

      runState =
        states[i];
    }

    return (
      `linear-gradient(` +
      `to bottom, ` +
      stops.join(', ') +
      `)`
    );
  }


  function updateScrollbar() {
    const viewport =
      window.innerHeight;

    const pageHeight =
      documentHeight();

    const maxScroll =
      Math.max(
        0,
        pageHeight -
        viewport
      );

    currentMaxScroll =
      maxScroll;

    if (
      maxScroll <= 1
    ) {
      thumb.style.display =
        'none';

      return;
    }

    thumb.style.display =
      'block';

    const trackHeight =
      Math.max(
        1,
        viewport -
        TRACK_GAP * 2
      );

    currentTrackHeight =
      trackHeight;

    const proportionalHeight =
      (
        viewport /
        pageHeight
      ) *
      trackHeight;

    const thumbHeight =
      Math.min(
        MAX_THUMB,
        Math.max(
          MIN_THUMB,
          proportionalHeight
        )
      );

    currentThumbHeight =
      thumbHeight;

    const travel =
      Math.max(
        0,
        trackHeight -
        thumbHeight
      );

    const progress =
      Math.min(
        1,
        Math.max(
          0,
          window.scrollY /
          maxScroll
        )
      );

    const top =
      TRACK_GAP +
      progress *
      travel;

    currentThumbTop =
      top;

    thumb.style.top =
      `${top}px`;

    thumb.style.height =
      `${thumbHeight}px`;

    thumb.style.setProperty(
      '--thumb-bg',
      makeAdaptiveGradient(
        top,
        thumbHeight
      )
    );
  }


  /* =========================================
     ARRASTAR COM O MOUSE / TOQUE
  ========================================= */

  function scrollFromThumbTop(
    desiredTop
  ) {
    const travel =
      Math.max(
        1,
        currentTrackHeight -
        currentThumbHeight
      );

    const clampedTop =
      Math.min(
        TRACK_GAP + travel,
        Math.max(
          TRACK_GAP,
          desiredTop
        )
      );

    const progress =
      (
        clampedTop -
        TRACK_GAP
      ) /
      travel;

    window.scrollTo({
      top:
        progress *
        currentMaxScroll,

      behavior:
        'auto'
    });
  }


  thumb.addEventListener(
    'pointerdown',
    (event) => {
      if (
        currentMaxScroll <= 1
      ) {
        return;
      }

      isDragging = true;

      thumb.classList.add(
        'is-dragging'
      );

      dragOffsetY =
        event.clientY -
        currentThumbTop;

      thumb.setPointerCapture?.(
        event.pointerId
      );

      event.preventDefault();
    }
  );


  thumb.addEventListener(
    'pointermove',
    (event) => {
      if (!isDragging) {
        return;
      }

      scrollFromThumbTop(
        event.clientY -
        dragOffsetY
      );

      event.preventDefault();
    }
  );


  function stopDragging(
    event
  ) {
    if (!isDragging) {
      return;
    }

    isDragging = false;

    thumb.classList.remove(
      'is-dragging'
    );

    if (
      event?.pointerId !==
      undefined
    ) {
      try {
        thumb.releasePointerCapture?.(
          event.pointerId
        );
      } catch {
        /* sem problema */
      }
    }
  }


  thumb.addEventListener(
    'pointerup',
    stopDragging
  );

  thumb.addEventListener(
    'pointercancel',
    stopDragging
  );


  /* =========================================
     ATUALIZAÇÃO EM UM ÚNICO FRAME
  ========================================= */

  let ticking = false;

  function requestUpdate() {
    if (ticking) {
      return;
    }

    ticking = true;

    window.requestAnimationFrame(
      () => {
        ticking = false;

        updateLikePosition();
        updateScrollbar();
      }
    );
  }


  window.addEventListener(
    'scroll',
    requestUpdate,
    { passive: true }
  );

  window.addEventListener(
    'resize',
    requestUpdate
  );

  window.addEventListener(
    'load',
    requestUpdate
  );


  if (
    'ResizeObserver'
    in window
  ) {
    const resizeObserver =
      new ResizeObserver(
        requestUpdate
      );

    resizeObserver.observe(
      document.body
    );
  }


  requestUpdate();
})();
