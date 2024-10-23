import View from './view';
import State from './state';
import Sound from './sound';
import QuestionManager from './question';
import { logController } from './logController';

export default {
  randPositions: [],
  randomQuestion: null,
  questionType: null,
  randomQuestionId: 0,
  answeredNum: 0,
  correctedAnswerNumber: 0,
  totalQuestions: 0,
  score: 0,
  time: 0,
  remainingTime: 0,
  optionSize: 0,
  timer: null,
  timerRunning: false,
  nextQuestion: true,
  randomPair: [],
  wordParts: [],
  answerLength: 0,
  questionWrapper: null,
  answerWrapper: null,
  startedGame: false,
  fillwordTime: 0,
  redBoxX: 0,
  redBoxY: 0,
  redBoxWidth: 0,
  redBoxHeight: 0,
  eachQAMark: 0,
  isPlayLastTen: false,
  starNum: 0,
  touchResetBtn: false,
  usableCells: null,
  apiManager: null,

  init(gameTime = null) {
    this.remainingTime = gameTime !== null ? gameTime : 60;
    this.updateTimerDisplay(this.remainingTime);
    this.randPositions = [];
    //View.showTips('tipsReady');
    this.randomQuestion = null;
    this.questionType = QuestionManager.questionField;
    this.score = 0;
    this.time = 0;
    this.timerRunning = false;
    this.nextQuestion = true;
    this.addScore(0);
    this.randomPair = [];
    this.wordParts = [];
    this.stopCountTime();
    View.scoreBoard.className = "scoreBoard";
    this.questionWrapper = null;
    this.answerWrapper = null;
    this.fillwordTime = 0;
    View.stageImg.innerHTML = '';
    View.optionArea.innerHTML = '';
    this.startedGame = false;
    this.optionSize = View.canvas.width / 8;
    this.answerLength = 0;
    this.answeredNum = 0;
    this.redBoxX = View.canvas.width / 3;
    this.redBoxY = (View.canvas.height / 5) * 3;
    this.redBoxWidth = View.canvas.width / 3;
    this.redBoxHeight = (View.canvas.height / 5) * 2;
    this.eachQAMark = 10;
    View.hideSuccess();
    View.hideFailure();
    for (let i = 1; i < 4; i++) {
      let star = document.getElementById("star" + i);
      if (star) {
        star.classList.remove("show");
      }
    }
    this.isPlayLastTen = false;
    this.starNum = 0;
    this.touchResetBtn = false;
    this.usableCells = null;
    this.apiManager = State.apiManager;
    this.resetProgressBar();
  },

  getProgressColor(value) {
    if (value < 50) {
      return "#4CAF50"; // Green
    } else if (value < 80) {
      return "#FFC107"; // Yellow
    } else {
      return "#E53935"; // Red
    }
  },
  trackingWord(value, hand) {
    requestAnimationFrame(() => {
      var elementName = "progressBar" + hand;
      // logController.log(elementName);
      const progressBar = document.getElementById(elementName);
      const progressRect = progressBar.getElementsByTagName("rect")[0];

      // Map the value to a percentage (0-100)
      const percentage = Math.min(Math.max(value, 0), 100);
      // Update the width and color of the progress bar
      progressRect.setAttribute("width", `${percentage}%`);
      progressRect.setAttribute("fill", "#4CAF50");
    });
  },

  addScore(mark) {
    let currentScore = this.score;
    let newScore = this.score + mark;

    if (newScore < 0)
      newScore = 0;

    if (newScore >= 30 && newScore < 60) {
      this.starNum = 1;
      View.showSuccess();
    }
    else if (newScore >= 60 && newScore <= 90) {
      this.starNum = 2;
    }
    else if (newScore > 90) {
      this.starNum = 3;
    }
    else {
      View.showFailure();
    }

    this.score = newScore;
    //View.scoreText.innerText = this.score;
    this.countUp(View.scoreText, currentScore, this.score, 1000);
  },
  countUp(displayElement, start, end, duration, playEffect = true, unit = "", updateTextColor = true) {
    let startTime = null;
    let lastSoundTime = 0;
    const soundInterval = 200;

    function animate(timestamp) {
      if (!startTime) {
        startTime = timestamp;
        if (updateTextColor) displayElement.style.color = 'yellow';
      }
      const progress = timestamp - startTime;
      // Calculate the current value based on the start value
      const current = Math.min(Math.floor((progress / duration) * (end - start) + start), end);
      displayElement.innerText = current + unit;

      if (current < end) {
        if (State.isSoundOn && (timestamp - lastSoundTime >= soundInterval) && playEffect) {
          Sound.play('score');
          lastSoundTime = timestamp; // Update the last sound time
        }
        requestAnimationFrame(animate);
      }
      else {
        if (updateTextColor) displayElement.style.color = 'white';
      }
    }
    requestAnimationFrame(animate);
  },

  showFinalStars() {
    const delayPerStar = 200;
    const star1 = document.getElementById("star1");
    const star2 = document.getElementById("star2");
    const star3 = document.getElementById("star3");

    if (this.starNum === 1) {
      star1.classList.add('show');
      this.scaleStarUp(star1, 500);
    }
    else if (this.starNum === 2) {
      star1.classList.add('show');
      this.scaleStarUp(star1, 500, () => {
        setTimeout(() => {
          star2.classList.add('show');
          this.scaleStarUp(star2, 500);
        }, delayPerStar);
      });
    }
    else if (this.starNum === 3) {
      star1.classList.add('show');
      this.scaleStarUp(star1, 500, () => {
        setTimeout(() => {
          star2.classList.add('show');
          this.scaleStarUp(star2, 500, () => {
            setTimeout(() => {
              star3.classList.add('show');
              this.scaleStarUp(star3, 500);
            }, delayPerStar);
          });
        }, delayPerStar);
      });
    }
  },

  scaleStarUp(starElement, duration, callback = null) {
    let start = null;
    const initialScale = 0;
    const finalScale = 1;

    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const scale = Math.min(initialScale + (progress / duration), finalScale);
      starElement.style.transform = `scale(${scale})`;
      starElement.style.opacity = scale;

      if (scale < finalScale) {
        requestAnimationFrame(animate);
      } else if (callback) {
        callback();
      }
    }

    requestAnimationFrame(animate);
  },

  startCountTime() {
    if (!this.startedGame) {
      this.time = this.remainingTime;
      this.startedGame = true;
    }

    if (!this.timerRunning) {
      this.showQuestions(true);
      this.timerRunning = true;
      this.countTime();
    }
  },
  countTime() {
    if (this.timerRunning) {
      if (this.nextQuestion) {
        this.setQuestions();
        this.nextQuestion = false;
      }

      //this.wordParts.splice(0);
      //View.optionArea.innerHTML = '';
      if (this.wordParts.length === 0) {
        View.preloadedFallingImages = View.preloadedFallingImages.sort(() => Math.random() - 0.5);
        const halfLength = Math.floor(this.randomPair.length / 2);
        for (let i = 0; i < this.randomPair.length; i++) {
          const optionImageIndex = i % View.preloadedFallingImages.length;
          let isLeft;
          if (i < halfLength) {
            isLeft = true;
          } else if (i < this.randomPair.length - (this.randomPair.length % 2)) {
            isLeft = false;
          } else {
            isLeft = Math.random() < 0.5; // Randomly assign left or right
          }
          this.createRandomPartWord(this.randomPair[i], isLeft, View.preloadedFallingImages[optionImageIndex]);
        }
      }

      this.time--;
      this.updateTimerDisplay(this.time);

      if (this.time <= 10 && !this.isPlayLastTen) {
        if (State.isSoundOn) {
          Sound.play('lastTen', true);
          logController.log('play last ten!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        }
        View.timeText.classList.add('lastTen');
        this.isPlayLastTen = true;
      }

      if (this.time <= 0) {
        this.finishedGame();
      }
      else {
        this.timer = setTimeout(this.countTime.bind(this), 1000);
      }
    }
  },
  stopCountTime() {
    if (this.timerRunning) {
      clearTimeout(this.timer);
      this.timerRunning = false;
      this.showQuestions(false);
    }
  },
  updateTimerDisplay(countdownTime) {
    // Calculate the minutes and seconds
    const minutes = Math.floor(countdownTime / 60);
    const seconds = countdownTime % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    View.timeText.innerText = timeString;
  },
  generateUniqueId() {
    return Math.random().toString(16).slice(2);
  },
  createRandomPartWord(char, isLeft, optionImage, id = null, _optionWrapper = null) {
    if (char && char.length !== 0) {
      const localId = id || this.generateUniqueId();
      //let position = this.randPosition(isLeft, localId);
      if (!this.usableCells) {
        const grid = this.generateGrid();
        this.usableCells = this.getUsableCells(grid);
      }

      const sideCells = isLeft ? this.usableCells.left : this.usableCells.right;
      if (sideCells.length > 0) {
        const randomIndex = this.getRandomInt(0, sideCells.length);
        const randomCell = sideCells.splice(randomIndex, 1)[0];
        const word = char;
        const optionWrapper = _optionWrapper || this.createOptionWrapper(word, localId, optionImage);
        const newPartWord = {
          x: randomCell.x,
          y: randomCell.y,
          size: this.optionSize,
          word: word,
          optionWrapper,
          id: localId,
        };
        // Check for collisions with existing items
        /*let collision = this.checkCollisionWithExistingItems(newPartWord);
        let attempts = 0;
        const maxAttempts = 20;

        while (collision && attempts < maxAttempts) {
          this.wordParts = this.wordParts.filter((item) => item.id !== localId);
          position = this.randPosition(isLeft, localId);
          newPartWord.x = position.x;
          newPartWord.y = position.y;
          collision = this.checkCollisionWithExistingItems(newPartWord);
          attempts++;
        }

        if (!collision) {
          this.wordParts.push(newPartWord);
          this.renderPartItem(newPartWord);
        } else {
          //this.wordParts = this.wordParts.filter((item) => item.id !== localId);
          console.warn('Could not find a valid position for the new part word.');
          newPartWord.x = 0;
          newPartWord.y = 0;
          this.wordParts.push(newPartWord);
          this.renderPartItem(newPartWord);
          //this.createRandomPartWord(char, isLeft, optionImage, localId, optionWrapper);
        }*/

        this.wordParts.push(newPartWord);
        this.renderPartItem(newPartWord);
      }
      else {
        console.warn('No usable cells available for the new part word.');
      }
    }
  },
  checkCollisionWithExistingItems(newPartWord) {
    let collision = false;
    for (let i = 0; i < this.wordParts.length; i++) {
      const existingPart = this.wordParts[i];
      if (this.checkCollision(newPartWord, existingPart)) {
        collision = true;
        break;
      }
    }
    return collision;
  },
  checkCollision(item1, item2) {
    return (
      item1.x < item2.x + item2.size &&
      item1.x + item1.size > item2.x &&
      item1.y < item2.y + item2.size &&
      item1.y + item1.size > item2.y
    );
  },

  generateGrid() {
    const cellSize = this.optionSize;
    const margin = 15;
    const grid = [];
    for (let x = margin; x < View.canvas.width; x += cellSize + margin) {
      for (let y = 150; y < View.canvas.height - (cellSize * 1.6); y += cellSize + margin) {
        grid.push({ x, y });
      }
    }
    return grid;
  },

  getUsableCells(grid) {
    const leftCells = grid.filter(cell => cell.x < this.redBoxX - this.optionSize);
    const rightCells = grid.filter(cell => cell.x > this.redBoxX + this.redBoxWidth && cell.x < View.canvas.width - this.optionSize);
    return { left: leftCells, right: rightCells };
  },

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },
  randPosition(isLeft, id) {
    if (isLeft) {
      return {
        x: Math.round(this.getRandomInt(0, this.redBoxX - this.optionSize)),
        y: Math.round(this.getRandomInt(150, View.canvas.height - (this.optionSize * 2))),
        id,
      }
    }
    else {
      return {
        x: Math.round(this.getRandomInt((this.redBoxX + this.redBoxWidth) + this.optionSize,
          View.canvas.width - this.optionSize)),
        y: Math.round(this.getRandomInt(150, View.canvas.height - (this.optionSize * 2))),
        id,
      }
    }
  },
  createOptionWrapper(text, id, optionImage) {
    let optionWrapper = document.createElement('div');
    optionWrapper.classList.add('optionWrapper');
    optionWrapper.classList.add('fadeIn');
    //logController.log(optionImage);
    if (optionImage !== '' && optionImage !== 'undefined')
      optionWrapper.style.backgroundImage = `url(${optionImage.src})`;
    optionWrapper.style.width = `${this.optionSize}px`;
    optionWrapper.style.height = `${this.optionSize}px`;
    optionWrapper.id = id;
    optionWrapper.value = text;
    let option = document.createElement('span');
    option.classList.add('option');
    //option.type = 'text';
    option.textContent = text;
    let containerWidth = this.optionSize;
    let maxFontSize = 45; // Maximum font size in px
    let minFontSize = 10; // Minimum font size in px
    let fontSize = Math.max(minFontSize, Math.min(maxFontSize, containerWidth / (text.length * 0.65)));
    option.style.fontSize = `${fontSize}px`;
    optionWrapper.appendChild(option);
    return optionWrapper;
  },
  renderPartItem(item) {
    View.optionArea.appendChild(item.optionWrapper);
    item.optionWrapper.classList.add("show");
    item.optionWrapper.style.left = item.x + 'px';
    item.optionWrapper.style.top = item.y + 'px';
  },
  removePartItem(item) {
    const index = this.wordParts.indexOf(item);
    if (index > -1) {
      this.wordParts.splice(index, 1);
      View.optionArea.removeChild(item.optionWrapper);
    }
  },
  removePartItemByIndex(id) {
    const item = this.wordParts.find(item => item.id === id);
    if (item) {
      const index = this.wordParts.indexOf(item);
      this.wordParts.splice(index, 1);
      View.optionArea.removeChild(item.optionWrapper);
    }
  },
  /////////////////////////////////////////Questions///////////////////////////////
  getRandomWord(string) {
    const randomIndex = Math.floor(Math.random() * string.length);
    return string[randomIndex];
  },
  splitByString(source, splitBy) {
    var splitter = source.split(splitBy);
    return splitter;
  },
  generateRandomWrongWords(length, isUpper = false) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < length; i++) {
      var randomIndex = Math.floor(Math.random() * characters.length);
      if (i === 0 && isUpper) {
        result += characters.charAt(randomIndex).toUpperCase();
      } else {
        result += characters.charAt(randomIndex);
      }
    }
    return result;
  },
  generatePrefixesAndSuffixes(defaultStrings) {
    var splitArray = this.splitByString(defaultStrings, '/');
    return splitArray;
  },
  getRandomPair(prefixSuffixPairs) {
    var pairs = [];
    for (let i = 0; i < prefixSuffixPairs.length; i++) {
      pairs.push(prefixSuffixPairs[i]);
    }

    let wrongPairLength = 0;
    if (prefixSuffixPairs.length < 3) {
      wrongPairLength = prefixSuffixPairs.length + 1;
    }
    else {
      if (prefixSuffixPairs.length >= 4)
        wrongPairLength = prefixSuffixPairs.length - 2;
      else
        wrongPairLength = prefixSuffixPairs.length;
    }

    for (let i = 0; i < wrongPairLength; i++) {
      var incorrectPart = this.generateRandomWrongWords(pairs[i].length, i === 0 ? true : false);
      pairs.push(incorrectPart);
    }

    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    return pairs;
  },

  getRandomAnswersPair(answers) {
    var pairs = [];
    for (let i = 0; i < answers.length; i++) {
      pairs.push(answers[i]);
    }
    return pairs;
  },


  randQuestion() {
    if (this.questionType === null || this.questionType === undefined)
      return null;

    let questions = this.questionType.questions;
    this.totalQuestions = questions.length;
    if (this.randomQuestionId === 0) {
      questions = questions.sort(() => Math.random() - 0.5);
      //logController.log("questions", questions);
    }
    const _type = questions[this.randomQuestionId].questionType;
    const _QID = questions[this.randomQuestionId].qid;
    const _question = questions[this.randomQuestionId].question;
    const _answers = questions[this.randomQuestionId].answers;
    const _correctAnswer = questions[this.randomQuestionId].correctAnswer;
    const _star = questions[this.randomQuestionId].star;
    const _score = questions[this.randomQuestionId].score;
    const _correctAnswerIndex = questions[this.randomQuestionId].correctAnswerIndex;
    const _media = questions[this.randomQuestionId].media;

    if (this.randomQuestionId < this.totalQuestions - 1) {
      this.randomQuestionId += 1;
    }
    else {
      this.randomQuestionId = 0;
    }

    //logController.log("answered count", this.answeredNum);
    return {
      QuestionType: _type,
      QID: _QID,
      Question: _question,
      Answers: _answers,
      CorrectAnswer: _correctAnswer,
      Star: _star,
      Score: _score,
      CorrectAnswerId: _correctAnswerIndex,
      Media: _media,
    };
  },
  setQuestions() {
    //logController.log("this.redBoxWidth", this.redBoxWidth);
    this.randomQuestion = this.randQuestion();
    if (this.randomQuestion.QuestionType === 'pair' || this.randomQuestion.QuestionType === 'picture') {
      const prefixSuffixPairs = this.generatePrefixesAndSuffixes(this.randomQuestion.Question);
      this.answerLength = prefixSuffixPairs.length;
      this.randomPair = this.getRandomPair(prefixSuffixPairs);
    }
    else {
      this.answerLength = 1;
      this.randomPair = this.getRandomAnswersPair(this.randomQuestion.Answers);
    }

    let questionBg = document.createElement('div');
    this.answerWrapper = document.createElement('span');
    let resetBtn = document.createElement('div');
    //resetBtn.classList.add('resetBtn');
    let resetTouchBtn = document.createElement('button');
    resetTouchBtn.classList.add('resetBtn');
    let questionText = null;

    switch (this.randomQuestion.QuestionType) {
      case 'text':
        questionText = document.createElement('span');
        questionBg.classList.add('questionImgBg');
        questionText.classList.add('questionText');
        questionText.textContent = this.randomQuestion.Question;
        View.stageImg.appendChild(questionBg);
        View.stageImg.appendChild(questionText);
        //var fontSize = `calc(min(max(4vh, 6vh - ${this.randomQuestion.Question.length} * 0.1vh), 6vh))`;
        //this.questionWrapper.style.setProperty('--question-font-size', fontSize);
        this.answerWrapper.classList.add('pictureType');
        resetTouchBtn.style.opacity = 0;
        break;
      case 'pair':
        questionText = document.createElement('span');
        questionBg.classList.add('questionBg');
        questionText.classList.add('questionText');
        questionText.textContent = this.randomQuestion.CorrectAnswer;
        //this.questionWrapper.classList.add('questionWrapper');
        View.stageImg.appendChild(questionBg);
        View.stageImg.appendChild(questionText);
        this.answerWrapper.classList.add('textType');
        resetTouchBtn.classList.add('resetTextType');
        break;
      case 'picture':
        this.questionWrapper = document.createElement('div');
        this.questionWrapper.classList.add('questionImageWrapper');
        questionBg.classList.add('questionImgBg');
        View.stageImg.appendChild(questionBg);

        if (QuestionManager.preloadedImagesItem && QuestionManager.preloadedImagesItem.length > 0) {
          //let imageFile = imageFiles.find(([name]) => name === this.randomQuestion.QID);
          let currentImagePath = '';
          let imageFile = null;
          QuestionManager.preloadedImagesItem.forEach((img) => {
            if (img.id === this.randomQuestion.QID) {
              imageFile = img.src;
              //logController.log("imageFile", imageFile);
            }
          });

          if (imageFile) {
            currentImagePath = imageFile;
            var imageElement = document.createElement('img');
            imageElement.src = currentImagePath;
            imageElement.alt = 'image';
            imageElement.classList.add('questionImage');
            this.questionWrapper.appendChild(imageElement);
          }
        }
        this.answerWrapper.classList.add('pictureType');
        resetTouchBtn.classList.add('resetPictureType');
        View.stageImg.appendChild(this.questionWrapper);
        break;
    }

    resetTouchBtn.addEventListener('mousedown', () => {
      this.touchResetBtn = true;
      this.resetFillWord(resetTouchBtn);
    });

    resetTouchBtn.addEventListener('mouseup', () => {
      this.touchResetBtn = false;
      resetTouchBtn.classList.remove('active');
    });
    resetTouchBtn.addEventListener('touchstart', (event) => {
      event.preventDefault(); // Prevent default touch behavior
      this.touchResetBtn = true;
      this.resetFillWord(resetTouchBtn);
    });

    resetTouchBtn.addEventListener('touchend', (event) => {
      event.preventDefault(); // Prevent default touch behavior
      this.touchResetBtn = false;
      resetTouchBtn.classList.remove('active');
    });

    resetBtn.appendChild(resetTouchBtn);

    this.answerWrapper.classList.add('answerWrapper');
    View.stageImg.appendChild(resetBtn);
    View.stageImg.appendChild(this.answerWrapper);
    View.stageImg.classList.add('fadeIn');
    View.stageImg.style.opacity = 1;
  },
  showQuestions(status) {
    View.stageImg.style.display = status ? '' : 'none';
    View.optionArea.style.display = status ? '' : 'none';
  },
  finishedGame() {
    this.stopCountTime();
    View.timeText.classList.remove('lastTen');
    State.changeState('finished');
    this.startedGame = false;
  },
  ///////////////////////////////////////////Merge words//////////////////////////////////

  mergeWord(option) {
    if (this.answerWrapper) {
      if (this.fillwordTime < this.answerLength) {
        this.answerWrapper.textContent += option.value;
        option.classList.add('touch');
        this.fillwordTime += 1;
        if (State.isSoundOn) {
          Sound.stopAll(['bgm', 'lastTen']);
          Sound.play('btnClick');
        }
        if (this.fillwordTime == this.answerLength) {
          setTimeout(() => {
            this.checkAnswer(this.answerWrapper.textContent);
          }, 300);
        }
      }
    }
  },
  resetFillWord(resetBtn = null, playResetSound = true) {
    if (this.answerWrapper.textContent !== '') {
      if (resetBtn) resetBtn.classList.add('active');
      if (State.isSoundOn && playResetSound) {
        Sound.stopAll(['bgm', 'lastTen']);
        Sound.play('btnClick');
      }
      let optionWrappers = document.querySelectorAll('.canvasWrapper > .optionArea > .optionWrapper.show');
      for (let option of optionWrappers) option.classList.remove('touch');
      this.answerWrapper.classList.remove('correct');
      this.answerWrapper.classList.remove('wrong');
      this.answerWrapper.textContent = '';
      this.fillwordTime = 0;
    }
  },
  moveToNextQuestion() {
    this.resetFillWord(null, false);
    this.nextQuestion = true;
    View.optionArea.innerHTML = '';
    View.stageImg.innerHTML = '';
    this.wordParts.splice(0);
    this.usableCells = null;
  },
  ////////////////////////////Added Submit Answer API/////////////////////////////////////////////////////
  checkAnswer(answer) {
    if (this.answerWrapper === null) return;
    const isCorrect = answer.toLowerCase() === this.randomQuestion.CorrectAnswer.toLowerCase();
    const eachQAScore = this.getScoreForQuestion();

    if (isCorrect) {
      //答岩1分，答錯唔扣分
      this.addScore(eachQAScore);
      this.answerWrapper.classList.add('correct');
      State.changeState('playing', 'ansCorrect');
      View.showCorrectEffect(true);
    } else {
      //this.addScore(-1);
      this.answerWrapper.classList.add('wrong');
      State.changeState('playing', 'ansWrong');
      View.showWrongEffect(true);
    }

    this.updateAnsweredProgressBar(() => {
      logController.log("finished question");
      this.finishedGame();
      return null;
    });

    this.uploadAnswerToAPI(answer, this.randomQuestion, eachQAScore); ////submit answer api//////
  },
  getScoreForQuestion() {
    return this.randomQuestion.Score ? this.randomQuestion.Score : this.eachQAMark;
  },
  answeredPercentage() {
    if (this.totalQuestions === 0) return 0;
    return (this.correctedAnswerNumber / this.totalQuestions) * 100;
  },
  uploadAnswerToAPI(answer, currentQuestion, eachMark) {
    if (!this.apiManager || !this.apiManager.isLogined || answer === '') return;
    logController.log(`Game Time: ${this.remainingTime}, Remaining Time: ${this.time}`);
    const currentTime = this.calculateCurrentTime();
    const progress = this.calculateProgress();
    const { correctId, score, currentQAPercent } = this.calculateAnswerMetrics(answer, currentQuestion, eachMark);
    const answeredPercentage = this.calculateAnsweredPercentage();
    this.apiManager.SubmitAnswer(
      currentTime,
      this.score,
      answeredPercentage,
      progress,
      correctId,
      currentTime,
      currentQuestion.QID,
      currentQuestion.CorrectAnswerId,
      answer,
      currentQuestion.CorrectAnswer,
      score,
      currentQAPercent
    );
  },
  calculateCurrentTime() {
    return Math.floor(((this.remainingTime - this.time) / this.remainingTime) * 100);
  },
  calculateProgress() {
    return Math.floor((this.answeredNum / this.totalQuestions) * 100);
  },
  calculateAnswerMetrics(answer, currentQuestion, eachMark) {
    let correctId = 0;
    let score = 0;
    let currentQAPercent = 0;

    if (answer === currentQuestion.CorrectAnswer) {
      this.correctedAnswerNumber = Math.min(this.correctedAnswerNumber + 1, this.totalQuestions);
      correctId = 2;
      score = eachMark;
      currentQAPercent = 100;
    }
    logController.log("Corrected Answer Number: ", this.correctedAnswerNumber);
    return { correctId, score, currentQAPercent };
  },
  calculateAnsweredPercentage() {
    return this.correctedAnswerNumber < this.totalQuestions
      ? this.answeredPercentage(this.totalQuestions)
      : 100;
  },

  updateAnsweredProgressBar(onCompleted = null) {
    if (this.apiManager.isLogined) {
      let progress = 0;
      if (this.answeredNum < this.totalQuestions) {
        this.answeredNum += 1;
        progress = this.answeredNum / this.totalQuestions;
      }
      else {
        progress = 1;
      }

      let progressColorBar = document.getElementById("progressColorBar");
      let progressText = document.querySelector('.progressText');

      if (progressColorBar) {
        let rightPosition = (100 - (progress * 100)) + "%";
        progressColorBar.style.setProperty('--progress-right', rightPosition);

        const targetPercentage = Math.round(progress * 100);
        this.countUp(progressText, Number(progressText.innerText.replace('%', '')) || 0, targetPercentage, 500, false, "%", false);

        if (progress >= 1) {
          setTimeout(() => {
            if (onCompleted) onCompleted();
          }, 500);
        }
      }
    }
  },
  resetProgressBar() {
    if (this.apiManager.isLogined) {
      this.answeredNum = 0; // Reset answered questions
      let progressColorBar = document.getElementById("progressColorBar");
      let progressText = document.querySelector('.progressText');

      if (progressColorBar) {
        progressColorBar.style.setProperty('--progress-right', "100%"); // Reset position
      }

      if (progressText) {
        progressText.textContent = "0%"; // Reset text
      }
    }
  }

}
