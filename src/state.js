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
      View.hideCanvas();
      View.hideGame();
      View.hideFinished();
      View.showInstruction();
      Sound.stopAll();
      if (this.isSoundOn) {
        Sound.play('bgm', true);
        Sound.stopAll('bgm');
        Sound.play('instruction');
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
      View.showTips('tipsReady');
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
        Sound.play('start');
      }
    } else if (state == 'playing') {
      View.showTopLeftControl();
      Game.startCountTime();
      switch (stateType) {
        case 'showStage':
          if (this.isSoundOn) setTimeout(() => Sound.play('countDown'), 500);
          setTimeout(() => this.changeState('playing', 'showQstImg'), 1000);
          break;
        case 'showQstImg':
          Game.setQuestions();
          this.changeState('playing', 'waitAns');
          break;
        case 'nextQst':
          Game.setQuestions();
          break;
      }


      /*   if (stateType == 'showStage') {
           View.showStage();
           if (this.isSoundOn) setTimeout(() => Sound.play('countDown'), 500);
           setTimeout(() => this.changeState('playing', 'showQstImg'), 1000);
         } else if (stateType == 'showQstImg') {
           Game.setImgs();
           this.changeState('playing', 'waitAns');
         } else if (stateType == 'waitAns') {
           View.setSelectCount('3');
         } else if (stateType == 'touched1') {
           View.setSelectCount('2');
           if (this.isSoundOn) Sound.play('countDown');
         } else if (stateType == 'touched2') {
           View.setSelectCount('1');
           if (this.isSoundOn) Sound.play('countDown');
         } else if (stateType == 'ansWrong') {
           if (this.isSoundOn) {
             Sound.stopAll('bgm');
             Sound.play('ansWrong');
           }
           View.showAnsResult('wrong');
           setTimeout(() => {
             View.showAnsResult('');
             this.setPoseState('selectedImg', '');
             this.changeState('playing', 'waitAns');
           }, 2000);
         } else if (stateType == 'ansCorrect') {
           if (this.isSoundOn) {
             Sound.stopAll('bgm');
             Sound.play('ansCorrect');
           }
           View.showAnsResult('correct');
           setTimeout(() => {
             //因為是多選多，先刪掉當前已選的正確答案
             let curSelectedOptionWrapper = document.querySelector('.canvasWrapper > .optionArea > .optionWrapper.show.correct.showColorBorder');
             if (curSelectedOptionWrapper) curSelectedOptionWrapper.remove();
             let correct = document.querySelector('.gameWrapper > .ansResult > .ans.correct');
             if (correct) correct.classList.remove('show');
             let wrong = document.querySelector('.gameWrapper > .ansResult > .ans.wrong');
             if (wrong) wrong.classList.remove('show');

             //如果還有其他正確答案，就繼續等答案
             if (document.querySelector('.canvasWrapper > .optionArea > .optionWrapper.correct')) {
               this.changeState('playing', 'waitAns');
             } else {
               View.optionArea.innerHTML = '';
               View.showAnsResult('');
               if (Game.canGoNextQuestion()) {
                 this.changeState('playing', 'showQstImg');
               } else if (Game.canGoNextStage()) {
                 this.changeState('playing', 'showStage');
               } else {
                 this.changeState('finished');
               }
             }
           }, 2000);
         }
         View.showTips('tipsStart');

   */

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
    }

    if (state != 'playing') {
      Game.stopCountTime();
    }

  },
  //-----------------------------------------------------------------------------------------------
};
