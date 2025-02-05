/**
	* @typedef {Object} Cylinder
	* @property {float[]} position
	* @property {float[]} color
	* @property {number} size
	* @property {number} segments
	*/

/** @type {Cylinder} */
class Cylinder {
	constructor() {
		this.type = 'triangle';
		this.position = [0.0, 0.0, 0.0];
		this.color = [1.0, 1.0, 1.0, 1.0];
		this.segments = 10;
		this.size = 1;
		this.matrix = new Matrix4();
	}

	render() {
		let xy = this.position;
		let rgba = this.color;
		let size = this.size;

		// Pass the color of a point to u_FragColor variable
		gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

		gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
		// Draw
		drawCircle(xy, this.segments, size);
		gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
		drawConnects(xy, this.segments, size);
		let otherXy = this.position;
		otherXy[2] += 2.0;
		gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
		drawCircle(otherXy, this.segments, size);
	}
}

/**
	* @function
	* @param {float[]} center 
	* @param {number} numtriangles 
	* @param {number} scale 
	*/
function drawCircle(center, numtriangles, scale) {
	const segment = (2 * Math.PI) / numtriangles;

	for (let i = 0; i < numtriangles; i++) {
		let vertices = [];
		vertices = vertices.concat(center);
		vertices = vertices.concat(
			[center[0] + Math.cos(segment * i) * scale, center[1] + Math.sin(segment * i) * scale, center[2]]
		);
		vertices = vertices.concat(
			[center[0] + Math.cos(segment * (i + 1)) * scale, center[1] + Math.sin(segment * (i + 1)) * scale, center[2]]
		);
		drawTriangle3D(vertices);
	}
}

/**
	* @function
	* @param {float[]} center 
	* @param {number} numtriangles 
	* @param {number} scale 
	*/
function drawConnects(center, numtriangles, scale) {
	const segment = (2 * Math.PI) / numtriangles;

	const sideScale = scale * 2;

	let vertices = [];
	for (let i = 0; i < numtriangles; i++) {
		vertices = vertices.concat(
			[
				center[0] + Math.cos(segment * i) * scale,
				center[1] + Math.sin(segment * i) * scale,
				center[2],
			]
		);
		vertices = vertices.concat(
			[
				center[0] + Math.cos(segment * (i + 1)) * scale,
				center[1] + Math.sin(segment * (i + 1)) * scale,
				center[2]
			]
		);
		vertices = vertices.concat(
			[
				center[0] + Math.cos(segment * i) * scale,
				center[1] + Math.sin(segment * i) * scale,
				center[2] + sideScale,
			]
		);

		vertices = vertices.concat(
			[
				center[0] + Math.cos(segment * i) * scale,
				center[1] + Math.sin(segment * i) * scale,
				center[2] + sideScale,
			]
		);
		vertices = vertices.concat(
			[
				center[0] + Math.cos(segment * (i + 1)) * scale,
				center[1] + Math.sin(segment * (i + 1)) * scale,
				center[2] + sideScale,
			]
		);
		vertices = vertices.concat(
			[
				center[0] + Math.cos(segment * (i + 1)) * scale,
				center[1] + Math.sin(segment * (i + 1)) * scale,
				center[2]
			]
		);
	}
	drawTriangle3D(vertices);
}

