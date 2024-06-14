import View from './view';
import State from './state';
import Sound from './sound';
import QuestionManager from './question';

export default {
  optionImages: [
    require("./images/phonics/candy1.png"),
    require("./images/phonics/candy2.png"),
    require("./images/phonics/candy3.png"),
    require("./images/phonics/candy4.png"),
    require("./images/phonics/candy5.png"),
  ],
  randPositions: [],
  questionWord: null,
  questionField: null,
  answeredNum: 0,
  score: 0,
  time: 0,
  remainingTime: 180,
  optionSize: 0,
  timer: null,
  timerRunning: false,
  nextQuestion: true,
  randomPair: [],
  wordParts: [],
  answerLength: 0,
  questionWrapper: null,
  questionResult: null,
  startedGame: false,
  fillwordTime: 0,
  redBoxX: 0,
  redBoxY: 0,
  redBoxWidth: 0,
  redBoxHeight: 0,
  eachQAMark: 0,


  init() {
    this.randPositions = [];
    this.updateTimerDisplay(this.remainingTime);
    //View.showTips('tipsReady');
    this.questionWord = null;
    this.questionField = null;
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
    this.questionResult = null;
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
  },


  addScore(mark) {
    let newScore = this.score + mark;
    let starNum = 0;

    if (newScore < 0)
      newScore = 0;

    if (newScore >= 30 && newScore < 60) {
      starNum = 1;
      const star1 = document.getElementById("star1");
      star1.classList.add('show');
      View.showSuccess();
    }
    else if (newScore >= 60 && newScore <= 90) {
      starNum = 2;
      const star2 = document.getElementById("star2");
      star2.classList.add('show');
    }
    else if (newScore > 90) {
      starNum = 3;
      const star3 = document.getElementById("star3");
      star3.classList.add('show');
    }
    else {
      View.showFailure();
    }

    this.score = newScore;
    View.scoreText.innerText = this.score;
    View.finishedScore.innerText = this.score;
  },

  startCountTime() {
    if (!this.startedGame) {
      this.time = this.remainingTime;
      QuestionManager.loadQuestionData();
      this.questionField = QuestionManager.questionType();
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
        this.optionImages = this.optionImages.sort(() => Math.random() - 0.5);
        //console.log(this.optionImages);
        const halfLength = Math.floor(this.randomPair.length / 2);
        for (let i = 0; i < this.randomPair.length; i++) {
          const optionImageIndex = i % this.optionImages.length;
          let isLeft;
          if (i < halfLength) {
            isLeft = true;
          } else if (i < this.randomPair.length - (this.randomPair.length % 2)) {
            isLeft = false;
          } else {
            isLeft = Math.random() < 0.5; // Randomly assign left or right
          }
          this.createRandomPartWord(this.randomPair[i], isLeft, this.optionImages[optionImageIndex]);
        }
      }

      this.time--;
      this.updateTimerDisplay(this.time);

      if (this.time <= 0) {
        this.stopCountTime();
        State.changeState('finished');
      } else {
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
      let position = this.randPosition(isLeft, localId);
      if (position) {
        const word = char;
        const optionWrapper = _optionWrapper || this.createOptionWrapper(word, localId, optionImage);
        const newPartWord = {
          x: position.x,
          y: position.y,
          size: this.optionSize,
          word: word,
          optionWrapper,
          id: localId,
        };
        // Check for collisions with existing items
        let collision = this.checkCollisionWithExistingItems(newPartWord);

        if (!collision) {
          this.wordParts.push(newPartWord);
          this.renderPartItem(newPartWord);
        } else {
          position = this.randPosition(isLeft, localId);
          newPartWord.x = position.x;
          newPartWord.y = position.y;
          this.createRandomPartWord(char, isLeft, optionImage, localId, optionWrapper);
        }
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
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },
  randPosition(isLeft, id) {
    if (isLeft) {
      return {
        x: Math.round(this.getRandomInt(0, this.redBoxX - this.optionSize)),
        y: Math.round(this.getRandomInt(150, View.canvas.height - this.optionSize)),
        id,
      }
    }
    else {
      return {
        x: Math.round(this.getRandomInt((this.redBoxX + this.redBoxWidth) + this.optionSize,
          View.canvas.width - this.optionSize)),
        y: Math.round(this.getRandomInt(150, View.canvas.height - this.optionSize)),
        id,
      }
    }
  },
  createOptionWrapper(text, id, optionImage) {
    let optionWrapper = document.createElement('div');
    optionWrapper.classList.add('optionWrapper');
    optionWrapper.classList.add('fadeIn');
    //console.log(optionImage);
    if (optionImage !== '' && optionImage !== 'undefined')
      optionWrapper.style.backgroundImage = `url(${optionImage})`;
    optionWrapper.style.width = `${this.optionSize}px`;
    optionWrapper.style.height = `${this.optionSize}px`;
    optionWrapper.id = id;
    optionWrapper.value = text;
    let option = document.createElement('input');
    option.classList.add('option');
    option.type = 'text';
    option.value = text;
    option.style.fontSize = `${this.optionSize / 3.5}px`;
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

    var wrongPairLength = prefixSuffixPairs.length < 3 ? prefixSuffixPairs.length + 1 : prefixSuffixPairs.length;
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

  randQuestion() {
    if (this.questionField === null)
      return null;

    let questions = this.questionField.QA;
    if (this.answeredNum === 0) {
      questions = questions.sort(() => Math.random() - 0.5);
      //console.log("questions", questions);
    }
    const _type = questions[this.answeredNum].type;
    const _QID = questions[this.answeredNum].QID;
    const _question = questions[this.answeredNum].question;
    const _answers = questions[this.answeredNum].answers;
    const _correctAnswer = questions[this.answeredNum].correctAnswer;
    const _media = questions[this.answeredNum].media;

    if (this.answeredNum < questions.length - 1) {
      this.answeredNum += 1;
    }
    else {
      this.answeredNum = 0;
    }
    //console.log("answered count", this.answeredNum);
    return {
      type: _type,
      QID: _QID,
      question: _question,
      answers: _answers,
      correctAnswer: _correctAnswer,
      media: _media,
    };
  },
  setQuestions() {
    //console.log("this.redBoxWidth", this.redBoxWidth);
    this.questionWord = this.randQuestion();
    const prefixSuffixPairs = this.generatePrefixesAndSuffixes(this.questionWord.question);
    this.answerLength = prefixSuffixPairs.length;
    this.randomPair = this.getRandomPair(prefixSuffixPairs);
    let questionBg = document.createElement('div');
    let questionText = document.createElement('span');
    let resetBtn = document.createElement('div');
    questionBg.classList.add('questionBg');
    resetBtn.classList.add('resetBtn');
    questionText.classList.add('questionText');
    questionText.textContent = this.questionWord.correctAnswer;
    this.questionWrapper = document.createElement('span');
    //this.questionWrapper.style.width = this.redBoxWidth + 'px';
    this.questionWrapper.classList.add('questionWrapper');
    View.stageImg.appendChild(questionBg);
    View.stageImg.appendChild(questionText);
    View.stageImg.appendChild(resetBtn);
    View.stageImg.appendChild(this.questionWrapper);
    View.stageImg.classList.add('fadeIn');
    View.stageImg.style.opacity = 1;
  },
  showQuestions(status) {
    View.stageImg.style.display = status ? '' : 'none';
    View.optionArea.style.display = status ? '' : 'none';
  },
  ///////////////////////////////////////////Merge words//////////////////////////////////

  mergeWord(option) {
    if (this.questionWrapper) {
      if (this.fillwordTime < this.answerLength) {
        this.questionWrapper.textContent += option.value;
        option.classList.add('touch');
        this.fillwordTime += 1;
        if (State.isSoundOn) {
          Sound.stopAll('bgm');
          Sound.play('btnClick');
        }
        if (this.fillwordTime == this.answerLength) {
          setTimeout(() => {
            this.checkAnswer(this.questionWrapper.textContent);
          }, 300);
        }
      }
    }
  },
  resetFillWord() {
    this.questionWrapper.classList.remove('correct');
    this.questionWrapper.classList.remove('wrong');
    this.questionWrapper.textContent = '';
    this.fillwordTime = 0;
  },
  checkAnswer(answer) {
    if (this.questionWrapper) {
      if (answer === this.questionWord.correctAnswer) {
        //答岩1分，答錯唔扣分
        this.addScore(this.eachQAMark);
        this.questionWrapper.classList.add('correct');
        State.changeState('playing', 'ansCorrect');
        View.showCorrectEffect(true);
      } else {
        //this.addScore(-1);
        this.questionWrapper.classList.add('wrong');
        State.changeState('playing', 'ansWrong');
      }
    }
  },
  moveToNextQuestion() {
    this.resetFillWord();
    this.nextQuestion = true;
    View.optionArea.innerHTML = '';
    View.stageImg.innerHTML = '';
    this.wordParts.splice(0);
  }

}
