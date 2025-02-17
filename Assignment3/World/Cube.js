// Originally from Lab3

import { Matrix4, Vector3 } from "../lib/cuon-matrix-cse160.js";

export default class Cube {
	constructor() {
		this.vertices = null;
		this.uvs = null;
		this.colors = null;
		this.vertexBuffer = null;
		this.uvBuffer = null;
		this.colorBuffer = null;
		this.texture0 = null;
		this.texture1 = null;

		this.position = new Vector3([0, 0, 0]);
		this.rotation = new Vector3([0, 0, 0]);
		this.scale = new Vector3([1, 1, 1]);
		this.modelMatrix = new Matrix4();

		this.setVertices();
		this.setUvs();
		this.setColors();
	}

	/**
		* @function
		* @param {WebGLRenderingContext} gl
		* @param {string} imagePath
		* @param {number} index
		*/
	setImage(gl, imagePath, index) {
		if (index === 0) {
			if (this.texture0 == null) {
				this.texture0 = gl.createTexture();
			}

			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

			const uTexture0 = gl.getUniformLocation(gl.program, "uTexture0");
			if (uTexture0 < 0) {
				console.warn("could not get uniform location");
			}

			const img = new Image();

			img.onload = () => {
				gl.activeTexture(gl.TEXTURE0);

				gl.bindTexture(gl.TEXTURE_2D, this.texture0);

				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

				gl.uniform1i(uTexture0, 0);
			};

			img.crossOrigin = "anonymous";
			img.src = imagePath;
		} else if (index === 1) {
			if (this.texture1 == null) {
				this.texture1 = gl.createTexture();
			}

			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

			const uTexture1 = gl.getUniformLocation(gl.program, "uTexture1");
			if (uTexture1 < 0) {
				console.warn("could not get uniform location");
			}

			const img = new Image();

			img.onload = () => {
				gl.activeTexture(gl.TEXTURE1);

				gl.bindTexture(gl.TEXTURE_2D, this.texture1);

				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

				gl.texImage2D(
					gl.TEXTURE_2D,
					0,
					gl.RGBA,
					gl.RGBA,
					gl.UNSIGNED_BYTE,
					img,
				);

				gl.uniform1i(uTexture1, 1);
			};

			img.crossOrigin = "anonymous";
			img.src = imagePath;
		}
	}

	setVertices() {
		// prettier-ignore
		this.vertices = new Float32Array([
			//FRONT
			0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0,
			0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0,
			//LEFT
			0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0,
			0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
			//RIGHT
			1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0,
			1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0,
			//TOP
			0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0,
			0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0,
			//BACK
			1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0,
			0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0,
			//BOTTOM
			0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0
		]);
	}

	/**
		* @function
		* @param {number} textureIndex 
		* @param {number} textureCount 
		*/
	setUvs(textureIndex = 0, textureCount = 1) {
		console.log(`Creating uvs with index: ${textureIndex} and count: ${textureCount}`);
		// prettier-ignore
		this.uvs = new Float32Array([
			// FRONT
			0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1,
			// LEFT
			0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1,
			// RIGHT
			0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1,
			// TOP
			1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0,
			// BACK
			0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0,
			// BOTTOM
			0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1,
		]);
		const offset = textureIndex / textureCount;

		for (let i = 1; i < this.uvs.length; i += 2) {
			this.uvs[i] = this.uvs[i] / textureCount + offset;
		}
	}

	setColors() {
		// prettier-ignore
		this.colors = new Float32Array(36 * 4);
		for (let i = 0; i < 36 * 4; i += 4) {
			this.colors[i] = 1.0;
			this.colors[i + 1] = 0.0;
			this.colors[i + 2] = 0.0;
			this.colors[i + 3] = 0.0;
		}
	}

	calculateMatrix() {
		let [x, y, z] = this.position.elements;
		let [rx, ry, rz] = this.rotation.elements;
		let [sx, sy, sz] = this.scale.elements;

		this.modelMatrix
			.setTranslate(x, y, z)
			.rotate(rx, 1, 0, 0)
			.rotate(ry, 0, 1, 0)
			.rotate(rz, 0, 0, 1)
			.scale(sx, sy, sz);
	}

	render(gl, camera) {
		this.calculateMatrix();

		const aPosition = gl.getAttribLocation(gl.program, "aPosition");
		const uv = gl.getAttribLocation(gl.program, "uv");
		const color = gl.getAttribLocation(gl.program, "color");
		const modelMatrix = gl.getUniformLocation(gl.program, "modelMatrix");
		const viewMatrix = gl.getUniformLocation(gl.program, "viewMatrix");
		const projectionMatrix = gl.getUniformLocation(
			gl.program,
			"projectionMatrix"
		);

		gl.uniformMatrix4fv(modelMatrix, false, this.modelMatrix.elements);
		gl.uniformMatrix4fv(viewMatrix, false, camera.viewMatrix.elements);
		gl.uniformMatrix4fv(
			projectionMatrix,
			false,
			camera.projectionMatrix.elements
		);

		if (this.vertexBuffer === null) {
			this.vertexBuffer = gl.createBuffer();
			if (!this.vertexBuffer) {
				console.log("Failed to create the buffer object");
				return -1;
			}
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(aPosition);

		if (this.uvBuffer === null) {
			this.uvBuffer = gl.createBuffer();
			if (!this.uvBuffer) {
				console.log("Failed to create the buffer object");
				return -1;
			}
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(uv);

		if (this.colorBuffer === null) {
			this.colorBuffer = gl.createBuffer();
			if (!this.colorBuffer) {
				console.log("Failed to create the buffer object");
				return -1;
			}
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(color);

		gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
	}

	/**
		* @param {Vector3} translation 
		*/
	translate(translation) {
		this.position.add(translation)
	}

	setColor(r, g, b) {
		this.colors = new Float32Array(36 * 4);
		for (let i = 0; i < 36 * 4; i += 4) {
			this.colors[i] = r;
			this.colors[i + 1] = g;
			this.colors[i + 2] = b;
			this.colors[i + 3] = 1.0;
		}
		console.log(this.colors)
	}
}
