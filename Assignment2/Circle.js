/**
	* @typedef {Circle} Circle
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

