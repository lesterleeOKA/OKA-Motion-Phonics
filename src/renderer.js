import * as posedetection from '@tensorflow-models/pose-detection';
import State from './state';
import Sound from './sound';
import Camera from './camera';
import Game from './phonics';

export class RendererCanvas2d {
  constructor(canvas) {
    this.ctx = canvas.getContext('2d');
    this.videoWidth = canvas.width;
    this.videoHeight = canvas.height;
    this.lastPoseValidValue = false;
  }

  draw(rendererParams) {
    const [video, poses, isModelChanged] = rendererParams;
    this.videoWidth = video.width;
    this.videoHeight = video.height;
    this.ctx.canvas.width = this.videoWidth;
    this.ctx.canvas.height = this.videoHeight;

    this.redBoxX = this.videoWidth / 3;
    this.redBoxY = this.videoHeight / 5 * 2;
    this.redBoxWidth = this.videoWidth / 3;
    this.redBoxHeight = this.videoHeight / 5 * 3;

    this.drawCtx(video);
    if (['prepare', 'counting3', 'counting2', 'counting1', 'counting0', 'playing', 'outBox'].includes(State.state)) {
      let isCurPoseValid = false;
      if (poses && poses.length > 0 && !isModelChanged) {
        this.drawResults(poses, video.width / video.videoWidth);
        //this.isPoseValid(poses, video.width / video.videoWidth);
        isCurPoseValid = this.isPoseValid(poses, video.width / video.videoWidth);
        if (isCurPoseValid && State.bodyInsideRedBox.value == true) {
          if (State.state == 'prepare' && State.getStateLastFor() > 2000) {
            State.changeState('counting3');
          } else if (State.state == 'counting3' && State.getStateLastFor() > 1000) {
            State.changeState('counting2');
          } else if (State.state == 'counting2' && State.getStateLastFor() > 1000) {
            State.changeState('counting1');
          } else if (State.state == 'counting1' && State.getStateLastFor() > 1000) {
            State.changeState('counting0');
          } else if (State.state == 'counting0' && State.getStateLastFor() > 2000) {
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
          } else if (State.state == 'outBox' && State.bodyInsideRedBox.lastFor > 3000) {
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
    let passScore = 0.65;

    if (pose.keypoints != null) {
      //我建議膊頭兩點，腰兩點，膝頭兩點，手肘兩點，手腕兩點入框就可以玩
      //nose, left_eye_inner, left_eye, left_eye_outer, right_eye_inner, right_eye, right_eye_outer, left_ear, right_ear, mouth_left, mouth_right, left_shoulder, right_shoulder, left_elbow, right_elbow, left_wrist, right_wrist, left_pinky, right_pinky, left_index, right_index, left_thumb, right_thumb, left_hip, right_hip, left_knee, right_knee, left_ankle, right_ankle, left_heel, right_heel, left_foot_index, right_foot_index
      //let checkKeypoints = pose.keypoints.filter(k=>['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee'].includes(k.name) && k.score>0.65);
      let checkKeypoints = pose.keypoints.filter(k => k.name == 'nose' && k.score > passScore);
      let isBodyOutBox = (
        checkKeypoints.find(keypoint => (
          keypoint.x < this.redBoxX ||
          keypoint.x > (this.redBoxX + this.redBoxWidth) ||
          keypoint.y < this.redBoxY ||
          keypoint.y > (this.redBoxY + this.redBoxHeight)
        )) ? true : false
      );
      State.setPoseState('bodyInsideRedBox', !isBodyOutBox);
      if (isBodyOutBox) {
        if (State.state == 'playing') State.changeState('outBox', 'outBox');
        //console.log('outBox', 'outBox');
        return false;
      }

      //檢查是否有選到圖
      let optionWrappers = document.querySelectorAll('.canvasWrapper > .optionArea > .optionWrapper.show');
      if (State.state == 'playing' && ['waitAns', 'touched1', 'touched2'].includes(State.stateType)) {
        let checkKeypoints = pose.keypoints.filter(k => ['right_index', 'left_index'].includes(k.name) && k.score > passScore);
        let touchingImg = null;

        for (let point of checkKeypoints) {
          for (let option of optionWrappers) {

            /*if (
              !touchingImg &&
              point.x > option.offsetLeft &&
              point.x < (option.offsetLeft + option.offsetWidth) &&
              point.y > option.offsetTop &&
              point.y < (option.offsetTop + option.offsetHeight)
            ) {
              touchingImg = option;
            }*/
            const optionRect = option.getBoundingClientRect();

            if (!touchingImg &&
              point.x > optionRect.left &&
              point.x < optionRect.right &&
              point.y > optionRect.top &&
              point.y < optionRect.bottom
            ) {
              touchingImg = option;
            }
          }
        }

        for (let option of optionWrappers) {
          if (option == touchingImg) {
            var optionId = option.id;
            console.log("touched!!!!!!!!!!!!!!!!!!", optionId);
            State.setPoseState('selectedImg', option);
            option.classList.add('touch');
            Game.removeFallingItemByIndex(optionId);
          } else {
            option.classList.remove('touch');
          }
        }

        if (!touchingImg) State.setPoseState('selectedImg', '');
      } else if (State.selectedImg.value) {
        State.setPoseState('selectedImg', null);
        for (let option of optionWrappers) option.classList.remove('touch');
      };


      //檢查有沒有面向鏡頭
      /*let nose = pose.keypoints.find(k=>k.name=='nose' && k.score>passScore); //鼻尖
      let left_ear = pose.keypoints.find(k=>k.name=='left_ear' && k.score>passScore); //左耳
      let right_ear = pose.keypoints.find(k=>k.name=='right_ear' && k.score>passScore); //右耳
      let left_eye = pose.keypoints.find(k=>k.name=='left_eye' && k.score>passScore); //左眼
      let right_eye = pose.keypoints.find(k=>k.name=='right_eye' && k.score>passScore); //右眼
      let left_shoulder = pose.keypoints.find(k=>k.name=='left_shoulder' && k.score>passScore); //膊頭
      let right_shoulder = pose.keypoints.find(k=>k.name=='right_shoulder' && k.score>passScore); //膊頭

      let isBodyNotFaceCam = (
        Camera.constraints.video.facingMode=='user' ? (
          (nose && left_ear && left_ear.x > nose.x) || //面部左轉
          (nose && right_ear && right_ear.x < nose.x) || //面部右轉
          (left_eye && right_eye && right_eye.x < left_eye.x) || //面部背各鏡頭
          (left_shoulder && right_shoulder && right_shoulder.x < left_shoulder.x) //膊頭背各鏡頭
        ) : (
          (nose && left_ear && left_ear.x < nose.x) || //面部左轉
          (nose && right_ear && right_ear.x > nose.x) || //面部右轉
          (left_eye && right_eye && right_eye.x > left_eye.x) ||
          (left_shoulder && right_shoulder && right_shoulder.x > left_shoulder.x)
        )
      );
      State.setPoseState('bodyFaceCam', !isBodyNotFaceCam);
      if (isBodyNotFaceCam) {
        if (State.state=='playing') State.changeState('outBox', 'face');
        //console.log('outBox', 'face');
        return false;
      }*/

      //檢查有沒有舉高手
      /*let left_elbow = pose.keypoints.find(k=>k.name=='left_elbow' && k.score>passScore); //手踭
      let left_wrist = pose.keypoints.find(k=>k.name=='left_wrist' && k.score>passScore); //手腕
      let right_elbow = pose.keypoints.find(k=>k.name=='right_elbow' && k.score>passScore); //手踭
      let right_wrist = pose.keypoints.find(k=>k.name=='right_wrist' && k.score>passScore); //手腕
      let isBodyHandsUp = (
        (left_elbow && left_wrist && left_wrist.y < left_elbow.y) || //手腕高過手踭
        (right_elbow && right_wrist && right_wrist.y < right_elbow.y) ||
        (left_elbow && left_shoulder && left_shoulder.y > left_elbow.y) || //手踭高過膊頭
        (right_elbow && right_shoulder && right_shoulder.y > right_elbow.y)
      );
      State.setPoseState('bodyHandsUp', isBodyHandsUp);
      if (isBodyHandsUp) {
        if (State.state=='playing') State.changeState('outBox', 'hand');
        //console.log('outBox', 'hand');
        return false;
      }*/

      //檢查是否踎低
      /*let left_hip = pose.keypoints.find(k=>k.name=='left_hip' && k.score>passScore); //腰
      let right_hip = pose.keypoints.find(k=>k.name=='right_hip' && k.score>passScore); //腰
      let left_knee = pose.keypoints.find(k=>k.name=='left_knee' && k.score>passScore); //膝頭
      let right_knee = pose.keypoints.find(k=>k.name=='right_knee' && k.score>passScore); //膝頭
      let isBodySit = (
        (left_shoulder && left_hip && left_knee && ((left_knee.y - left_hip.y) < ((left_hip.y - left_shoulder.y) * 0.5))) ||
        (right_shoulder && right_hip && right_knee && ((right_knee.y - right_hip.y) < ((right_hip.y - right_shoulder.y) * 0.5)))
      );
      State.setPoseState('bodySit', isBodySit);
      if (isBodySit) {
        if (State.state=='playing') State.changeState('outBox', 'sit');
        //console.log('outBox', 'sit');
        return false;
      }*/

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

  drawCtx(video) {
    if (Camera.constraints.video.facingMode == 'user') {
      this.ctx.translate(this.videoWidth, 0);
      this.ctx.scale(-1, 1);
    }
    this.ctx.drawImage(video, 0, 0, this.videoWidth, this.videoHeight);
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
    const keypointInd = posedetection.util.getKeypointIndexBySide('BlazePose');
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

    if (score >= 0.65) {
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

    posedetection.util.getAdjacentPairs('BlazePose').forEach(([i, j]) => {
      const kp1 = keypoints[i];
      const kp2 = keypoints[j];

      // If score is null, just show the keypoint.
      const score1 = kp1.score != null ? kp1.score : 1;
      const score2 = kp2.score != null ? kp2.score : 1;
      const scoreThreshold = 0.65;

      if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
        this.ctx.beginPath();
        this.ctx.moveTo(kp1.x, kp1.y);
        this.ctx.lineTo(kp2.x, kp2.y);
        this.ctx.stroke();
      }
    });
  }

}
