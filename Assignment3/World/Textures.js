/**
	* @param {string} path 
	* @returns {HTMLImageElement}
	*/
export async function loadImage(path) {
	let img = new Image();
	img.src = path;

	await new Promise((resolve) => img.addEventListener("load", resolve));

	return img;
}

export class Textures {
	/**
		* @param {WebGLRenderingContext} gl 
		*/
	constructor(gl) {
		/**
			* @type {WebGLTexture}
			*/
		this.texture0 = gl.createTexture();
		this.atlas = new Image();
		this.numtextures = 1;
	}

	/**
		* @param {WebGLRenderingContext} gl 
		* @param {string} path 
		*/
	loadAtlast(gl, path) {
		this.atlas = new Image();

		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

		const uTexture0 = gl.getUniformLocation(gl.program, "uTexture0");
		if (uTexture0 < 0) {
			console.warn("could not get uniform location");
		}

		this.atlas.onload = () => {
			gl.activeTexture(gl.TEXTURE0);

			gl.bindTexture(gl.TEXTURE_2D, this.texture0);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.atlas);

			gl.uniform1i(uTexture0, 0);

			this.numtextures = this.atlas.height / 32;
		}

		this.atlas.src = path;
	}
}
