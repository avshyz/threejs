import GUI from "lil-gui";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/Addons.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { camera, controls, initFullScreen, renderer } from "./utils.js";

const fontLoader = new FontLoader();
const textureLoader = new THREE.TextureLoader();
const pinkTexture = textureLoader.load("./textures/matcaps/pink.png");
const greenTexture = textureLoader.load("./textures/matcaps/7.png");
pinkTexture.colorSpace = THREE.SRGBColorSpace;
const material = new THREE.MeshMatcapMaterial({ matcap: pinkTexture });
const textMaterial = new THREE.MeshMatcapMaterial({ matcap: greenTexture });

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
	const text = new THREE.Mesh(textGeometry, textMaterial);
	text.position.y = 0.5;
	scene.add(text);
});
camera.position.z = 4;

const scene = new THREE.Scene();
const torus = new THREE.TorusGeometry(1, 0.5, 32, 32);

const WORLD_SIZE = 60;
const ROTATION_FACTOR = 1;
const torusGroup = new THREE.Group();

for (let i = 0; i < 1000; i++) {
	const mesh = new THREE.Mesh(torus, material);
	const v = new THREE.Vector3()
		.random()
		.subScalar(0.5)
		.multiplyScalar(WORLD_SIZE);
	mesh.position.set(v.x, v.y, v.z);
	mesh.rotation.set(
		Math.random() * Math.PI,
		Math.random() * Math.PI,
		Math.random() * Math.PI,
	);
	mesh.scale.setScalar(Math.random());
	torusGroup.add(mesh);
}
scene.add(torusGroup);

const clock = new THREE.Clock();
animate();
initFullScreen();
function animate() {
	const delta = clock.getDelta();
	const elapsedTime = clock.getElapsedTime();
	controls.update();
	renderer.render(scene, camera);
	torusGroup.traverse((object) => {
		if (object.isMesh && object.geometry.type === "TorusGeometry") {
			object.rotation.x += delta * ROTATION_FACTOR;
			object.rotation.y += delta * ROTATION_FACTOR;
			object.rotation.z += delta * ROTATION_FACTOR;
		}
	});

	camera.position.y = Math.sin(elapsedTime) * 3;
	camera.position.x = Math.cos(elapsedTime) * 3;

	torusGroup.rotation.y = elapsedTime * 0.1;
	torusGroup.rotation.z = elapsedTime * 0.1;

	requestAnimationFrame(animate);
}
