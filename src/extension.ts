'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

class CodicExtension{

    protected context:vscode.ExtensionContext;
    protected request=require('request-promise');
    protected nullsymbol:string="<null>";
    protected cases:{[index:string]:{applyfunc:(string,boolean)=>string, sample:string}}={
            "PascalCase": {
                "applyfunc": (word:string, isFirst:boolean)=>{return word[0].toUpperCase()+word.slice(1);},
                "sample": "Aa"
            },
            "camelCase": {
                "applyfunc": (word:string, isFirst:boolean)=>{return isFirst?word:(word[0].toUpperCase()+word.slice(1));},
                "sample": "aA"
            },
            "snake_case": {
                "applyfunc": (word:string, isFirst:boolean)=>{return isFirst?word:"_"+word;},
                "sample": "a_a"
            },
            "SNAKE_CASE": {
                "applyfunc": (word:string, isFirst:boolean)=>{return (isFirst?word:"_"+word).toUpperCase();},
                "sample": "A_A",
            },
            "hy-phen-a-tion": {
                "applyfunc": (word:string, isFirst:boolean)=>{return isFirst?word:"-"+word;},
                "sample": "a-a"
            },
            "no case": {
                "applyfunc": (word:string, isFirst:boolean)=>{return isFirst?word:" "+word;},
                "sample": "a a"
            }
        };

    constructor(context:vscode.ExtensionContext){
        this.context=context;
    }

    public translate():void{
        if(!this.disposeLegacyCaseSetting()){
            // case未設定
            vscode.window.showErrorMessage("単語の連結方法が設定されていません。");
            return;
        }
        this.getInputText()
        .then((input:string) => this.sendRequest(input, this.getAccessToken()))
        .then((body)=>this.listCandidates(body))
        .then((candidates)=>this.pickCandidates(candidates))
    }
    
    public setLocalCase(){
        var keys=[];
        for(var key in this.cases){
            keys.push(key);
        }
        vscode.window.showQuickPick(keys)
        .then((choice) => {
            vscode.workspace.getConfiguration('codic').update('case', choice, false);
        });
    }

    public setGlobalCase(){
        var keys=[];
        for(var key in this.cases){
            keys.push(key);
        }
        vscode.window.showQuickPick(keys)
        .then((choice) => {
            vscode.workspace.getConfiguration('codic').update('case', choice, true);
        });
    }
    
    public dispose(){

    }

    protected getAccessToken():string{
        let ACCESS_TOKEN=vscode.workspace.getConfiguration('codic').get<string>('ACCESS_TOKEN');
        if(ACCESS_TOKEN===undefined){
            vscode.window.showErrorMessage("アクセストークンが設定されていません。");
            throw 'no ACCESS_TOKEN';
        }
        return ACCESS_TOKEN;
    }

    protected getInputText():PromiseLike<string|boolean>{
        return vscode.window.showInputBox({prompt: 'Input a Japanese phrase'})
        .then((input) => {
            if(input === undefined || input === ""){
                return Promise.reject(undefined);
            }
            return input;
        });
    }

    protected sendRequest(text:string,ACCESS_TOKEN:string){
        let options = {
            uri : 'https://api.codic.jp/v1/engine/translate.json',
            method:'GET',
            qs:{text:text},
            headers: {'Authorization': 'Bearer '+ ACCESS_TOKEN},
            transform2xxonly: true,
            transform: (body) => {return JSON.parse(body);},
        };
        return this.request(options);
    }

    protected listCandidates(body):string[][]{
        let candidates: string[][] = [];
        for(let i = 0; i < body[0].words.length; i++){
            let temp: Array<string> = [];
            for(let j = 0; j < body[0].words[i]['candidates'].length; j++){
                temp.push(body[0].words[i]['candidates'][j]['text']===null?this.nullsymbol:body[0].words[i]['candidates'][j]['text']);
            }
            if(temp.length===0){temp = [body[0].words[i]['text']];}
            candidates.push(temp);
        }
        return candidates;
    }

    protected getCase(){
        return vscode.workspace.getConfiguration('codic').get<string>('case');
    }

    protected applyCase(text:string, isFirst:boolean, case_:string){
        return this.cases[case_]["applyfunc"](text,isFirst);
    }

    protected pickCandidates(candidates:string[][]):Promise<any>{
        let p:Promise<any> = Promise.resolve();
        let isFirst = true;
        candidates.forEach((words) => {
            p=p.then(() => {return vscode.window.showQuickPick(words)})
            .then((choice) => {
                if(choice === undefined) return Promise.reject("user focused out");
                if(choice === this.nullsymbol){
                    return Promise.resolve(null);
                }
                return this.insertText(this.applyCase(choice,isFirst,this.getCase()));
            })
            .then((val)=>{if(val!==null){isFirst = false;}})
            .then(this.moveCursorToEndOfSelection);
        });
        return p;
    }

    protected insertText(text:string){
        let editor = vscode.window.activeTextEditor;
        let edit = new vscode.WorkspaceEdit();
        edit.insert(editor.document.uri, editor.selection.anchor, text);
        return vscode.workspace.applyEdit(edit);
    }

    protected moveCursorToEndOfSelection(){
        let editor = vscode.window.activeTextEditor;
        editor.selection = new vscode.Selection(editor.selection.end,editor.selection.end);
    }

    protected disposeLegacyCaseSetting():boolean{
        // 旧case設定をsettings.jsonに移行
        // 設定がなかった場合はfalse
        let new_case = vscode.workspace.getConfiguration('codic').get<string>('case');
        if(!new_case){
            // local, global共に設定されていない
            let local_legacy_case = this.context.workspaceState.get<string|undefined>("codic.case");
            if(local_legacy_case){
                vscode.workspace.getConfiguration('codic').update('case', local_legacy_case, false);
            }
            let global_legacy_case = this.context.globalState.get<string|undefined>("codic.case");
            if(global_legacy_case){
                vscode.workspace.getConfiguration('codic').update('case', global_legacy_case, false);
            }
            return local_legacy_case !== undefined || global_legacy_case !== undefined;
        } else {
            // なんかしら設定されている
            return true;
        }
    }

}

export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json

    let codicExtension = new CodicExtension(context);
    let disposable:vscode.Disposable[] = [];
    disposable.push(vscode.commands.registerCommand('extension.codicTranslate', () => {codicExtension.translate();}));

    disposable.push(vscode.commands.registerCommand("extension.codicSetLocalCase", () => {codicExtension.setLocalCase();}));

    disposable.push(vscode.commands.registerCommand("extension.codicSetGlobalCase", () => {codicExtension.setGlobalCase();}));

    context.subscriptions.push(codicExtension);
    disposable.forEach((item) => {
        context.subscriptions.push(item);
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
}