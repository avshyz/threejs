import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
	camera,
	canvas,
	controls,
	initFullScreen,
	renderer,
	sizes,
} from "./utils.js";

const gui = new GUI();

const scene = new THREE.Scene();
const textureLoader = new THREE.TextureLoader();

// initSphereParticles(scene);
initParticles(scene);
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	controls.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};

tick();

initFullScreen();

function initParticles(scene) {
	const particlesGeometry = new THREE.BufferGeometry(1, 32, 32);
	const particlesTexture = textureLoader.load("textures/particles/11.png");
	const particlesMaterial = new THREE.PointsMaterial({
		size: 0.1,
		sizeAttenuation: true,
		// color: "#ff88cc",
		alphaMap: particlesTexture,
		transparent: true,
		vertexColors: true,
		// particles overlap eachother
		alphaTest: 0.001, // has some glitches - good enogh when particles move
		// blending: THREE.AdditiveBlending, // warning - performance impact.
		// depthTest: false,  // may cause other bugs - esp. when there are other objects
		// depthWrite: false,
	});

	const count = 5000;

	const positions = new Float32Array(count * 3);
	const colors = new Float32Array(count * 3);

	for (let i = 0; i < count * 3; i++) {
		positions[i] = (Math.random() - 0.5) * 10;
		colors[i] = Math.random();
	}

	particlesGeometry.setAttribute(
		"position",
		new THREE.BufferAttribute(positions, 3),
	);
	particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

	const particles = new THREE.Points(particlesGeometry, particlesMaterial);
	scene.add(particles);
}

function initSphereParticles(scene) {
	const sphere = new THREE.SphereGeometry(2.5, 32, 32);
	const sphereParticlesMaterial = new THREE.PointsMaterial({
		size: 0.02,
		sizeAttenuation: true,
	});

	const sphereParticles = new THREE.Points(sphere, sphereParticlesMaterial);
	scene.add(sphereParticles);
}
