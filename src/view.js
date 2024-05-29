import Game from './phonics';
import State from './state';

export default {
  //-----------------------------------------------------------------------------------------------
  renderer: null,
  loadingBarWrapper: document.querySelector('.loadingBarWrapper'),
  instructionWrapper: document.querySelector('.instructionWrapper'),
  canvasWrapper: document.querySelector('.canvasWrapper'),
  canvas: document.querySelector('.canvasWrapper > canvas'),
  gameWrapper: document.querySelector('.gameWrapper'),
  prepareBoard: document.querySelector('.gameWrapper > .prepareBoardWrapper'),
  //outBoxBoard: document.querySelector('.gameWrapper > .outBoxBoardWrapper'),
  countImg: document.querySelector('.gameWrapper > .count'),
  stageImg: document.querySelector('.gameWrapper > .questionBoard'),
  startBtn: document.querySelector('.startBtn'),
  musicBtn: document.querySelector('.gameWrapper > .topRightControl > .musicBtn'),
  exitBtn: document.querySelector('.gameWrapper > .topRightControl > .exitBtn'),
  tips: document.querySelector('.gameWrapper > .topRightControl > .tips'),
  poleImg: document.querySelector('.gameWrapper > .flagWrapper > .pole'),
  flagImg: document.querySelector('.gameWrapper > .flagWrapper > .flag'),
  finishedWrapper: document.querySelector('.finishedWrapper'),
  finishedBoardWrapper: document.querySelector('.finishedWrapper > .finishedBoardWrapper'),
  savePhotoBtn: document.querySelector('.finishedWrapper > .finishedBoardWrapper > .finishedBtnWrapper > .savePhotoBtn'),
  backHomeBtnOfFinished: document.querySelector('.finishedWrapper > .finishedBoardWrapper > .finishedBtnWrapper > .backHomeBtn'),
  playAgainBtn: document.querySelector('.finishedWrapper > .finishedBoardWrapper > .finishedBtnWrapper > .playAgainBtn'),
  backHomeBtnOfExit: document.querySelector('.exitWrapper > .exitBoard  > .btnWrapper > .backHomeBtn'),
  exitWrapper: document.querySelector('.exitWrapper'),
  continuebtn: document.querySelector('.exitWrapper > .exitBoard  > .btnWrapper > .continueBtn'),
  optionArea: document.querySelector('.canvasWrapper > .optionArea'),
  debug: document.querySelector('.debug'),
  stageStar: document.querySelector('.gameWrapper > .topLeftControl > .stageWrapper > .stageStar'),
  scoreBoard: document.querySelector('.gameWrapper > .topLeftControl > .scoreWrapper > .scoreBoard'),
  scoreText: document.querySelector('.gameWrapper > .topLeftControl > .scoreWrapper > .scoreText'),
  timeText: document.querySelector('.gameWrapper > .topLeftControl > .timeWrapper > .timeText'),
  finishedScore: document.querySelector('.finishedWrapper > .finishedBoardWrapper > .scoreTimeWrapper > .row.score > .value'),
  finishedTime: document.querySelector('.finishedWrapper > .finishedBoardWrapper > .scoreTimeWrapper > .row.time > .value'),
  topLeftControl: document.querySelector('.gameWrapper > .topLeftControl'),
  selectCounts: document.querySelectorAll('.canvasWrapper > .optionArea > .optionWrapper > .selectCount'),
  //-----------------------------------------------------------------------------------------------
  showInstruction() {
    this.instructionWrapper.style.top = 0;
  },
  hideInstruction() {
    this.instructionWrapper.style.top = '-100vh';
  },
  //-----------------------------------------------------------------------------------------------
  showCanvas() {
    this.canvasWrapper.style.visibility = "visible";
    this.canvasWrapper.style.opacity = 1;
  },
  hideCanvas() {
    this.canvasWrapper.style.opacity = 0;
    setTimeout(() => {
      this.canvasWrapper.style.visibility = "visible";
    }, 500);
  },
  //-----------------------------------------------------------------------------------------------
  showGame() {
    this.gameWrapper.style.top = 0;
  },
  hideGame() {
    this.gameWrapper.style.top = '-100vh';
  },
  //-----------------------------------------------------------------------------------------------
  showPrepareBoard() {
    this.prepareBoard.style.opacity = 1;
  },
  hidePrepareBoard() {
    this.prepareBoard.style.opacity = 0;
  },
  //-----------------------------------------------------------------------------------------------
  /*showOutBoxBoard() {
    this.outBoxBoard.style.opacity = 1;
  },
  hideOutBoxBoard() {
    this.outBoxBoard.style.opacity = 0;
  },*/
  //-----------------------------------------------------------------------------------------------
  showCount(num) {
    this.countImg.className = "count c" + num;
    this.countImg.style.opacity = 1;
    this.countImg.style.maxHeight = "calc(min(40vh, 40vw))";
    setTimeout(() => this.hideCount(), 600);
  },
  hideCount() {
    this.countImg.style.opacity = 0;
    this.countImg.style.maxHeight = "";
  },
  //-----------------------------------------------------------------------------------------------
  showStage() {
    Game.addScore(0);
    this.stageStar.className = "stageStar stage" + Game.stage
    //this.scoreBoard.className ="scoreBoard stage" + Game.stage;

    this.stageImg.className = "stage s" + Game.stage;
    this.stageImg.style.opacity = 1;
    this.stageImg.style.maxHeight = "calc(min(40vh, 40vw))";
    setTimeout(() => this.hideStage(), 600);
  },
  hideStage() {
    this.stageImg.style.opacity = 0;
    this.stageImg.style.maxHeight = "";
  },
  //-----------------------------------------------------------------------------------------------
  showFinished() {
    this.finishedWrapper.classList.add("show");
    /*let fullScore = 0;
    for (let stage of Game.stages) for (let question of stage.questions) fullScore += question.correctImgNum;
    let ttlScore = 0;
    for (let score of Game.score) ttlScore += score;
    this.finishedScore.innerText = ttlScore + "/" + fullScore;*/
    //this.finishedTime.innerText = Game.getCurTimeString();
  },
  hideFinished() {
    this.finishedWrapper.classList.remove("show");
    setTimeout(() => {
      this.finishedScore.innerText = "0";
      //this.finishedTime.innerText = "";
    }, 1000);
  },
  //-----------------------------------------------------------------------------------------------
  showExit() {
    this.exitWrapper.classList.add("show");
  },
  //-----------------------------------------------------------------------------------------------
  hideExit() {
    this.exitWrapper.classList.remove("show");
  },
  //-----------------------------------------------------------------------------------------------
  showTips(tipsName) {
    this.tips.className = "tips " + tipsName;
    //this.tips.classList.add(tipsName);
  },
  //-----------------------------------------------------------------------------------------------
  hideTips() {
    this.tips.className = "tips";
    //this.tips.classList.remove(tipsName);
  },
  //-----------------------------------------------------------------------------------------------
  showTopLeftControl() {
    this.topLeftControl.className = "topLeftControl";
  },
  //-----------------------------------------------------------------------------------------------
  hideTopLeftControl() {
    this.topLeftControl.className = "topLeftControl hide";
  },
  //-----------------------------------------------------------------------------------------------
  showAnsResult(result) {
    let correct = document.querySelector('.gameWrapper > .ansResult > .ans.correct');
    if (correct) {
      correct.classList.remove('show');
      if (result == 'correct') correct.classList.add('show');
    }
    let wrong = document.querySelector('.gameWrapper > .ansResult > .ans.wrong');
    if (wrong) {
      wrong.classList.remove('show');
      if (result == 'wrong') wrong.classList.add('show');
    }

    //顯示所選答案的color border
    for (let optionWrapper of document.querySelectorAll('.optionWrapper')) {
      if (optionWrapper.classList.contains('showColorBorder')) optionWrapper.classList.remove('showColorBorder');
    }
    if (result && State.selectedImg.value && !State.selectedImg.value.classList.contains('showColorBorder')) {
      State.selectedImg.value.classList.add('showColorBorder');
    }
  },
  //-----------------------------------------------------------------------------------------------
  setSelectCount(value) {
    for (let selectCount of this.selectCounts) selectCount.innerHTML = value;
  }
  //-----------------------------------------------------------------------------------------------
};
