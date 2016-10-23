require('assets/hud.css');

const utils = require('./lib/utils');
const Rewards = require('./rewards');
const $ = utils.$;
const $$ = utils.$$;

let $wrapper, $score, $learned;

class PageUI {
  static initUI() {
    $wrapper = document.createElement('div');
    $wrapper.id="glaHUD";

    $score = document.createElement('div');
    $score.id="scoreWrap";
    PageUI.updateScore();
    $wrapper.appendChild($score);

    $learned = document.createElement('div');
    $learned.id="learned";
    $wrapper.appendChild($learned);

    var refEle = $('body').children[0];
    $('body').insertBefore($wrapper,refEle);
  }
  static artistLearnedFlash() {
    // TweenMax.to('#learned', 0.3, {scale: '1'});
    // TweenMax.to('#learned', 0.7, {scale: '0.01', delay: 0.2});
  }
  static constructCanvas() {
    var ele = document.createElement('canvas');
    ele.id="glcanvas";
    var refEle = $('body').children[0];
    $('body').insertBefore(ele,refEle);
    return ele;
  }
  static updateScore() {
    // $score.innerHTML = `Artist Reward: <span id="score">${Rewards.reward}<\/span>`;
  }
  static getCanvasEle() {
    return document.getElementById('glcanvas');
  }
}
PageUI.initUI();
PageUI.constructCanvas();


module.exports = PageUI;
