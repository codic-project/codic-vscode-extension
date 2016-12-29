'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    var request=require("request-promise");
    var nullsignal = "<null>";
    function applyCase(word:string, isFirst:boolean){
        return isFirst?word:"_"+word;
    }

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "codic" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.codictranslate', () => {
        var ACCESS_TOKEN=vscode.workspace.getConfiguration('codic').get('ACCESS_TOKEN');
        // The code you place here will be executed every time your command is executed
        vscode.window.showInputBox({prompt: 'Input a Japanese phrase'})
            .then(function(input){
                if(input === undefined || input === ""){
                    return Promise.reject(undefined);
                } else {                    
                    var options = {
                        uri : 'https://api.codic.jp/v1/engine/translate.json',
                        method:'GET',
                        qs:{text:input},
                        headers: {'Authorization': 'Bearer '+ ACCESS_TOKEN},
                        transform2xxonly: true,
                        transform: function(body){return JSON.parse(body);},
                    };
                    return request(options);
                    
                }
            }).then(function(body){
                if(!body)return Promise.reject(undefined);
                var candidates: Array<Array<string>> = [];
                for(var i = 0; i < body[0].words.length; i++){
                    var temp: Array<string> = [];
                    for(var j = 0; j < body[0].words[i]['candidates'].length; j++){
                        temp.push(body[0].words[i]['candidates'][j]['text']===null?nullsignal:body[0].words[i]['candidates'][j]['text']);
                    }
                    candidates.push(temp);
                }
                return candidates;
            }).then(function(candidates:Array<Array<string>>){
                var p :Promise<any>=Promise.resolve();
                var isFirst=true;
                candidates.forEach(function(words){
                    p=p.then(function(){return vscode.window.showQuickPick(words)})
                    .then(function(choice){
                        // {#BUG}: QuickPick loop continues when the user focus out
                        // {#TODO}: catch the reject() below
                        if(!choice){
                            return Promise.reject(undefined);
                        }
                        if(choice === nullsignal){
                            return Promise.resolve(undefined);
                        }
                        var editor = vscode.window.activeTextEditor;
                        var edit = new vscode.WorkspaceEdit();
                        edit.insert(editor.document.uri, editor.selection.anchor, applyCase(choice,isFirst));
                        isFirst=false;
                        return vscode.workspace.applyEdit(edit);
                    })
                    .then(function(){
                        var editor = vscode.window.activeTextEditor;
                        editor.selection = new vscode.Selection(editor.selection.end,editor.selection.end);
                    });
                });
            });
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(request);
}

// this method is called when your extension is deactivated
export function deactivate() {
}