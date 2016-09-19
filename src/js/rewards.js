const _ = require('lodash');
const utils = require('utils');
const $ = utils.$;
const $$ = utils.$$;

let ctaInteraction = {x: 0, y: 0};
let interactTime = 0;

class Rewards {
  constructor() {
    let context = this;
    let incrementInteractTime = function() {
      context.interactTime+=0.01;
    }
    let interactCounterHandle = _.debounce(incrementInteractTime, 10);

    context.resetRewards();

    window.addEventListener('panic', function() {
      context.resetRewards();
    });

    window.addEventListener('click', function (e) {
      if ( e.target.nodeName == 'A' || e.target.nodeName == 'BUTTON' ) {
        ctaInteraction.x = mouse.x;
        ctaInteraction.x = mouse.y;
        context.totalInteractions++;
        if (e.target == utils.getCTA()) {
          context.totalInteractions+=4;
        }
        context.timeSinceLastInteraction = Date.now()-context.timeSinceLastInteraction;
      }
    }, false);

    window.addEventListener('mousemove', interactCounterHandle, false);
    window.addEventListener('scroll', interactCounterHandle, false);
    window.addEventListener('mouseover', function (e) {
      if (e.target.nodeName == 'A' || e.target.nodeName == 'BUTTON') {
        interactCounterHandle(e);
        if (e.target == utils.getCTA()) {
          context.totalInteractions+=1;
        }
      }
    }, false);

    window.addEventListener('blur', function() {
      this.timePageLoad = Date.now();
      interactTime = Math.max(interactTime-50,0);
    }, false);
  }
  calculateReward() {
    // seconds on page * 1, interactions * 15, scroll dist total * 10, num pages * 20, clicks contact * 200
    if ( true ) {
      this.reward = this.userReward + Math.floor((Date.now()-this.timePageLoad)/(100*1000)) + Math.floor(this.interactTime) + (this.totalInteractions*15);
    }
    return this.reward;
  }
  increaseMerit () {
    this.userReward+=10;
    window.dispatchEvent(new Event('learn'));
  }
  decreaseMerit (key) {
    this.userReward-=50;
    if (this.userReward<=0) this.userReward = 0;
    window.dispatchEvent(new Event('learn'));
  }
  resetRewards() {
    this.timePageLoad = Date.now();
    this.timeSinceLastInteraction = this.timePageLoad;
    this.interactTime = 0;
    this.totalInteractions = 0;
    this.userReward = 0;
    this.reward = 0;
  }
}

let rewards = new Rewards();

module.exports = rewards;
