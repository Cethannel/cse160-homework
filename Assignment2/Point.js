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

