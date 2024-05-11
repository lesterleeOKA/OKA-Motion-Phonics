import View from './view';
import State from './state';
import Sound from './sound';

export default {
  randPositions: [],
  questionWord: '',
  score: 0,
  time: 0,
  remainingTime: 60,
  optionSize: 10,
  timer: null,
  timerRunning: false,
  nextQuestion: true,
  randomPair: [],
  wordParts: [],
  defaultStrings: ['apple', 'banana', 'cherry', 'orange', 'pear'],
  questionWrapper: null,
  startedGame: false,
  fillwordTime: 0,

  init() {
    this.randPositions = [];
    this.remainingTime = 60;
    View.timeText.innerText = this.remainingTime;
    View.showTips('tipsReady');
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
    this.fillwordTime = 0;
    View.stageImg.innerHTML = '';
    View.optionArea.innerHTML = '';
    this.startedGame = false;
    this.optionSize = View.canvas.width / 8;
  },

  addScore(mark) {
    let newScore = this.score + mark;
    if (newScore < 0) newScore = 0;
    this.score = newScore;
    View.scoreText.innerText = this.score;
    View.finishedScore.innerText = this.score;
  },

  startCountTime() {
    if(!this.startedGame) {
      this.time = this.remainingTime;
      this.startedGame = true;
    }

    if (!this.timerRunning) {
      this.showQuestions(true);

      this.timer = setInterval(() => {
        //this.wordParts.splice(0);
       // View.optionArea.innerHTML = '';

        if (this.nextQuestion) {
          this.setQuestions();
          this.nextQuestion = false;
        }

        if (this.wordParts.length === 0) {
          for (var i = 0; i < this.randomPair.length; i++) {
            this.createRandomPartWord(this.randomPair[i]);
          }
        }

        this.time--;
        View.timeText.innerText = this.time;

        if (this.time <= 0) {
          this.stopCountTime();
          State.changeState('finished');
        }
      }, 1000);
      this.timerRunning = true;
    }
  },
  stopCountTime() {
    if (this.timerRunning) {
      clearInterval(this.timer);
      this.showQuestions(false);
      this.timerRunning = false;
    }
  },

  generateUniqueId() {
    return Math.random().toString(16).slice(2);
  },
  createRandomPartWord(char) {
    if (char && char.length !== 0) {
      const word = char;
      const id = this.generateUniqueId();
      const optionWrapper = this.createOptionWrapper(word, id);
      const position = this.getRandomPosition(optionWrapper);
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
          this.createRandomPartWord(char);
        }
      }
    }
  },

  checkCollision(item1, item2) {
    return (
      item1.x < item2.x + item2.size &&
      item1.x + item1.size> item2.x &&
      item1.y < item2.y + item2.size &&
      item1.y + item1.size > item2.y
    );
  },
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },

  generatePositionsArray(numItems, maxX, maxY, objectSize) {
    // declarations
    var positionsArray = [];
    var i;
    for (i = 0; i < numItems; i++) {
      positionsArray.push({
        x: Math.round(this.getRandomInt(0, maxX - objectSize)),
        y: Math.round(this.getRandomInt(220, maxY - objectSize)),
      });
    }
    // return array
    return positionsArray;
  },

  getRandomPosition(optionWrapper) {

    if(optionWrapper) {
      //console.log("ow", optionWrapper);
      const positionsArray = this.generatePositionsArray(
        4,
        View.canvas.width,
        View.canvas.height,
        this.optionSize,
      );
    
      for (const position of positionsArray) {
        const { x, y } = position;  
        const redBoxX = View.canvas.width / 3;
        const redBoxY = (View.canvas.height / 5) * 3;
        const redBoxWidth = View.canvas.width / 3;
        const redBoxHeight = (View.canvas.height / 5) * 2;
  
        if (
          x + this.optionSize < redBoxX ||    
          x - this.optionSize > redBoxX + redBoxWidth ||
          y - this.optionSize > redBoxY + redBoxHeight
        ) {
          return position;
        }
      }  
    }
    
    return this.getRandomPosition(optionWrapper);
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
    option.style.width = `${this.optionSize-20}px`;
    option.style.height = `${this.optionSize-20}px`;
    option.style.border = `${this.optionSize}px solid transparent`;
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

  generatePrefixesAndSuffixes(word) {
    const prefixSuffixPairs = [];

    for (let i = 1; i < word.length; i++) {
      const prefix = word.substring(0, i);
      const suffix = word.substring(i);
      prefixSuffixPairs.push([prefix, suffix]);
    }

    return prefixSuffixPairs;
  },
  getRandomPair(prefixSuffixPairs) {
    const correctPairIndex = Math.floor(Math.random() * prefixSuffixPairs.length);
    const correctPair = prefixSuffixPairs[correctPairIndex];
    prefixSuffixPairs.splice(correctPairIndex, 1);
    const incorrectPairIndex = Math.floor(Math.random() * prefixSuffixPairs.length);
    const incorrectPair = prefixSuffixPairs[incorrectPairIndex];
    return [correctPair[0], correctPair[1], incorrectPair[0], incorrectPair[1]];
  },
  setQuestions() {
    this.questionWord = this.getRandomWord(this.defaultStrings);
    const prefixSuffixPairs = this.generatePrefixesAndSuffixes(this.questionWord);
    this.randomPair = this.getRandomPair(prefixSuffixPairs);
    this.questionWrapper = document.createElement('input');
    this.questionWrapper.classList.add('questionWrapper');
    this.questionWrapper.classList.add('fadeIn');
    this.questionWrapper.setAttribute('answer', this.questionWord);
    //questionWrapper.textContent = this.questionWord;
    View.stageImg.appendChild(this.questionWrapper);
  },
  showQuestions(status) {
    View.stageImg.style.display = status ? '' : 'none';
    View.optionArea.style.display = status ? '' : 'none';
  },
  ///////////////////////////////////////////Merge words//////////////////////////////////

  mergeWord(option) {
    if (this.questionWrapper) {
      if (this.fillwordTime < 2) {
        this.questionWrapper.value += option.value;
        option.classList.add('touch');
        this.fillwordTime += 1;
        if (State.isSoundOn) {
          Sound.stopAll('bgm');
          Sound.play('btnClick');
        }
        if (this.fillwordTime == 2) {
          setTimeout(() => {
            this.checkAnswer(this.questionWrapper.value);
          }, 1000);
        }
      }
    }
  },

  resetFillWord() {
    this.questionWrapper.value = '';
    this.fillwordTime = 0;
  },

  checkAnswer(answer) {
    if (this.questionWrapper) {
      if (answer === this.questionWrapper.getAttribute('answer')) {
        //答岩1分，答錯唔扣分
        this.addScore(1);
        State.changeState('playing', 'ansCorrect');
      } else {
        //this.addScore(-1);
        State.changeState('playing', 'ansWrong');
      }
    }
  },

  moveToNextQuestion() {
    setTimeout(() => {
      this.resetFillWord();
      this.nextQuestion = true;
      View.optionArea.innerHTML = '';
      View.stageImg.innerHTML = '';
      this.wordParts.splice(0);
    }, 1000);
  }

}
