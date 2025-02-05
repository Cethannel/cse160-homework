/**
 * With codesandbox we import our functions from the files they live in
 * rather than import that file in the HTML file like we usually do
 *
 * ALSO NOTE that there is NO main function being called.
 * index.js IS your main function and the code written in it is run
 * on page load.
 */
import "./styles.css";
import { initShaders } from "../lib/cuon-utils";
import { Matrix4, Vector3 } from "../lib/cuon-matrix-cse160";

// HelloCube.js (c) 2012 matsuda
// Vertex shader program
// Vertex shader program
const VSHADER_SOURCE = `
  attribute vec2 aPosition;
  uniform mat4 uModelMatrix;
  void main() {
    gl_Position = uModelMatrix * vec4(aPosition, 0.0, 1.0);
  }
  `;

// Fragment shader program
const FSHADER_SOURCE = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
  `;

// Retrieve <canvas> element
/**
	* @type {HTMLCanvasElement}
	*/
var canvas = document.getElementById("webgl");

// Get the rendering context for WebGL
/**
	* @type {WebGLRenderingContext}
	*/
var gl = canvas.getContext("webgl");
if (!gl) {
	console.log("Failed to get the rendering context for WebGL");
}

// Initialize shaders
if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
	console.log("Failed to intialize shaders.");
}

// Set clear color
gl.clearColor(0.0, 0.0, 0.0, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);

const vertices = new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5]);

const vertexBuffer = gl.createBuffer();
if (!vertexBuffer) {
	console.log("Failed to create the buffer object");
}

gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const aPosPtr = gl.getAttribLocation(gl.program, "aPosition");

if (aPosPtr < 0) {
	console.error("could not find aPostion ptr");
}

gl.vertexAttribPointer(aPosPtr, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aPosPtr);

const M = new Matrix4();

M.setTranslate(-0.5, -0.5, 0);
M.scale(0.35, 0.35, 0.35);
M.rotate(30, 0, 0, 1);

drawSpaceship(gl, M);

M.setTranslate(0.5, -0.25, 0);
M.scale(0.46, 0.46, 0.46);
M.rotate(45, 0, 0, 1);

drawSpaceship(gl, M);

M.setTranslate(-0.15, 0.25, 0);
M.scale(0.75, 0.75, 0.75);
M.rotate(39, 0, 0, 1);

drawSpaceship(gl, M);

/**
	* @function
	* @param {WebGLRenderingContext} gl
	* @param {Matrix4} matrix
	*/
function drawSpaceship(gl, matrix) {
	const uModelMatrixPtr = gl.getUniformLocation(gl.program, "uModelMatrix");

	const M1 = new Matrix4();

	let baseScale = 0.5;

	let baseRotate = 180;

	let scale = 0.7;
	M1.set(matrix);
	M1.translate(0.5, 0.5, 0);
	M1.rotate(baseRotate, 0, 0, 1);
	M1.scale(baseScale * scale, baseScale * scale, baseScale * scale);
	gl.uniformMatrix4fv(uModelMatrixPtr, false, M1.elements);
	gl.drawArrays(gl.TRIANGLES, 0, 3);

	scale = 1.0;
	M1.set(matrix);
	M1.translate(0.32, 0.32, 0);
	M1.rotate(baseRotate + 45, 0, 0, 1);
	M1.scale(baseScale * scale, baseScale * scale, baseScale * scale);
	gl.uniformMatrix4fv(uModelMatrixPtr, false, M1.elements);
	gl.drawArrays(gl.TRIANGLES, 0, 3);

	M1.set(matrix);
	M1.translate(0.32, 0.32, 0);
	M1.rotate(baseRotate + 45 + 180, 0, 0, 1);
	M1.scale(baseScale * scale, baseScale * scale, baseScale * scale);
	gl.uniformMatrix4fv(uModelMatrixPtr, false, M1.elements);
	gl.drawArrays(gl.TRIANGLES, 0, 3);

	scale = 0.5;
	M1.set(matrix);
	M1.translate(0.054, 0.054, 0);
	M1.rotate(baseRotate + 45, 0, 0, 1);
	M1.scale(baseScale * scale, baseScale * scale, baseScale * scale);
	gl.uniformMatrix4fv(uModelMatrixPtr, false, M1.elements);
	gl.drawArrays(gl.TRIANGLES, 0, 3);

	M1.set(matrix);
	M1.translate(0.054, 0.054, 0);
	M1.rotate(baseRotate + 45 + 180, 0, 0, 1);
	M1.scale(baseScale * scale, baseScale * scale, baseScale * scale);
	gl.uniformMatrix4fv(uModelMatrixPtr, false, M1.elements);
	gl.drawArrays(gl.TRIANGLES, 0, 3);

	scale = 0.6;
	M1.set(matrix);
	M1.translate(0.08, -0.10, 0);
	M1.rotate(baseRotate - 90, 0, 0, 1);
	M1.scale(baseScale * scale, baseScale * scale, baseScale * scale);
	gl.uniformMatrix4fv(uModelMatrixPtr, false, M1.elements);
	gl.drawArrays(gl.TRIANGLES, 0, 3);

	M1.set(matrix);
	M1.translate(0.08, -0.405, 0);
	M1.rotate(baseRotate + 90, 0, 0, 1);
	M1.scale(baseScale * scale, baseScale * scale, baseScale * scale);
	gl.uniformMatrix4fv(uModelMatrixPtr, false, M1.elements);
	gl.drawArrays(gl.TRIANGLES, 0, 3);

	scale = 0.6;
	M1.set(matrix);
	M1.translate(-0.10, 0.08, 0);
	M1.rotate(baseRotate + 90, 0, 0, 1);
	M1.scale(baseScale * scale, baseScale * scale, baseScale * scale);
	gl.uniformMatrix4fv(uModelMatrixPtr, false, M1.elements);
	gl.drawArrays(gl.TRIANGLES, 0, 3);

	M1.set(matrix);
	M1.translate(-0.405, 0.08, 0);
	M1.rotate(baseRotate - 90, 0, 0, 1);
	M1.scale(baseScale * scale, baseScale * scale, baseScale * scale);
	gl.uniformMatrix4fv(uModelMatrixPtr, false, M1.elements);
	gl.drawArrays(gl.TRIANGLES, 0, 3);
}
