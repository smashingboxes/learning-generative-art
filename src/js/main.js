(function (window, document) {

  var canvas, gl, buffer,
      vertex_shader, fragment_shader,
      currentProgram, vertex_position,

      DEF_FRAG = 'shader.frag',
      DEF_VERT = 'shader.vert',

      delayMouse = {
        x: 0,
        y: 0
      },
      mouse = {
        x: 0,
        y: 0
      },
      parameters = {
        start_time  : Date.now(),
        time        : 0,
        screenWidth : 0,
        screenHeight: 0
      };

  window.rewards = {
    merit: 1,
    demerit: 1,
  }

  const glUtils = require('./glUtils');
  const artist = require('./artist');

  init();

  function $ (sel) {
    return document.querySelector(sel);
  }
  function $$ (sel) {
    return document.querySelectorAll(sel);
  }

  function init() {
    canvas = document.getElementById( 'glcanvas' );
    mouse.x = window.innerWidth/2;
    mouse.y = window.innerHeight/2;

    gl = glUtils.setupWebGL(canvas, {preserveDrawingBuffer: false});

    // THINK ABOUT A LARGER VERTEX BUFFER
    buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [ -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0 ] ), gl.STATIC_DRAW );

    // Create GL Program
    let fragShaderName = (getParameterByName('frag') || DEF_FRAG) + '.glsl';
    let vertShaderName = (getParameterByName('vert') || DEF_VERT) + '.glsl';

    currentProgram = createProgram( `${fragShaderName}`, `${vertShaderName}` );
    onWindowResize();
    addEventListeners();

    animate();
  }

  function addEventListeners () {
    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( 'mousemove', onMouseMove, false );

    window.addEventListener('keydown', function(event){
      console.log('test', event);
      if (event.keyCode === 38) {
        increaseMerit('merit')();
      } else if (event.keyCode === 40) {
        resetMerit('merit')();
      }
    });

    $('.merit').addEventListener('click', increaseMerit('merit'), false);
    $('.merit').addEventListener('mouseover', increaseMerit('merit'), false);
    $('.merit').addEventListener('mouseout', resetMerit('merit'), false);
    $('.demerit').addEventListener('click', decreaseMerit('merit'), false);
    $('.demerit').addEventListener('mouseover', decreaseMerit('merit'), false);
    $('.demerit').addEventListener('mouseout', resetMerit('merit'), false);
  }
  function increaseMerit (key) {
    return function () {
      rewards[key]+=2;
      window.dispatchEvent(new Event('learn'));
    }
  }
  function decreaseMerit (key) {
    return function () {
      rewards[key]-=1;
      window.dispatchEvent(new Event('learn'));
    }
  }
  function resetMerit (key) {
    return function () {
      rewards[key]=0;
      window.dispatchEvent(new Event('learn'));
    }
  }
  function onMouseMove (event) {
    mouse = { x: event.pageX, y: event.pageY };
  }

  function getParameterByName(name, url) {
      if (!url) url = window.location.href;
      url = url.toLowerCase(); // This is just to avoid case sensitiveness
      name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();// This is just to avoid case sensitiveness for query parameter name
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
  }


  function createProgram( vertex, fragment ) {

    var program = gl.createProgram();

    var vs = getShader(gl, vertex);
    var fs = getShader(gl, fragment);

    if ( vs == null || fs == null ) return null;

    gl.attachShader( program, vs );
    gl.attachShader( program, fs );

    gl.deleteShader( vs );
    gl.deleteShader( fs );

    gl.linkProgram( program );

    if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) ) {

      console.error(
        "ERROR:\n" +
        "VALIDATE_STATUS: " + gl.getProgramParameter( program, gl.VALIDATE_STATUS ) + "\n" +
        "ERROR: " + gl.getError() + "\n\n" +
        "- Vertex Shader -\n" + vertex + "\n\n" +
        "- Fragment Shader -\n" + fragment
      );

      return null;

    }

    return program;
  }

  function createShader( src, type ) {

    var shader = gl.createShader( type );

    gl.shaderSource( shader, src );
    gl.compileShader( shader );

    if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
      console.error( ( type == gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT" ) + " SHADER:\n" + gl.getShaderInfoLog( shader ) );
      return null;
    }

    return shader;
  }

  function onWindowResize( event ) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    parameters.screenWidth = canvas.width;
    parameters.screenHeight = canvas.height;

    gl.viewport( 0, 0, canvas.width, canvas.height );
  }

  function animate() {
    requestAnimationFrame( animate );
    delayMouse.x += (mouse.x-delayMouse.x)/16;
    delayMouse.y += (mouse.y-delayMouse.y)/16;
    //console.log(delayMouse, mouse);
    render();
  }

  function useUniforms (uniforms) {
    uniforms.forEach(function (obj) {
      gl.uniform1f( gl.getUniformLocation( currentProgram, obj.name ), obj.val );
    })
  }

  function getShader(gl, shaderID) {
    var shaderScriptFile = require(`../shaders/${shaderID}`);

    // Didn't find shader files. Abort.
    if (!shaderScriptFile) {
      throw new Error(`No shader found here: shaders/${shaderID}`);
      return null;
    }

    var shader;

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


  function render() {

    if ( !currentProgram ) return;

    parameters.time = ( Date.now() - parameters.start_time ) / 100000;
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    gl.useProgram( currentProgram );

    useUniforms(learningUniforms);

    gl.uniform1f( gl.getUniformLocation( currentProgram, 'time' ), parameters.time  );
    gl.uniform2f( gl.getUniformLocation( currentProgram, 'resolution' ), parameters.screenWidth, parameters.screenHeight );
    gl.uniform2f( gl.getUniformLocation( currentProgram, 'mouse' ), mouse.x/parameters.screenWidth, (parameters.screenHeight-mouse.y)/parameters.screenHeight );
    gl.uniform2f( gl.getUniformLocation( currentProgram, 'delayMouse' ), delayMouse.x/parameters.screenWidth, (parameters.screenHeight-delayMouse.y)/parameters.screenHeight );


    gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
    gl.vertexAttribPointer( vertex_position, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertex_position );
    gl.drawArrays( gl.TRIANGLES, 0, 6 );
    gl.disableVertexAttribArray( vertex_position );
  }



})(window, document);
