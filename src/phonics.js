import View from './view';
import State from './state';
import Sound from './sound';

export default {
  randPositions: [],
  questionWord: '',
  score: 0,
  time: 0,
  remainingTime: 1000,
  optionSize: 0,
  timer: null,
  timerRunning: false,
  nextQuestion: true,
  randomPair: [],
  wordParts: [],
  defaultStrings: ['ap/ple', 'ba/na/na', 'ch/erry', 'or/ange', 'pe/ar'],
  answerLength: 0,
  maxOpition: 4,
  questionWrapper: null,
  questionResult: null,
  startedGame: false,
  fillwordTime: 0,
  redBoxX: 0,
  redBoxY: 0,
  redBoxWidth: 0,
  redBoxHeight: 0,


  init() {
    this.randPositions = [];
    View.timeText.innerText = this.remainingTime;
    //View.showTips('tipsReady');
    this.questionWord = '';
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

    this.redBoxX = View.canvas.width / 3;
    this.redBoxY = (View.canvas.height / 5) * 3;
    this.redBoxWidth = View.canvas.width / 3;
    this.redBoxHeight = (View.canvas.height / 5) * 2;

    //console.log('redBox-left-X', this.redBoxX);
    //console.log('redBox-right-X', this.redBoxX + this.redBoxWidth);

    //console.log(this.redBoxX, this.redBoxY, this.redBoxWidth, this.redBoxHeight);
  },


  addScore(mark) {
    let newScore = this.score + mark;
    if (newScore < 0) newScore = 0;
    this.score = newScore;
    View.scoreText.innerText = this.score;
    View.finishedScore.innerText = this.score;
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
        for (var i = 0; i < this.randomPair.length; i++) {
          if (i < 2)
            this.createRandomPartWord(this.randomPair[i], true);
          else
            this.createRandomPartWord(this.randomPair[i], false);
        }
      }

      this.time--;
      View.timeText.innerText = this.time;

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
  generateUniqueId() {
    return Math.random().toString(16).slice(2);
  },
  createRandomPartWord(char, isLeft) {
    if (char && char.length !== 0) {
      const word = char;
      const id = this.generateUniqueId();
      const optionWrapper = this.createOptionWrapper(word, id);
      const position = this.getRandomPosition(optionWrapper, isLeft);
      if (position) {
        const generatePosition = () => {
          const newPart = {
            x: position.x,
            y: position.y,
            size: this.optionSize,
            word: word,
            optionWrapper,
            id,
          };
          return newPart;
        };
        const newPartWord = generatePosition();
        // Check for collisions with existing items
        let collision = false;
        for (let i = 0; i < this.wordParts.length; i++) {
          const existingPart = this.wordParts[i];
          if (this.checkCollision(newPartWord, existingPart)) {
            collision = true;
            break;
          }
        }

        if (!collision) {
          this.wordParts.push(newPartWord);
          this.renderPartItem(newPartWord);
        } else {
          //console.log('Collision detected. Skipping item creation.');
          this.createRandomPartWord(char, isLeft);
        }
      }
    }
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
  randPosition(isLeft) {
    if (isLeft) {
      return {
        x: Math.round(this.getRandomInt(0, this.redBoxX - this.optionSize)),
        y: Math.round(this.getRandomInt(150, View.canvas.height - this.optionSize)),
      }
    }
    else {
      return {
        x: Math.round(this.getRandomInt((this.redBoxX + this.redBoxWidth) + this.optionSize,
          View.canvas.width - this.optionSize)),
        y: Math.round(this.getRandomInt(150, View.canvas.height - this.optionSize)),
      }
    }
  },
  getRandomPosition(optionWrapper, isLeft) {
    if (optionWrapper) {
      let position = this.randPosition(isLeft);
      return position;
    }
    else
      return null;
  },
  createOptionWrapper(text, id) {
    let optionWrapper = document.createElement('div');
    optionWrapper.classList.add('optionWrapper');
    optionWrapper.classList.add('fadeIn');
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
  /////////////////////////////////////////QUestions///////////////////////////////
  getRandomWord(string) {
    const randomIndex = Math.floor(Math.random() * string.length);
    return string[randomIndex];
  },
  splitByString(source, splitBy) {
    var splitter = source.split(splitBy);
    return splitter;
  },
  generateRandomWrongWords(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < length; i++) {
      var randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
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

    var wrongPairLength = prefixSuffixPairs.length > 2 ? (this.maxOpition - prefixSuffixPairs.length) :
      (prefixSuffixPairs.length);
    for (let i = 0; i < wrongPairLength; i++) {
      var incorrectPart = this.generateRandomWrongWords(pairs[i].length);
      pairs.push(incorrectPart);
    }

    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    return pairs;
  },
  setQuestions() {
    this.questionWord = this.getRandomWord(this.defaultStrings);
    const prefixSuffixPairs = this.generatePrefixesAndSuffixes(this.questionWord);
    this.answerLength = prefixSuffixPairs.length;
    this.randomPair = this.getRandomPair(prefixSuffixPairs);
    this.questionWrapper = document.createElement('span');
    this.questionWrapper.classList.add('questionWrapper');
    this.questionWrapper.classList.add('fadeIn');
    this.questionWrapper.setAttribute('answer', this.questionWord.replace(/\//g, ""));
    View.stageImg.appendChild(this.questionWrapper);
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
          }, 1000);
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
      if (answer === this.questionWrapper.getAttribute('answer')) {
        //答岩1分，答錯唔扣分
        this.addScore(1);
        this.questionWrapper.classList.add('correct');
        State.changeState('playing', 'ansCorrect');
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
