import { loadLevel } from "./level";
import questions from './questions.json'

const QuestionManager = {
  QUESTION_TYPE: Object.freeze({
    QA: [],
  }),

  loadQuestionData: function () {
    try {
      this.QUESTION_TYPE = {
        QA: questions.QA,
      };
    } catch (error) {
      console.error('Error loading JSON data:', error);
    }
  },

  questionType: function () {
    let level = loadLevel();
    let question = null;
    let questionField = null;
    if (level !== '') {
      question = {
        QA: this.QUESTION_TYPE.QA.filter(item => item.QID.includes(level)),
      };
    }
    else {
      question = { QA: this.QUESTION_TYPE.QA };
    }
    if (question.QA.length > 0) questionField = Object.freeze(question);
    console.log(questionField);
    return questionField;
  }
};

export default QuestionManager;
