const utils = require('utils');
const $ = utils.$;
const $$ = utils.$$;

class PageUI {
  static initUI() {
    var ele1 = document.createElement('div');
    ele1.id="scoreWrap";
    ele1.innerHTML = 'Artist Reward: <span id="score">0<\/span>';

    var ele2 = document.createElement('div');
    ele2.id="learned";
    var refEle = $('body').children[0];

    ele1.setAttribute('style', 'position: fixed; top: 0; right: 0; z-index: 1000;');
    ele2.setAttribute('style', 'position: fixed; bottom: 0; right: 0; z-index: 1000;');

    $('body').insertBefore(ele2,refEle);
    $('body').insertBefore(ele1,refEle);
  }
  static shuffleMessages() {
    let shuffle = function (arr) {
      let counter = arr.length;
      while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
      }
      return arr;
    }
    let indexShuffle = [];
    let messages = $('#messages');
    let sections = $$('#messages > *');
    sections.forEach((ele, i) => {
      indexShuffle.push(i);
    });
    indexShuffle = shuffle(indexShuffle);
    indexShuffle.forEach((index, ii) => {
      messages.appendChild(sections[index]);
    });
  }
}
PageUI.initUI();

module.exports = PageUI;
