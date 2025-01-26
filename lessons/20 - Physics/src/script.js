import CANNON from "cannon";
import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// important - when physics is too "heavy", offload to worker

const sound = new Audio("/sounds/hit.mp3");
function playHitSound(collision) {
	const impact = collision.contact.getImpactVelocityAlongNormal();
	if (impact > 1.5) {
		// without this the sound will wait for its previous to finish to start
		sound.currentTime = 0;
		sound.volume = Math.random();
		sound.play();
	}
}

const debugObj = {
	createSphere: () =>
		createSphere(
			(Math.random() + 0.1) * 1,
			new THREE.Vector3(
				(Math.random() - 0.5) * 3,
				(Math.random() + 1) * 3,
				(Math.random() - 0.5) * 3,
			),
		),

	createBox: () =>
		createBox(
			Math.random(),
			new THREE.Vector3(
				(Math.random() - 0.5) * 3,
				(Math.random() + 1) * 3,
				(Math.random() - 0.5) * 3,
			),
		),

	reset: () => {
		for (const { mesh, body } of objectsToUpdate) {
			world.removeBody(body);
			scene.remove(mesh);
			body.removeEventListener("collide", playHitSound);
		}
		objectsToUpdate.splice(0, objectsToUpdate.length);
	},
};

const gui = new GUI();
gui.add(debugObj, "createSphere");
gui.add(debugObj, "createBox");
gui.add(debugObj, "reset");

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMapTexture = cubeTextureLoader.load([
	"/textures/environmentMaps/0/px.png",
	"/textures/environmentMaps/0/nx.png",
	"/textures/environmentMaps/0/py.png",
	"/textures/environmentMaps/0/ny.png",
	"/textures/environmentMaps/0/pz.png",
	"/textures/environmentMaps/0/nz.png",
]);

//PHYSICS
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
// for optimization, can be problematic when tehre's a fast moving object
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;

// 1. we can create different materials, and give them to different bodies
// const concreteMaterial = new CANNON.Material("concrete");
// const plasticMaterial = new CANNON.Material("plastic");
// const concretePlasticContactMaterial = new CANNON.ContactMaterial(
// 	concreteMaterial,
// 	plasticMaterial,
// 	{
// 		friction: 0.1,
// 		restitution: 0.7,
// 	},
// );
// world.addContactMaterial(concretePlasticContactMaterial);

// 2. or we can create a default material and give it to all bodies
const defaultMaterial = new CANNON.Material("default");
const defaultContactMaterial = new CANNON.ContactMaterial(
	defaultMaterial,
	defaultMaterial,
	{
		friction: 0.1,
		restitution: 0.7,
	},
);

// const sphereShape = new CANNON.Sphere(0.5);
// const sphereBody = new CANNON.Body({
// 	mass: 1,
// 	position: new CANNON.Vec3(0, 3, 0),
// 	shape: sphereShape,
// 	material: defaultContactMaterial,
// });
// world.addBody(sphereBody);

// sphereBody.applyLocalForce(
// 	new CANNON.Vec3(150, 0, 0),
// 	new CANNON.Vec3(0, 0, 0),
// );

// 3. we can set this as the default contact material for all bodies in the world
world.defaultContactMaterial = defaultContactMaterial;

const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({
	mass: 0,
	position: new CANNON.Vec3(0, 0, 0),
	shape: floorShape,
	material: defaultContactMaterial,
});

floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI * 0.5);
world.addBody(floorBody);

/**
 * Floor
 */
const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(10, 10),
	new THREE.MeshStandardMaterial({
		color: "#777777",
		metalness: 0.3,
		roughness: 0.4,
		envMap: environmentMapTexture,
		envMapIntensity: 0.5,
	}),
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100,
);
camera.position.set(-3, 3, 3);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let oldElapsedTime = 0;
const objectsToUpdate = [];
const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - oldElapsedTime;
	oldElapsedTime = elapsedTime;

	// apply wind force
	world.step(1 / 60, deltaTime, 3);
	objectsToUpdate.map(({ mesh, body }) => {
		mesh.position.copy(body.position);
		mesh.quaternion.copy(body.quaternion);
	});

	controls.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};

tick();

const sphereMaterial = new THREE.MeshStandardMaterial({
	metalness: 0.3,
	roughness: 0.4,
	envMap: environmentMapTexture,
});
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

function createSphere(radius, position) {
	const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
	// important - using geometry with size 1 and scale, allows us to reuse the same geometry
	mesh.scale.set(radius, radius, radius);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	mesh.position.copy(position);
	scene.add(mesh);

	const shape = new CANNON.Sphere(radius);
	const body = new CANNON.Body({
		mass: (100 * (Math.PI * Math.PI * 4)) / 3,
		position,
		shape,
		material: defaultMaterial,
	});

	world.addBody(body);
	objectsToUpdate.push({ mesh, body });

	body.addEventListener("collide", playHitSound);
}

function createBox(size, position) {
	const mesh = new THREE.Mesh(boxGeometry, sphereMaterial);
	mesh.scale.set(size, size, size);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	mesh.position.copy(position);
	scene.add(mesh);

	const shape = new CANNON.Box(
		// * 0.5 because the origin is the center of the box
		new CANNON.Vec3(size * 0.5, size * 0.5, size * 0.5),
	);
	const body = new CANNON.Body({
		mass: 100 * size * size * size,
		position,
		shape,
		material: defaultMaterial,
	});

	world.addBody(body);
	objectsToUpdate.push({ mesh, body });

	body.addEventListener("collide", playHitSound);
}

createSphere(0.5, new THREE.Vector3(0.5, 3, 0));
// createSphere(1, new THREE.Vector3(1.5, 5, 0));
createSphere(3, new THREE.Vector3(1, 9, 0));
