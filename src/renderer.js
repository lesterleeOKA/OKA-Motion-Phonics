import * as posedetection from '@tensorflow-models/pose-detection';
import State from './state';
import Sound from './sound';
import Camera from './camera';
import Game from './phonics';
import { stat } from 'fs';


export class RendererCanvas2d {
  constructor(canvas) {
    this.ctx = canvas.getContext('2d');
    this.videoWidth = canvas.width;
    this.videoHeight = canvas.height;
    this.lastPoseValidValue = false;
    this.modelType = posedetection.SupportedModels.BlazePose;
    this.scoreThreshold = 0.75;
    this.center_shoulder = null;
    this.rightLoadingValue = 0;
    this.leftLoadingValue = 0;
  }

  draw(rendererParams) {
    const [video, poses, isModelChanged, bodySegmentationCanvas] = rendererParams;
    this.videoWidth = video.width;
    this.videoHeight = video.height;
    this.ctx.canvas.width = this.videoWidth;
    this.ctx.canvas.height = this.videoHeight;

    this.redBoxX = this.videoWidth / 3;
    this.redBoxY = this.videoHeight / 5 * 1;
    this.redBoxWidth = this.videoWidth / 3;
    this.redBoxHeight = this.videoHeight / 5 * 4;

    this.drawCtx(video, bodySegmentationCanvas);
    if (['prepare', 'counting3', 'counting2', 'counting1', 'counting0', 'playing', 'outBox'].includes(State.state)) {
      let isCurPoseValid = false;
      if (poses && poses.length > 0 && !isModelChanged) {
        this.drawResults(poses, video.width / video.videoWidth);
        //this.isPoseValid(poses, video.width / video.videoWidth);
        isCurPoseValid = this.isPoseValid(poses, video.width / video.videoWidth);
        if (isCurPoseValid && State.bodyInsideRedBox.value == true) {
          if (State.state == 'prepare' && State.getStateLastFor() > 3500) {
            State.changeState('counting3');
          } else if (State.state == 'counting3' && State.getStateLastFor() > 1000) {
            State.changeState('counting2');
          } else if (State.state == 'counting2' && State.getStateLastFor() > 1000) {
            State.changeState('counting1');
          } else if (State.state == 'counting1' && State.getStateLastFor() > 1000) {
            State.changeState('counting0');
          } else if (State.state == 'counting0' && State.getStateLastFor() > 1000) {
            State.changeState('playing', 'showStage');
          } else if (State.state == 'playing') {

            if (State.stageType == 'showStage' && State.getStateLastFor() > 1000) {
              //State.changeState('playing', 'showQstImg');
            } else if (State.stateType == 'waitAns') {
              if (State.selectedImg.value && State.selectedImg.lastFor > 1000) {
                //1秒掂到就得，唔駛倒數
                //State.changeState('playing', Game.checkAnswer() ? 'ansCorrect' : 'ansWrong');
                //State.changeState('playing', 'touched1');
              }
            } else if (State.stateType == 'touched1') {
              if (State.selectedImg.value && State.selectedImg.lastFor > 2000) {
                State.changeState('playing', 'touched2');
              } else if (!State.selectedImg.value) {
                State.changeState('playing', 'waitAns');
              }
            } else if (State.stateType == 'touched2') {
              if (State.selectedImg.value && State.selectedImg.lastFor > 3000) {
                //let isCorrect = Game.checkAnswer();
                // State.changeState('playing', isCorrect ? 'ansCorrect' : 'ansWrong');
              } else if (!State.selectedImg.value) {
                State.changeState('playing', 'waitAns');
              }
            }
          } else if (State.state == 'outBox' && State.bodyInsideRedBox.lastFor > 2000) {
            State.changeState('playing', 'waitAns');
          }
        }
      }

      this.drawBox(isCurPoseValid);
    }
  }

  isPoseValid(poses) {
    if (!poses[0]) return false;
    let pose = poses[0];
    let passScore = this.scoreThreshold;
    let isBodyOutBox;

    if (pose.keypoints != null) {
      //我建議膊頭兩點，腰兩點，膝頭兩點，手肘兩點，手腕兩點入框就可以玩
      //nose, left_eye_inner, left_eye, left_eye_outer, right_eye_inner, right_eye, right_eye_outer, left_ear, right_ear, mouth_left, mouth_right, left_shoulder, right_shoulder, left_elbow, right_elbow, left_wrist, right_wrist, left_pinky, right_pinky, left_index, right_index, left_thumb, right_thumb, left_hip, right_hip, left_knee, right_knee, left_ankle, right_ankle, left_heel, right_heel, left_foot_index, right_foot_index
      //let checkKeypoints = pose.keypoints.filter(k=>['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee'].includes(k.name) && k.score>0.65);
      /*let checkKeypoints = pose.keypoints.filter(k => k.name == 'nose' && k.score > passScore);
      let isBodyOutBox = (
        checkKeypoints.find(keypoint => (
          keypoint.x < this.redBoxX ||
          keypoint.x > (this.redBoxX + this.redBoxWidth) ||
          keypoint.y < this.redBoxY ||
          keypoint.y > (this.redBoxY + this.redBoxHeight)
        )) ? true : false
      );*/

      if (this.center_shoulder) {
        isBodyOutBox = ((this.center_shoulder.x < this.redBoxX ||
          this.center_shoulder.x > (this.redBoxX + this.redBoxWidth) ||
          this.center_shoulder.y < this.redBoxX ||
          this.center_shoulder.y > (this.redBoxY + this.redBoxHeight)) ? true : false);
      }
      else {
        isBodyOutBox = false;
      }

      State.setPoseState('bodyInsideRedBox', !isBodyOutBox);
      if (isBodyOutBox) {
        if (State.state == 'playing')
          State.changeState('outBox', 'outBox');
        //console.log('outBox', 'outBox');
        return false;
      }

      let resetBtn = document.querySelector('.resetBtn');


      //檢查是否有選到圖
      let optionWrappers = document.querySelectorAll('.canvasWrapper > .optionArea > .optionWrapper.show');

      if (State.state == 'playing' && ['waitAns'].includes(State.stateType)) {

        //console.log(pose.keypoints);
        let checkKeypoints = pose.keypoints.filter(k => ['right_index', 'left_index'].includes(k.name) && k.score > passScore);
        let touchingWord = [];

        const rightHandImg = document.getElementById('right-hand');
        const leftHandImg = document.getElementById('left-hand');

        if (checkKeypoints.length === 0) {
          // Disable both hand images
          rightHandImg.style.display = 'none';
          leftHandImg.style.display = 'none';
        } else {
          for (let point of checkKeypoints) {
            if (point.name === 'right_index') {
              const xInVw = (point.x / window.innerWidth) * 100;
              rightHandImg.style.left = `calc(${xInVw}vw - calc(min(3vh, 3vw)))`;
              rightHandImg.style.top = `${point.y}px`;
              rightHandImg.style.display = 'block';
            } else if (point.name === 'left_index') {
              const xInVw = (point.x / window.innerWidth) * 100;
              leftHandImg.style.left = `calc(${xInVw}vw - calc(min(3vh, 3vw)))`;
              leftHandImg.style.top = `${point.y}px`;
              leftHandImg.style.display = 'block';
            }
          }
        }

        let isInOptionRight = false;
        let isInOptionLeft = false;
        let touchingOptionRight = null;
        let touchingOptionLeft = null;

        for (let point of checkKeypoints) {
          //console.log(point);
          if (resetBtn) {
            if (
              point.x > resetBtn.offsetLeft * 2 &&
              point.x < (resetBtn.offsetLeft * 2 + resetBtn.offsetWidth * 2) &&
              point.y > resetBtn.offsetTop &&
              point.y < (resetBtn.offsetTop + resetBtn.offsetHeight)
            ) {
              if (State.isSoundOn) {
                Sound.stopAll(['bgm', 'lastTen']);
                Sound.play('btnClick');
              }
              resetBtn.classList.add('active');
              for (let option of optionWrappers) option.classList.remove('touch');
              Game.resetFillWord();
              //console.log("reset word");
            } else {
              resetBtn.classList.remove('active');
            }
          }

          for (let option of optionWrappers) {
            if (
              point.x > option.offsetLeft &&
              point.x < (option.offsetLeft + option.offsetWidth) &&
              point.y > option.offsetTop &&
              point.y < (option.offsetTop + option.offsetHeight)
            ) {
              if (point.name === 'right_index') {
                isInOptionRight = true;
                touchingOptionRight = option;
              } else if (point.name === 'left_index') {
                isInOptionLeft = true;
                touchingOptionLeft = option;
              }
            }
          }
        }

        if (isInOptionRight && touchingOptionRight && !touchingOptionRight.classList.contains('touch') && State.allowTouchWord) {
          if (this.rightLoadingValue < 100) {
            this.rightLoadingValue += 2;
            console.log("right", this.rightLoadingValue);
            Game.trackingWord(this.rightLoadingValue, "Right");
          } else {
            touchingWord.push(touchingOptionRight);
            this.rightLoadingValue = 0;
            Game.trackingWord(this.rightLoadingValue, "Right");
          }
        } else {
          this.rightLoadingValue = 0;
          Game.trackingWord(this.rightLoadingValue, "Right");
        }

        if (isInOptionLeft && touchingOptionLeft && !touchingOptionLeft.classList.contains('touch') && State.allowTouchWord) {
          if (this.leftLoadingValue < 100) {
            this.leftLoadingValue += 2;
            console.log("left", this.leftLoadingValue);
            Game.trackingWord(this.leftLoadingValue, "Left");
          } else {
            touchingWord.push(touchingOptionLeft);
            this.leftLoadingValue = 0;
            Game.trackingWord(this.leftLoadingValue, "Left");
          }
        } else {
          this.leftLoadingValue = 0;
          Game.trackingWord(this.leftLoadingValue, "Left");
        }

        for (let option of optionWrappers) {
          if (touchingWord.includes(option) && !option.classList.contains('touch')) {
            State.setPoseState('selectedImg', option);
            Game.mergeWord(option);
          }
        }

        if (touchingWord.length === 0) State.setPoseState('selectedImg', '');
      }
      else if (State.state == 'playing' && ['wrong'].includes(State.stateType)) {
        for (let option of optionWrappers) option.classList.remove('touch');
        State.changeState('playing', 'waitAns');
      }

      return true;
    } else {
      return false;
    }
  }

  drawBox(isCurPoseValid) {
    //this.ctx.translate(this.videoWidth, 0);
    //this.ctx.scale(-1, 1);
    this.ctx.beginPath();
    this.ctx.lineWidth = isCurPoseValid ? 1 : Math.max(10, this.videoHeight * 0.01);//20230821老師話想轉1px白色  Math.max(10, this.videoHeight * 0.01);
    //this.ctx.roundRect(this.redBoxX, this.redBoxY, this.redBoxWidth, this.redBoxHeight, [this.videoHeight * 0.02]);
    this.ctx.rect(this.redBoxX, this.redBoxY, this.redBoxWidth, this.redBoxHeight);
    this.ctx.strokeStyle = isCurPoseValid ? '#FFFFFF' : '#ff0000';//20230821老師話想轉1px白色  isCurPoseValid ? '#00ff00' : '#ff0000';
    this.ctx.stroke();
    if (!this.lastPoseValidValue && isCurPoseValid && State.isSoundOn) Sound.play('poseValid');
    this.lastPoseValidValue = isCurPoseValid;
  }

  drawCtx(video, bodySegmentationCanvas) {
    if (Camera.constraints.video.facingMode == 'user') {
      this.ctx.translate(this.videoWidth, 0);
      this.ctx.scale(-1, 1);
    }
    this.ctx.drawImage(bodySegmentationCanvas ? bodySegmentationCanvas : video, 0, 0, this.videoWidth, this.videoHeight);
    if (Camera.constraints.video.facingMode == 'user') {
      this.ctx.translate(this.videoWidth, 0);
      this.ctx.scale(-1, 1);
    }
  }

  clearCtx() {
    this.ctx.clearRect(0, 0, this.videoWidth, this.videoHeight);
  }

  drawResults(poses, ratio) {
    for (const pose of poses) {
      this.drawResult(pose, ratio);
    }
  }

  drawResult(pose, ratio) {
    if (pose.keypoints != null) {
      this.keypointsFitRatio(pose.keypoints, ratio);
      this.drawKeypoints(pose.keypoints);
      this.drawSkeleton(pose.keypoints, pose.id);
    }
  }

  drawKeypoints(keypoints) {
    const keypointInd = posedetection.util.getKeypointIndexBySide(this.modelType);
    this.ctx.fillStyle = 'Red';
    this.ctx.strokeStyle = 'White';
    this.ctx.lineWidth = 2;

    for (const i of keypointInd.middle) {
      this.drawKeypoint(keypoints[i]);
    }

    this.ctx.fillStyle = 'Green';
    for (const i of keypointInd.left) {
      this.drawKeypoint(keypoints[i]);
    }

    this.ctx.fillStyle = 'Orange';
    for (const i of keypointInd.right) {
      this.drawKeypoint(keypoints[i]);
    }
  }

  keypointsFitRatio(keypoints, ratio) {
    for (let keypoint of keypoints) {
      keypoint.x = (Camera.constraints.video.facingMode == 'user') ? this.videoWidth - (keypoint.x * ratio) : (keypoint.x * ratio);
      keypoint.y = keypoint.y * ratio;
    }
  }

  drawKeypoint(keypoint) {
    // If score is null, just show the keypoint.
    const score = keypoint.score != null ? keypoint.score : 1;
    //const scoreThreshold = params.STATE.modelConfig.scoreThreshold || 0;

    if (score >= this.scoreThreshold) {
      const circle = new Path2D();
      circle.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
      this.ctx.fill(circle);
      this.ctx.stroke(circle);
    }
  }

  drawSkeleton(keypoints, poseId) {
    const color = 'White';
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;

    let left_shoulder = null;
    let right_shoulder = null;

    posedetection.util.getAdjacentPairs(this.modelType).forEach(([i, j]) => {
      const kp1 = keypoints[i];
      const kp2 = keypoints[j];

      // If score is null, just show the keypoint.
      const score1 = kp1.score != null ? kp1.score : 1;
      const score2 = kp2.score != null ? kp2.score : 1;

      if (score1 >= this.scoreThreshold && score2 >= this.scoreThreshold) {
        this.ctx.beginPath();
        this.ctx.moveTo(kp1.x, kp1.y);
        this.ctx.lineTo(kp2.x, kp2.y);
        this.ctx.stroke();
      }

      if (kp1.name === 'left_shoulder') left_shoulder = kp1;
      if (kp1.name === 'right_shoulder') right_shoulder = kp1;

      if (kp2.name === 'left_shoulder') left_shoulder = kp2;
      if (kp2.name === 'right_shoulder') right_shoulder = kp2;
    });

    // Draw circle around the head
    if (left_shoulder && right_shoulder) {
      const center_shoulderX = (left_shoulder.x + right_shoulder.x) / 2;
      const center_shoulderY = (left_shoulder.y + right_shoulder.y) / 2;

      this.center_shoulder = {
        x: center_shoulderX,
        y: center_shoulderY,
      };

      if (this.center_shoulder) {
        // Draw the keypoint as a circle
        this.ctx.fillStyle = 'Blue';
        this.ctx.strokeStyle = 'White';
        this.ctx.lineWidth = 2;
        const circle = new Path2D();
        circle.arc(this.center_shoulder.x, this.center_shoulder.y, 4, 0, 2 * Math.PI);
        this.ctx.fill(circle);
        this.ctx.stroke(circle);
      }
    }



  }

}
