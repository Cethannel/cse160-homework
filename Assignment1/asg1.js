// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
	'attribute vec4 a_Position;\n' +
	'attribute float a_PointSize;\n' +
	'void main() {\n' +
	'  gl_Position = a_Position;\n' +
	'  gl_PointSize = a_PointSize;\n' +
	'}\n';

// Fragment shader program
var FSHADER_SOURCE =
	'precision mediump float;\n' +
	'uniform vec4 u_FragColor;\n' +  // uniform変数
	'void main() {\n' +
	'  gl_FragColor = u_FragColor;\n' +
	'}\n';

/** @type{HTMLCanvasElement} */
let canvas = undefined;
/** @type{WebGLRenderingContext} */
let gl = undefined;

function setupWebGL() {
	// Retrieve <canvas> element
	canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	gl = getWebGLContext(canvas);
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}
}

/** @type{number} */
let a_Position = undefined;

/** @type{number} */
let a_PointSize = undefined;

/** @type{WebGLUniformLocation} */
let u_FragColor = null;

function connectVariablesToGLSL() {
	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to intialize shaders.');
		return;
	}

	// // Get the storage location of a_Position
	a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if (a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return;
	}

	// // Get the storage location of a_PointSize
	a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
	if (a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return;
	}

	// Get the storage location of u_FragColor
	u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
	if (!u_FragColor) {
		console.log('Failed to get the storage location of u_FragColor');
		return;
	}

}

function hookupInputs() {
	// Register function (event handler) to be called on a mouse press
	canvas.onmousedown = function(ev) {
		mouseDown = true;
		click(ev);
	};
	canvas.onmousemove = function(ev) {
		if (ev.buttons == 1) {
			click(ev);
		}
	};

	const colors = ["r", "g", "b"];

	for (let i = 0; i < colors.length; i++) {
		const id = "color-" + colors[i];

		/** @type{HTMLInputElement} */
		const input = document.getElementById(id);
		selColor[colors[i]] = input.value;
		const color = colors[i];
		input.onchange = (e) => {
			setColor(e, color);
		}
	}

	const colorSet =
		`rgb(${selColor.r * 256}, ${selColor.g * 256}, ${selColor.b * 256})`;

	document.getElementById("colorDisplay").style.backgroundColor = colorSet;

	document.getElementById("sizeSel").onchange = sizeCallback;
	document.getElementById("sizeSel").setAttribute("value", 10);

	document.getElementById("clearButton").onclick = () => {
		shapesList = [];
		renderAllShapes();
	};

	document.getElementById("pointButton").onclick = () => { selShape = 'point' };
	document.getElementById("triangleButton").onclick = () => { selShape = 'triangle' };
	document.getElementById("circleButton").onclick = () => { selShape = 'circle' };
	document.getElementById("picture").onclick = drawPicture;
}

function main() {
	setupWebGL();

	connectVariablesToGLSL();

	initVertexBuffers();

	hookupInputs();

	// Specify the color for clearing <canvas>
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT);
}

let selColor = {
	r: 1.0,
	g: 1.0,
	b: 1.0,
};

let shape_size = 10.0;
let selShape = 'point';

/**
	* @typedef {Object} Point
	* @property {float[]} position
	* @property {float[]} color
	* @property {number} size
	*/

/** @type {Point} */
class Point {
	constructor() {
		this.type = 'point';
		this.position = [0.0, 0.0, 0.0];
		this.color = [1.0, 1.0, 1.0, 1.0];
		this.size = 10.0;
	}

	render() {
		let xy = this.position;
		let rgba = this.color;
		let size = this.size;

		gl.disableVertexAttribArray(a_Position);

		// Pass the position of a point to a_Position variable
		gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
		// Pass the size of a point to a_PointSize variable
		gl.vertexAttrib1f(a_PointSize, size);
		// Pass the color of a point to u_FragColor variable
		gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
		// Draw
		gl.drawArrays(gl.POINTS, 0, 1);
	}
}

/**
	* @typedef {Triangle} Point
	* @property {float[]} position
	* @property {float[]} color
	* @property {number} size
	*/

/** @type {Triangle} */
class Triangle {
	constructor() {
		this.type = 'triangle';
		this.position = [0.0, 0.0, 0.0];
		this.color = [1.0, 1.0, 1.0, 1.0];
		this.size = 10.0;
	}

	render() {
		let xy = this.position;
		let rgba = this.color;
		let size = this.size;

		// Pass the size of a point to a_PointSize variable
		gl.vertexAttrib1f(a_PointSize, size);
		// Pass the color of a point to u_FragColor variable
		gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
		// Draw
		let d = this.size / 200.0;
		drawTriangle([xy[0], xy[1], xy[0] + d, xy[1], xy[0], xy[1] + d]);
	}
}


/**
	* @typedef {Circle} Point
	* @property {float[]} position
	* @property {float[]} color
	* @property {number} size
	* @property {number} segments
	*/

/** @type {Circle} */
class Circle {
	constructor() {
		this.type = 'triangle';
		this.position = [0.0, 0.0, 0.0];
		this.color = [1.0, 1.0, 1.0, 1.0];
		this.size = 10.0;
		this.segments = 10;
	}

	render() {
		let xy = this.position;
		let rgba = this.color;
		let size = this.size;

		// Pass the size of a point to a_PointSize variable
		gl.vertexAttrib1f(a_PointSize, size);
		// Pass the color of a point to u_FragColor variable
		gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
		// Draw
		drawCircle(xy, this.segments, size / 200);
	}
}

/** @type {Point[]} */
let shapesList = [];  // The array for the position of a mouse press
function click(ev) {
	var x = ev.clientX; // x coordinate of a mouse pointer
	var y = ev.clientY; // y coordinate of a mouse pointer
	var rect = ev.target.getBoundingClientRect();

	x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
	y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

	/** @type {Point} */
	let point = undefined;
	switch (selShape) {
		case 'point':
			point = new Point();
			break;
		case 'triangle':
			point = new Triangle();
			break;
		case 'circle':
			point = new Circle();
			break;
	}
	point.position = [x, y, 0];
	point.color = [selColor.r, selColor.g, selColor.b, 1.0];
	point.size = shape_size;

	shapesList.push(point);

	renderAllShapes();
}

function renderAllShapes() {
	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT);

	var len = shapesList.length;
	for (let i = 0; i < len; i++) {
		let point = shapesList[i];
		point.render();
	}
}

/**
	* @param {Event} e 
	*/
function setColor(e, color) {
	console.log(e)
	switch (color) {
		case "r":
			selColor.r = e.target.value;
			break;
		case "g":
			selColor.g = e.target.value;
			break;
		case "b":
			selColor.b = e.target.value;
			break;
	}

	const colorSet =
		`rgb(${selColor.r * 256}, ${selColor.g * 256}, ${selColor.b * 256})`;

	console.log(colorSet);

	document.getElementById("colorDisplay").style.backgroundColor = colorSet;
}

/**
	* @param {Event} e 
	*/
function sizeCallback(e) {
	shape_size = e.target.value;

	document.getElementById("sizeShow").textContent = shape_size;
}

const n = 3; // The number of vertices


/**
	* @function
	* @param {float[]} vertices 
	*/
function drawTriangle(vertices) {
	// Create a buffer object
	let vertexBuffer = gl.createBuffer();
	if (!vertexBuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}

	// Bind the buffer object to target
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	// Write date into the buffer object
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

	// Assign the buffer object to a_Position variable
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

	// Enable the assignment to a_Position variable
	gl.enableVertexAttribArray(a_Position);

	gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);

	gl.deleteBuffer(vertexBuffer);
}

function initVertexBuffers() {
	var vertices = new Float32Array([
		0, 0.5, -0.5, -0.5, 0.5, -0.5
	]);

	// Create a buffer object
	let vertexBuffer = gl.createBuffer();
	if (!vertexBuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}

	// Bind the buffer object to target
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	// Write date into the buffer object
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	// Assign the buffer object to a_Position variable
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

	// Enable the assignment to a_Position variable
	gl.enableVertexAttribArray(a_Position);
}


/**
	* @function
	* @param {float[]} center 
	* @param {number} numtriangles 
	* @param {number} scale 
	*/
function drawCircle(center, numtriangles, scale) {
	console.log("Drawing circle")

	const segment = (2 * Math.PI) / numtriangles;

	for (let i = 0; i < numtriangles; i++) {
		let vertices = [];
		vertices = vertices.concat([center[0], center[1]]);
		vertices = vertices.concat(
			[center[0] + Math.cos(segment * i) * scale, center[1] + Math.sin(segment * i) * scale]
		);
		vertices = vertices.concat(
			[center[0] + Math.cos(segment * (i + 1)) * scale, center[1] + Math.sin(segment * (i + 1)) * scale]
		);
		drawTriangle(vertices);
	}
}

function drawPicture() {
	gl.uniform4f(u_FragColor, 156.3136 / 256, 80 / 256, 27.0336 / 256, 1.0);

	// Front
	let vertices = [];
	const addVertex = (x, y) => {
		const scale = 0.1;
		vertices = vertices.concat([x * scale, y * scale]);
	}

	addVertex(0, 0);
	addVertex(0, -4);
	addVertex(-3, -3);
	addVertex(0, 0);
	addVertex(-3, -3);
	addVertex(-3, 0);

	drawTriangle(vertices);

	vertices = [];

	gl.uniform4f(u_FragColor, 174.592 / 256, 103.7824 / 256, 27.0336 / 256, 1.0);

	addVertex(6, 0);
	addVertex(6, -2);
	addVertex(0, -4);
	addVertex(6, 0);
	addVertex(0, -4);
	addVertex(0, 0);

	drawTriangle(vertices);

	vertices = [];

	gl.uniform4f(u_FragColor, 33.792 / 256, 50.7392 / 256, 56.2944 / 256, 1.0);

	addVertex(-1.5, 1.5);
	addVertex(0, 0);
	addVertex(-3, 0);

	drawTriangle(vertices);

	vertices = [];

	gl.uniform4f(u_FragColor, 136.192 / 256, 32.4608 / 256, 16.0512 / 256, 1.0);

	addVertex(5, 0.5);
	addVertex(6, 0);
	addVertex(0, 0);
	addVertex(5, 0.5);
	addVertex(0, 0);
	addVertex(-1.5, 1.5);

	drawTriangle(vertices);

	vertices = [];

	gl.uniform4f(u_FragColor, 17.3312 / 256, 169.6 / 256, 239.1552 / 256, 1.0);

	addVertex(2, -0.85);
	addVertex(2, -2.2);
	addVertex(1, -2.5);
	addVertex(2, -0.85);
	addVertex(1, -2.5);
	addVertex(1, -1);

	drawTriangle(vertices);

	vertices = [];

	gl.uniform4f(u_FragColor, 17.3312 / 256, 169.6 / 256, 239.1552 / 256, 1.0);

	addVertex(4, -0.6);
	addVertex(4, -1.7);
	addVertex(3, -2);
	addVertex(4, -0.6);
	addVertex(3, -2);
	addVertex(3, -0.7);

	drawTriangle(vertices);
}
