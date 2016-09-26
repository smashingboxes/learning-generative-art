require('assets/hud.css');

const utils = require('./utils');
const Rewards = require('./rewards');
const $ = utils.$;
const $$ = utils.$$;

let $wrapper, $score, $learned;

class PageUI {
  static initUI() {
    $wrapper = document.createElement('div');
    $wrapper.id="glaHUD";
    $wrapper.setAttribute('style', 'position: fixed; top: 0; right: 0; z-index: 1000;');

    $score = document.createElement('div');
    $score.id="scoreWrap";
    $score.innerHTML = 'Artist Reward: <span id="score">0<\/span>';
    $wrapper.appendChild($score);

    $learned = document.createElement('div');
    $learned.id="learned";
    $wrapper.appendChild($learned);

    var refEle = $('body').children[0];
    $('body').insertBefore($wrapper,refEle);
  }
  static constructCanvas() {
    var ele = document.createElement('canvas');
    ele.id="glcanvas";
    var refEle = $('body').children[0];
    ele.setAttribute('style', 'height: 100vh; width: 100vw; position: fixed; top: 0; left: 0; z-index: -1;');
    $('body').insertBefore(ele,refEle);
    return ele;
  }
  static updateScore() {
    $score.innerHTML = `Artist Reward: <span id="score">${Rewards.reward}<\/span>`;
  }
  static getCanvasEle() {
    return document.getElementById('glcanvas');
  }
}
PageUI.initUI();
PageUI.constructCanvas();


module.exports = PageUI;
