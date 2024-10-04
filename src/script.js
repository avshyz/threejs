import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { gsap } from "gsap";

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

const canvas = document.querySelector("canvas.webgl");

// RENDERER
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// SCENE
const scene = new THREE.Scene();

// CAMERA
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

// CONTROLS
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.autoRotateSpeed = 0.03;

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: "crimson" });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

window.addEventListener("resize", () => {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();
});

const clock = new THREE.Clock();

function animate() {
	const elapsedTime = clock.getElapsedTime();
	controls.update(elapsedTime);
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

initGUI();
initFullScreen();
animate();

function initCursor() {
	const cursor = {
		x: 0,
		y: 0,
	};

	window.addEventListener("mousemove", (event) => {
		cursor.x = event.clientX / sizes.width - 0.5;
		cursor.y = -(event.clientY / sizes.height - 0.5);
	});
	return cursor;
}

function initGUI() {
	// GUI
	const gui = new GUI();
	const debugObject = {
		spin: () => {
			gsap.to(mesh.rotation, {
				duration: 1,
				ease: "power3",
				y: mesh.rotation.y + Math.PI * 2,
			});
		},
	};

	gui.add(mesh.position, "y").name("elevation").min(-3).max(3);
	gui.add(mesh.material, "wireframe");
	gui.add(debugObject, "spin");
	gui.hide();
	window.addEventListener("keydown", (event) => {
		if (event.key === "h") {
			gui.show(gui._hidden);
		}
	});
}

function initFullScreen() {
	window.addEventListener("dblclick", () => {
		const fullScreenElement =
			document.fullscreenElement ||
			document.mozFullScreenElement ||
			document.webkitFullscreenElement;

		const requestFullScreen =
			canvas.requestFullscreen ||
			canvas.mozRequestFullScreen ||
			canvas.webkitRequestFullscreen;

		if (!fullScreenElement) {
			requestFullScreen.call(canvas);
		} else {
			document.exitFullscreen?.();
		}
	});
}
