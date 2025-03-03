// Originally from Lab3

import { Matrix4, Vector3 } from "../lib/cuon-matrix-cse160.js";

export default class Sphere {
	constructor() {
		this.vertices = null;
		this.indices = null;
		this.uvs = null;
		this.colors = null;
		this.normals = null;
		this.vertexBuffer = null;
		this.indexBuffer = null;
		this.uvBuffer = null;
		this.colorBuffer = null;
		this.normalBuffer = null;
		this.texture0 = null;
		this.texture1 = null;
		this.radius = 1;
		this.sectorCount = 180;
		this.stackCount = 180;
		this.enableSpecular = true;

		this.position = new Vector3([0, 5, 0]);
		this.rotation = new Vector3([0, 0, 0]);
		this.scale = new Vector3([1, 1, 1]);
		this.modelMatrix = new Matrix4();

		this.buildVertices();
		this.setColors();
	}

	// Modified version of https://www.songho.ca/opengl/gl_sphere.html
	buildVertices() {
		let vertices = [];
		let indices = [];
		let normals = [];
		let texCoords = [];
		const PI = Math.PI;
		const radius = this.radius;
		const sectorCount = this.sectorCount;
		const stackCount = this.stackCount;

		let x, y, z, xy;                              // vertex position
		let nx, ny, nz, lengthInv = 1.0 / this.radius;    // vertex normal
		let s, t;                                     // vertex texCoord

		let sectorStep = 2 * Math.PI / this.sectorCount;
		let stackStep = Math.PI / this.stackCount;
		let sectorAngle, stackAngle;

		for (let i = 0; i <= this.stackCount; ++i) {
			stackAngle = PI / 2 - i * stackStep;        // starting from pi/2 to -pi/2
			xy = radius * Math.cos(stackAngle);             // r * cos(u)
			z = radius * Math.sin(stackAngle);              // r * sin(u)
			for (let j = 0; j <= this.sectorCount; ++j) {
				sectorAngle = j * sectorStep;           // starting from 0 to 2pi

				// vertex position (x, y, z)
				x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
				y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)

				vertices.push(x);
				vertices.push(y);
				vertices.push(z);

				nx = x * lengthInv;
				ny = y * lengthInv;
				nz = z * lengthInv;
				normals.push(nx);
				normals.push(ny);
				normals.push(nz);

				s = j / sectorCount;
				t = i / stackCount;
				texCoords.push(s);
				texCoords.push(t);
			}
		}

		let k1, k2;
		for (let i = 0; i < stackCount; ++i) {
			k1 = i * (sectorCount + 1);     // beginning of current stack
			k2 = k1 + sectorCount + 1;      // beginning of next stack

			for (let j = 0; j < sectorCount; ++j, ++k1, ++k2) {
				// 2 triangles per sector excluding first and last stacks
				// k1 => k2 => k1+1
				if (i != 0) {
					indices.push(k1);
					indices.push(k2);
					indices.push(k1 + 1);
				}

				// k1+1 => k2 => k2+1
				if (i != (stackCount - 1)) {
					indices.push(k1 + 1);
					indices.push(k2);
					indices.push(k2 + 1);
				}
			}
		}

		this.vertices = new Float32Array(vertices);
		this.indices = new Uint32Array(indices);
		this.normals = new Float32Array(normals);
		this.uvs = new Float32Array(texCoords);
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

	setColors() {
		// prettier-ignore
		this.colors = new Float32Array(this.vertices.length / 3 * 4);
		for (let i = 0; i < this.colors.length; i += 4) {
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

	/**
		* @param {WebGLRenderingContext} gl 
		*/
	render(gl, camera) {
		this.calculateMatrix();

		const aPosition = gl.getAttribLocation(gl.program, "aPosition");
		const uv = gl.getAttribLocation(gl.program, "uv");
		const color = gl.getAttribLocation(gl.program, "color");
		const normal = gl.getAttribLocation(gl.program, "normal");
		const modelMatrix = gl.getUniformLocation(gl.program, "modelMatrix");
		const uSpecular = gl.getUniformLocation(gl.program, "uEnableSpecular");
		const viewMatrix = gl.getUniformLocation(gl.program, "viewMatrix");
		const projectionMatrix = gl.getUniformLocation(
			gl.program,
			"projectionMatrix"
		);

		gl.uniform1i(uSpecular, this.enableSpecular ? 1 : 0);
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

		if (this.indexBuffer === null) {
			this.indexBuffer = gl.createBuffer();
			if (!this.indexBuffer) {
				console.log("Failed to create the buffer object");
				return -1;
			}
		}

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.DYNAMIC_DRAW);

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

		if (this.normalBuffer === null) {
			this.normalBuffer = gl.createBuffer();
			if (!this.normalBuffer) {
				console.log("Failed to create the buffer object");
				return -1;
			}
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(normal);

		gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_INT, 0)
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
