import GUI from "lil-gui";
import * as THREE from "three";
import { camera, controls, renderer } from "./utils.js";

const gui = new GUI();

const scene = new THREE.Scene();

// const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
// scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.9);
// directionalLight.position.set(1, 0.25, 0);
// scene.add(directionalLight);

// const hemisphereLight = new THREE.HemisphereLight("red", "blue", 0.9);
// scene.add(hemisphereLight);

// const pointLight = new THREE.PointLight(0xff9000, 3);
// pointLight.position.set(2, 3, 4);
// scene.add(pointLight);

// const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 6, 1, 1);
// rectAreaLight.position.set(-1.5, 0, 1.5);
// rectAreaLight.lookAt(0, 0, 0);
// scene.add(rectAreaLight);

const spotLight = new THREE.SpotLight(
	0x78ff00,
	4.5,
	10,
	Math.PI * 0.1,
	0.25,
	1,
);
spotLight.position.set(0, 2, 3);
scene.add(spotLight.target);
spotLight.target.position.x -= 0.75;
scene.add(spotLight);
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
sphere.position.x = -1.5;
const cube = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), material);
const torus = new THREE.Mesh(
	new THREE.TorusGeometry(0.3, 0.2, 32, 64),
	material,
);
torus.position.x = 1.5;

const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.65;

scene.add(sphere, cube, torus, plane);

camera.position.set(1, 1, 2);
scene.add(camera);

const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	cube.rotation.set(0.15 * elapsedTime, 0.1 * elapsedTime, 0);
	sphere.rotation.set(0.15 * elapsedTime, 0.1 * elapsedTime, 0);
	torus.rotation.set(0.15 * elapsedTime, 0.1 * elapsedTime, 0);

	controls.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};

tick();
