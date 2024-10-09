import Game from './phonics';
import State from './state';
import Util from './util';

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
  //instructionBtn: document.querySelector('.gameWrapper > .topRightControl > .instructionBtn'),
  musicBtn: document.querySelector('.gameWrapper > .topRightControl > .musicBtn'),
  exitBtn: document.querySelector('.gameWrapper > .topRightControl > .exitBtn'),
  tips: document.querySelector('.gameWrapper > .topRightControl > .tips'),
  poleImg: document.querySelector('.gameWrapper > .flagWrapper > .pole'),
  flagImg: document.querySelector('.gameWrapper > .flagWrapper > .flag'),
  finishedWrapper: document.querySelector('.finishedWrapper'),
  finishedBoardWrapper: document.querySelector('.finishedWrapper > .finishedBoardWrapper'),
  finishedBoard: document.querySelector('.finishedWrapper > .finishedBoardWrapper > .finishedBoard'),
  savePhotoBtn: document.querySelector('.finishedWrapper > .finishedBoardWrapper > .finishedBtnWrapper > .savePhotoBtn'),
  backHomeBtnOfFinished: document.querySelector('.finishedWrapper > .finishedBoardWrapper > .finishedBtnWrapper > .backHomeBtn'),
  playAgainBtn: document.querySelector('.finishedWrapper > .finishedBoardWrapper > .finishedBtnWrapper > .playAgainBtn'),
  backHomeBtnOfExit: document.querySelector('.exitWrapper > .exitBoard  > .btnWrapper > .backHomeBtn'),

  loginErrorWrapper: document.querySelector('.loginErrorWrapper'),
  reloadBtn: document.querySelector('.loginErrorWrapper > .loginErrorBoard  > .errorWrapper > .reloadBtn'),

  musicOnOffWrapper: document.querySelector('.musicOnOffWrapper'),
  onBtn: document.querySelector('.musicOnOffWrapper > .musicOnOffBoard  > .musicWrapper > .onBtn'),
  offBtn: document.querySelector('.musicOnOffWrapper > .musicOnOffBoard  > .musicWrapper > .offBtn'),
  exitWrapper: document.querySelector('.exitWrapper'),
  continuebtn: document.querySelector('.exitWrapper > .exitBoard  > .btnWrapper > .continueBtn'),
  optionArea: document.querySelector('.canvasWrapper > .optionArea'),
  debug: document.querySelector('.debug'),
  stageStar: document.querySelector('.gameWrapper > .topLeftControl > .stageWrapper > .stageStar'),
  scoreBoard: document.querySelector('.gameWrapper > .topLeftControl > .scoreWrapper > .scoreBoard'),
  scoreText: document.querySelector('.gameWrapper > .topLeftControl > .scoreWrapper > .scoreText'),
  playerName: document.querySelector('.gameWrapper > .topLeftControl > .scoreWrapper > .playerName'),
  playerNameText: document.querySelector('.gameWrapper > .topLeftControl > .scoreWrapper > .playerName > .playerNameText'),

  timeText: document.querySelector('.gameWrapper > .topLeftControl > .timeWrapper > .timeText'),
  finishedScore: document.querySelector('.finishedWrapper > .finishedBoardWrapper > .scoreTimeWrapper > .row.score > .value'),
  finishedTime: document.querySelector('.finishedWrapper > .finishedBoardWrapper > .scoreTimeWrapper > .row.time > .value'),
  topLeftControl: document.querySelector('.gameWrapper > .topLeftControl'),
  selectCounts: document.querySelectorAll('.canvasWrapper > .optionArea > .optionWrapper > .selectCount'),

  rightHandImg: document.getElementById('right-hand'),
  leftHandImg: document.getElementById('left-hand'),
  playerIcon: document.getElementById('userIcon'),
  fpsModeBtn: document.getElementById('fpsButton'),
  //-----------------------------------------------------------------------------------------------
  preloadedFallingImages: [],
  optionImages: [
    require("./images/phonics/candy1.png"),
    require("./images/phonics/candy2.png"),
    require("./images/phonics/candy3.png"),
    require("./images/phonics/candy4.png"),
    require("./images/phonics/candy5.png"),
  ],

  preloadUsedImages() {
    this.optionImages.forEach((path) => {
      const img = new Image();
      img.src = path;
      this.preloadedFallingImages.push(img);
    });

    console.log("preloading UsedImages....................", this.preloadedFallingImages);
    Util.updateLoadingStatus("Loading Images");
  },
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
    this.countImg.classList.add("count", "c" + num);
    //this.countImg.style.opacity = 1;
    //this.countImg.style.maxHeight = "calc(min(60vh, 60vw))";
    setTimeout(() => this.hideCount(num), 750);
  },
  hideCount(num) {
    this.countImg.classList.remove("count", "c" + num);
    //this.countImg.style.opacity = 0;
    //this.countImg.style.maxHeight = "";
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
  showSuccess() {
    this.finishedBoard.classList.remove("fail");
    this.finishedBoard.classList.add("success");
  },
  hideSuccess() {
    this.finishedBoard.classList.remove("success");
  },
  showFailure() {
    this.finishedBoard.classList.remove("success");
    this.finishedBoard.classList.add("fail");
  },
  hideFailure() {
    this.finishedBoard.classList.remove("fail");
  },
  hideFinished() {
    this.finishedWrapper.classList.remove("show");
    setTimeout(() => {
      this.finishedScore.innerText = "0";
      //this.finishedTime.innerText = "";
    }, 1000);
  },
  showMusicOnOff() {
    this.musicOnOffWrapper.classList.add("show");
  },
  hideMusicOnOff() {
    this.musicOnOffWrapper.classList.remove("show");
  },
  showLoginErrorPopup() {
    this.loginErrorWrapper.classList.add("show");
  },
  hideLoginErrorPopup() {
    this.loginErrorWrapper.classList.remove("show");
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

  showCorrectEffect(status) {
    let result = document.querySelector('.gameWrapper .ansResult .wellDone');
    if (status) {
      result.classList.add('show');
      result.addEventListener('animationend', () => result.classList.remove('show'));
    }
  },
  //-----------------------------------------------------------------------------------------------
  setSelectCount(value) {
    for (let selectCount of this.selectCounts) selectCount.innerHTML = value;
  },
  //-----------------------------------------------------------------------------------------------

  showHands(status) {
    this.rightHandImg.style.display = status ? 'block' : 'none';
    this.leftHandImg.style.display = status ? 'block' : 'none';
  },

  setPlayerIcon(iconUrl = null) {
    if (iconUrl) {
      this.playerIcon.src = iconUrl;
    }
  },

  setPlayerName(name = null) {
    if (name && name !== '') {
      this.playerName.style.display = 'block';
      this.playerNameText.textContent = name;
    }
    else {
      this.playerName.style.display = 'none';
      this.playerNameText.textContent = '';
    }
  }
};
