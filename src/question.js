import Questions from '../static/json/questions.json';
import { imageFiles } from './mediaFile';
import { apiManager } from "./apiManager";
import Util from './util';

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
      Util.updateLoadingStatus("Loading Images");
    });

    console.log("preloadedImagesItem", this.preloadedImagesItem);
  },

  loadQuestionData: async function (jwt = null, levelkey = null, onCompleted = null, onError = null) {
    try {
      await apiManager.postGameSetting(jwt, () => this.loadQuestionFromJson(levelkey, onCompleted), () => onError());
    } catch (error) {
      if (onError) onError();
      console.error('Error loading JSON data:', error);
    }
  },

  loadQuestionFromJson: async function (levelkey = null, onCompleted = null) {
    let questionsJsonPath;
    let questions;
    var noAccountInfo = Object.keys(apiManager.accountJson).length === 0;
    console.log("noAccountInfo", noAccountInfo);

    if (apiManager.questionJson && !noAccountInfo) {
      questions = apiManager.questionJson;
      this.QUESTION_TYPE = { QA: questions };
    }
    else {
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
    }

    if (onCompleted) onCompleted();
    this.loadQuestionType(levelkey);
  },

  loadQuestionType: function (levelKey) {
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

    console.log("Filtered: ", this.questionField);
  },


};

export default QuestionManager;
