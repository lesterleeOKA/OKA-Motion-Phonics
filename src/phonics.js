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
  randomPair: [],
  fallingItems: [],
  defaultStrings: ['apple', 'banana', 'cherry', 'orange', 'pear'],

  init() {
    this.fallingId = 0;
    this.questionWord = '';
    this.itemDistance = 200;
    this.score = 0;
    this.time = 0;
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
      this.timer = setInterval(() => {
        if (this.fallingItems.length < this.randomPair.length) {
          this.createRandomItem(this.getRandomWord(this.randomPair));
        }
        this.time++;
      }, 1000);
      requestAnimationFrame(this.updateFallingItems.bind(this));
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


  updateFallingItems() {
    // Move each falling item down
    // console.log(this.fallingItems);
    this.fallingItems.forEach((item) => {
      item.y += item.speed;

      // Check if the item has reached the bottom
      if (item.y >= View.canvas.height) {
        this.handleItemReachedBottom(item);
      }
    });

    this.fallingItems = this.fallingItems.filter((item) => item.y < View.canvas.height);
    this.renderFallingItems();
    requestAnimationFrame(this.updateFallingItems.bind(this));
  },

  getRandomSpeed(minSpeed, maxSpeed) {
    const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
    return speed;
  },

  createRandomItem(char) {
    if (char && char.length !== 0) {
      const word = char;

      const generatePosition = () => {
        const x = Math.random() * View.canvas.width * 0.75;
        const y = 0;
        const speed = this.getRandomSpeed(0.5, 2);
        const id = `fallingItem-${this.fallingItems.length}`;
        const optionWrapper = this.createOptionWrapper(word, id);
        const newFallingItem = {
          x,
          y,
          optionWrapper,
          id,
          speed
        };

        if (this.IsTooClose(newFallingItem)) {
          newFallingItem.x = Math.random() * View.canvas.width * 0.75;
        }

        return newFallingItem;
      };

      const newFallingItem = generatePosition();
      this.fallingItems.push(newFallingItem);
    }
  },

  IsTooClose(newFallingItem) {
    return this.fallingItems.some((item) => {
      const distance = Math.abs(item.x - newFallingItem.x);

      if (distance < this.itemDistance) {
        console.log(newFallingItem.id, item.id);
        return true;
      }

    });
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

  renderFallingItems() {

    View.optionArea.innerHTML = '';
    this.fallingItems.forEach((item) => {
      View.optionArea.appendChild(item.optionWrapper);
      item.optionWrapper.classList.add("show");
      item.optionWrapper.style.left = item.x + 'px';
      //item.optionWrapper.style.top = item.y + 'px';
      item.optionWrapper.style.transform = `translateY(${item.y}px)`;
    });
  },

  getRandomWord(string) {
    const randomIndex = Math.floor(Math.random() * string.length);
    return string[randomIndex];
  },

  handleItemReachedBottom(item) {
    item.x = Math.random() * View.canvas.width * 0.75;
    item.y = 0;

    if (this.IsTooClose(item)) {
      item.x = Math.random() * View.canvas.width * 0.75;
      item.y = 0;
    }
    // Handle the item reaching the bottom (e.g., remove item)
    //this.removeFallingItem(item);
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

  setQuestions() {
    View.optionArea.innerHTML = '';
    this.questionWord = this.getRandomWord(this.defaultStrings);
    const prefixSuffixPairs = this.generatePrefixesAndSuffixes(this.questionWord);
    this.randomPair = this.getRandomPair(prefixSuffixPairs);

    const questionWrapper = document.createElement('div');
    questionWrapper.classList.add('questionWrapper');
    questionWrapper.textContent = this.questionWord;
    questionWrapper.value = this.questionWord;
    View.stageImg.appendChild(questionWrapper);
  },

  closeQuestions() {
    this.questionWord = '';
    View.stageImg.innerHTML = '';
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
