'use strict'
import 'babel-polyfill';
import './lib/console.nerf';
import './lib/eventListener.polyfill.js';

let canvas, gl, buffer, vertex_shader, fragment_shader, currentProgram, vertex_position;

const DEF_FRAG = 'shader.frag';
const DEF_VERT = 'shader.vert';

let delayMouse = { x: 0, y: 0 };
let mouse = { x: 0, y: 0 };
let ctaDistance = { x: 0, y: 0 };

window.mouse = mouse;

const TweenMax = require('gsap');
const _ = require('lodash');

const versioning = require('./lib/versioning');
const GLOBALS = require('./globals');

const glUtils = require('./lib/glUtils');
const focusUtils = require('./lib/window.focus.util');
const artist = require('./artist');
const Rewards = require('./rewards');
const utils = require('./lib/utils');
const pageUI = require('./pageUI');
const TIMEMOD = 25000;

const $ = utils.$;
const $$ = utils.$$;

let $score = $('#score');
let screenShotCaptureMode = utils.getUrlVars('captureMode') || false;
let learningUniforms = artist.learningUniforms;

class ArtistRenderer {
  constructor() {
    this.parameters = {
      seed: Math.random(),
      start_time : Date.now(),
      time : Math.floor( Date.now() * Math.random() ),
      scrolly : 0,
      screenWidth : 1,
      screenHeight : 1,
      pageHeight: 1,
      pageWidth: 1
    };
    if (localStorage.parameters) {
      this.parameters = _.merge(this.parameters, JSON.parse(localStorage.parameters));
    }

    localStorage.setItem('parameters', JSON.stringify(this.parameters));

    this.helpers = {
      scrollDelta: 0,
      scrollDistance: 0
    }

    canvas = pageUI.getCanvasEle();

    mouse.x = window.innerWidth/2;
    mouse.y = window.innerHeight/2;
    delayMouse.x = window.innerWidth/2;
    delayMouse.y = window.innerHeight/2;

    gl = glUtils.setupWebGL(canvas, {preserveDrawingBuffer: screenShotCaptureMode});

    if (!gl || !window.Worker || !window.localStorage) {
      //Feature Detection
      return;
    }

    // THINK ABOUT A LARGER VERTEX BUFFER
    buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer );

    // Make a giant square to display fragment shader on
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array([
      -1.0, -1.0, 1.0,
      -1.0, -1.0, 1.0,
       1.0, -1.0, 1.0,
       1.0, -1.0, 1.0
    ]), gl.STATIC_DRAW );

    // Create GL Program
    let fragShaderName = (utils.getParameterByName('frag') || DEF_FRAG) + '.glsl';
    let vertShaderName = (utils.getParameterByName('vert') || DEF_VERT) + '.glsl';

    currentProgram = this.createProgram( `${fragShaderName}`, `${vertShaderName}` );

    this.onWindowResize();
    this.addEventListeners();
    this.animate();
  }
  addEventListeners () {
    window.addEventListener('load', this.onWindowResize.bind(this), false);
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    window.addEventListener('scroll', this.onMouseMove.bind(this), false);
    $('body').addEventListener('mouseleave', this.onMouseLeave.bind(this), false );
    window.addEventListener('keydown', this.onKeyDown.bind(this));
  }
  onMouseLeave(event) {
    Rewards.decreaseMerit();
  }
  onKeyDown(event) {
    console.log('keypressed', event.key, event);
    if (event.target.nodeName === 'BODY') {
      if (event.key === 'ArrowUp' && event.shiftKey === true) {
        //UP ARROW
        this.saveImage();
        Rewards.increaseMerit();
      } else if (event.key === 'ArrowDown' && event.shiftKey === true) {
        //DOWN ARROW
        Rewards.decreaseMerit();
      } else if (event.key === 'p' && event.ctrlKey === true) {
        //"P" KEY
        this.panicButton();
      } else if (event.key === 'H' && event.ctrlKey === true && event.shiftKey === true) {
        //"H" KEY
        pageUI.toggleHUD();
      }
    }
  }
  onWindowResize(event) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.parameters.screenWidth = canvas.width;
    this.parameters.screenHeight = canvas.height;

    let pageSize = utils.getBodyDimensions();

    this.parameters.pageWidth = pageSize.width;
    this.parameters.pageHeight = pageSize.height;

    gl.viewport( 0, 0, canvas.width, canvas.height );
  }
  onMouseMove (event) {
    let scroll = utils.getPageScroll();
    if (typeof event.pageX !== 'undefined') {
      this.helpers.scrollDistance = scroll.scrollY;
      this.helpers.scrollDelta = scroll.scrollY - this.helpers.scrollDistance;
      mouse = { x: event.pageX, y: event.pageY };
    } else {
      this.helpers.scrollDelta = scroll.scrollY - this.helpers.scrollDistance;
      mouse.y = mouse.y + this.helpers.scrollDelta;
      this.helpers.scrollDistance = scroll.scrollY;
    }
    //console.log(mouse);
    window.mouse = mouse;
  }
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.processDelayMouse();
    this.processCTADistance();
    this.render();
  }
  processCTADistance() {
    let ctaPos = utils.getCTAPostition();
    ctaDistance.x = ctaPos.x - delayMouse.x;
    ctaDistance.y = ctaPos.y - delayMouse.y;
    //console.log(ctaDistance);
  }
  processDelayMouse() {
    delayMouse.x += (mouse.x-delayMouse.x)/16;
    delayMouse.y += (mouse.y-delayMouse.y)/16;
  }
  saveImage() {
    let imgData = canvas.toDataURL();
    console.log('TODO: image saving not implemented.');
    return;
    fetch(GLOBALS.ROOT+'/goodpainting', {
        method: 'POST',
        body: imgData
      })
      .then(utils.checkStatus)
      .then(utils.parseJSON)
      .then(function (e,d) {
        console.log(e,d);
      })
      .catch(function (e) {
        console.error('Error:',e);
      });
  }
  panicButton () {
    window.dispatchEvent(new CustomEvent('panic'));
  }

  createProgram( vertex, fragment ) {
    let program = gl.createProgram();
    let vs = this.getShader(gl, vertex);
    let fs = this.getShader(gl, fragment);

    if ( vs == null || fs == null ) return null;

    gl.attachShader( program, vs );
    gl.attachShader( program, fs );

    gl.deleteShader( vs );
    gl.deleteShader( fs );

    gl.linkProgram( program );

    if ( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
      console.error(`
        ERROR:\n
        VALIDATE_STATUS: ${gl.getProgramParameter(program, gl.VALIDATE_STATUS)}
        ERROR: ${gl.getError()} \n
        - Vertex Shader -  ${vertex} \n
        - Fragment Shader -  ${fragment}
      `);
      return null;
    }

    return program;
  }

  createShader( src, type ) {
    var shader = gl.createShader( type );

    gl.shaderSource( shader, src );
    gl.compileShader( shader );

    if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
      console.error( ( type == gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT" ) + " SHADER:\n" + gl.getShaderInfoLog( shader ) );
      return null;
    }

    return shader;
  }

  useUniforms (uniforms) {
    if (!uniforms) return;
    uniforms.forEach(function (uniform, index) {
      gl.uniform1f( gl.getUniformLocation( currentProgram, uniform.name ), uniform.val );
    })
  }

  getShader(gl, shaderID) {
    let shaderScriptFile = require(`../shaders/${shaderID}`);

    // Didn't find shader files. Abort.
    if (!shaderScriptFile) {
      throw new Error(`No shader found here: shaders/${shaderID}`);
      return null;
    }

    let shader;

    if (shaderID.match('frag')) {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderID.match('vert')) {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      throw new Error(`Shader file must have extension of either .frag.glsl or .vert.glsl`);
      return null;  // Unknown shader type
    }

    gl.shaderSource(shader, shaderScriptFile);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }

  render() {
    if ( !currentProgram ) return;
    let parameters = this.parameters;

    parameters.time = Math.sin((Date.now() - parameters.start_time) / TIMEMOD);
    parameters.scrolly = window.scrollY / parameters.pageHeight;

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    gl.useProgram( currentProgram );

    if (typeof learningUniforms !== 'undefined') {
      this.useUniforms(learningUniforms);
    }

    var loc = gl.getUniformLocation(currentProgram, "mat");
    var mat = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
    mat[5] = canvas.height/canvas.width;
    gl.uniformMatrix4fv(loc, false, mat);

    gl.uniform1f(
      gl.getUniformLocation(currentProgram, 'time'),
      parameters.time );

    gl.uniform1f(
      gl.getUniformLocation(currentProgram, 'seed'),
      parameters.seed );

    gl.uniform1f(
      gl.getUniformLocation(currentProgram, 'scrolly'),
      parameters.scrolly - 0.5);

    gl.uniform2f(
      gl.getUniformLocation(currentProgram, 'resolution'),
      parameters.screenWidth, parameters.screenHeight );

    gl.uniform2f(
      gl.getUniformLocation(currentProgram, 'ctaDistance'),
      ctaDistance.x/this.parameters.pageWidth, ctaDistance.y/this.parameters.pageHeight );

    gl.uniform2f(
      gl.getUniformLocation(currentProgram, 'delayMouse'),
      delayMouse.x/parameters.screenWidth, (parameters.screenHeight-delayMouse.y)/parameters.screenHeight );


    gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
    gl.vertexAttribPointer( vertex_position, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertex_position );
    gl.drawArrays( gl.TRIANGLES, 0, 6 );
    gl.disableVertexAttribArray( vertex_position );

    this.updateScore();
  }

  updateScore () {
    //console.log(this.parameters.time)
    pageUI.updateScore();
  }
}


module.exports = new ArtistRenderer();
