// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
	'attribute vec4 a_Position;\n' +
	'uniform mat4 u_ModelMatrix;\n' +
	'uniform mat4 u_GlobalRotateMatrix;\n' +
	'void main() {\n' +
	'  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
	'}\n';

// Fragment shader program
var FSHADER_SOURCE =
	'precision mediump float;\n' +
	'uniform vec4 u_FragColor;\n' +
	'void main() {\n' +
	'  gl_FragColor = u_FragColor;\n' +
	'}\n';

/** @type{HTMLCanvasElement} */
let canvas = undefined;
/** @type{WebGLRenderingContext} */
let gl = undefined;

/** @type{WebGLBuffer} */
let vertexBuffer = undefined;

function setupWebGL() {
	// Retrieve <canvas> element
	canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	gl = getWebGLContext(canvas);
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

/** @type{number} */
let a_Position = undefined;

/** @type{number} */
let a_PointSize = undefined;

/** @type{WebGLUniformLocation} */
let u_FragColor = null;

/** @type{WebGLUniformLocation} */
let u_ModelMatrix = null;

/** @type{WebGLUniformLocation} */
let u_GlobalRotateMatrix = null;

/** @type{number} */
let g_yellowAngle = 0;

/** @type{boolean} */
let g_yellowAnimation = false;

/** @type{number} */
let g_magentaAngle = 0;

/** @type{boolean} */
let g_magentaAnimation = false;

let g_legs = {
	animation: false,
	angle: 0,
};

let g_legsX = {
	animation: false,
	angle: 0,
};

let g_lowerLegs = {
	animation: false,
	angle: 0,
};

let g_wave = {
	animation: false,
	angle: 0,
};

let g_poke = {
	animation: false,
	angle: 0,
};

let g_bodyZ = 0;

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

	u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
	if (!u_ModelMatrix) {
		console.log('Failed to get the storage location of u_ModelMatrix');
		return;
	}

	var identityM = new Matrix4();
	gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);


	u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
	if (!u_GlobalRotateMatrix) {
		console.log('Failed to get the storage location of u_GlobalRotateMatrix');
		return;
	}

	identityM = new Matrix4();
	gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identityM.elements);
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

	function hookUpAnimation(name, gVar) {
		document.getElementById(name + "AnimationOnButton").onclick = () => {
			gVar.animation = true;
		}

		document.getElementById(name + "AnimationOffButton").onclick = () => {
			gVar.animation = false;
		}

		document.getElementById(name + "Slide").addEventListener('mousemove', (e) => {
			gVar.angle = e.target.value;
		})
	}

	hookUpAnimation("legs", g_legs);
	hookUpAnimation("legsX", g_legsX);
	hookUpAnimation("lowerLegs", g_lowerLegs);
	hookUpAnimation("wave", g_wave);

	document.getElementById("bodyZSlide").addEventListener('mousemove', (e) => {
		g_bodyZ = e.target.value;
		document.getElementById("bodyZVal").innerText = g_bodyZ;
	});

	document.getElementById("animationYellowOnButton").onclick = () => {
		g_yellowAnimation = true;
	}

	document.getElementById("animationYellowOffButton").onclick = () => {
		g_yellowAnimation = false;
	}

	document.getElementById("yellowSlide").addEventListener('mousemove', (e) => {
		g_yellowAngle = e.target.value;
	})

	document.getElementById("animationMagentaOnButton").onclick = () => {
		g_magentaAnimation = true;
	}

	document.getElementById("animationMagentaOffButton").onclick = () => {
		g_magentaAnimation = false;
	}


	document.getElementById("magentaSlide").addEventListener('mousemove', (e) => {
		g_magentaAngle = e.target.value;
	})
}

function main() {
	setupWebGL();

	connectVariablesToGLSL();

	initVertexBuffers();

	hookupInputs();

	// Specify the color for clearing <canvas>
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// Clear <canvas>
	requestAnimationFrame(tick);
}

let g_startTime = performance.now() / 1000.0;
let g_seconds = performance.now() / 1000.0 - g_startTime;
let g_lastSeconds = g_seconds;

function tick() {
	g_lastSeconds = g_seconds;
	g_seconds = performance.now() / 1000.0 - g_startTime;

	updateAnimationAnlges();

	renderAllShapes();

	requestAnimationFrame(tick);
}

let selColor = {
	r: 1.0,
	g: 1.0,
	b: 1.0,
};

let shape_size = 10.0;
let selShape = 'point';

function updateAnimationAnlges() {
	if (g_yellowAnimation) {
		g_yellowAngle = (45 * Math.sin(g_seconds));
	}

	if (g_magentaAnimation) {
		g_magentaAngle = (45 * Math.sin(3 * g_seconds));
	}

	if (g_poke.animation) {
		g_poke.angle += g_seconds - g_lastSeconds;

		if (g_poke.angle >= 10.0) {
			g_poke.animation = false;
			g_poke.angle = 0;
		}
	}

	if (g_wave.animation) {
		g_wave.angle = g_seconds;
	}
}

function renderAllShapes() {
	var startTime = performance.now();

	let globalRotMat = new Matrix4()
		.translate(0, -0.5, 0)
		.rotate(g_mousePos.x * 360, 0, 1, 0)
		.rotate(g_mousePos.y * 360, 1, 0, 0)
		.scale(0.25, 0.25, 0.25);
	gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

	gl.clear(gl.COLOR_BUFFER_BIT);

	let body = new Cube();
	body.color = [1.0, 0.0, 0.0, 1.0];
	if (!g_poke.animation) {
		body.matrix.rotate(Math.sin(g_wave.angle) * 10, 1, 0, 0);
	} else {
		body.matrix.translate(0.0, -Math.pow(g_poke.angle, 2), Math.pow(g_poke.angle, 2));
		body.matrix.rotate(Math.sin(g_poke.angle) * 90, 1, 0, 0);
	}
	body.matrix.translate(-0.2, -0.1, -0.25 / 2);
	body.matrix.translate(0, 1, 0);
	let bodyCoordinate = new Matrix4(body.matrix);
	body.matrix.scale(0.5, 0.8, 0.25);
	body.render();

	let head = new Cube();
	head.matrix = new Matrix4(bodyCoordinate);
	head.matrix.translate(0.5 / 2 - 0.3 / 2, 0.8, -0.11);
	head.matrix.rotate(Math.sin(g_wave.angle) * 20, 0, 1, 0);
	head.matrix.scale(0.3, 0.3, 0.3);
	head.render();

	let leftArm = new Cube();
	leftArm.color = [1, 1, 0, 1];
	leftArm.matrix = new Matrix4(bodyCoordinate);
	leftArm.matrix.translate(0.5, .8 - 0.25 / 2, 0.25 / 2);
	leftArm.matrix.rotate(180, 0, 1, 0);
	leftArm.matrix.rotate(g_wave.angle * 90, 1, 0, 0);
	leftArm.matrix.rotate(-g_yellowAngle - 180, 0, 0, 1);
	leftArm.matrix.translate(0, -0.25 / 2, -0.25 / 2);
	let yellowCoordinate = new Matrix4(leftArm.matrix);
	leftArm.matrix.scale(0.25, 0.4, 0.25);
	leftArm.render();

	let leftBox = new Cube();
	leftBox.color = [1, 0, 1, 1];
	leftBox.matrix = new Matrix4(yellowCoordinate);
	leftBox.matrix.rotate(180, 0, 1, 0);
	leftBox.matrix.translate(-0.25, .4, -0.25);
	leftBox.matrix.rotate(-g_magentaAngle, 1, 0, 0);
	leftBox.matrix.scale(0.25, 0.4, 0.25);
	leftBox.render();

	let rightArm = new Cube();
	rightArm.color = [0, 1, 0, 1];
	rightArm.matrix = new Matrix4(bodyCoordinate);
	rightArm.matrix.translate(0, .8 - 0.25 / 2, 0.25 / 2);
	rightArm.matrix.rotate(g_wave.angle * 90, 1, 0, 0);
	rightArm.matrix.rotate(-g_yellowAngle - 180, 0, 0, 1);
	rightArm.matrix.translate(0, -0.25 / 2, -0.25 / 2);
	let rightYellowCoordinate = new Matrix4(rightArm.matrix);
	rightArm.matrix.scale(0.25, 0.4, 0.25);
	rightArm.matrix.translate(0, 0, 0);
	rightArm.render();

	let rightBox = new Cube();
	rightBox.color = [0, 0, 1, 1];
	rightBox.matrix = rightYellowCoordinate;
	rightBox.matrix.translate(0, .4, 0);
	rightBox.matrix.rotate(-g_magentaAngle, 1, 0, 0);
	rightBox.matrix.scale(0.25, 0.4, 0.25);
	rightBox.render();

	let rightLeg = new Cube();
	rightLeg.color = [1, 1, 0, 1];
	rightLeg.matrix = new Matrix4(bodyCoordinate);
	rightLeg.matrix.translate(0, 0, 0.25);
	rightLeg.matrix.rotate(180, 0, 1, 0);
	rightLeg.matrix.rotate(g_legsX.angle, 1, 0, 0);
	rightLeg.matrix.rotate(g_legs.angle - 180, 0, 0, 1);
	let rightLegCoordinate = new Matrix4(rightLeg.matrix);
	rightLeg.matrix.scale(0.25, 0.4, 0.25);
	rightLeg.render();

	let rightLowerLeg = new Cube();
	rightLowerLeg.color = [1, 0, 1, 1];
	rightLowerLeg.matrix = new Matrix4(rightLegCoordinate);
	rightLowerLeg.matrix.translate(0.0, .4, 0.0);
	rightLowerLeg.matrix.rotate(-g_lowerLegs.angle, 1, 0, 0);
	rightLowerLeg.matrix.scale(0.25, 0.4, 0.25);
	rightLowerLeg.render();

	let leftLeg = new Cube();
	leftLeg.color = [1, 1, 0, 1];
	leftLeg.matrix = new Matrix4(bodyCoordinate);
	leftLeg.matrix.translate(0.5, 0, 0.0);
	leftLeg.matrix.rotate(g_legsX.angle, 1, 0, 0);
	leftLeg.matrix.rotate(g_legs.angle - 180, 0, 0, 1);
	let leftLegCoordinate = new Matrix4(leftLeg.matrix);
	leftLeg.matrix.scale(0.25, 0.4, 0.25);
	leftLeg.render();

	let leftLowerLeg = new Cube();
	leftLowerLeg.color = [1, 0, 1, 1];
	leftLowerLeg.matrix = new Matrix4(leftLegCoordinate);
	leftLowerLeg.matrix.rotate(180, 0, 1, 0);
	leftLowerLeg.matrix.translate(-0.25, .4, -0.25);
	leftLowerLeg.matrix.rotate(-g_lowerLegs.angle, 1, 0, 0);
	leftLowerLeg.matrix.scale(0.25, 0.4, 0.25);
	leftLowerLeg.render();

	let cyl = new Cylinder();
	cyl.matrix.translate(-1, 0, 0);
	cyl.matrix.rotate(90, 0, 1, 0);
	cyl.matrix.scale(0.1, 0.1, 1);
	cyl.render();

	let block = new Cube();
	block.matrix.translate(-2, -0.5, -0.5);
	block.render();

	let block2 = new Cube();
	block2.matrix.translate(1, -0.5, -0.5);
	block2.render();

	var duration = performance.now() - startTime;
	sendTextToHtml(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000 / duration), "numdot");
}

function sendTextToHtml(text, htmlID) {
	var htmlElm = document.getElementById(htmlID);
	if (!htmlElm) {
		console.log("Failed to get " + htmlID + " from HTML");
		return;
	}
	htmlElm.innerHTML = text;
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

/**
	* @function
	* @param {float[]} vertices 
	*/
function drawTriangle3D(vertices) {
	// Write date into the buffer object
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

	// Assign the buffer object to a_Position variable
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

	// Enable the assignment to a_Position variable
	gl.enableVertexAttribArray(a_Position);

	gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
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


