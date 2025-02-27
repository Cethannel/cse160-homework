export default function getContext() {
	// Retrieve <canvas> element
	/**
		* @type {HTMLCanvasElement}
		*/
	var canvas = document.getElementById("webgl");

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// Get the rendering context for WebGL
	const gl = canvas.getContext("webgl");
	if (!gl) {
		console.log("Failed to get the rendering context for WebGL");
	}

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.enable(gl.DEPTH_TEST);

	window.addEventListener("resize", (e) => {
		gl.canvas.width = window.innerWidth;
		gl.canvas.height = window.innerHeight;

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	});

	return gl;
}
