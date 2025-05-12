let canvas, gl;
let a_Position, a_UV;
let u_ModelMatrix, u_ViewMatrix, u_ProjectionMatrix, u_FragColor, u_whichTexture;
let u_Sampler0, u_Sampler1;
let camera;
let animalFound = false;

const VERTEX_SHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  varying vec2 v_UV;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }
`;

const FRAGMENT_SHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  varying vec2 v_UV;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else {
      gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
    }
  }
`;

function main() {
  canvas = document.getElementById("webgl");
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.5, 0.8, 0.92, 1.0);
  setupGLSL();
  prepareTextures(() => {
    camera = new Camera();
    renderScene();
  });
  document.addEventListener("keydown", handleKeyInput);
  canvas.addEventListener("mousemove", trackMouseMovement);
  canvas.addEventListener("click", manageMouseClick);
}

function setupGLSL() {
  const program = initProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
  gl.useProgram(program);
  gl.program = program;
  a_Position = gl.getAttribLocation(program, "a_Position");
  a_UV = gl.getAttribLocation(program, "a_UV");
  u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");
  u_ViewMatrix = gl.getUniformLocation(program, "u_ViewMatrix");
  u_ProjectionMatrix = gl.getUniformLocation(program, "u_ProjectionMatrix");
  u_FragColor = gl.getUniformLocation(program, "u_FragColor");
  u_whichTexture = gl.getUniformLocation(program, "u_whichTexture");
  u_Sampler0 = gl.getUniformLocation(program, "u_Sampler0");
  u_Sampler1 = gl.getUniformLocation(program, "u_Sampler1");
}

function initProgram(gl, vsSource, fsSource) {
  const vShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const prog = gl.createProgram();
  gl.attachShader(prog, vShader);
  gl.attachShader(prog, fShader);
  gl.linkProgram(prog);
  return prog;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

function prepareTextures(callback) {
  let loaded = 0;
  const skyImg = new Image();
  const dirtImg = new Image();
  skyImg.onload = () => { applyTexture(skyImg, 0); if (++loaded === 2) callback(); };
  dirtImg.onload = () => { applyTexture(dirtImg, 1); if (++loaded === 2) callback(); };
  skyImg.src = "textures/sky.jpg";
  dirtImg.src = "textures/dirt.jpg";
}

function applyTexture(img, unit) {
  const tex = gl.createTexture();
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.uniform1i(unit === 0 ? u_Sampler0 : u_Sampler1, unit);
}

let blockGrid = Array.from({ length: 32 }, () =>
  Array.from({ length: 32 }, () => Math.floor(Math.random() * 5))
);

function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

  const ground = new Cube();
  ground.textureNum = -2;
  ground.color = [0.2, 0.6, 0.2, 1.0];
  ground.matrix = new Matrix4().setTranslate(0, -1, 0).scale(32, 0.1, 32);
  ground.render();

  const sky = new Cube();
  sky.textureNum = 0;
  sky.matrix = new Matrix4().setTranslate(0, 0, 0).scale(1000, 1000, 1000);
  sky.render();

  for (let col = 0; col < 32; col++) {
    for (let row = 0; row < 32; row++) {
      const height = blockGrid[col][row];
      for (let level = 0; level < height; level++) {
        const cube = new Cube();
        cube.textureNum = 1;
        cube.matrix = new Matrix4().setTranslate(col - 16, level, row - 16);
        cube.renderfast();
      }
    }
  }

  drawFrog();
  checkFrogFound();
}

function drawFrog() {
  const baseX = 0, baseY = 0.5, baseZ = 0;

  const body = new Cube();
  body.textureNum = -2;
  body.color = [0.0, 0.8, 0.0, 1.0];
  body.matrix = new Matrix4().setTranslate(baseX, baseY, baseZ).scale(2, 1, 2);
  body.render();

  const leftEye = new Cube();
  leftEye.textureNum = -2;
  leftEye.color = [1.0, 1.0, 1.0, 1.0];
  leftEye.matrix = new Matrix4().setTranslate(baseX - 0.6, baseY + 1.0, baseZ + 0.8).scale(0.4, 0.4, 0.4);
  leftEye.render();

  const rightEye = new Cube();
  rightEye.textureNum = -2;
  rightEye.color = [1.0, 1.0, 1.0, 1.0];
  rightEye.matrix = new Matrix4().setTranslate(baseX + 0.6, baseY + 1.0, baseZ + 0.8).scale(0.4, 0.4, 0.4);
  rightEye.render();

  const leftPupil = new Cube();
  leftPupil.textureNum = -2;
  leftPupil.color = [0.0, 0.0, 0.0, 1.0];
  leftPupil.matrix = new Matrix4().setTranslate(baseX - 0.5, baseY + 1.1, baseZ + 1.0).scale(0.2, 0.2, 0.2);
  leftPupil.render();

  const rightPupil = new Cube();
  rightPupil.textureNum = -2;
  rightPupil.color = [0.0, 0.0, 0.0, 1.0];
  rightPupil.matrix = new Matrix4().setTranslate(baseX + 0.5, baseY + 1.1, baseZ + 1.0).scale(0.2, 0.2, 0.2);
  rightPupil.render();
}

function checkFrogFound() {
  const dx = camera.eye.elements[0];
  const dz = camera.eye.elements[2];
  if (!animalFound && Math.abs(dx) < 2 && Math.abs(dz) < 2) {
    animalFound = true;
    console.log("The frog says: 'Welcome to your world!'");
  }
}

function handleKeyInput(e) {
  const key = e.key.toLowerCase();
  const step = 0.5;
  if (key === 'w') camera.moveForward(step);
  if (key === 's') camera.moveBackward(step);
  if (key === 'a') camera.moveLeft(step);
  if (key === 'd') camera.moveRight(step);
  if (key === 'q') camera.panLeft(5);
  if (key === 'e') camera.panRight(5);
  renderScene();
}

let lastX = null;
function trackMouseMovement(e) {
  if (!camera) return;
  if (lastX !== null) {
    let dx = e.clientX - lastX;
    camera.panRight(-dx * 0.5);
    renderScene();
  }
  lastX = e.clientX;
}

function manageMouseClick(e) {
  if (!camera || typeof camera.getFocusedGrid !== 'function') return;
  const [col, row] = camera.getFocusedGrid();
  if (e.shiftKey) {
    if (blockGrid[col] && blockGrid[col][row] > 0) blockGrid[col][row]--;
  } else {
    if (blockGrid[col]) blockGrid[col][row] = Math.min(4, blockGrid[col][row] + 1);
  }
  renderScene();
}
