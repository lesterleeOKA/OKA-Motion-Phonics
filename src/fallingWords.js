import View from './view';
import State from './state';

export default {
  fallingId: 0,
  questionWord: '',
  itemDistance: 200,
  score: 0,
  time: 0,
  timer: null,
  timerRunning: false,
  nextQuestion: true,
  randomPair: [],
  fallingItems: [],
  defaultStrings: ['apple', 'banana', 'cherry', 'orange', 'pear'],

  init() {
    View.showTips('tipsReady');
    this.fallingId = 0;
    this.questionWord = '';
    this.itemDistance = 200;
    this.score = 0;
    this.time = 0;
    this.timerRunning = false;
    this.nextQuestion = true;
    this.addScore(0);
    this.randomPair = [];
    this.fallingItems = [];
    this.stopCountTime();
    View.scoreBoard.className = "scoreBoard";
    this.defaultStrings = ['apple', 'banana', 'cherry', 'orange', 'pear'];
  },

  addScore(mark) {
    let newScore = this.score + mark;
    if (newScore < 0) newScore = 0;
    this.score = newScore;
    View.scoreText.innerText = this.score;
  },
  startCountTime() {
    if (!this.timerRunning) {
      this.showQuestions();

      if (this.nextQuestion) {
        this.setQuestions();
        this.nextQuestion = false;
      }

      this.timer = setInterval(() => {
        if (this.fallingItems.length < this.randomPair.length) {
          if (this.fallingId < this.fallingItems.length) {
            this.fallingId += 1;
          }
          else {
            this.fallingId = 0;
          }
          this.createRandomItem(this.randomPair[this.fallingId]);
        }
        this.time++;
      }, this.getRandomSpeed(1500, 4000));
      this.timerRunning = true;
    }
  },
  stopCountTime() {
    if (this.timerRunning) {
      clearInterval(this.timer);
      this.closeQuestions();
      this.timerRunning = false;
    }
  },
  getTranslateYValue(transformStyle) {
    const translateYRegex = /translateY\((-?\d+\.?\d*)px\)/;
    const match = transformStyle.match(translateYRegex);
    if (match && match[1]) {
      return parseFloat(match[1]);
    }
    return 0;
  },
  updateFallingItems() {
    // console.log(this.fallingItems);
    this.fallingItems.forEach((item) => {
      // Check if the item has reached the bottom
      const element = document.getElementById(item.id);
      const transformStyle = window.getComputedStyle(element).getPropertyValue('transform');
      const translateYValue = this.getTranslateYValue(transformStyle);
      const bottomHeight = View.canvas.height; // Replace with your desired bottom height

      // Check if the translateY value has reached the bottom height
      if (translateYValue >= bottomHeight) {
        this.handleItemReachedBottom(item);
      }
    });
    requestAnimationFrame(this.updateFallingItems.bind(this));
  },
  getRandomSpeed(minSpeed, maxSpeed) {
    const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
    return speed;
  },
  generateUniqueId() {
    return Math.random().toString(16).slice(2);
  },
  createRandomItem(char) {
    if (char && char.length !== 0) {
      const word = char;
      const generatePosition = () => {
        const x = this.generatePositionX();
        const speed = this.getRandomSpeed(0.5, 2);
        const id = this.generateUniqueId();
        const optionWrapper = this.createOptionWrapper(word, id);
        const newFallingItem = {
          x,
          optionWrapper,
          id,
          speed
        };
        return newFallingItem;
      };

      const newFallingItem = generatePosition();
      this.fallingItems.push(newFallingItem);
      this.renderFallingItem(newFallingItem);
    }
  },

  generatePositionX() {
    const segmentCount = 5; // Adjust the number of segments as needed
    const segmentWidth = View.canvas.width * 0.75 / segmentCount;
    const segmentIndex = Math.floor(Math.random() * segmentCount);
    const x = (segmentIndex * segmentWidth) + (Math.random() * segmentWidth);
    return x;
  },
  createOptionWrapper(text, id) {
    let optionWrapper = document.createElement('div');
    optionWrapper.classList.add('optionWrapper');
    optionWrapper.id = id;
    let option = document.createElement('input');
    option.classList.add('option');
    option.type = 'text';
    option.value = text;
    optionWrapper.appendChild(option);
    return optionWrapper;
  },
  renderFallingItem(item) {
    View.optionArea.appendChild(item.optionWrapper);
    item.optionWrapper.classList.add("show");
    item.optionWrapper.style.left = item.x + 'px';
    item.optionWrapper.style.setProperty('--top-height', `${-(View.canvas.height * 0.1)}px`);
    item.optionWrapper.style.setProperty('--bottom-height', `${View.canvas.height}px`);

    item.optionWrapper.addEventListener('animationend', () => {
      item.optionWrapper.classList.remove('show');
      setTimeout(() => {
        this.handleItemReachedBottom(item.optionWrapper);
        item.optionWrapper.classList.add('show'); // Resume the animation after a short delay
      }, this.getRandomSpeed(1500, 4000));
    });
  },


  randomizeTranslateX(item) {
    console.log("Finished");
    const randomTranslateX = Math.random() * View.canvas.width * 0.75;
    item.style.transform = `translateX(${randomTranslateX}%)`;
  },

  getRandomWord(string) {
    const randomIndex = Math.floor(Math.random() * string.length);
    return string[randomIndex];
  },
  handleItemReachedBottom(item) {
    item.x = this.generatePositionX();
    item.style.left = item.x + 'px';
  },
  removeFallingItem(item) {
    const index = this.fallingItems.indexOf(item);
    if (index > -1) {
      this.fallingItems.splice(index, 1);
      View.optionArea.removeChild(item.optionWrapper);
    }
  },
  removeFallingItemByIndex(id) {
    const item = this.fallingItems.find(item => item.id === id);
    if (item) {
      const index = this.fallingItems.indexOf(item);
      this.fallingItems.splice(index, 1);
      View.optionArea.removeChild(item.optionWrapper);
    }
  },
  /////////////////////////////////////////QUestions///////////////////////////////
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
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const correctPairIndex = Math.floor(Math.random() * prefixSuffixPairs.length);
    const correctPair = prefixSuffixPairs[correctPairIndex];
    prefixSuffixPairs.splice(correctPairIndex, 1);
    const incorrectPrefixLength = Math.floor(Math.random() * (alphabet.length - 1)) + 1; // Random length from 1 to alphabet.length - 1
    const incorrectSuffixLength = Math.floor(Math.random() * (alphabet.length - 1)) + 1; // Random length from 1 to alphabet.length - 1
    const incorrectPrefixIndex = Math.floor(Math.random() * (alphabet.length - incorrectPrefixLength));
    const incorrectSuffixIndex = Math.floor(Math.random() * (alphabet.length - incorrectSuffixLength));
    const incorrectPrefix = alphabet.substring(incorrectPrefixIndex, incorrectPrefixIndex + incorrectPrefixLength);
    const incorrectSuffix = alphabet.substring(incorrectSuffixIndex, incorrectSuffixIndex + incorrectSuffixLength);
    return [correctPair[0], correctPair[1], incorrectPrefix, incorrectSuffix];
  },
  setQuestions() {
    this.questionWord = this.getRandomWord(this.defaultStrings);
    const prefixSuffixPairs = this.generatePrefixesAndSuffixes(this.questionWord);
    this.randomPair = this.getRandomPair(prefixSuffixPairs);
    const questionWrapper = document.createElement('div');
    questionWrapper.classList.add('questionWrapper');
    questionWrapper.textContent = this.questionWord;
    questionWrapper.value = this.questionWord;
    View.stageImg.appendChild(questionWrapper);
  },
  showQuestions() {
    View.stageImg.style.display = '';
  },
  closeQuestions() {
    this.fallingItems.splice(0);
    View.optionArea.innerHTML = '';
    View.stageImg.style.display = 'none';
  },
  finishedGame() {
    this.questionWord = '';
    this.fallingItems.splice(0);
    View.stageImg.innerHTML = '';
    View.optionArea.innerHTML = '';
  },

  checkAnswer() {
    if (State.selectedImg.value.classList.contains('correct')) {
      //答岩1分，答錯唔扣分
      this.addScore(1);
      return true;
    } else {
      //this.addScore(-1);
      return false;
    }
  },

}
