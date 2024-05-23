import { loadLevel } from "./level";
import questions from './questions.json'

const QuestionManager = {
  QUESTION_TYPE: Object.freeze({
    Pair: [],
  }),

  loadQuestionData: function () {
    try {
      this.QUESTION_TYPE = {
        Pair: questions.Pair,
      };
    } catch (error) {
      console.error('Error loading JSON data:', error);
    }
  },

  questionType: function () {
    let level = loadLevel();
    let question = null;
    let questionField = null;
    if (level.includes('p1u1')) {
      switch (level) {
        case 'p1u1':
          question = {
            Pair: this.QUESTION_TYPE.Pair.filter(item => item.QID.includes(level)),
          };
          if (question.Pair.length > 0) questionField = Object.freeze(question);
          break;
      }
    }
    else {
      console.log("All Type Question mode");
      questionField = this.QUESTION_TYPE;
    }
    console.log(questionField);
    return questionField;
  }
};

export default QuestionManager;
