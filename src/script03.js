import GUI from "lil-gui";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/Addons.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { camera, controls, renderer } from "./utils.js";
const textureLoader = new THREE.TextureLoader();
const matcapTexture = textureLoader.load("./textures/matcaps/1.png");

const fontLoader = new FontLoader();
fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
	const textGeometry = new TextGeometry(
		"Marie, is amazing, \nthe best woman on earth!",
		{
			font,
			size: 0.5,
			depth: 0.1,
			curveSegments: 5,
			bevelEnabled: true,
			bevelThickness: 0.1,
			bevelSize: 0.02,
			bevelOffset: 0,
			bevelSegments: 3,
		},
	);
	textGeometry.center();
	const text = new THREE.Mesh(
		textGeometry,
		new THREE.MeshMatcapMaterial({ map: matcapTexture }),
	);
	text.position.y = 0.5;
	scene.add(text);
});
camera.position.z = 4;

const scene = new THREE.Scene();
const axisHelper = new THREE.AxesHelper(2);
scene.add(axisHelper);

const clock = new THREE.Clock();
animate();
function animate() {
	const elapsedTime = clock.getElapsedTime();

	controls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}
