'use strict'; // 厳格モード：曖昧な書き方をエラーにして、バグを未然に防ぐおまじない

// ==========================================
// 1. HTML要素の取得（操作する部品をJSに読み込む）
// ==========================================
const userNameInput = document.getElementById("user-name");     // 名前を入力するテキストボックス
const assessmentButton = document.getElementById("assessment"); // 「診断する」ボタン
const resultDivision = document.getElementById("result-area");  // 診断結果を表示するエリア
const tweetDivision = document.getElementById("tweet-area");    // ツイートボタンを表示するエリア

// ==========================================
// 2. ボタンがクリックされたときの処理
// ==========================================
assessmentButton.addEventListener(
  'click', // 「クリックされたら」というイベントを指定
  () => {  // クリックされたときに実行される処理（アロー関数）
    
    // 入力欄から名前を取得し、空欄ならここで処理をストップする（ガード節）
    const userName = userNameInput.value;
    if (userName.length === 0) {
      return; // 関数を終了し、以降の処理を実行しない
    }

    // --- 診断結果エリアの作成（BootstrapのCardデザインを適用） ---
    resultDivision.innerText = ''; // 2回目以降の診断時に、前の結果が重複しないよう中身を空にする

    // カードのヘッダー部分（青い見出し）を作成
    const headerDivision = document.createElement('div');
    headerDivision.setAttribute('class', 'card-header text-bg-primary');
    headerDivision.innerText = '診断結果';

    // カードのボディ部分（診断結果の文章が入る枠）を作成
    const bodyDivision = document.createElement('div');
    bodyDivision.setAttribute('class', 'card-body');

    const paragraph = document.createElement('p');
    paragraph.setAttribute('class', 'card-text');
    const result = assessment(userName); // 下で定義している診断関数を呼び出して結果を取得
    paragraph.innerText = result;
    bodyDivision.appendChild(paragraph); // bodyDivisionの中にpタグを入れる

    // 親要素（resultDivision）をカード化し、ヘッダーとボディを合体させる
    resultDivision.setAttribute('class', 'card');
    resultDivision.appendChild(headerDivision);
    resultDivision.appendChild(bodyDivision);

    // --- ツイート（X投稿）エリアの作成 ---
    tweetDivision.innerText = ''; // 前のツイートボタンをリセット

    // aタグ（リンク）を作成し、Xの投稿画面へ飛ぶURLを設定
    const anchor = document.createElement('a');
    // encodeURIComponent：日本語のハッシュタグをURLで使える安全な文字列に変換する
    const hrefValue = "https://x.com/intent/tweet?button_hashtag=" + encodeURIComponent("あなたのいいところ") + "&ref_src=twsrc%5Etfw";

    anchor.setAttribute('href', hrefValue);
    anchor.setAttribute('class', 'twitter-hashtag-button'); // Xの公式ボタンデザインにするためのクラス
    anchor.setAttribute('data-text', result);               // 投稿文に診断結果を自動セット
    anchor.innerText = 'Tweet #あなたのいいところ';

    tweetDivision.appendChild(anchor);

    // 単なるテキストリンクを、X公式の青いツイートボタンの見た目に変換する外部スクリプトを読み込む
    const script = document.createElement('script');
    script.setAttribute('src', 'https://platform.twitter.com/widgets.js');
    tweetDivision.appendChild(script);
  }
);

// ==========================================
// 3. 入力欄でEnterキーが押されたときの処理
// ==========================================
userNameInput.addEventListener(
  'keydown', // キーボードが押された瞬間を検知
  (event) => {
    if (event.key === 'Enter') {
      // 「診断する」ボタンがクリックされたのと同じイベントをプログラムから発生させる
      assessmentButton.dispatchEvent(new Event('click'));
    }
  }
);

// ==========================================
// 4. 診断結果のテンプレート一覧（配列）
// ==========================================
// 「###userName###」は、あとで実際の入力名に置き換えるための目印（プレースホルダー）
const answers = [
  '###userName###のいいところは声です。###userName###の特徴的な声は皆を惹きつけ、心に残ります。',
  '###userName###のいいところはまなざしです。###userName###に見つめられた人は、気になって仕方がないでしょう。',
  '###userName###のいいところは情熱です。###userName###の情熱に周りの人は感化されます。',
  '###userName###のいいところは厳しさです。###userName###の厳しさがものごとをいつも成功に導きます。',
  '###userName###のいいところは知識です。博識な###userName###を多くの人が頼りにしています。',
  '###userName###のいいところはユニークさです。###userName###だけのその特徴が皆を楽しくさせます。',
  '###userName###のいいところは用心深さです。###userName###の洞察に、多くの人が助けられます。',
  '###userName###のいいところは見た目です。内側から溢れ出る###userName###の良さに皆が気を惹かれます。',
  '###userName###のいいところは決断力です。###userName###がする決断にいつも助けられる人がいます。',
  '###userName###のいいところは思いやりです。###userName###に気をかけてもらった多くの人が感謝しています。',
  '###userName###のいいところは感受性です。###userName###が感じたことに皆が共感し、わかりあうことができます。',
  '###userName###のいいところは節度です。強引すぎない###userName###の考えに皆が感謝しています。',
  '###userName###のいいところは好奇心です。新しいことに向かっていく###userName###の心構えが多くの人に魅力的に映ります。',
  '###userName###のいいところは気配りです。###userName###の配慮が多くの人を救っています。',
  '###userName###のいいところはそのすべてです。ありのままの###userName###自身がいいところなのです。',
  '###userName###のいいところは自制心です。やばいと思ったときにしっかりと衝動を抑えられる###userName###が皆から評価されています。',
];

// ==========================================
// 5. 診断ロジックの本体（関数）
// ==========================================
/**
 * 名前の文字列を渡すと診断結果を返す関数（JSDocコメント）
 * @param {string} userName ユーザーの名前
 * @return {string} 診断結果
 */
function assessment(userName) {
  // 全文字の文字コード（コンピュータ内部の数値）を取得して足し合わせる
  let sumOfCharCode = 0;
  for (let i = 0; i < userName.length; i++) {
    sumOfCharCode = sumOfCharCode + userName.charCodeAt(i);
  }

  // 文字コードの合計を「配列の要素数（16）」で割った【余り】を求める
  // これにより、どんな名前でも必ず 0〜15 の数値になり、同じ名前なら毎回同じ結果になる
  const index = sumOfCharCode % answers.length;
  let result = answers[index];

  // テンプレート内の「###userName###」をすべてユーザーの名前に置換する
  result = result.replaceAll('###userName###', userName);
  return result;
}

// ==========================================
// 6. プログラムが正しく動くか確認する自動テスト
// ==========================================
function test() {
  console.log('診断結果の文章のテスト');

  // console.assert(条件式, エラー時のメッセージ)
  // 条件式が true なら何も起きず、false になったときだけコンソールにエラーを表示する

  // 太郎のテスト
  console.log('太郎');
  console.assert(
    assessment('太郎') ===
    '太郎のいいところは決断力です。太郎がする決断にいつも助けられる人がいます。',
    '診断結果の文言の特定の部分を名前に置き換える処理が正しくありません。'
  );

  // 次郎のテスト
  console.log('次郎');
  console.assert(
    assessment('次郎') ===
    '次郎のいいところは自制心です。やばいと思ったときにしっかりと衝動を抑えられる次郎が皆から評価されています。',
    '診断結果の文言の特定の部分を名前に置き換える処理が正しくありません。'
  );

  // 花子のテスト
  console.log('花子');
  console.assert(
    assessment('花子') ===
    '花子のいいところはまなざしです。花子に見つめられた人は、気になって仕方がないでしょう。',
    '診断結果の文言の特定の部分を名前に置き換える処理が正しくありません。'
  );

  console.log('診断結果の文章のテスト終了');
}

// ページ読み込み時にテストを実行（開発者ツールのConsoleで確認できる）
test();