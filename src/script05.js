import GUI from "lil-gui";
import * as THREE from "three";
import { camera, controls, renderer } from "./utils.js";
const gui = new GUI();

// Scene
const scene = new THREE.Scene();

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
gui.add(ambientLight, "intensity").min(0).max(3).step(0.001);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(2, 2, -1);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);

// directionalLight.shadow.camera.far = 6;
// directionalLight.shadow.camera.top = 1;
// directionalLight.shadow.camera.left = -1;
// directionalLight.shadow.camera.right = 1;
// directionalLight.shadow.camera.bottom = -1;
// directionalLight.shadow.radius = 20;

const spotLight = new THREE.SpotLight(0xffffff, 3.6, 10, Math.PI * 0.3);
spotLight.position.set(0, 2, 2);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
scene.add(spotLight);
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

const directionalLightCameraHelper = new THREE.CameraHelper(
	directionalLight.shadow.camera,
);
directionalLightCameraHelper.visible = false;
scene.add(directionalLightCameraHelper);

gui.add(directionalLight, "intensity").min(0).max(3).step(0.001);
gui.add(directionalLight.position, "x").min(-5).max(5).step(0.001);
gui.add(directionalLight.position, "y").min(-5).max(5).step(0.001);
gui.add(directionalLight.position, "z").min(-5).max(5).step(0.001);
scene.add(directionalLight);

const material = new THREE.MeshStandardMaterial();
material.roughness = 0.7;
gui.add(material, "metalness").min(0).max(1).step(0.001);
gui.add(material, "roughness").min(0).max(1).step(0.001);

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);

const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.5;

sphere.castShadow = true;
plane.receiveShadow = true;

scene.add(sphere, plane);

camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
scene.add(camera);

const clock = new THREE.Clock();
renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	controls.update();

	sphere.position.x = Math.cos(elapsedTime) * 1.5;
	sphere.position.z = Math.sin(elapsedTime) * 1.5;
	sphere.position.y = Math.abs(Math.sin(elapsedTime * 3));

	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};

tick();
