const glUtils = require('./glUtils');

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());




var canvas,
    gl,
    buffer,
    vertex_shader, fragment_shader,
    currentProgram,
    vertex_position,
    parameters = {  start_time  : new Date().getTime(),
                    time        : 0,
                    screenWidth : 0,
                    screenHeight: 0 };

init();
animate();

function init() {
  canvas = document.getElementById( 'glcanvas' );

  // Initialise WebGL

  gl = glUtils.setupWebGL(canvas);

  // Create Vertex buffer (2 triangles)

  buffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [ -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0 ] ), gl.STATIC_DRAW );

  // Create Program

  let fragShaderName = getParameterByName('frag') || 'shader.frag';
  let vertShaderName = getParameterByName('vert') || 'shader.vert';

  currentProgram = createProgram( `${fragShaderName}.glsl`, `${vertShaderName}.glsl` );

  onWindowResize();
  window.addEventListener( 'resize', onWindowResize, false );
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

    console.error( "ERROR:\n" +
      "VALIDATE_STATUS: " + gl.getProgramParameter( program, gl.VALIDATE_STATUS ) + "\n" +
      "ERROR: " + gl.getError() + "\n\n" +
      "- Vertex Shader -\n" + vertex + "\n\n" +
      "- Fragment Shader -\n" + fragment );

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
  render();

}

function render() {

  if ( !currentProgram ) return;

  parameters.time = new Date().getTime() - parameters.start_time;

  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

  // Load program into GPU

  gl.useProgram( currentProgram );

  // Set values to program variables

  gl.uniform1f( gl.getUniformLocation( currentProgram, 'time' ), parameters.time / 1000 );
  gl.uniform2f( gl.getUniformLocation( currentProgram, 'resolution' ), parameters.screenWidth, parameters.screenHeight );

  // Render geometry

  gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
  gl.vertexAttribPointer( vertex_position, 2, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vertex_position );
  gl.drawArrays( gl.TRIANGLES, 0, 6 );
  gl.disableVertexAttribArray( vertex_position );

}


function getShader(gl, id) {
  var shaderScript = require(`shaders/${id}`);

  // Didn't find an element with the specified ID; abort.
  if (!shaderScript) {
    return null;
  }

  // Walk through the source element's children, building the
  // shader source string.


  var theSource = shaderScript;
  var currentChild = shaderScript.firstChild;

  // Now figure out what type of shader script we have,
  // based on its MIME type.

  var shader;

  if (id.match('frag')) {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (id.match('vert')) {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;  // Unknown shader type
  }

  // Send the source to the shader object

  gl.shaderSource(shader, theSource);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

