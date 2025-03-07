import { Vector3, Matrix4 } from "../../lib/cuon-matrix-cse160";
import { createProgram } from "../../lib/cuon-utils";

export default class Plane {
	constructor(widthSegments = 1, heightSegments = 1) {
		// buffers
		this.vertexBuffer = null;
		this.indexBuffer = null;
		this.uvBuffer = null;
		this.normalBuffer = null;

		// shader programs
		this.vertexShader = null; // ADD THESE
		this.fragmentShader = null;
		this.program = null;

		// data arrays
		this.vertices = null;
		this.indices = null;
		this.uvs = null;
		this.normals = null;

		// transformations
		this.position = new Vector3([0, 0, 0]);
		this.rotation = new Vector3([0, 0, 0]);
		this.scale = new Vector3([1, 1, 1]);
		this.modelMatrix = new Matrix4();
		this.normalMatrix = new Matrix4();

		this.generatePlane(widthSegments, heightSegments);
	}

	generatePlane(widthSegments, heightSegments) {
		const seg_width = 1.0 / widthSegments;
		const seg_height = 1.0 / widthSegments;

		const vertices = [];
		const indices = [];
		const uvs = [];
		const normals = [];

		/**
		 * generate widthSegments by heightSegments grid of vertices centered on origin
		 * generate uv's and normals along the way
		 * */
		for (let i = 0; i < heightSegments + 1; i++) {
			const y = i * seg_height - 0.5;

			for (let j = 0; j < widthSegments + 1; j++) {
				let x = j * seg_width - 0.5;

				vertices.push(x, -y, 0);

				// facing towards camera at first
				normals.push(0, 0, 1);

				uvs.push(j / widthSegments);
				uvs.push(1 - i / heightSegments);
			}

			for (let i = 0; i < heightSegments; i++) {
				for (let j = 0; j < widthSegments; j++) {
					let a = j + (widthSegments + 1) * i;
					let b = j + (widthSegments + 1) * (i + 1);
					let c = j + 1 + (widthSegments + 1) * (i + 1);
					let d = j + 1 + (widthSegments + 1) * i;

					// this indices compose the two triangles that create the square
					// on the grid at [i,j]
					indices.push(a, b, d);
					indices.push(b, c, d);
				}
			}

			this.vertices = new Float32Array(vertices);
			this.indices = new Uint16Array(indices);
			this.uvs = new Float32Array(uvs);
			this.normals = new Float32Array(normals);
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

		this.normalMatrix.set(this.modelMatrix).invert().transpose();
	}

	/**
		* @function
		* @param {WebGLRenderingContext} gl
		*/
	render(gl, camera) {
		if (this.program == null) {
			this.setProgram(gl);
		}

		gl.useProgram(this.program);

		if (this.vertexBuffer === null) this.vertexBuffer = gl.createBuffer();
		if (this.indexBuffer === null) this.indexBuffer = gl.createBuffer();
		if (this.uvBuffer === null) this.uvBuffer = gl.createBuffer();
		if (this.normalBuffer === null) this.normalBuffer = gl.createBuffer();

		this.calculateMatrix();
		camera.calculateViewProjection();

		const uTime = gl.getUniformLocation(this.program, "uTime");
		const position = gl.getAttribLocation(this.program, "position");
		console.assert(position >= 0, "position");
		const normal = gl.getAttribLocation(this.program, "normal");
		const modelMatrix = gl.getUniformLocation(this.program, "modelMatrix");
		const normalMatrix = gl.getUniformLocation(this.program, "normalMatrix");
		const viewMatrix = gl.getUniformLocation(this.program, "viewMatrix");
		const projectionMatrix = gl.getUniformLocation(
			this.program,
			"projectionMatrix"
		);

		gl.uniform1f(uTime, performance.now() / 1000);
		gl.uniformMatrix4fv(modelMatrix, false, this.modelMatrix.elements);
		gl.uniformMatrix4fv(normalMatrix, false, this.normalMatrix.elements);
		gl.uniformMatrix4fv(viewMatrix, false, camera.viewMatrix.elements);
		gl.uniformMatrix4fv(
			projectionMatrix,
			false,
			camera.projectionMatrix.elements
		);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(position);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(normal);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.DYNAMIC_DRAW);

		gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
	}

	/**
		* @function
		* @param {WebGLRenderingContext} gl
		*/
	setProgram(gl) {
		this.vertexShader = `
  precision mediump float;
  attribute vec3 position;
  attribute vec3 normal;
  
  uniform mat4 modelMatrix;
  uniform mat4 normalMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
	uniform float uTime; // ADD THIS
  
  varying vec3 vNormal;
	varying float vWaveHeight; // add this
  
  void main() {
		vec4 transformedPosition = modelMatrix * vec4(position, 1.0);

		float waveZ = transformedPosition.z + uTime * 0.5; // add this
		float waveX = transformedPosition.x - uTime * 0.2; // add this
		float waveIntensity = sin(waveZ) + cos(waveX); // change this

		transformedPosition.y += waveIntensity;

		gl_Position = projectionMatrix * viewMatrix * transformedPosition;
		vNormal = (normalMatrix * vec4(normal, 1.0)).xyz;
		vWaveHeight = (waveIntensity + 2.0) * 0.25; // map from [-2,2] to [0,1]
  }
`;
		this.fragmentShader = `
  precision mediump float;
  varying vec3 vNormal;
	varying float vWaveHeight;

  void main() {
    vec3 norm = normalize(vNormal);

		vec3 color = vec3(0.15, 0.35, 0.75);
		color = mix(color, vec3(1.0), smoothstep(0.35, 1.0, vWaveHeight));
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
		this.program = createProgram(gl, this.vertexShader, this.fragmentShader);
		if (!this.program) console.error("Could not compile shaders for ", this);
	}
}
