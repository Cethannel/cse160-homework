import Cube from "./Cube.js";
import { initShaders } from "../lib/cuon-utils.js";
import getContext from "./Context.js";
import { Matrix4, Vector3 } from "../lib/cuon-matrix-cse160.js"
import Camera from "./Camera.js";
import { Textures } from "./Textures.js";

// Originally Lab3 Shader code
var VSHADER_SOURCE = `
	uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;

  attribute vec3 aPosition;
  attribute vec2 uv;
	attribute vec4 color;

  varying vec2 vUv;
  varying vec4 vColor;

void main() {
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(aPosition, 1.0);

	vUv = uv;
	vColor = color;
}
`

// Fragment shader program
const FSHADER_SOURCE = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  uniform sampler2D uTexture0;

  varying vec2 vUv;
  varying vec4 vColor;

  void main() {
		vec4 image0 = texture2D(uTexture0, vUv);

		vec3 color = mix(image0.rgb, vColor.rgb, vColor.a);

    gl_FragColor = vec4(color, 1.0);
  }
  `;


/** @type{HTMLCanvasElement} */
let canvas = undefined;
/** @type{WebGLRenderingContext} */
let gl = undefined;

/** @type{WebGLBuffer} */
let vertexBuffer = undefined;

let camera = new Camera();

/** @type{Textures} */
let textures = undefined;

function setupWebGL() {
	// Retrieve <canvas> element
	canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	gl = getContext(canvas);
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}
	gl.enable(gl.DEPTH_TEST);

	vertexBuffer = gl.createBuffer();
	if (!vertexBuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
}

let g_mousePos = {
	x: 0,
	y: 0,
}

let g_prevMousePos = {
	x: 0,
	y: 0,
}

function connectVariablesToGLSL() {
	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to intialize shaders.');
		return;
	}
}

function hookupInputs() {
	// Register function (event handler) to be called on a mouse press
	canvas.onmousemove = function(ev) {
		const normal_x = ev.x / canvas.width - 0.5;
		const normal_y = ev.y / canvas.height - 0.5;
		if (ev.buttons == 1) {
			g_mousePos.x += g_prevMousePos.x - normal_x;
			g_mousePos.y += g_prevMousePos.y - normal_y;
		}
		g_prevMousePos.x = normal_x;
		g_prevMousePos.y = normal_y;
	};

	canvas.onclick = function(ev) {
		if (ev.shiftKey) {
			g_poke.angle = 0;
			g_poke.animation = true;
		}
	}

	window.onkeydown = (ev) => {
		console.log("Got key down", ev.key)
		switch (ev.key) {
			case "w":
				camera.moveForward();
				break;
			case "a":
				camera.moveLeft();
				break;
			case "s":
				camera.moveBackwards();
				break;
			case "d":
				camera.moveRight();
				break;
			case "q":
				camera.panLeft();
				break;
			case "e":
				camera.panRight();
				break;
		}
		camera.calculateViewProjection();
	}
}

function genMap() {
	for (let i = 0; i < 32; i++) {
		map.push([]);
		for (let j = 0; j < 32; j++) {
			map[i][j] = Math.floor(Math.random() * 10);
		}
	}
}

function genWorld() {
	for (let i = 0; i < 32; i++) {
		for (let j = 0; j < 32; j++) {
			for (let h = 0; h < map[i][j]; h++) {
				let c = new Cube();
				c.translate(new Vector3([i, h, j]));
				cubes.push(c);
			}
		}
	}

	let floor = new Cube();
	floor.scale = new Vector3([1000.0, 1.0, 1000.0]);
	floor.translate(new Vector3([-500.0, -1.0, -500.0]));
	floor.setColor(0.0, 1.0, 0.0);
	staticCubes.push(floor);

	let sky = new Cube();
	sky.scale = new Vector3([1000.0, 1000.0, 1000.0]);
	sky.translate(new Vector3([-500.0, -500.0, -500.0]));
	sky.setColor(0.0, 1.0, 1.0);
	staticCubes.push(sky);
}

export function main() {
	console.log("running main");

	setupWebGL();

	connectVariablesToGLSL();

	hookupInputs();

	textures = new Textures(gl);

	textures.loadAtlast(gl, "../assets/textures/atlas.png");

	// Specify the color for clearing <canvas>
	gl.clearColor(1.0, 0.0, 0.0, 1.0);

	gl.clear(gl.COLOR_BUFFER_BIT);

	genMap();

	genWorld();

	// Clear <canvas>
	requestAnimationFrame(tick);
}

let g_startTime = performance.now() / 1000.0;
let g_seconds = performance.now() / 1000.0 - g_startTime;
let g_lastSeconds = g_seconds;

function tick() {
	g_lastSeconds = g_seconds;
	g_seconds = performance.now() / 1000.0 - g_startTime;
	var startTime = performance.now();

	updateAnimationAnlges();

	renderAllShapes();

	requestAnimationFrame(tick);
	let duration = performance.now() - startTime;
	sendTextToHtml(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000 / duration), "numdot");
}

function updateAnimationAnlges() {
}

let map = [];

/**
	* @type {Cube[]}
	*/
let cubes = [];

/**
	* @type {Cube[]}
	*/
let staticCubes = [];

function renderAllShapes() {

	gl.clear(gl.COLOR_BUFFER_BIT);

	for (let i = 0; i < cubes.length; i++) {
		cubes[i].setUvs(1, textures.numtextures);
		cubes[i].render(gl, camera);
	}

	for (let i = 0; i < staticCubes.length; i++) {
		staticCubes[i].setUvs(1, textures.numtextures);
		staticCubes[i].render(gl, camera);
	}

}

function sendTextToHtml(text, htmlID) {
	var htmlElm = document.getElementById(htmlID);
	if (!htmlElm) {
		console.log("Failed to get " + htmlID + " from HTML");
		return;
	}
	htmlElm.innerHTML = text;
}

main();
