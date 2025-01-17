import GUI from "lil-gui";
import * as THREE from "three";
import { camera, canvas, controls, renderer } from "./utils.js";

const parameters = {
	count: 1000,
	size: 0.02,
	radius: 5,
	branches: 3,
	spin: 1,
	randomness: 0.1,
	randomnessPower: 3,
	insideColor: "#ff6030",
	outsideColor: "#1b3984",
};

let material;
let geometry;
let points;

// Scene
const scene = new THREE.Scene();

camera.near = 0.1;
camera.far = 10;
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

controls.enableDamping = true;

const clock = new THREE.Clock();

const generateGalaxy = () => {
	cleanup();
	geometry = new THREE.BufferGeometry();
	const positions = new Float32Array(parameters.count * 3);
	const colors = new Float32Array(parameters.count * 3);

	const colorInside = new THREE.Color(parameters.insideColor);
	const colorOutside = new THREE.Color(parameters.outsideColor);

	for (let i = 0; i < parameters.count; i++) {
		const i3 = i * 3;
		const radius = Math.random() * parameters.radius;
		const branchAngle =
			((i % parameters.branches) / parameters.branches) * Math.PI * 2;

		const randomX =
			Math.random() ** parameters.randomnessPower *
			(Math.random() < 0.5 ? 1 : -1) *
			parameters.randomness *
			radius;
		const randomY =
			Math.random() ** parameters.randomnessPower *
			(Math.random() < 0.5 ? 1 : -1) *
			parameters.randomness *
			radius;
		const randomZ =
			Math.random() ** parameters.randomnessPower *
			(Math.random() < 0.5 ? 1 : -1) *
			parameters.randomness *
			radius;

		const spinAngle = radius * parameters.spin;
		positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
		positions[i3 + 1] = randomY;
		positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

		// color
		const mixedColor = colorInside
			.clone()
			.lerp(colorOutside, radius / parameters.radius);
		colors[i3] = mixedColor.r;
		colors[i3 + 1] = mixedColor.g;
		colors[i3 + 2] = mixedColor.b;
	}

	geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
	geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
	material = new THREE.PointsMaterial({
		size: parameters.size,
		sizeAttenuation: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		vertexColors: true,
	});

	points = new THREE.Points(geometry, material);
	scene.add(points);
};

function cleanup() {
	material?.dispose();
	geometry?.dispose();
	if (points) {
		scene.remove(points);
	}
}

generateGalaxy();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	controls.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};

tick();

const gui = new GUI();
gui.add(parameters, "count").min(100).max(1000000).step(100).name("Particles");
gui.add(parameters, "size").min(0.001).max(0.1).step(0.001).name("Size");
gui.add(parameters, "radius").min(0.1).max(20).step(0.1).name("Radius");
gui.add(parameters, "branches").min(2).max(20).step(1).name("Branches");
gui.add(parameters, "spin").min(-5).max(5).step(0.001).name("Spin");
gui.add(parameters, "randomness").min(0).max(2).step(0.001).name("Randomness");
gui
	.add(parameters, "randomnessPower")
	.min(0)
	.max(10)
	.step(0.001)
	.name("randomnessPower");
gui.addColor(parameters, "insideColor").name("Inside Color");
gui.addColor(parameters, "outsideColor").name("Outside Color");
gui.onFinishChange(generateGalaxy);
