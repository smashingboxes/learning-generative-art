require('assets/hud.css');

const utils = require('./lib/utils');
const Rewards = require('./rewards');
const $ = utils.$;
const $$ = utils.$$;

let isVisible = false, isMouseDown = false;
let $wrapper, $score, $learned, $uniforms;

class PageUI {
  static initUI() {
    $wrapper = document.createElement('div');
    $wrapper.id="glaHUD";

    let scoreWrap = PageUI.addElement('div', 'scoreWrap');
    scoreWrap.innerHTML = `
      This is the Djarvis Heads-up Display.<br />
      You can Tweak Djarvis' inputs here. <br />
      Djarvis Reward Factor: <span id="score">0<\/span> <br />
      Press ctrl + shift + 'H' to exit.
    `;

    $learned = PageUI.addElement('div', 'learned');

    var refEle = $('body').children[0];
    $('body').insertBefore($wrapper,refEle);

    $score = $('#score');
    PageUI.updateScore();
  }
  static addElement(eleType, id, parent) {
    let ele = document.createElement('div');
    if (id) { ele.id = id; }
    if (!parent) {
      parent = $wrapper;
    }
    parent.appendChild(ele);
    return ele;
  }
  static artistLearnedFlash() {
    if (!isVisible) return;
    PageUI.updateUniforms(this);
    TweenMax.to('#learned', 0.3, {scale: '1'});
    TweenMax.to('#learned', 0.7, {scale: '0.01', delay: 0.2});
  }
  static ensureUniformsExist(context) {
    if (context.learningUniforms && !$('#learningUniforms')) {
      let uniformBox = PageUI.addElement('div', 'learningUniforms');
      $uniforms = context.learningUniforms.map((uniform)=>{
        let uni = PageUI.addElement('div', uniform.name, uniformBox)
        uni.innerHTML = `
          ${uniform.name}
          <input type="range" min="0.0000001" max="2" step="0.00001" value="${uniform.val}" />
          <input type="number" value="${uniform.val}" />
        `;
        uni.addEventListener('mousedown', PageUI.onInputChange.bind(uniform));
        uni.addEventListener('mousemove', PageUI.onInputChange.bind(uniform));
        uni.addEventListener('change', PageUI.onInputChange.bind(uniform));
        return uni;
      });
    }
  }
  static updateUniforms(context) {
    PageUI.ensureUniformsExist(context);
    context.learningUniforms.forEach((uniform)=>{
      $(`#${uniform.name}`).children[0].value = uniform.val;
      $(`#${uniform.name}`).children[1].value = uniform.val;
    });
  }
  static onInputChange(e) {
    if (e.type === 'mousedown') {
      isMouseDown = true;
    }

    if (!isMouseDown) return;

    let uniform  = this;
    uniform.val = e.target.value;
    window.dispatchEvent(new CustomEvent('userAdjustment', {detail: uniform}));

    if (e.type === 'change') {
      isMouseDown = false;
    }
  }
  static toggleHUD() {
    if (!isVisible) {
      TweenMax.fromTo($wrapper, 0.3, {display: 'none', opacity: 0}, {display: 'block', opacity: 1});
    } else {
      TweenMax.to($wrapper, 0.3, {display: 'none', opacity: 0});
    }
    isVisible = !isVisible;
  }
  static constructCanvas() {
    var ele = document.createElement('canvas');
    ele.id="glcanvas";
    var refEle = $('body').children[0];
    $('body').insertBefore(ele,refEle);
    return ele;
  }
  static updateScore() {
    if (!isVisible) return;
    $score.innerHTML = `${Rewards.reward}`;
  }
  static getCanvasEle() {
    return document.getElementById('glcanvas');
  }
}
PageUI.initUI();
PageUI.constructCanvas();


module.exports = PageUI;
