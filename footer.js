(() => {
  const likeButton =
    document.getElementById('likeButton');

  const footer =
    document.getElementById('siteFooter');

  if (!likeButton || !footer) {
    return;
  }

  const gap = 14;

  let ticking = false;

  function updateLikePosition() {
    ticking = false;

    const footerTop =
      footer.getBoundingClientRect().top;

    const buttonStyle =
      window.getComputedStyle(likeButton);

    const baseBottom =
      Number.parseFloat(buttonStyle.bottom) || 0;

    const normalButtonBottom =
      window.innerHeight - baseBottom;

    const lift =
      Math.max(
        0,
        normalButtonBottom - footerTop + gap
      );

    likeButton.style.translate =
      `0 -${lift}px`;
  }

  function requestUpdate() {
    if (ticking) {
      return;
    }

    ticking = true;

    window.requestAnimationFrame(
      updateLikePosition
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

  requestUpdate();
})();
