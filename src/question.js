import { parseUrlParams } from "./level";
import Questions from '../static/json/questions.json';
import { imageFiles } from './mediaFile';

const hostname = window.location.hostname;

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

  loadQuestionData: async function () {
    try {
      let questionsJsonPath;
      let questions;
      console.log("hostname", hostname);

      if (hostname.includes('dev.openknowledge.hk') ||
        hostname.includes('www.rainbowone.app')
      ) {
        // We're in the build context, use the relative path
        questionsJsonPath = './json/questions.json';
        const response = await fetch(questionsJsonPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${questionsJsonPath}: ${response.statusText}`);
        }
        questions = await response.json();
        console.log(questions);
      } else {
        // We're in the development context, use the relative path
        questions = Questions;
        console.log(questions);
      }

      this.QUESTION_TYPE = {
        QA: questions.QA,
      };

      this.loadQuestionType();
    } catch (error) {
      console.error('Error loading JSON data:', error);
    }
  },

  loadQuestionType: function () {
    const { levelKey } = parseUrlParams();
    let question = null;
    if (levelKey) {
      question = {
        QA: this.QUESTION_TYPE.QA.filter(item => item.QID.includes(levelKey)),
      };
      this.preloadedImages = imageFiles.filter(img => img[0].includes(levelKey));
    }
    else {
      question = { QA: this.QUESTION_TYPE.QA };
      this.preloadedImages = imageFiles;
    }
    if (question.QA.length > 0)
      this.questionField = Object.freeze(question);

    if (this.preloadedImages !== null && this.preloadedImages !== undefined && this.preloadedImages.length > 0)
      this.preloadImagesFile();

    console.log(this.questionField);
  }
};

export default QuestionManager;
