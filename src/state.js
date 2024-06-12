import View from './view';
import Sound from './sound';
import Game from './phonics';

export default {
  state: 'load', //load/instruction/prepare/count/play
  lastState: '',
  stateLastAt: +new Date(),
  stateLastFor: 0,
  stateType: '',
  isSoundOn: true,
  gamePauseData: {
    state: '',
    stateType: '',
  },
  bodyInsideRedBox: {
    value: false,
    lastAt: +new Date(),
    lastFor: 0
  },
  selectedImg: {
    value: '',
    lastAt: +new Date(),
    lastFor: 0
  },
  setPoseState(stateName, newValue) {
    let state = this[stateName];
    if (state.value == newValue) {
      state.lastFor = +new Date() - state.lastAt;
    } else {
      state.value = newValue;
      state.lastAt = +new Date();
      state.lastFor = 0;
    }
  },
  //-----------------------------------------------------------------------------------------------
  getStateLastFor() {
    this.stateLastFor = +new Date() - this.stateLastAt;
    return this.stateLastFor;
  },
  //-----------------------------------------------------------------------------------------------
  changeState(state, stateType = '') {
    if (this.state === 'finished')
      return;

    console.log(state, stateType);
    if (this.state == state) {
      this.stateLastFor = +new Date() - this.stateLastAt;
      if (this.stateType == stateType) return;
    } else {
      this.lastState = this.state;
      this.state = state;
      this.stateLastAt = +new Date();
      this.stateLastFor = 0;
    }
    this.stateType = stateType;

    if (state == 'instruction') {
      const bgImageElement = document.getElementById('bgImage');
      bgImageElement.style.backgroundColor = 'black';
      Game.init();
      View.hideTopLeftControl();
      View.hideTips();
      View.showCanvas();
      //View.hideCanvas();
      View.hideGame();
      View.hideFinished();
      View.showInstruction();
      Sound.stopAll();
      if (this.isSoundOn) {
        Sound.play('bgm', true);
        Sound.stopAll('bgm');
        //Sound.play('instruction');
      }
    } else if (state == 'prepare') {
      Game.init();
      View.hideFinished();
      View.showCanvas();
      View.hideInstruction();
      View.showGame();
      View.showPrepareBoard();
      Sound.stopAll('bgm');
      if (this.isSoundOn) Sound.play('prepare');
    } else if (state == 'counting3') {
      View.hidePrepareBoard();
      View.showCount(3);
      if (this.isSoundOn) setTimeout(() => Sound.play('countDown'), 500);
    } else if (state == 'counting2') {
      View.showCount(2);
      if (this.isSoundOn) setTimeout(() => Sound.play('countDown'), 500);
    } else if (state == 'counting1') {
      View.showCount(1);
      if (this.isSoundOn) setTimeout(() => Sound.play('countDown'), 500);
    } else if (state == 'counting0') {
      View.showCount(0);
      if (this.isSoundOn) {
        Sound.stopAll('bgm');
        //Sound.play('start');
      }
    } else if (state == 'playing') {
      //View.showTips('tipsReady');
      View.showTopLeftControl();
      switch (stateType) {
        case 'showStage':
          if (this.isSoundOn) setTimeout(() => Sound.play('countDown'), 500);
          setTimeout(() => this.changeState('playing', 'showQstImg'), 1000);
          break;
        case 'showQstImg':
          this.changeState('playing', 'waitAns');
        case 'waitAns':
          View.hideTips();
          Game.startCountTime();
          break;
        case 'ansWrong':
          if (this.isSoundOn) {
            Sound.stopAll('bgm');
            Sound.play('ansWrong');
          }
          this.changeState('playing', 'wrong');

          setTimeout(() => {
            this.setPoseState('selectedImg', '');
            Game.resetFillWord();
          }, 1000);
          break;
        case 'ansCorrect':
          if (this.isSoundOn) {
            Sound.stopAll('bgm');
            Sound.play('ansCorrect');
          }
          this.changeState('playing', 'waitAns');

          setTimeout(() => {
            this.setPoseState('selectedImg', '');
            if (state == 'playing')
              Game.moveToNextQuestion();
          }, 1000);
          break;
      }

    } else if (state == 'pause') {
      Sound.stopAll('bgm');
      View.hidePrepareBoard();
      View.showExit();
    } else if (state == 'outBox') {
      if (stateType == 'outBox') {
        if (this.isSoundOn) Sound.play('outBox');
        View.showTips('tipsOutBox');
      }
    } else if (state == 'finished') {
      View.hideTopLeftControl();
      View.hideTips();
      View.hideGame();
      View.showFinished();
      Sound.stopAll();
      if (this.isSoundOn) {
        Sound.stopAll('bgm');
        Sound.play('finished');
      }
      Game.stopCountTime();
    }

    if (state != 'playing') {
      Game.stopCountTime();
    }

  },
  //-----------------------------------------------------------------------------------------------
};
