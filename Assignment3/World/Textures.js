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
	async loadAtlast(gl, path) {
		this.atlas = new Image();

		const uTexture0 = gl.getUniformLocation(gl.program, "uTexture0");
		if (uTexture0 < 0) {
			console.warn("could not get uniform location");
		}

		let loaded = false;
		this.atlas.loading = "eager";

		let loadImage = async img => {
			return new Promise((resolve, reject) => {
				img.onload = async () => {
					console.log("Image Loaded");
					resolve(true);
				};
			});
		};

		this.atlas.src = path;

		await loadImage(this.atlas)

		gl.activeTexture(gl.TEXTURE0);

		gl.bindTexture(gl.TEXTURE_2D, this.texture0);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.atlas);

		gl.uniform1i(uTexture0, 0);

		this.numtextures = this.atlas.height / 32;
	}
}
