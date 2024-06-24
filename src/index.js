import * as posedetection from '@tensorflow-models/pose-detection';
import Camera from './camera';
import { RendererCanvas2d } from './renderer';
import Util from './util';
import View from './view';
import State from './state';
import Sound from './sound';
import { setupStats } from './stats_panel';
import QuestionManager from './question';

let detector
let rafId;
let stats;
let startInferenceTime, numInferences = 0;
let inferenceTimeSum = 0, lastPanelUpdate = 0;

async function createDetector() {
  const runtime = 'mediapipe';
  return posedetection.createDetector(posedetection.SupportedModels.BlazePose, {
    runtime,
    modelType: 'lite',
    solutionPath: `@mediapipe/pose@0.5.1675469404`,
    //solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`
  });
}

/*async function createDetector() {
  let modelType = posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING;
  const modelConfig = { modelType };
  return await posedetection.createDetector(posedetection.SupportedModels.MoveNet, modelConfig);
}
*/
/*async function createDetector() {
  const modelConfig = {
    quantBytes: 4,
    architecture: 'MobileNetV1',
    outputStride: 16,
    inputResolution: { width: 250, height: 250 },
    multiplier: 0.75
  };
  return await posedetection.createDetector(posedetection.SupportedModels.PoseNet, modelConfig);
}*/


async function checkGuiUpdate() {
  window.cancelAnimationFrame(rafId);

  if (detector != null) {
    detector.dispose();
  }

  try {
    detector = await createDetector();
  } catch (error) {
    detector = null;
    alert(error);
  }

}

async function renderResult() {
  if (Camera.video.readyState < 2) {
    await new Promise((resolve) => {
      Camera.video.onloadeddata = () => {
        resolve(video);
      };
    });
  }

  let poses = null;

  // Detector can be null if initialization failed (for example when loading
  // from a URL that does not exist).
  if (detector != null) {
    //beginEstimatePosesStats();
    try {
      poses = await detector.estimatePoses(Camera.video, { maxPoses: 1, flipHorizontal: false });
      //console.log(poses[0]);
    } catch (error) {
      detector.dispose();
      detector = null;
      alert(error);
    }

    //endEstimatePosesStats();
  }

  View.renderer.draw([Camera.video, poses, false]);
}

function beginEstimatePosesStats() {
  startInferenceTime = (performance || Date).now();
}

function endEstimatePosesStats() {
  const endInferenceTime = (performance || Date).now();
  inferenceTimeSum += endInferenceTime - startInferenceTime;
  ++numInferences;

  const panelUpdateMilliseconds = 1000;
  if (endInferenceTime - lastPanelUpdate >= panelUpdateMilliseconds) {
    const averageInferenceTime = inferenceTimeSum / numInferences;
    inferenceTimeSum = 0;
    numInferences = 0;
    stats.customFpsPanel.update(
      1000.0 / averageInferenceTime, 120 /* maxValue */);
    lastPanelUpdate = endInferenceTime;
  }
}

async function renderPrediction() {
  if (!detector) await checkGuiUpdate();

  await renderResult();

  rafId = requestAnimationFrame(renderPrediction);
};

function init() {
  console.log('in init()');
  Sound.init();
  View.preloadUsedImages();
  QuestionManager.loadQuestionData();
  //因應iPad及手機browser的nav bar會扣掉高度，在這裡將hv用innerHiehgt重新計算
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);

  //  const clickHandler = ('ontouchstart' in document.documentElement ? "touchend" : "click");
  const clickHandler = 'click';

  function handleButtonClick(e) {
    if (State.isSoundOn) Sound.play('btnClick');
    switch (e.currentTarget) {
      case View.startBtn:
        if (State.isSoundOn) {
          Sound.play('btnClick');
        }
        State.changeState('prepare');
        break;
      case View.exitBtn:
        if (State.isSoundOn) {
          Sound.play('btnClick');
        }
        State.gamePauseData.state = State.state;
        State.gamePauseData.stateType = State.stateType;
        //State.changeState('pause');
        setTimeout(() => {
          State.changeState('leave');
        }, 100);
        break;
      case View.musicBtn:
        if (State.isSoundOn) {
          Sound.play('btnClick');
        }
        State.gamePauseData.state = State.state;
        State.gamePauseData.stateType = State.stateType;
        State.changeState('showMusicOnOff');
        //toggleSound();
        break;
      case View.instructionBtn:
        if (State.isSoundOn) {
          Sound.play('btnClick');
        }
        break;
      case View.backHomeBtnOfFinished:
        if (State.isSoundOn) {
          Sound.play('btnClick');
        }
        State.state = '';
        setTimeout(() => {
          State.changeState('leave');
        }, 200);
        break;
      case View.playAgainBtn:
        if (State.isSoundOn) {
          Sound.play('btnClick');
          Sound.play('bgm', true);
        }
        State.state = '';
        State.changeState('prepare');
        break;
      case View.backHomeBtnOfExit:
        if (State.isSoundOn) {
          Sound.play('btnClick');
        }
        View.hideExit();
        State.state = '';
        setTimeout(() => {
          State.changeState('leave');
        }, 200);
        break;
      case View.continuebtn:
        if (State.isSoundOn) {
          Sound.play('btnClick');
        }
        View.hideExit();
        State.changeState(State.gamePauseData.state, State.gamePauseData.stateType);
        break;
      case View.offBtn:
        if (State.isSoundOn) {
          Sound.play('btnClick');
        }
        View.hideMusicOnOff();
        State.changeState(State.gamePauseData.state, State.gamePauseData.stateType);
        State.setSound(false);
        break;
      case View.onBtn:
        if (State.isSoundOn) {
          Sound.play('btnClick');
        }
        View.hideMusicOnOff();
        State.changeState(State.gamePauseData.state, State.gamePauseData.stateType);
        State.setSound(true);
        break;
    }
  }

  function handleButtonTouch(e) {
    switch (e.currentTarget) {
      case View.startBtn:
        View.startBtn.classList.add('touched');
        break;
      case View.exitBtn:
        View.exitBtn.classList.add('touched');
        break;
      case View.musicBtn:
        View.musicBtn.classList.add('touched');
        break;
      case View.onBtn:
        View.onBtn.classList.add('touched')
        break;
      case View.offBtn:
        View.offBtn.classList.add('touched')
        break;
      case View.backHomeBtnOfFinished:
        View.backHomeBtnOfFinished.classList.add('touched');
        break;
      case View.playAgainBtn:
        View.playAgainBtn.classList.add('touched');
        break;
    }
  }

  function handleButtonTouchLeave(e) {
    switch (e.currentTarget) {
      case View.startBtn:
        View.startBtn.classList.remove('touched');
        break;
      case View.exitBtn:
        View.exitBtn.classList.remove('touched');
        break;
      case View.musicBtn:
        View.musicBtn.classList.remove('touched');
        break;
      case View.onBtn:
        View.onBtn.classList.remove('touched');
        break;
      case View.offBtn:
        View.offBtn.classList.remove('touched');
        break;
      case View.backHomeBtnOfFinished:
        View.backHomeBtnOfFinished.classList.remove('touched');
        break;
      case View.playAgainBtn:
        View.playAgainBtn.classList.remove('touched');
        break;
    }
  }

  View.startBtn.addEventListener('pointerdown', handleButtonTouch);
  View.exitBtn.addEventListener('pointerdown', handleButtonTouch);
  View.musicBtn.addEventListener('pointerdown', handleButtonTouch);
  View.backHomeBtnOfFinished.addEventListener('pointerdown', handleButtonTouch);
  View.playAgainBtn.addEventListener('pointerdown', handleButtonTouch);
  View.onBtn.addEventListener('pointerdown', handleButtonTouch);
  View.offBtn.addEventListener('pointerdown', handleButtonTouch);

  View.startBtn.addEventListener('pointerup', handleButtonTouchLeave);
  View.exitBtn.addEventListener('pointerup', handleButtonTouchLeave);
  View.musicBtn.addEventListener('pointerup', handleButtonTouchLeave);
  View.backHomeBtnOfFinished.addEventListener('pointerup', handleButtonTouchLeave);
  View.playAgainBtn.addEventListener('pointerup', handleButtonTouchLeave);
  View.onBtn.addEventListener('pointerup', handleButtonTouchLeave);
  View.offBtn.addEventListener('pointerup', handleButtonTouchLeave);

  // Attach the click/touchend event listeners to the buttons
  View.startBtn.addEventListener(clickHandler, handleButtonClick);
  View.exitBtn.addEventListener(clickHandler, handleButtonClick);
  View.musicBtn.addEventListener(clickHandler, handleButtonClick);
  //View.instructionBtn.addEventListener(clickHandler, handleButtonClick);
  View.backHomeBtnOfFinished.addEventListener(clickHandler, handleButtonClick);
  View.playAgainBtn.addEventListener(clickHandler, handleButtonClick);
  View.backHomeBtnOfExit.addEventListener(clickHandler, handleButtonClick);
  View.continuebtn.addEventListener(clickHandler, handleButtonClick);
  View.offBtn.addEventListener(clickHandler, handleButtonClick);
  View.onBtn.addEventListener(clickHandler, handleButtonClick);

  return Promise.all([
    Sound.preloadAudios([
      ['bgm', require('./audio/bgm.mp3'), false, 0.5],
      ['btnClick', require('./audio/btnClick.wav')],
      ['countDown', require('./audio/countDown.mp3')],
      /*['instruction', require('./audio/instruction.mp3')],*/
      ['prepare', require('./audio/prepare.mp3')],
      ['start', require('./audio/start.mp3')],
      /*['dontMove', require('./audio/dontMove.mp3')],*/
      /*['finished', require('./audio/finished.mp3')],*/
      ['passGame', require('./audio/passgame.mp3')],
      ['failGame', require('./audio/failgame.mp3')],
      ['outBox', require('./audio/outBox.mp3')],
      ['poseValid', require('./audio/poseValid.mp3')],
      ['ansCorrect', require('./audio/ansCorrect.mp3')],
      ['ansWrong', require('./audio/ansWrong.mp3')],
      ['lastTen', require('./audio/dingding.wav')],
    ]),
    Camera.getVideo()
  ]);
}


async function app() {
  //console.log('in app()');
  if (location.protocol !== 'https:') {
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
  }

  init().then(() => {
    Util.loadingStart();
    setTimeout(() => {
      stats = setupStats();
      Camera.setup();
      //(new FPSMeter({ ui: true })).start();
      createDetector().then((detector) => {

        //console.log(detector);
        //const canvas = document.getElementById('output');
        View.renderer = new RendererCanvas2d(View.canvas);

        renderPrediction().then(() => {
          Util.loadingComplete().then(() => {
            State.changeState('instruction');
          });
        })
      });
    }, 2000);
  });

  /* init().then(() => {
     Util.loadingStart();
     setTimeout(async () => {
       (new FPSMeter({ ui: true })).start();
       await Camera.setup();
       await tf.setBackend('wasm');
       await tf.ready();

       await createDetector().then((detector) => {
         console.log(detector);
         //var poses = detector.estimatePoses(Camera.video);
         //console.log(poses[0]);
         //const canvas = document.getElementById('output');
         //View.renderer = new RendererCanvas2d(View.canvas);

         renderPrediction().then(() => {
           Util.loadingComplete().then(() => {
             State.changeState('instruction');
           });
         })
       });
       //const poses = await detector.estimatePoses(Camera.video);
       //console.log(poses[0]);
       //const canvas = document.getElementById('output');
       View.renderer = new RendererCanvas2d(View.canvas);

       await renderPrediction(detector);

       Util.loadingComplete().then(() => {
         State.changeState('instruction');
       });
     }, 2000);
   });*/
};

//-------------------------------------------------------------------------------------------------
function toggleSound() {
  State.isSoundOn = !State.isSoundOn;
  //console.log('State.isSoundOn: ' + State.isSoundOn);
  if (State.isSoundOn) {
    View.musicBtn.classList.add('on');
    View.musicBtn.classList.remove('off');
    Sound.play('bgm', true);
  } else {
    View.musicBtn.classList.remove('on');
    View.musicBtn.classList.add('off');
    Sound.stopAll();
  }
}

//-------------------------------------------------------------------------------------------------
app();
//-------------------------------------------------------------------------------------------------
