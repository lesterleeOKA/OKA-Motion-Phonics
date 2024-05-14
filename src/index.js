import * as posedetection from '@tensorflow-models/pose-detection';
import Camera from './camera';
import { RendererCanvas2d } from './renderer';
import Util from './util';
import View from './view';
import State from './state';
import Sound from './sound';
import FPSMeter from 'fps-m';

let detector
let rafId;

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
    try {
      poses = await detector.estimatePoses(Camera.video, { maxPoses: 1, flipHorizontal: false });
      //console.log(poses[0]);
    } catch (error) {
      detector.dispose();
      detector = null;
      alert(error);
    }
  }

  View.renderer.draw([Camera.video, poses, false]);
}

async function renderPrediction() {
  if (!detector) await checkGuiUpdate();

  await renderResult();

  rafId = requestAnimationFrame(renderPrediction);
};

function init() {
  console.log('in init()');

  //因應iPad及手機browser的nav bar會扣掉高度，在這裡將hv用innerHiehgt重新計算
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);

  const clickHandler = ('ontouchstart' in document.documentElement ? "touchend" : "click");

  View.startBtn.addEventListener(clickHandler, () => {
    if (State.isSoundOn) Sound.play('btnClick');
    State.changeState('prepare');
  });

  View.exitBtn.addEventListener(clickHandler, () => {
    if (State.isSoundOn) Sound.play('btnClick');
    State.gamePauseData.state = State.state;
    State.gamePauseData.stateType = State.stateType;
    State.changeState('pause');
  });

  View.musicBtn.addEventListener(clickHandler, () => {
    if (State.isSoundOn) Sound.play('btnClick');
    toggleSound();
  });

  View.backHomeBtnOfFinished.addEventListener(clickHandler, () => {
    if (State.isSoundOn) Sound.play('btnClick');
    State.changeState('instruction');
  });

  View.playAgainBtn.addEventListener(clickHandler, () => {
    if (State.isSoundOn) {
      Sound.play('btnClick');
      Sound.play('bgm', true);
    }
    State.changeState('prepare');
  });

  View.backHomeBtnOfExit.addEventListener(clickHandler, () => {
    if (State.isSoundOn) Sound.play('btnClick');
    View.hideExit();
    State.changeState('instruction');
  });

  View.continuebtn.addEventListener(clickHandler, () => {
    if (State.isSoundOn) Sound.play('btnClick');
    View.hideExit();
    State.changeState(State.gamePauseData.state, State.gamePauseData.stateType);
  });

  return Promise.all([
    Sound.preloadAudios([
      ['bgm', require('./audio/bgm.mp3'), false, 0.5],
      ['btnClick', require('./audio/btnClick.wav')],
      ['countDown', require('./audio/countDown.wav')],
      ['instruction', require('./audio/instruction.mp3')],
      ['prepare', require('./audio/prepare.mp3')],
      ['start', require('./audio/start.mp3')],
      ['dontMove', require('./audio/dontMove.mp3')],
      ['finished', require('./audio/finished.mp3')],
      ['outBox', require('./audio/outBox.mp3')],
      ['poseValid', require('./audio/poseValid.mp3')],
      ['ansCorrect', require('./audio/ansCorrect.mp3')],
      ['ansWrong', require('./audio/ansWrong.mp3')],
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
      Camera.setup();
      (new FPSMeter({ ui: true })).start();
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
