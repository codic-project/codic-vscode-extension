# codic

ネーミングツール [codic](https://codic.jp) を Visual Studio Code のコマンドパレットから操作できるようにする拡張機能です。

## 使い方
![usage GIF](images/usage.gif)  

※ 事前に後述の「設定」を行う必要があります。

コマンドパレットから以下のコマンドを選択します。
```
codic: Translate Japanese Phrase
```
![choose Translation command from command pallet](images/translate.png)  

表示された入力欄に、翻訳したい文字列を入力します。  
![input a phrase to translate](images/japanese.png)  

それぞれの単語に対応する訳語の一覧が表示されるので、適当なものを選択します。  
※ &lt;null&gt; という選択肢は、訳出しないことを意味します。  
![choose an equivalent](images/candidates.png)  

選択した単語が入力されます。

## 動作環境

Visual Studio Code 1.5.0以上

## インストール
コマンドパレットに以下のコマンドを入力してください。
```
ext install codic
```
Marketplace の検索結果が表示されるので、この拡張機能を選択し、インストールしてください。

## 設定

### アクセストークンの設定
この拡張機能を利用するには、codic API のアクセストークンを設定することが必要です。  
アクセストークンは[こちら](https://codic.jp/my/api_status)で取得できます。  
`メニューバー > ファイル > 基本設定 > ユーザー設定` から `settings.json` を開き、以下のように記述を追加してください。
```json
{
    "codic.ACCESS_TOKEN": "取得したアクセストークン"
}
```  

### case の設定
単語の連結方法を、
- `PascalCase`
- `camelCase`
- `snake_case`
- `SNAKE_CASE`
- `hy-phen-a-tion` (ハイフン区切り)
- `no case` (空白区切り)

から選ぶことができます。

現在のワークスペースにのみ適用する場合、
```
codic: Set Which Case to Use Locally
```
全てのワークスペースに適用する場合、
```
codic: Set Which Case to Use Globally
```
をコマンドパレットから選択し、表示された選択肢から使用したい case を選択してください。  
![call command from command pallet](images/codic.png)    
![choose case](images/cases.png)  

## ライセンス
この拡張機能は [MIT License](LICENSE.txt) の下で利用可能です。  
ソースコードは以下の GitHub リポジトリをご参照ください。  
[https://github.com/codic-project/codic-vscode-extension](https://github.com/codic-project/codic-vscode-extension)

## バグ報告・要望
[GitHub リポジトリの Issue](https://github.com/codic-project/codic-vscode-extension/issues) までご報告ください。  
※ ver 0.0.1 時点ではエラー処理をほとんどやっていません。そのうち実装します。

### 既知の不具合・要望
[GitHub リポジトリの Open Issues](https://github.com/codic-project/codic-vscode-extension/issues?utf8=%E2%9C%93&q=is%3Aissue%20is%3Aopen)をご参照ください。  
また、それぞれの優先度や進捗状況については、[GiHub リポジトリの Project](https://github.com/codic-project/codic-vscode-extension/projects/2)をご覧ください。

## 変更履歴

[こちら](CHANGELOG.md)をご覧ください。