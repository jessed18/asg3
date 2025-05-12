function initShaders(gl, vshader, fshader) {
    const program = createProgram(gl, vshader, fshader);
    if (!program) {
      console.log('failed to create program');
      return false;
    }
    gl.useProgram(program);
    gl.program = program;
    return true;
  }

  function createProgram(gl, vshader, fshader) {
    console.log(gl["VERTEX_SHADER"])
    console.log(vshader)
    const vertexShader = loadShader(gl, gl["VERTEX_SHADER"], vshader);
    const fragmentShader = loadShader(gl, gl["FRAGMENT_SHADER"], fshader);



    if (!vertexShader || !fragmentShader) {
      return null;
    }

    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const linked = gl.getProgramParameter(program, gl["LINK_STATUS"]);
    if (!linked) {
      const error = gl.getProgramInfoLog(program);
      console.log("failed to link program: " + error);
      gl.deleteProgram(program);
      gl.deleteShader(fragmentShader);
      gl.deleteShader(vertexShader);
      return null;
    }
    return program;c
  }

  function loadShader(gl, type, source) {
    console.log(gl)
    // console.log(type)
    const shader = gl.createShader(type);
    if (!shader) {
      console.log('unable to create shader');
      return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      const error = gl.getShaderInfoLog(shader);
      console.log('failed to compile shader: ' + error);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  function getWebGLContext(canvas, opt_debug) {
    let gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) return null;

    if (arguments.length < 2 || opt_debug) {
      gl = WebGLDebugUtils.makeDebugContext(gl);
    }

    return gl;
  }
