// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const path = require('path');
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });
const { AssistLuisService } = require('./AssistLuisService');
const { LuisAppId, LuisAPIKey, LuisAPIHostName } = process.env;
const luisConfig = { applicationId: LuisAppId, endpointKey: LuisAPIKey, endpoint: `https://${ LuisAPIHostName }` };

const luisRecognizer = new AssistLuisService(luisConfig);
const { LuisRecognizer } = require('botbuilder-ai');

// const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog, ComponentDialog, ChoiceFactory, ChoicePrompt } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { MainDialog, MAIN_DIALOG } = require('./hrDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';
const HR_DIALOG = 'hrDialog';
const CHOICE_PROMPT = 'CHOICE_PROMPT';


class hrDialog extends ComponentDialog {
    constructor() {
        super(HR_DIALOG);

        this.luisRecognizer = luisRecognizer;
        // this.addDialog(new MainDialog());
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT))
        this.addDialog(new TextPrompt(TEXT_PROMPT))
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.HRintroStep.bind(this),
            this.HRactStep.bind(this),
            this.HRfinalStep.bind(this)

        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async HRintroStep(stepContext) {
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt:'Here are a few suggestions you can try', 
            choices: ChoiceFactory.toChoices(['Leave Mangement', 'Payroll', 'Recruitment', 'L&D', 'Survey','Holiday Calendar'])
        });      
        }

    
    async HRactStep(stepContext) {
        console.log("hractStep")
        if (this.luisRecognizer.isConfigured) {
            console.log("hractStep insides")  
        const luisResult = await this.luisRecognizer.executeLuisQuery(stepContext.context);
        switch (LuisRecognizer.topIntent(luisResult)) {
        case 'LeaveMangement': {
            return await stepContext.sendActivity.MessageFactory.text(['Request Leave', 'Leave Balance', 'Leave Application Status', 'Delete Leave Application' ], 'Sure I can assist you with leave management.');
            //  await stepContext.beginDialog('LeaveDialog', hrDialog);
        }

        case 'RequestLeave': {
                var levreq = 'Plz write "i want 2 days sick leave from 15 May 2020"'
                return await stepContext.prompt(TEXT_PROMPT,levreq);
            
        }

        case 'Payroll': {
        
            const salesText = 'TODO:';
            await stepContext.context.sendActivity(salesText);
            break;
        }

        case 'Recruitment': {
            
            const itText = 'TODO: ';
            await stepContext.context.sendActivity(itText);
            break;
        }

        case 'L&D': {
            
            const itText = 'TODO: ';
            await stepContext.context.sendActivity(itText);
            break;
        }

        case 'Survey': {
            
            const itText = 'TODO: ';
            await stepContext.context.sendActivity(itText);
            break;
        }

        case 'HolidayCalendar': {
            
            const itText = 'TODO: ';
            await stepContext.context.sendActivity(itText);
            break;
        }

        case 'Help': {
            // return await stepContext.beginDialog(MAIN_DIALOG);
        }

        default: {
            // Catch all for unhandled intents
            const didntUnderstandMessageText = `Sorry, I didn't get that. Please try asking in a different way (intent was ${ LuisRecognizer.topIntent(luisResult) })`;
            await stepContext.context.sendActivity(didntUnderstandMessageText, didntUnderstandMessageText, InputHints.IgnoringInput);
        }
        }
    }
        
    }

    async HRfinalStep(stepContext) {
        console.log("hrfinalStep",stepContext.context)
        if (this.luisRecognizer.isConfigured) {
            console.log("hrfinalStep insides")  
        const luisResult = await this.luisRecognizer.executeLuisQuery(stepContext.context);
        switch (LuisRecognizer.topIntent(luisResult)) {
        case 'RequestLeave': {
            const leaveDetails = {};

            // Initialize BookingDetails with any entities we may have found in the response.
            leaveDetails.sickType = this.luisRecognizer.getLeaveType(luisResult);
            leaveDetails.sickDays = this.luisRecognizer.getLeaveDays(luisResult);
            // leaveDetails.sickDate = this.luisRecognizer.getLeaveDate(luisResult);
            console.log(leaveDetails.sickType,leaveDetails.sickDays)
            if(leaveDetails.sickType && leaveDetails.sickDays ){
                console.log('LUIS extracted these booking details:', JSON.stringify(leaveDetails));
                return await stepContext.beginDialog(MAIN_DIALOG);
            } else{
                var levreq = 'Plz write "i want 2 days sick leave from 15 May 2020"'
                return await stepContext.context.sendActivity(levreq);

            }
        }
        default: {
            // Catch all for unhandled intents
            const didntUnderstandMessageText = `Sorry, I didn't get that. Please try asking in a different way (intent was ${ LuisRecognizer.topIntent(luisResult) })`;
            await stepContext.context.sendActivity(didntUnderstandMessageText, didntUnderstandMessageText, InputHints.IgnoringInput);
        }
        }
    }
        return await stepContext.replaceDialog(this.initialDialogId, { restartMsg: 'What else can I do for you?' });
    }
    
}

module.exports.hrDialog = hrDialog;
module.exports.HR_DIALOG = HR_DIALOG;