/** @type {CanvasRenderingContext2D} */
let ctx = null;

const center = new Vector3([10, 10, 0]);

// DrawRectangle.js
function main() {
	// Retrieve <canvas> element <- (1)
	/** @type {HTMLCanvasElement} */
	let canvas = document.getElementById('example');
	if (!canvas) {
		console.log('Failed to retrieve the <canvas> element');
		return;
	}

	// Get the rendering context for 2DCG <- (2)
	ctx = canvas.getContext('2d');

	clearCanvas();
}

function clearCanvas() {
	ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
	ctx.fillRect(0, 0, 400, 400);
}

/** @function
 * @argument {Vector3} vec
 */
function drawVector(vec, color) {
	vec.elements[1] *= -1;
	let newVec = vec.add(center);
	newVec = newVec.mul(20);

	ctx.beginPath()
	ctx.strokeStyle = color;
	ctx.moveTo(200, 200)
	ctx.lineTo(newVec.elements[0], newVec.elements[1])
	ctx.stroke();
}

/** @function
	* @param {string} color 
	* @returns Vector3
	*/
function getVector(vectorName) {
	/** @type {HTMLInputElement} */
	let x = document.getElementById(vectorName + "x");
	/** @type {HTMLInputElement} */
	let y = document.getElementById(vectorName + "y");
	/** @type{Vector3} */
	const v = new Vector3([x.value, y.value, 0.0]);
	return v;
}

/** @function
	* @param {string} color 
	* @param {string} vectorName 
	*/
function getAndDrawVecotor(vectorName, color) {
	const v = getVector(vectorName);
	drawVector(v, color);
}

function handleDrawEvent() {
	clearCanvas();
	getAndDrawVecotor("v1", "red");
	getAndDrawVecotor("v2", "blue");
}

function handleDrawOperationEvent() {
	clearCanvas();
	getAndDrawVecotor("v1", "red");
	getAndDrawVecotor("v2", "blue");

	const v1 = getVector("v1");
	const v2 = getVector("v2");

	/** @type{HTMLSelectElement} */
	const operation = document.getElementById("operationSelector");

	/** @type{HTMLInputElement} */
	const scaler = document.getElementById("scaler");

	switch (operation.value) {
		case "add":
			{
				const vout = v1.add(v2);
				drawVector(vout, "green");
				break
			}
		case "subtract":
			{
				const vout = v1.sub(v2);
				drawVector(vout, "green");
				break
			}
		case "multiply":
			{
				const v1out = v1.mul(scaler.value);
				drawVector(v1out, "green");
				const v2out = v2.mul(scaler.value);
				drawVector(v2out, "green");
				break
			}
		case "divide":
			{
				const v1out = v1.div(scaler.value);
				drawVector(v1out, "green");
				const v2out = v2.div(scaler.value);
				drawVector(v2out, "green");
				break
			}
		case "magnitude":
			{
				console.log("Magnitude v1: ", v1.magnitude())
				console.log("Magnitude v2: ", v2.magnitude())
				break
			}
		case "normalize":
			{
				const v1out = v1.normalize();
				drawVector(v1out, "green");
				const v2out = v2.normalize();
				drawVector(v2out, "green");
				break
			}
		case "angle":
			{
				console.log("Angle: ", angleBetween(v1, v2))
			}
		case "area":
			{
				console.log("Area: ", areaTriangle(v1, v2))
			}
	}
}

/** @function
	* @param {Vector3} v1 
	* @param {Vector3} v2 
	*/
function angleBetween(v1, v2) {
	return Math.acos(
		Vector3.dot(v1, v2) / (v1.magnitude() * v2.magnitude())
	) * 180 / Math.PI
}

/** @function
	* @param {Vector3} v1
	* @param {Vector3} v2
	*/
function areaTriangle(v1, v2) {
	return Vector3.cross(v1, v2).magnitude() / 2
}
