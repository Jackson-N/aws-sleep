/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const util = require('util');
const express = require('express');
const app = express();
//const { ExpressAdapter } = require('ask-sdk-express-adapter');
app.use(express.static(__dirname + '/public')); //Serves resources from public folder
//NOTE: when working in VS Code, remember to import to ADC after making changes


let startHour = null;
let startMinute = null;
let startPhase = null;

let wakeHour = null;
let wakeMinute = null;
let wakePhase = null;

let remHour = null;
let remMinute = null;
let remPhase = null;

let timeHourDiff;
let timeMinDiff;

let yesResponse = null;
let noResponse = null;

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        //Alexa.getSlotValue(handlerInput.requestEnvelope, ‘startSleepTime’);
        const speakOutput = 'Welcome, you can say Hello or Help. Which would you like to try?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/*Formatting

//This function is all of the logic required for an intent 
const SomeIntentHandler = {
    //canHandle() needs to ALWAYS return TRUE or FALSE; this tells Alexa if the handle() should be ran or not
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'SomeIntent'; //SomeIntent is from the 'Build' tab
    },
    //handle() runs if canHandle() returns TRUE
    handle(handlerInput) {
        const speechText = "Some text";
        return handlerInput.responseBuilder
            .speak(speechText) //This is what Alexa will see to the user
            .reprompt(speechText) //Alexa will say this if the user doesn't get an answer right away
            .getResponse();
    }
};
*/

const startBedTimeIntentHandler = {
    canHandle(handlerInput) {
       return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'startBedTimeIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const {requestEnvelope} = handlerInput;
        const {intent} = requestEnvelope.request;
        
        
        let speechText = 'That is not a valid response. Please try again.';
        
        
        startHour = Alexa.getSlotValue(handlerInput.requestEnvelope, 'hour');
        startMinute = Alexa.getSlotValue(handlerInput.requestEnvelope, 'minute');
        startPhase = Alexa.getSlotValue(handlerInput.requestEnvelope, 'phase');
        
        wakeHour = Alexa.getSlotValue(handlerInput.requestEnvelope, 'wakeHour');
        wakeMinute = Alexa.getSlotValue(handlerInput.requestEnvelope, 'wakeMinute');
        wakePhase = Alexa.getSlotValue(handlerInput.requestEnvelope, 'wakePhase');
    
        
        if (startMinute === 'o clock')
        {
            startMinute = 0;
        }
        else if (wakeMinute === 'o clock')
        {
            wakeMinute = 0;
        }
        
        //process hour difference
        if (parseInt(wakeHour) === parseInt(startHour))
        {
            timeHourDiff = 12;
        }
        else if (parseInt(wakeHour) > parseInt(startHour))
        {
            timeHourDiff = parseInt(wakeHour) - parseInt(startHour);
        }
        else if (parseInt(wakeHour) < parseInt(startHour))
        {
            timeHourDiff = 12 + (parseInt(wakeHour) - parseInt(startHour))
        }
        
        //process minute difference
        if (parseInt(wakeMinute) === parseInt(startMinute))
        {
            timeMinDiff = 0;
        }
        else if (parseInt(wakeMinute) > parseInt(startMinute))
        {
            timeMinDiff = parseInt((wakeMinute - startMinute) % 60);
        }
        else if (parseInt(wakeMinute) < parseInt(startMinute))
        {
            timeMinDiff = parseInt((wakeMinute + startMinute) % 60);
            timeHourDiff--;
        }
            
        speechText = 'Bed time is set for: ' + startHour + ' ' + startMinute + ' ' + startPhase + 
        '. And Wake Up time is set for' +  wakeHour + ' ' + wakeMinute + ' ' + wakePhase + '. Sleep well!';
        
        //const bedTime = Alexa.getSlotValue(handlerInput.requestEnvelope, 'bed');

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const wakeUpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'wakeUpIntent'; //SomeIntent is from the 'Build' tab
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const {requestEnvelope} = handlerInput;
        const {intent} = requestEnvelope.request;
        
        remHour = Alexa.getSlotValue(handlerInput.requestEnvelope, 'reminderHour');
        remMinute = Alexa.getSlotValue(handlerInput.requestEnvelope, 'reminderMinute');
        remPhase = Alexa.getSlotValue(handlerInput.requestEnvelope, 'reminderPhase');
        
        let isSnoozing = false;
        
        if (yesResponse === true && noResponse === false)
        {
            timeMinDiff += 9;
            if (timeMinDiff % 60 === 0 || (timeMinDiff % 60) < timeMinDiff)
            {
                timeMinDiff = timeMinDiff % 60;
                timeHourDiff++;
            }
            isSnoozing = true;
            //Alexa is weird and setting alarms is annoying. This is where it would go and add more time.
        }
        else if (yesResponse === false && noResponse === true)
        {
            isSnoozing = false;
        }
        
        const sleepText = 'You have slept for ' + timeHourDiff + ' hours and ' + timeMinDiff + ' minutes.';
        const speechText = 'Alright, bed time reminder is set for' +  remHour + ' ' + remMinute + ' ' + remPhase + '. Have a good day!';
        
        return handlerInput.responseBuilder
            .speak(sleepText)
            .speak(speechText) //This is what Alexa will see to the user
            .reprompt(speechText) //Alexa will say this if the user doesn't get an answer right away
            .getResponse();
    }
};

//TODO: Fix yes and no intent handlers

const YesIntentHandler = {
    //get a confirmation from the user. this one will return true for yes and false for no. return values
    //it should be using the Alexa Developer Console's built-in intents (AMAZON.YesIntent and AMAZON.NoIntent)

    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
        const { attributesManager } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        
        yesResponse = true;
        noResponse = false;

        return handlerInput.responseBuilder
        
            //.speak('Test')
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
}

/*
const YesIntentHandler = {
    canHandle(handlerInput) {
        const { attributesManager } = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
        const { attributesManager } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        
        yesResponse = true;
        noResponse = false;

        return handlerInput.responseBuilder
            //.speak('Test')
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .yesResponse
            .noResponse
            .getResponse();
    }
};
*/

const NoIntentHandler = {
    canHandle(handlerInput) {
        const { attributesManager } = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent';
    },
    handle(handlerInput) {
        const { attributesManager } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        
        yesResponse = false;
        noResponse = true;

        return handlerInput.responseBuilder
          //.speak('Test')
          //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
          .yesResponse
          .noResponse
          .getResponse();
    }
};



/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        startBedTimeIntentHandler,
        wakeUpIntentHandler,
        YesIntentHandler,
        NoIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();