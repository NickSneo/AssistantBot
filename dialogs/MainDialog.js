// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { MessageFactory, InputHints } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { hrDialog, HR_DIALOG } = require('./hrDialog');


const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

class MainDialog extends ComponentDialog {
    constructor(userState, conversationState, luisRecognizer) {
        super(MAIN_DIALOG);
        this.userState = userState;

        if (!luisRecognizer) throw new Error('[MainDialog]: Missing parameter \'luisRecognizer\' is required');
        this.luisRecognizer = luisRecognizer;

        if (!hrDialog) throw new Error('[MainDialog]: Missing parameter \'bookingDialog\' is required');

        this.addDialog(new hrDialog());
        this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.actStep.bind(this)
            ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    
    async actStep(stepContext) {
        // const bookingDetails = {};

        if (this.luisRecognizer.isConfigured) {
            
        const luisResult = await this.luisRecognizer.executeLuisQuery(stepContext.context);
        switch (LuisRecognizer.topIntent(luisResult)) {
        case 'HR': {
            await stepContext.sendActivity.MessageFactory.text(['Leave Mangement', 'Payroll', 'Recruitment', 'L&D', 'Survey','Holiday Calendar', ], 'Here are few suggestions which you can try.');
            return await stepContext.beginDialog(HR_DIALOG);
        }

        case 'Sales': {
        
            const salesText = 'TODO:';
            await stepContext.context.sendActivity(salesText);
            break;
        }

        case 'IT': {
            
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

module.exports.MainDialog = MainDialog;
module.exports.MAIN_DIALOG = MAIN_DIALOG;