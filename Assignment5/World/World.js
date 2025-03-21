import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TGALoader } from 'three/addons/loaders/TGALoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import VoxelWorld from './VoxelWorld.js';
import NOISE from '../lib/perlin.js';

function main() {

	const canvas = document.querySelector('#webgl');
	const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

	const cellSize = 32;

	const fov = 75;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 300000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(- cellSize * .3, cellSize * .8, - cellSize * .3);

	const controls = new OrbitControls(camera, canvas);
	controls.target.set(cellSize / 2, cellSize / 3, cellSize / 2);
	controls.update();

	const scene = new THREE.Scene();
	scene.background = new THREE.Color('lightblue');

	{
		const color = 0xFFFFFF;  // white
		const near = 10;
		const far = 100;
		scene.fog = new THREE.Fog(color, near, far);
	}

	const tileSize = 16;
	const tileTextureWidth = 256;
	const tileTextureHeight = 64;
	const loader = new THREE.TextureLoader();
	const texture = loader.load('../assets/textures/flourish-cc-by-nc-sa.png', render);
	texture.magFilter = THREE.NearestFilter;
	texture.minFilter = THREE.NearestFilter;
	texture.colorSpace = THREE.SRGBColorSpace;

	const ambient = new THREE.AmbientLight(0xFFFFFF);
	scene.add(ambient);

	const light = new THREE.DirectionalLight(0xffffff, 1);
	light.castShadow = true;
	const targetObject = new THREE.Object3D();
	targetObject.translateX(4);
	scene.add(targetObject);

	//light.target = targetObject;
	light.translateY(256);
	light.translateX(40);
	//Set up shadow properties for the light
	light.shadow.camera.left = -100;
	light.shadow.camera.right = 100;
	light.shadow.camera.bottom = -100;
	light.shadow.camera.top = 100;
	scene.add(light);

	function addBall() {
		const geometry = new THREE.SphereGeometry(1, 32, 16);
		const material = new THREE.MeshPhongMaterial({ color: 0xaaaaa });
		const sphere = new THREE.Mesh(geometry, material);
		sphere.translateY(30);
		sphere.translateX(-10);
		sphere.castShadow = true;

		scene.add(sphere);
	}

	addBall();

	const helper = new THREE.CameraHelper(light.shadow.camera);
	scene.add(helper);

	function makeSelector() {
		const geometry = new THREE.BoxGeometry(1, 1, 1);
		const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
		const cube = new THREE.Mesh(geometry, material);
		scene.add(cube);
		return cube;
	}

	{
		let geometry = new THREE.CylinderGeometry(0.1, 1, 1);
		const material = new THREE.MeshBasicMaterial({ color: 0xAA0000 });
		const cone = new THREE.Mesh(geometry, material);
		cone.translateY(40);
		cone.translateX(-20);
		cone.rotateZ(Math.PI / 4);
		scene.add(cone);
		{
			let light = new THREE.SpotLight(0xFF0000, 1000);
			light.castShadow = true;
			cone.add(light);
		}
	}

	/**
		* @type {THREE.Object3D}
		*/
	let model = undefined;
	const pivot = new THREE.Object3D();
	pivot.translateY(30);
	scene.add(pivot);

	{
		const loader = new THREE.TextureLoader();
		const texture = loader.load('../assets/textures/metal_seamless.jpg');
		texture.colorSpace = THREE.SRGBColorSpace;

		let radius = 0.05;
		const geometry = new THREE.CylinderGeometry(radius, radius, 2, 16);
		const material = new THREE.MeshPhongMaterial({
			map: texture,
		});
		const cyl = new THREE.Mesh(geometry, material);
		cyl.rotateZ(Math.PI / 2);
		cyl.castShadow = true;
		pivot.add(cyl);
	}

	{

		const mtlLoader = new MTLLoader();
		mtlLoader.setPath('../assets/objects/'); // Set the path to your files

		mtlLoader.load('oil_lantern.mtl', (materials) => {
			materials.preload();

			// Debug materials
			console.log('Loaded materials:', materials.materials);
			for (let mat in materials.materials) {
				console.log(`Material ${mat}:`, materials.materials[mat]);
				// Force some visibility if material is black
				if (materials.materials[mat].color.getHex() === 0x000000) {
					materials.materials[mat].color.set(0x888888); // Set to gray if black
				}
			}

			const objLoader = new OBJLoader();
			objLoader.setMaterials(materials);
			objLoader.setPath('../assets/objects/');

			objLoader.load(
				'oil_lantern.obj',
				/**
				* @param {THREE.Object3D} object 
				*/
				(object) => {
					model = object;
					const scale = 0.02;
					object.scale.set(scale, scale, scale);
					object.translateY(-5.55 * 10 * scale);
					object.translateZ(0.80 * 10 * scale);

					let light = new THREE.PointLight(0xe66100, 30);
					light.translateY(10);
					light.translateZ(-10);
					const healper = new THREE.PointLightHelper(light);
					object.add(light);
					scene.add(healper);

					pivot.add(object);

					// Debug geometry
					console.log('Object loaded:', object);
				},
				(xhr) => {
					console.log((xhr.loaded / xhr.total * 100) + '% loaded');
				},
				(error) => {
					console.error('OBJ loading error:', error);
				}
			);
		},
			(xhr) => {
				console.log('MTL ' + (xhr.loaded / xhr.total * 100) + '% loaded');
			},
			(error) => {
				console.error('MTL loading error:', error);
			}
		);

	}


	let selector = makeSelector();

	// From: https://codinhood.com/post/create-skybox-with-threejs/
	function createPathStrings(filename) {
		const basePath = "../assets/textures/";
		const baseFilename = basePath + filename;
		const fileType = ".tga";
		const sides = ["ft", "bk", "up", "dn", "rt", "lf"];
		const pathStings = sides.map(side => {
			const name = baseFilename + "_" + side + fileType;
			console.log(`Loading: ${name}`);
			return name;
		});

		return pathStings;
	}

	let skyboxImage = "miramar";
	function createMaterialArray(filename) {
		const skyboxImagepaths = createPathStrings(filename);
		const materialArray = skyboxImagepaths.map(image => {
			let texture = new TGALoader().load(image);

			return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide }); // <---
		});
		return materialArray;
	}


	function makeSkyBox() {
		const materialArray = createMaterialArray(skyboxImage);
		const skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
		const skybox = new THREE.Mesh(skyboxGeo, materialArray);
		scene.add(skybox)
	}

	makeSkyBox();

	const world = new VoxelWorld({
		cellSize,
		tileSize,
		tileTextureWidth,
		tileTextureHeight,
	});

	const material = {
		transparent: new THREE.MeshLambertMaterial({
			map: texture,
			side: THREE.FrontSide,
			alphaTest: 0.1,
			transparent: true,
		}),
		solid: new THREE.MeshLambertMaterial({
			map: texture,
			side: THREE.FrontSide,
			alphaTest: 0.1,
		})
	};

	const cellIdToMesh = {};
	function updateCellGeometry(x, y, z) {
		const cellX = Math.floor(x / cellSize);
		const cellY = Math.floor(y / cellSize);
		const cellZ = Math.floor(z / cellSize);
		const cellId = world.computeCellId(x, y, z);
		let mesh = cellIdToMesh[cellId];

		function updateInner(type) {
			if (!mesh) {
				mesh = {};
			}
			const geometry = mesh[type] ? mesh[type].geometry : new THREE.BufferGeometry();

			const { positions, normals, uvs, indices } = type == "solid" ? world.generateGeometryDataForCell(cellX, cellY, cellZ) : world.generateTransparentGeometryDataForCell(cellX, cellY, cellZ);
			const positionNumComponents = 3;
			geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
			const normalNumComponents = 3;
			geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
			const uvNumComponents = 2;
			geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
			geometry.setIndex(indices);
			geometry.computeBoundingSphere();

			if (!mesh[type]) {
				const cMesh = new THREE.Mesh(geometry, material[type]);
				cMesh.castShadow = true;
				cMesh.receiveShadow = true;
				cMesh.name = cellId;
				scene.add(cMesh);
				cMesh.position.set(cellX * cellSize, cellY * cellSize, cellZ * cellSize);
				mesh[type] = cMesh;
				cellIdToMesh[cellId] = mesh;
			}
		}

		updateInner("solid");
		updateInner("transparent");
	}


	const neighborOffsets = [
		[0, 0, 0], // self
		[- 1, 0, 0], // left
		[1, 0, 0], // right
		[0, - 1, 0], // down
		[0, 1, 0], // up
		[0, 0, - 1], // back
		[0, 0, 1], // front
	];
	function updateVoxelGeometry(x, y, z) {

		const updatedCellIds = {};
		for (const offset of neighborOffsets) {

			const ox = x + offset[0];
			const oy = y + offset[1];
			const oz = z + offset[2];
			const cellId = world.computeCellId(ox, oy, oz);
			if (!updatedCellIds[cellId]) {

				updatedCellIds[cellId] = true;
				updateCellGeometry(ox, oy, oz);

			}

		}

	}

	NOISE.seed(1337);
	const scaleFactor = 1 / 50;
	const worldSize = 2;

	function genWorld() {
		function genStone(chunkX, chunkZ) {
			for (let y = 0; y < cellSize; ++y) {

				for (let z = 0; z < cellSize; ++z) {

					for (let x = 0; x < cellSize; ++x) {
						const aX = (chunkX * cellSize) + x;
						const aZ = (chunkZ * cellSize) + z;
						const height = NOISE.simplex2(aX * scaleFactor - 0.5, aZ * scaleFactor - 0.5) * (cellSize / 3) + (cellSize / 2);

						if (y < height) {
							world.setVoxel(aX, y, aZ, 4);

						}

					}

				}

			}
		}

		for (let chunkX = -worldSize; chunkX < worldSize; chunkX++) {
			for (let chunkZ = -worldSize; chunkZ < worldSize; chunkZ++) {
				genStone(chunkX, chunkZ);
			}
		}
		for (let chunkX = -worldSize; chunkX < worldSize; chunkX++) {
			for (let chunkZ = -worldSize; chunkZ < worldSize; chunkZ++) {
				updateVoxelGeometry(chunkX * cellSize, 0, chunkZ * cellSize); // 0,0,0 will generate
			}
		}
	}

	genWorld();

	function resizeRendererToDisplaySize(renderer) {

		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize) {

			renderer.setSize(width, height, false);

		}

		return needResize;

	}

	let renderRequested = false;

	let start = performance.now();

	const swingAmplitude = Math.PI / 4; // 45 degrees swing
	const swingSpeed = 0.001; // Speed of swing

	function render() {

		renderRequested = undefined;

		if (resizeRendererToDisplaySize(renderer)) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}

		// Calculate swing angle using sine wave
		const angle = Math.sin((performance.now() - start) * swingSpeed) * swingAmplitude;

		// Apply rotation to pivot
		pivot.rotation.x = angle;

		controls.update();
		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}

	render();

	function requestRenderIfNotRequested() {

		if (!renderRequested) {

			renderRequested = true;
			requestAnimationFrame(render);

		}

	}

	let currentVoxel = 0;
	let currentId;

	document.querySelectorAll('#ui .tiles input[type=radio][name=voxel]').forEach((elem) => {

		elem.addEventListener('click', allowUncheck);

	});

	function allowUncheck() {

		if (this.id === currentId) {

			this.checked = false;
			currentId = undefined;
			currentVoxel = 0;

		} else {

			currentId = this.id;
			currentVoxel = parseInt(this.value);

		}

	}

	function getCanvasRelativePosition(event) {

		const rect = canvas.getBoundingClientRect();
		return {
			x: (event.clientX - rect.left) * canvas.width / rect.width,
			y: (event.clientY - rect.top) * canvas.height / rect.height,
		};

	}

	let selectorOffset = new THREE.Vector3(0.5, 0.5, 0.5);

	function placeVoxel(event) {

		const pos = getCanvasRelativePosition(event);
		const x = (pos.x / canvas.width) * 2 - 1;
		const y = (pos.y / canvas.height) * - 2 + 1; // note we flip Y

		const start = new THREE.Vector3();
		const end = new THREE.Vector3();
		start.setFromMatrixPosition(camera.matrixWorld);
		end.set(x, y, 1).unproject(camera);

		const intersection = world.intersectRay(start, end);
		if (intersection) {

			const voxelId = event.shiftKey ? 0 : currentVoxel;
			// the intersection point is on the face. That means
			// the math imprecision could put us on either side of the face.
			// so go half a normal into the voxel if removing (currentVoxel = 0)
			// our out of the voxel if adding (currentVoxel  > 0)
			const pos = intersection.position.map((v, ndx) => {
				return Math.floor(v + intersection.normal[ndx] * (voxelId > 0 ? 0.5 : - 0.5));
			});
			console.log(`Setting voxel at ${pos} to ${voxelId}`);
			selector.position.set(...pos);
			selector.position.set(...selector.position.add(selectorOffset))
			world.setVoxel(...pos, voxelId);
			updateVoxelGeometry(...pos);
			requestRenderIfNotRequested();

		}

	}

	const mouse = {
		x: 0,
		y: 0,
	};

	function recordStartPosition(event) {

		mouse.x = event.clientX;
		mouse.y = event.clientY;
		mouse.moveX = 0;
		mouse.moveY = 0;

	}

	function recordMovement(event) {

		mouse.moveX += Math.abs(mouse.x - event.clientX);
		mouse.moveY += Math.abs(mouse.y - event.clientY);

	}

	function placeVoxelIfNoMovement(event) {

		if (mouse.moveX < 5 && mouse.moveY < 5) {

			placeVoxel(event);

		}

		window.removeEventListener('pointermove', recordMovement);
		window.removeEventListener('pointerup', placeVoxelIfNoMovement);

	}

	canvas.addEventListener('pointerdown', (event) => {

		event.preventDefault();
		recordStartPosition(event);
		window.addEventListener('pointermove', recordMovement);
		window.addEventListener('pointerup', placeVoxelIfNoMovement);

	}, { passive: false });
	canvas.addEventListener('touchstart', (event) => {

		// prevent scrolling
		event.preventDefault();

	}, { passive: false });

	controls.addEventListener('change', requestRenderIfNotRequested);
	window.addEventListener('resize', requestRenderIfNotRequested);

}

function makeXYZGUI(gui, vector3, name, onChangeFn) {
	const folder = gui.addFolder(name);
	folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
	folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
	folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
	folder.open();
}


main();

class ColorGUIHelper {
	constructor(object, prop) {
		this.object = object;
		this.prop = prop;
	}
	get value() {
		return `#${this.object[this.prop].getHexString()}`;
	}
	set value(hexString) {
		this.object[this.prop].set(hexString);
	}
}

