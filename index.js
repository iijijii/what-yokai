'use strict';
const Alexa = require('alexa-sdk');
const APP_ID = undefined;

// Data

const SKILL_NAME = "what yokai";
const HELP_MESSAGE_BEFORE_START = "Yokai is Japanese supernatural beings like monsters. Answer five questions, and I will tell you what Yokai you are. Ready?";
const HELP_MESSAGE_AFTER_START = "Just respond with yes or no. When you answered 5 questions, I'll tell you what yokai you are.";
const HELP_REPROMPT = "Your yokai will be revealed after you answer all my yes or no questions.";
const STOP_MESSAGE = "Your spirit yokai will be waiting for you next time.";
const CANCEL_MESSAGE = "Let's go back to the beginning.";
const MISUNDERSTOOD_INSTRUCTIONS_ANSWER = "Please answer with either yes or no.";

const WELCOME_MESSAGE = "Hi! I can tell you what yokai you are. Just answer five questions with either yes or no. Are you ready?";
const INITIAL_QUESTION_INTROS = [
  "Great! Let's start!",
  "<say-as interpret-as='interjection'>Alrighty</say-as>! Here comes your first question!",
  "Ok let's go. <say-as interpret-as='interjection'>Ahem</say-as>.",
  "<say-as interpret-as='interjection'>well well</say-as>."
];
const QUESTION_INTROS = [
  "Oh dear.",
  "Okey Dokey",
  "You go, human!",
  "Sure thing.",
  "I would have said that too.",
  "Of course.",
  "I knew it.",
  "Totally agree.",
  "So true.",
  "I agree."
];
const UNDECISIVE_RESPONSES = [
  "<say-as interpret-as='interjection'>Honk</say-as>. I'll just choose for you.",
  "<say-as interpret-as='interjection'>Nanu Nanu</say-as>. I picked an answer for you.",
  "<say-as interpret-as='interjection'>Uh oh</say-as>... well nothing I can do about that.",
  "<say-as interpret-as='interjection'>Aha</say-as>. We will just move on then.",
  "<say-as interpret-as='interjection'>Aw man</say-as>. How about this question?",
];
const RESULT_MESSAGE = "Here comes the big reveal! You are "; // the name of the result is inserted here.
const PLAY_AGAIN_REQUEST = "That was it. Do you want to play again?";

const yokaiList = {
  chochinObake: {
    name: "chochin obake",
    display_name: "Chochin Obake",
    audio_message: "Chochin Obake is a lantern with one eye and a long toungue.",
    description: "You rarely causes physical harm, preferring simply to surprise and scare others, laughing and rolling its large tongue and big eyes at guests in the home.",
    img: {
      smallImageUrl: "https://image.ibb.co/n8LLu9/chochin_03.png",
      largeImageUrl: "https://image.ibb.co/i6kmZ9/chochin_02.png"
    }
  },
  karakasaKozo: {
    name: "karakasa kozo",
    display_name: "Karakasa Kozo",
    audio_message: "You are a Karakasa Kozo, paper umbrella priest boy.",
    description: "You are not fearsome. But because of your oily liquid, you make people have traumatic feeling.",
    img: {
      smallImageUrl: "https://image.ibb.co/kD48gp/karakasa_03.png",
      largeImageUrl: "https://image.ibb.co/kCJqu9/karakasa_02.png"
    }
  },
  rokurokubi: {
    name: "rokurokubi",
    display_name: "Rokurokubi",
    audio_message: "Rokurokubi is a yokai whose neck becomes long when she is sleeping.",
    description: "By day, you appear to be ordinary. But once you get sleep, your head attacks others and make nearby people scared.",
    img: {
      smallImageUrl: "https://image.ibb.co/hXZVu9/test_03.png",
      largeImageUrl: "https://image.ibb.co/ccsuMp/test_02.png"
    }
  },
  hitotsumeKozo: {
    name: "hitotsume kozo",
    display_name: "Hitotsume Kozo",
    audio_message: "You are a Hitotsume Kozo, almost a human being but only has one eye.",
    description: "You are harmless yokai. You just like surprising people. You can be another yokai, but one thing differentiate from it is that the fact you like Tofu!",
    img: {
      smallImageUrl: "https://image.ibb.co/eWFs7U/hitotsume_03.png",
      largeImageUrl: "https://image.ibb.co/n7GznU/hitotsume_02.png"
    }
  },
  yurei: {
    name: "yurei",
    display_name: "Yurei",
    audio_message: "You are a Yurei which looks human beings but without legs.",
    description: "Others always feel afraid of you when they see you, because we believe you have resentment.",
    img: {
      smallImageUrl: "https://image.ibb.co/ky962U/ghost_03.png",
      largeImageUrl: "https://image.ibb.co/hujH99/ghost_02.png"
    }
  }
};

const questions = [
 {
    question: "Do you prefer to surprize and scare others?",
    points: {
			chochinObake: 3,
			karakasaKozo: 4,
			rokurokubi: 1,
			hitotsumeKozo: 5,
			yurei: 2
    }
  },
  {
    question: "Are you an untidy sleeper?",
    points: {
			chochinObake: 0,
			karakasaKozo: 0,
			rokurokubi: 5,
			hitotsumeKozo: 0,
			yurei: 0
    }
  },
  {
    question: "Do you like wearing white clothes?",
    points: {
			chochinObake: 0,
			karakasaKozo: 0,
			rokurokubi: 0,
			hitotsumeKozo: 0,
			yurei: 5
    }
  },
  {
    question: "Are you a big fan of Tofu?",
    points: {
			chochinObake: 0,
			karakasaKozo: 0,
			rokurokubi: 0,
			hitotsumeKozo: 4,
			yurei: 0
    }
  },
  {
    question: "Are you a great sweater and being hated by others because of it?",
    points: {
			chochinObake: 0,
			karakasaKozo: 4,
			rokurokubi: 0,
			hitotsumeKozo: 0,
			yurei: 0
    }
  }
];


// Private methods

const _initializeApp = handler => {
  // Set the progress to -1 one in the beginning
  handler.attributes['questionProgress'] = -1;
  // Assign 0 points to each yokai
  var initialPoints = {};
  Object.keys(yokaiList).forEach(yokai => initialPoints[yokai] = 0);
  handler.attributes['yokaiPoints'] = initialPoints;
};

const _nextQuestionOrResult = (handler, prependMessage = '') => {
  if(handler.attributes['questionProgress'] >= (questions.length - 1)){
    handler.handler.state = states.RESULTMODE;
    handler.emitWithState('ResultIntent', prependMessage);
  }else{
    handler.emitWithState('NextQuestionIntent', prependMessage);
  }
};

const _applyAnimalPoints = (handler, calculate) => {
  const currentPoints = handler.attributes['yokaiPoints'];
  const pointsToAdd = questions[handler.attributes['questionProgress']].points;

  handler.attributes['yokaiPoints'] = Object.keys(currentPoints).reduce((newPoints, yokai) => {
    newPoints[yokai] = calculate(currentPoints[yokai], pointsToAdd[yokai]);
    return newPoints;
  }, currentPoints);
};

const _randomQuestionIntro = handler => {
  if(handler.attributes['questionProgress'] == 0){
    // return random initial question intro if it's the first question:
    return _randomOfArray(INITIAL_QUESTION_INTROS);
  }else{
    // Assign all question intros to remainingQuestionIntros on the first execution:
    var remainingQuestionIntros = remainingQuestionIntros || QUESTION_INTROS;
    // randomQuestion will return 0 if the remainingQuestionIntros are empty:
    let randomQuestion = remainingQuestionIntros.splice(_randomIndexOfArray(remainingQuestionIntros), 1);
    // Remove random Question from rameining question intros and return the removed question. If the remainingQuestions are empty return the first question:
    return randomQuestion ? randomQuestion : QUESTION_INTROS[0];
  }
};

const _randomIndexOfArray = (array) => Math.floor(Math.random() * array.length);
const _randomOfArray = (array) => array[_randomIndexOfArray(array)];
const _adder = (a, b) => a + b;
const _subtracter = (a, b) => a - b;

// Handle user input and intents:

const states = {
  QUIZMODE: "_QUIZMODE",
  RESULTMODE: "_RESULTMODE"
}

const newSessionHandlers = {
  'NewSession': function(){
    _initializeApp(this);
    this.emit(':askWithCard', WELCOME_MESSAGE, SKILL_NAME, WELCOME_MESSAGE);
    //                         ^speechOutput,   ^cardTitle, ^cardContent,   ^imageObj
  },
  'YesIntent': function(){
    this.handler.state = states.QUIZMODE;
    _nextQuestionOrResult(this);
  },
  'NoIntent': function(){
    this.emitWithState('AMAZON.StopIntent');
  },
  'AMAZON.HelpIntent': function(){
    this.emit(':askWithCard', HELP_MESSAGE_BEFORE_START, HELP_REPROMPT, SKILL_NAME);
  },
  'AMAZON.CancelIntent': function(){
    this.emitWithState('AMAZON.StopIntent');
  },
  'AMAZON.StopIntent': function(){
    this.emit(':tellWithCard', STOP_MESSAGE, SKILL_NAME, STOP_MESSAGE);
  },
  'Unhandled': function(){
    this.emit(':ask', MISUNDERSTOOD_INSTRUCTIONS_ANSWER);
  }
};


const quizModeHandlers = Alexa.CreateStateHandler(states.QUIZMODE, {
  'NextQuestionIntent': function(prependMessage = ''){
    // Increase the progress of asked questions by one:
    this.attributes['questionProgress']++;
    // Reference current question to read:
    var currentQuestion = questions[this.attributes['questionProgress']].question;

    this.emit(':askWithCard', `${prependMessage} ${_randomQuestionIntro(this)} ${currentQuestion}`, HELP_MESSAGE_AFTER_START, SKILL_NAME, currentQuestion);
    //                        ^speechOutput                                                         ^repromptSpeech           ^cardTitle  ^cardContent     ^imageObj
  },
  'YesIntent': function(){
    _applyAnimalPoints(this, _adder);
    // Ask next question or return results when answering the last question:
    _nextQuestionOrResult(this);
  },
  'NoIntent': function(){
    // User is responding to a given question
    _applyAnimalPoints(this, _subtracter);
    _nextQuestionOrResult(this);
  },
  'UndecisiveIntent': function(){
    // Randomly apply
    Math.round(Math.random()) ? _applyAnimalPoints(this, _adder) : _applyAnimalPoints(this, _subtracter);
    _nextQuestionOrResult(this, _randomOfArray(UNDECISIVE_RESPONSES));
  },
  'AMAZON.RepeatIntent': function(){
    var currentQuestion = questions[this.attributes['questionProgress']].question;

    this.emit(':askWithCard', currentQuestion, HELP_MESSAGE_AFTER_START, SKILL_NAME, currentQuestion);
    //                        ^speechOutput    ^repromptSpeech           ^cardTitle ^cardContent     ^imageObj
  },
  'AMAZON.HelpIntent': function(){
    this.emit(':askWithCard', HELP_MESSAGE_AFTER_START, HELP_REPROMPT, SKILL_NAME);
  },
  'AMAZON.CancelIntent': function(){
    this.emit(':tellWithCard', CANCEL_MESSAGE, SKILL_NAME, CANCEL_MESSAGE);
  },
  'AMAZON.StopIntent': function(){
    this.emit(':tellWithCard', STOP_MESSAGE, SKILL_NAME, STOP_MESSAGE);
  },
  'Unhandled': function(){
    this.emit(':ask', MISUNDERSTOOD_INSTRUCTIONS_ANSWER);
  }
});


const resultModeHandlers = Alexa.CreateStateHandler(states.RESULTMODE, {
  'ResultIntent': function(prependMessage = ''){
    // Determine the highest value:
    const yokaiPoints = this.attributes['yokaiPoints'];
    const result = Object.keys(yokaiPoints).reduce((o, i) => yokaiPoints[o] > yokaiPoints[i] ? o : i);
    const resultMessage = `${prependMessage} ${RESULT_MESSAGE} ${yokaiList[result].name}. ${yokaiList[result].audio_message}. ${PLAY_AGAIN_REQUEST}`;

    this.emit(':askWithCard', resultMessage, PLAY_AGAIN_REQUEST, yokaiList[result].display_name, yokaiList[result].description, yokaiList[result].img);
    //                        ^speechOutput  ^repromptSpeech     ^cardTitle                       ^cardContent                    ^imageObj
  },
  'YesIntent': function(){
    _initializeApp(this);
    this.handler.state = states.QUIZMODE;
    _nextQuestionOrResult(this);
  },
  'NoIntent': function(){
    this.emitWithState('AMAZON.StopIntent');
  },
  'AMAZON.HelpIntent': function(){
    this.emit(':askWithCard', HELP_MESSAGE_AFTER_START, HELP_REPROMPT, SKILL_NAME);
  },
  'AMAZON.CancelIntent': function(){
    this.emitWithState('AMAZON.StopIntent');
  },
  'AMAZON.StopIntent': function(){
    this.emit(':tellWithCard', STOP_MESSAGE, SKILL_NAME, STOP_MESSAGE);
  },
  'Unhandled': function(){
    this.emit(':ask', MISUNDERSTOOD_INSTRUCTIONS_ANSWER);
  }
});



exports.handler = (event, context, callback) => {
  const alexa = Alexa.handler(event, context);
  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(newSessionHandlers, quizModeHandlers, resultModeHandlers);
  alexa.execute();
};
