import { loadLevel } from "./level";
import questions from './questions.json'
import { imageFiles } from './mediaFile';

const QuestionManager = {
  questionField: null,
  QUESTION_TYPE: Object.freeze({
    QA: [],
  }),
  preloadedImages: [],
  preloadedImagesItem: [],

  preloadImagesFile() {
    console.log("preloadedImages", this.preloadedImages);
    this.preloadedImages.forEach((item) => {
      const img = new Image();
      img.id = item[0];
      img.src = item[1];
      this.preloadedImagesItem.push(img);
    });

    console.log("preloadedImagesItem", this.preloadedImagesItem);
  },

  loadQuestionData: function () {
    try {
      this.QUESTION_TYPE = {
        QA: questions.QA,
      };

      this.loadQuestionType();
    } catch (error) {
      console.error('Error loading JSON data:', error);
    }
  },

  loadQuestionType: function () {
    let level = loadLevel();
    let question = null;
    if (level !== '') {
      question = {
        QA: this.QUESTION_TYPE.QA.filter(item => item.QID.includes(level)),
      };
      this.preloadedImages = imageFiles.filter(img => img[0].includes(level));

      if (this.preloadedImages !== null && this.preloadedImages !== undefined && this.preloadedImages.length > 0)
        this.preloadImagesFile();
    }
    else {
      question = { QA: this.QUESTION_TYPE.QA };
    }
    if (question.QA.length > 0)
      this.questionField = Object.freeze(question);
    console.log(this.questionField);
  }
};

export default QuestionManager;
