import Cube from "./Cube.js";
import Sphere from "./Sphere.js";
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
	//uniform vec3 uLightPos;

  attribute vec4 aPosition;
  attribute vec2 uv;
	attribute vec4 color;
	attribute vec3 normal;

  varying vec2 vUv;
  varying vec4 vColor;
  varying vec3 vNormal;
  varying vec4 vVertPos;

	void main() {
		gl_Position = projectionMatrix * viewMatrix * modelMatrix * aPosition;

		vUv = uv;
		vColor = color;
		vNormal = normal;
		vVertPos = modelMatrix * aPosition;
	}
`

// Fragment shader program
const FSHADER_SOURCE = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  uniform sampler2D uTexture0;
	uniform int normalRender;
	uniform vec3 uLightPos;
	uniform vec3 uCameraPos;
	uniform bool uEnableSpecular;
	uniform bool uLightOn;

  varying vec2 vUv;
  varying vec4 vColor;
  varying vec3 vNormal;
  varying vec4 vVertPos;

  void main() {
		vec4 image0 = texture2D(uTexture0, vUv);

		vec3 color = mix(image0.rgb, vColor.rgb, vColor.a);

    gl_FragColor = vec4(color, 1.0);

		vec3 lightVector =uLightPos - vec3(vVertPos) ; 
		float r = length(lightVector);

		if (normalRender == 1) {
			gl_FragColor = vec4(vNormal, 1.0);
		}

		//gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1.0);
		vec3 L = normalize(lightVector);
		vec3 N = normalize(vNormal);
		float nDotL = max(dot(N, L), 0.0);

		vec3 R = reflect(-L, N);

		vec3 E = normalize(uCameraPos - vec3(vVertPos));

		float specular = pow(max(dot(E,R), 0.0), 20.0) ;

		vec3 diffuse = vec3(gl_FragColor) * nDotL;
		vec3 ambient = vec3(gl_FragColor) * 0.3;
		if (uLightOn) {
			if (uEnableSpecular) {
				gl_FragColor = vec4(diffuse + ambient + specular, 1.0);
			} else {
				gl_FragColor = vec4(diffuse + ambient, 1.0);
			}
		}
  }
  `;

/** @type{HTMLCanvasElement} */
let canvas = undefined;
/** @type{WebGLRenderingContext} */
let gl = undefined;

/** @type{WebGLBuffer} */
let vertexBuffer = undefined;

let camera = new Camera([5.0, 2.0, 5.0], [5.0, 2.0, 0.0]);

/** @type{Textures} */
let textures = undefined;

let normalRender = false;

let sphere = new Sphere();
sphere.position = new Vector3([2.0, 1.0, 2.0]);

let lightPos = new Vector3([0.0, 10.0, 0.0]);
let lightCube = new Cube();
lightCube.position = lightPos;
lightCube.scale = new Vector3([0.1, 0.1, 0.1]);
lightCube.setColor(1.0, 1.0, 1.0);

let lightOn = true;

function setupWebGL() {
	// Retrieve <canvas> element
	canvas = document.getElementById('webgl');

	canvas.onresize = (ev) => {
		camera.setAspect(ev.target)
		camera.calculateViewProjection();
	}
	camera.setAspect(canvas);
	camera.calculateViewProjection();

	// Get the rendering context for WebGL
	gl = getContext(canvas);
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}
	gl.enable(gl.DEPTH_TEST);

	const ext = gl.getExtension("OES_element_index_uint");

	vertexBuffer = gl.createBuffer();
	if (!vertexBuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
}

function connectVariablesToGLSL() {
	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to intialize shaders.');
		return;
	}
}

let pointerLocked = false;

let sensitivity = 10;

let moveDirs = {
	x: 0,
	y: 0,
	z: 0,
}

let selectedBlockID = 0;

function hookupInputs() {
	// Register function (event handler) to be called on a mouse press
	canvas.onmousemove = function(ev) {
		if (pointerLocked) {
			camera.panAngle(ev.movementX / canvas.width * -360 * sensitivity)
		}
	};

	canvas.onmousedown = function(ev) {
		if (pointerLocked) {
			const pos = camera.at.floor();
			console.log("Button: ", ev.button)
			switch (ev.button) {
				case 0:
					cubes = cubes.filter((block) => !block.position.equal(pos));
					break;
				case 2:
					console.log("Adding block ");
					let c = new Cube();
					c.setUvs(selectedBlockID, textures.numtextures)
					c.translate(pos);
					cubes.push(c);
					break;
			}
		} else {
			canvas.requestPointerLock({
				unadjustedMovement: true,
			});
		}
	}

	let lightPositions = ["X", "Y", "Z"];

	for (let i = 0; i < lightPositions.length; i++) {
		const pos = lightPositions[i];
		const index = i;
		let elem = document.getElementById("light" + pos);
		lightPos.elements[index] = elem.value;
		elem.onchange = async (ev) => {
			lightPos.elements[index] = ev.target.value;
		};
	}

	document.getElementById("lightEnable").onclick = (ev) => {
		console.log(ev.target.value);
		lightOn = ev.target.checked;
	};

	document.addEventListener("pointerlockchange", () => {
		if (document.pointerLockElement === canvas) {
			console.log("The pointer lock status is now locked");
			pointerLocked = true;
		} else {
			console.log("The pointer lock status is now unlocked");
			pointerLocked = false;
		}
	}, false);

	window.onkeyup = async (ev) => {
		switch (ev.key) {
			case "w":
				moveDirs.x = 0;
				break;
			case "a":
				moveDirs.z = 0;
				break;
			case "s":
				moveDirs.x = 0;
				break;
			case "d":
				moveDirs.z = 0;
				break;
			case " ":
				moveDirs.y = 0;
				break;
			case "Shift":
				moveDirs.y = 0;
				break;
		}
	}

	/**
		* @param {KeyboardEvent} ev
		*/
	window.onkeydown = async (ev) => {
		if (ev.key > "0" && ev.key < "9") {
			selectedBlockID = ev.key[0] - '0' - 1;
			for (let i = 0; i < 9; i++) {
				let hotbarItem = document.getElementById("hotbar" + i);
				if (hotbarItem == null) continue;

				hotbarItem.style.borderStyle = "none";
			}
			let hotbarItem = document.getElementById("hotbar" + selectedBlockID);
			if (hotbarItem == null) return;

			hotbarItem.style.borderStyle = "solid";
		}
		console.log("Key:", ev.key);
		switch (ev.key) {
			case "w":
				moveDirs.x = + 1;
				break;
			case "a":
				moveDirs.z = - 1;
				break;
			case "s":
				moveDirs.x = - 1;
				break;
			case "d":
				moveDirs.z = + 1;
				break;
			case "q":
				camera.panLeft();
				break;
			case "e":
				camera.panRight();
				break;
			case " ":
				moveDirs.y = 1;
				break;
			case "Shift":
				moveDirs.y = -1;
				break;
			case "n":
				normalRender = !normalRender;
				break;
		}
	}
}

function genMap() {
	for (let i = 0; i < 32; i++) {
		map.push([]);
		for (let j = 0; j < 32; j++) {
			if ((i == 0 || i == 8 || j == 0 || j == 8) && (i <= 8 && j <= 8)) {
				map[i][j] = 4;
			}
		}
	}
}

function genWorld() {
	for (let i = 0; i < 32; i++) {
		for (let j = 0; j < 32; j++) {
			for (let h = 0; h < map[i][j]; h++) {
				let c = new Cube();
				c.enableSpecular = false;
				c.translate(new Vector3([i, h, j]));
				c.setUvs(0, textures.numtextures);
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

async function main() {
	console.log("running main");

	setupWebGL();

	connectVariablesToGLSL();

	hookupInputs();

	textures = new Textures(gl);

	await textures.loadAtlast(gl, "../assets/textures/atlas.png");

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

let g_lastTime = performance.now();

function tick() {
	let now = performance.now();
	let dt = now - g_lastTime;
	g_lastTime = now;
	camera.calculateViewProjection();
	g_lastSeconds = g_seconds;
	g_seconds = performance.now() / 1000.0 - g_startTime;
	var startTime = performance.now();

	const normalRenderIndex = gl.getUniformLocation(gl.program, "normalRender")
	if (normalRenderIndex != -1) {
		gl.uniform1i(normalRenderIndex, normalRender ? 1 : 0);
	} else {
		console.error("Could not find normalRender")
	}

	if (moveDirs.x > 0) {
		camera.moveForward(dt);
	} else if (moveDirs.x < 0) {
		camera.moveBackwards(dt);
	}

	if (moveDirs.z > 0) {
		camera.moveRight(dt);
	} else if (moveDirs.z < 0) {
		camera.moveLeft(dt);
	}


	if (moveDirs.y > 0) {
		camera.moveUp(dt);
	} else if (moveDirs.y < 0) {
		camera.moveDown(dt);
	}

	updateAnimationAnlges();

	lightCube.position = lightPos;

	const uLightPos = gl.getUniformLocation(gl.program, "uLightPos")
	if (uLightPos != -1) {
		gl.uniform3f(uLightPos, ...lightPos.elements);
	} else {
		console.error("Could not find lightPos")
	}

	const uLightOn = gl.getUniformLocation(gl.program, "uLightOn")
	if (uLightOn != -1) {
		gl.uniform1i(uLightOn, lightOn);
	} else {
		console.error("Could not find lightOn")
	}

	const uCameraPos = gl.getUniformLocation(gl.program, "uCameraPos")
	if (uCameraPos != -1) {
		gl.uniform3f(uCameraPos, ...camera.eye.elements);
	} else {
		console.error("Could not find CameraPos")
	}

	renderAllShapes();

	requestAnimationFrame(tick);
	let duration = performance.now() - startTime;
	sendTextToHtml(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000 / duration), "numdot");
}

function updateAnimationAnlges() {
	lightPos.elements[0] = (Math.cos(g_seconds) + 1.0) * 3 + 1.5;
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
		cubes[i].render(gl, camera);
	}

	for (let i = 0; i < staticCubes.length; i++) {
		staticCubes[i].render(gl, camera);
	}

	sphere.render(gl, camera);
	lightCube.render(gl, camera);
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
