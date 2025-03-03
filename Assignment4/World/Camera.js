// Originally from lab3

import { Matrix4, Vector3 } from "../lib/cuon-matrix-cse160.js";

export default class Camera {
	constructor(position = [0, 1, 1], target = [0, 1, 0]) {
		this.eye = new Vector3(position);
		this.at = new Vector3(target);
		this.viewMatrix = new Matrix4();
		this.projectionMatrix = new Matrix4();
		this.up = new Vector3([0, 1, 0]);
		this.fov = 60;
		this.speed = 0.01;
		this.rotateAngle = 1;

		this.aspect = window.innerWidth / window.innerHeight;

		this.calculateViewProjection();
	}

	/**
		* @param {HTMLCanvasElement} canvas 
		*/
	setAspect(canvas) {
		this.aspect = canvas.width / canvas.height;
	}

	calculateViewProjection() {
		this.viewMatrix.setLookAt(
			...this.eye.elements,
			...this.at.elements,
			...this.up.elements
		);

		this.projectionMatrix.setPerspective(60, this.aspect, 0.01, 1000);
	}

	/**
		* @returns {Vector3}
		*/
	calculateForward() {
		let f = new Vector3();
		f.set(this.at);
		f.sub(this.eye);
		return f;
	}

	moveForward(dt) {
		let f = this.calculateForward();
		f.normalize();
		f.mul(this.speed * dt);

		this.eye.add(f);
		this.at.add(f);
	}

	moveBackwards(dt) {
		let f = this.calculateForward();
		f.normalize();
		f.mul(this.speed * dt);

		this.eye.sub(f);
		this.at.sub(f);
	}

	moveLeft(dt) {
		const f = this.calculateForward();
		let s = Vector3.cross(this.up, f);
		s.normalize();
		s.mul(this.speed * dt);

		this.eye.add(s);
		this.at.add(s);
	}

	moveRight(dt) {
		const f = this.calculateForward();
		let s = Vector3.cross(this.up, f);
		s.normalize();
		s.mul(this.speed * dt);

		this.eye.sub(s);
		this.at.sub(s);
	}

	panLeft() {
		const f = this.calculateForward();
		f.normalize();
		let rotationMatrix = new Matrix4();
		if (rotationMatrix.elements.find((val, a, b) => Number.isNaN(val)) != undefined) {
			throw "Found nan"
		}
		rotationMatrix.setRotate(this.rotateAngle, ...this.up.elements);
		if (rotationMatrix.elements.find((val, a, b) => Number.isNaN(val)) != undefined) {
			throw "Found nan"
		}
		let f_prime = rotationMatrix.multiplyVector3(f);
		f_prime.add(this.eye);

		this.at = f_prime;
	}

	panRight() {
		const f = this.calculateForward();
		f.normalize();
		let rotationMatrix = new Matrix4();
		if (rotationMatrix.elements.find((val, a, b) => Number.isNaN(val)) != undefined) {
			throw "Found nan"
		}
		rotationMatrix.setRotate(-this.rotateAngle, ...this.up.elements);
		if (rotationMatrix.elements.find((val, a, b) => Number.isNaN(val)) != undefined) {
			throw "Found nan"
		}
		let f_prime = rotationMatrix.multiplyVector3(f);
		f_prime.add(this.eye);

		this.at = f_prime;
	}

	/**
		* @param {number} angle
		*/
	panAngle(angle) {
		const f = this.calculateForward();
		f.normalize();
		let rotationMatrix = new Matrix4();
		if (rotationMatrix.elements.find((val, a, b) => Number.isNaN(val)) != undefined) {
			throw "Found nan"
		}
		rotationMatrix.setRotate(angle, ...this.up.elements);
		if (rotationMatrix.elements.find((val, a, b) => Number.isNaN(val)) != undefined) {
			throw "Found nan"
		}
		let f_prime = rotationMatrix.multiplyVector3(f);
		f_prime.add(this.eye);

		this.at = f_prime;
	}

	moveUp(dt) {
		let f = new Vector3(this.up.elements);
		f.normalize();
		f.mul(this.speed * dt);

		this.eye.add(f);
		this.at.add(f);
	}

	moveDown(dt) {
		let f = new Vector3(this.up.elements);
		f.normalize();
		f.mul(this.speed * dt);

		this.eye.sub(f);
		this.at.sub(f);
	}
}
