let LEVEL_KEY = null;
let GAME_TIME = null;

function loadLevel() {
  const currentURL = window.location.href;
  if (currentURL.includes('?')) {
    // Split the URL by the ? character to get the search params
    const [, searchParams] = currentURL.split('?');

    // Split the search params by the & character to get key-value pairs
    const params = searchParams.split('&');

    // Find the "unit" parameter and get its value
    const unitParam = params.find(param => param.startsWith('unit='));
    const unitValue = unitParam ? unitParam.split('=')[1] : null;

    if (unitValue) {
      console.log(unitValue);
      LEVEL_KEY = unitValue.toString();
    }
  }

  var levelKey = LEVEL_KEY;
  console.log("current level", levelKey);
  return levelKey;
}

function loadGameTime() {
  const currentURL = window.location.href;
  if (currentURL.includes('?')) {
    // Split the URL by the ? character to get the search params
    const [, searchParams] = currentURL.split('?');
    const params = searchParams.split('&');

    const gameTimeParam = params.find(param => param.startsWith('gameTime='));
    const gameTimeValue = gameTimeParam ? gameTimeParam.split('=')[1] : null;

    if (gameTimeValue) {
      console.log(gameTimeValue);
      GAME_TIME = gameTimeValue.toString();
    }
  }

  var gameTime = GAME_TIME;
  console.log("game time", gameTime);
  return gameTime;
}

export { loadLevel, loadGameTime };
