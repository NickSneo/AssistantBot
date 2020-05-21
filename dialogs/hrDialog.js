// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class hrDialog extends ComponentDialog {
    constructor() {
        super(HR_DIALOG);
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.HRactStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    
    async HRactStep(stepContext) {
        
        if (this.luisRecognizer.isConfigured) {
            
        const luisResult = await this.luisRecognizer.executeLuisQuery(stepContext.context);
        switch (LuisRecognizer.topIntent(luisResult)) {
        case 'LeaveMangement': {
            return await stepContext.sendActivity.MessageFactory.text(['Request Leave', 'Leave Balance', 'Leave Application Status', 'Delete Leave Application' ], 'Sure I can assist you with leave management.');
            //  await stepContext.beginDialog('LeaveDialog', hrDialog);
        }

        case 'RequestLeave': {
            const leaveDetails = {};

            // Initialize BookingDetails with any entities we may have found in the response.
            leaveDetails.sickType = this.luisRecognizer.getLeaveType(luisResult);
            leaveDetails.sickDays = this.luisRecognizer.getLeaveDays(luisResult);
            leaveDetails.sickDate = this.luisRecognizer.getLeaveDate(luisResult);
            console.log('LUIS extracted these booking details:', JSON.stringify(leaveDetails));

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
