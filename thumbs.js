(() => {
  const compare =
    document.getElementById(
      'thumbCompare'
    );

  const range =
    document.getElementById(
      'thumbCompareRange'
    );

  if (!compare || !range) {
    return;
  }

  function updateCompare() {
    compare.style.setProperty(
      '--split',
      `${range.value}%`
    );
  }

  range.addEventListener(
    'input',
    updateCompare
  );

  range.addEventListener(
    'change',
    updateCompare
  );

  updateCompare();
})();
