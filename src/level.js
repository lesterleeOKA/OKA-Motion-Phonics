function parseUrlParams() {
  const currentURL = window.location.href;
  if (currentURL.includes('?')) {
    // Split the URL by the ? character to get the search params
    const [, searchParams] = currentURL.split('?');
    const params = searchParams.split('&');

    // Extract the required parameters
    const levelParam = params.find(param => param.startsWith('unit='));
    const levelValue = levelParam ? levelParam.split('=')[1] : null;
    console.log("level:", levelValue);
    const gameTimeParam = params.find(param => param.startsWith('gameTime='));
    const gameTimeValue = gameTimeParam ? gameTimeParam.split('=')[1] : null;
    console.log("game Time:", gameTimeValue);
    const removalParam = params.find(param => param.startsWith('removal='));
    const removalValue = removalParam ? removalParam.split('=')[1] : null;
    console.log("removal:", removalValue);
    const modelParam = params.find(param => param.startsWith('model='));
    const modelValue = modelParam ? modelParam.split('=')[1] : null;
    console.log("modelValue:", modelValue);
    const fpsParam = params.find(param => param.startsWith('fps='));
    const fpsValue = fpsParam ? fpsParam.split('=')[1] : null;
    console.log("fpsValue:", fpsValue);

    return {
      levelKey: levelValue,
      gameTime: gameTimeValue,
      removal: removalValue !== null ? removalValue : 0,
      fps: fpsValue !== null ? fpsValue : 0,
      model: modelValue,
    };
  }

  return {
    levelKey: null,
    gameTime: null,
    removal: 0,
    fps: 0,
    model: null,
  };
}

export { parseUrlParams };
