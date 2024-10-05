import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

export const canvas = document.querySelector("canvas.webgl");
export const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

export const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
);
camera.position.z = 2;

export const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

window.addEventListener("resize", () => {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();
});

export function initFullScreen() {
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
