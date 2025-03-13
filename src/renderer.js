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
    this.modelType = posedetection.SupportedModels.BlazePose;
    this.scoreThreshold = 0.75;
    this.center_shoulder = null;
    this.rightLoadingValue = 0;
    this.leftLoadingValue = 0;
    this.updateScheduledLeft = false;
    this.updateScheduledRight = false;
    this.showSkeleton = false;
  }

  draw(rendererParams) {
    const [video, poses, isFPSMode, bodySegmentationCanvas] = rendererParams;
    this.updateCanvasDimensions(video);
    this.drawCtx(video, bodySegmentationCanvas);

    if (this.isStateActive()) {
      let isCurPoseValid = false;
      if (poses && poses.length > 0) {
        const ratio = video.width / video.videoWidth;
        this.drawResults(poses, ratio, isFPSMode);
        isCurPoseValid = this.isPoseValid(poses);
        if (isCurPoseValid && State.bodyInsideRedBox.value) {
          this.handleStateTransitions();
        }
      }
      this.drawBox(isCurPoseValid);
    }
  }

  updateCanvasDimensions(video) {
    this.videoWidth = video.width;
    this.videoHeight = video.height;
    this.ctx.canvas.width = this.videoWidth;
    this.ctx.canvas.height = this.videoHeight;
    this.redBoxX = this.videoWidth / 3;
    this.redBoxY = this.videoHeight / 5;
    this.redBoxWidth = this.videoWidth / 3;
    this.redBoxHeight = (this.videoHeight / 5) * 4;
  }

  isStateActive() {
    return ['prepare', 'counting3', 'counting2', 'counting1', 'counting0', 'playing', 'outBox'].includes(State.state);
  }

  handleStateTransitions() {
    if (State.state === 'prepare' && State.getStateLastFor() > 3500) {
      State.changeState('counting3');
    } else if (State.state === 'counting3' && State.getStateLastFor() > 1000) {
      State.changeState('counting2');
    } else if (State.state === 'counting2' && State.getStateLastFor() > 1000) {
      State.changeState('counting1');
    } else if (State.state === 'counting1' && State.getStateLastFor() > 1000) {
      State.changeState('counting0');
    } else if (State.state === 'counting0' && State.getStateLastFor() > 1000) {
      State.changeState('playing', 'showStage');
    } else if (State.state === 'playing') {
      this.handlePlayingState();
    } else if (State.state === 'outBox' && State.bodyInsideRedBox.lastFor > 2000) {
      State.changeState('playing', 'waitAns');
    }
  }

  handlePlayingState() {
    if (State.stageType === 'showStage' && State.getStateLastFor() > 1000) {
      // Handle stage transition if necessary
    } else if (State.stateType === 'waitAns') {
      this.handleWaitAnsState();
    } else if (State.stateType === 'touched1' && State.selectedImg.lastFor > 2000) {
      State.changeState('playing', 'touched2');
    } else if (State.stateType === 'touched2' && State.selectedImg.lastFor > 3000) {
      // Handle answer checking if necessary
    } else if (!State.selectedImg.value) {
      State.changeState('playing', 'waitAns');
    }
  }

  handleWaitAnsState() {
    if (State.selectedImg.value && State.selectedImg.lastFor > 1000) {
      // Handle answer checking if necessary
    }
  }

  isOutOfBounds(keypoint) {
    return (
      keypoint.x < this.redBoxX ||
      keypoint.x > (this.redBoxX + this.redBoxWidth) ||
      keypoint.y < this.redBoxY ||
      keypoint.y > (this.redBoxY + this.redBoxHeight)
    );
  }

  checkBodyInBounds(pose, passScore) {
    const isNoseOutBox = pose.keypoints
      .filter(k => k.name === 'nose' && k.score > passScore)
      .some(keypoint => this.isOutOfBounds(keypoint));
    const isShoulderOutBox = this.center_shoulder && this.isOutOfBounds(this.center_shoulder);
    const isBodyOutBox = this.center_shoulder ? (isShoulderOutBox && isNoseOutBox) : isNoseOutBox;

    State.setPoseState('bodyInsideRedBox', !isBodyOutBox);
    if (isBodyOutBox && State.state === 'playing') {
      State.changeState('outBox', 'outBox');
    }

    return !isBodyOutBox;
  }

  updateHandDisplays(checkKeypoints, rightHandImg, leftHandImg) {
    rightHandImg.style.display = 'none';
    leftHandImg.style.display = 'none';

    const wristPositions = {
        right_wrist: null,
        left_wrist: null
    };

    checkKeypoints.forEach(point => {
        if (point.name === 'right_wrist') {
            wristPositions.right_wrist = point;
        } else if (point.name === 'left_wrist') {
            wristPositions.left_wrist = point;
        }
    });

    const processHand = (hand, handImg) => {
        const wristDetected = wristPositions[`${hand}_wrist`] !== null;
        const indexDetected = checkKeypoints.some(point => point.name === `${hand}_index`);

        if (wristDetected && indexDetected) {
            checkKeypoints.forEach(point => {
                if (point.name === `${hand}_index`) {
                    const xInVw = (point.x / window.innerWidth) * (hand === 'right' ? 100 : 105);
                    handImg.style.left = `calc(${xInVw}vw - calc(min(5vh, 5vw)))`;
                    handImg.style.top = `${point.y}px`;

                    const wristPoint = wristPositions[`${hand}_wrist`];
                    const deltaY = point.y - wristPoint.y;
                    const deltaX = point.x - wristPoint.x;
                    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;

                    handImg.style.transform = `rotate(${angle}deg)`;
                    handImg.style.display = 'block';
                }
            });
        }
    };

    processHand('right', rightHandImg);
    processHand('left', leftHandImg);
  }

  isPoseValid(poses) {
    if (!poses[0]) return false;
    const pose = poses[0];
    const passScore = this.scoreThreshold;

    if (pose.keypoints != null) {
      if (!this.checkBodyInBounds(pose, passScore)) {
        return false;
      }

      const resetBtn = document.querySelector('.resetBtn');
      const rightHandImg = document.getElementById('right-hand');
      const leftHandImg = document.getElementById('left-hand');
      const optionWrappers = document.querySelectorAll('.canvasWrapper > .optionArea > .optionWrapper.show');

      if (State.state === 'playing' && State.stateType === 'waitAns') {
        this.handleWaitAnsPose(pose, passScore, rightHandImg, leftHandImg, optionWrappers, resetBtn);
      } else if (State.state === 'playing' && State.stateType === 'wrong') {
        this.resetOptions(optionWrappers);
      }

      return true;
    }
    return false;
  }

  handleWaitAnsPose(pose, passScore, rightHandImg, leftHandImg, optionWrappers, resetBtn) {
    const checkKeypoints = pose.keypoints.filter(k => ['right_index', 'left_index', 'right_wrist', 'left_wrist'].includes(k.name) && k.score > passScore);
    this.updateHandDisplays(checkKeypoints, rightHandImg, leftHandImg);

    const touchingWord = [];
    let resetActive = false;

    const rightHandBounds = this.getElementBounds(rightHandImg);
    const leftHandBounds = this.getElementBounds(leftHandImg);

    let isInOptionRight = false;
    let isInOptionLeft = false;

    optionWrappers.forEach(option => {
      if (this.isElementOverlapping(rightHandBounds, option)) {
        isInOptionRight = true;
        this.handleTouchingOption(touchingWord, option, 'right');
      }
      if (this.isElementOverlapping(leftHandBounds, option)) {
        isInOptionLeft = true;
        this.handleTouchingOption(touchingWord, option, 'left');
      }
    });

    if (!isInOptionRight) {
      this.rightLoadingValue = 0;
      this.scheduleUpdateHandLoading('right');
    }

    if (!isInOptionLeft) {
      this.leftLoadingValue = 0;
      this.scheduleUpdateHandLoading('left');
    }

    if (resetBtn) {
      checkKeypoints.forEach(point => {
        if (this.isPointOverResetBtn(point, resetBtn)) {
          Game.resetFillWord(resetBtn);
          resetActive = true;
        }
      });

      if (!resetActive && resetBtn.classList.contains('active') && !Game.touchResetBtn) {
        resetBtn.classList.remove('active');
      }
    }

    this.updateTouchingWords(touchingWord, optionWrappers);
  }

  getElementBounds(element) {
    return {
      left: element.offsetLeft,
      top: element.offsetTop,
      width: element.offsetWidth,
      height: element.offsetHeight,
    };
  }

  isElementOverlapping(bounds, element) {
    return (
      bounds.left < (element.offsetLeft + element.offsetWidth) &&
      (bounds.left + bounds.width) > element.offsetLeft &&
      bounds.top < (element.offsetTop + element.offsetHeight) &&
      (bounds.top + bounds.height) > element.offsetTop
    );
  }

  handleTouchingOption(touchingWord, option, hand) {
    if (!option.classList.contains('touch') && State.allowTouchWord) {
      if (hand === 'right') {
        this.rightLoadingValue = this.updateLoadingValue(this.rightLoadingValue, touchingWord, option, 'right');
      } else {
        this.leftLoadingValue = this.updateLoadingValue(this.leftLoadingValue, touchingWord, option, 'left');
      }
    }
  }

  updateLoadingValue(loadingValue, touchingWord, option, hand) {
    if (loadingValue < 100) {
      loadingValue += 8;
      this.scheduleUpdateHandLoading(hand);
    } else {
      touchingWord.push(option);
      loadingValue = 0;
      this.scheduleUpdateHandLoading(hand);
    }
    return loadingValue;
  }

  scheduleUpdateHandLoading(hand) {
    if (hand === 'right' && !this.updateScheduledRight) {
      this.updateScheduledRight = true;
      requestAnimationFrame(() => {
        Game.trackingWord(this.rightLoadingValue, 'Right');
        this.updateScheduledRight = false;
      });
    } else if (hand === 'left' && !this.updateScheduledLeft) {
      this.updateScheduledLeft = true;
      requestAnimationFrame(() => {
        Game.trackingWord(this.leftLoadingValue, 'Left');
        this.updateScheduledLeft = false;
      });
    }
  }

  isPointOverResetBtn(point, resetBtn) {
    const offsetX = window.innerWidth / 7.68; // 10% of the viewport width
    return (
      point.x > resetBtn.offsetLeft * 2 + offsetX &&
      point.x < (resetBtn.offsetLeft * 2 + resetBtn.offsetWidth * 2) + (offsetX / 2) &&
      point.y - 30 > resetBtn.offsetTop &&
      point.y - 130 < (resetBtn.offsetTop + resetBtn.offsetHeight)
    );
  }

  updateTouchingWords(touchingWord, optionWrappers) {
    optionWrappers.forEach(option => {
      if (touchingWord.includes(option) && !option.classList.contains('touch')) {
        State.setPoseState('selectedImg', option);
        Game.mergeWord(option);
      }
    });

    if (touchingWord.length === 0) {
      State.setPoseState('selectedImg', '');
    }
  }

  resetOptions(optionWrappers) {
    optionWrappers.forEach(option => option.classList.remove('touch'));
    State.changeState('playing', 'waitAns');
  }

  drawBox(isCurPoseValid) {
    this.ctx.beginPath();
    this.ctx.lineWidth = isCurPoseValid ? 1 : Math.max(10, this.videoHeight * 0.01);
    this.ctx.rect(this.redBoxX, this.redBoxY, this.redBoxWidth, this.redBoxHeight);
    this.ctx.strokeStyle = isCurPoseValid ? '#FFFFFF' : '#ff0000';
    this.ctx.stroke();
    if (!this.lastPoseValidValue && isCurPoseValid && State.isSoundOn) {
      Sound.play('poseValid');
    }
    this.lastPoseValidValue = isCurPoseValid;
  }

  drawCtx(video, bodySegmentationCanvas) {
    if (Camera.constraints.video.facingMode === 'user') {
      this.ctx.translate(this.videoWidth, 0);
      this.ctx.scale(-1, 1);
    }
    this.ctx.drawImage(bodySegmentationCanvas || video, 0, 0, this.videoWidth, this.videoHeight);
    if (Camera.constraints.video.facingMode === 'user') {
      this.ctx.translate(this.videoWidth, 0);
      this.ctx.scale(-1, 1);
    }
  }

  clearCtx() {
    this.ctx.clearRect(0, 0, this.videoWidth, this.videoHeight);
  }

  drawResults(poses, ratio, isFPSMode) {
    poses.forEach(pose => this.drawResult(pose, ratio, isFPSMode));
  }

  drawResult(pose, ratio, isFPSMode) {
    if (pose.keypoints) {
      this.keypointsFitRatio(pose.keypoints, ratio);
      if (isFPSMode || this.showSkeleton) {
        this.drawKeypoints(pose.keypoints);
      }
      this.drawSkeleton(pose.keypoints, pose.id, isFPSMode);
    }
  }

  drawKeypoints(keypoints) {
    const keypointInd = posedetection.util.getKeypointIndexBySide(this.modelType);
    this.ctx.fillStyle = 'Red';
    this.ctx.strokeStyle = 'White';
    this.ctx.lineWidth = 2;

    keypointInd.middle.forEach(i => this.drawKeypoint(keypoints[i]));
    this.ctx.fillStyle = 'Green';
    keypointInd.left.forEach(i => this.drawKeypoint(keypoints[i]));
    this.ctx.fillStyle = 'Orange';
    keypointInd.right.forEach(i => this.drawKeypoint(keypoints[i]));
  }

  keypointsFitRatio(keypoints, ratio) {
    keypoints.forEach(keypoint => {
      keypoint.x = (Camera.constraints.video.facingMode === 'user') ? this.videoWidth - (keypoint.x * ratio) : (keypoint.x * ratio);
      keypoint.y = keypoint.y * ratio;
    });
  }

  drawKeypoint(keypoint) {
    const score = keypoint.score != null ? keypoint.score : 1;
    if (score >= this.scoreThreshold) {
      const circle = new Path2D();
      circle.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
      this.ctx.fill(circle);
      this.ctx.stroke(circle);
    }
  }

  drawSkeleton(keypoints, poseId, isFPSMode) {
    const color = 'White';
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;

    let left_shoulder = null;
    let right_shoulder = null;

    posedetection.util.getAdjacentPairs(this.modelType).forEach(([i, j]) => {
      const kp1 = keypoints[i];
      const kp2 = keypoints[j];
      const score1 = kp1.score != null ? kp1.score : 1;
      const score2 = kp2.score != null ? kp2.score : 1;

      if (score1 >= this.scoreThreshold && score2 >= this.scoreThreshold) {
        this.ctx.beginPath();
        this.ctx.moveTo(kp1.x, kp1.y);
        this.ctx.lineTo(kp2.x, kp2.y);
        if (isFPSMode || this.showSkeleton) {
          this.ctx.stroke();
        }
      }

      if (kp1.name === 'left_shoulder') left_shoulder = kp1;
      if (kp1.name === 'right_shoulder') right_shoulder = kp1;
      if (kp2.name === 'left_shoulder') left_shoulder = kp2;
      if (kp2.name === 'right_shoulder') right_shoulder = kp2;
    });

    if (left_shoulder && right_shoulder) {
      this.drawCenterShoulder(left_shoulder, right_shoulder, isFPSMode);
    }
  }

  drawCenterShoulder(left_shoulder, right_shoulder, isFPSMode) {
    const center_shoulderX = (left_shoulder.x + right_shoulder.x) / 2;
    const center_shoulderY = (left_shoulder.y + right_shoulder.y) / 2;

    this.center_shoulder = { x: center_shoulderX, y: center_shoulderY };

    if (this.center_shoulder) {
      this.ctx.fillStyle = 'Blue';
      this.ctx.strokeStyle = 'White';
      this.ctx.lineWidth = 2;
      const circle = new Path2D();
      circle.arc(this.center_shoulder.x, this.center_shoulder.y, 4, 0, 2 * Math.PI);
      if (isFPSMode || this.showSkeleton) {
        this.ctx.fill(circle);
        this.ctx.stroke(circle);
      }
    }
  }
}
