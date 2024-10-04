import * as THREE from "three";
import { gui, renderer, camera, controls } from "./utils.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

export const rgbeLoader = new RGBELoader();
export const textureLoader = new THREE.TextureLoader();

const doorColorTexture = textureLoader.load("./textures/door/color.jpg");
const doorAlphaTexture = textureLoader.load("./textures/door/alpha.jpg");
const doorAmbientOcclusionTexture = textureLoader.load(
	"./textures/door/ambientOcclusion.jpg",
);
const doorHeightTexture = textureLoader.load("./textures/door/height.jpg");
const doorNormalTexture = textureLoader.load("./textures/door/normal.jpg");
const doorMetalnessTexture = textureLoader.load(
	"./textures/door/metalness.jpg",
);
const doorRoughnessTexture = textureLoader.load(
	"./textures/door/roughness.jpg",
);
const matcapTexture = textureLoader.load("./textures/matcaps/1.png");
const gradientTexture = textureLoader.load("./textures/gradients/3.jpg");

doorColorTexture.colorSpace = THREE.SRGBColorSpace;
matcapTexture.colorSpace = THREE.SRGBColorSpace;

export const scene = new THREE.Scene();

const material = getMeshPhysicalMaterial();
// configureTransmission(material, gui);
// configureClearcoat(material, gui);
// configureIrredescence(material, gui);

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), material);
sphere.position.x = 1.5;

const thorus = new THREE.Mesh(
	new THREE.TorusGeometry(0.3, 0.2, 64, 128),
	material,
);
thorus.position.x = -1.5;

const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 100, 100), material);

rgbeLoader.load("./textures/environmentMap/2k.hdr", (environmentMap) => {
	environmentMap.mapping = THREE.EquirectangularReflectionMapping;
	scene.background = environmentMap;
	scene.environment = environmentMap;
});

scene.add(camera, sphere, thorus, plane);

addLights(scene);

const clock = new THREE.Clock();
animate();

function animate() {
	const elapsedTime = clock.getElapsedTime();

	plane.rotation.y = elapsedTime * 0.5;
	sphere.rotation.y = elapsedTime * 0.5;
	thorus.rotation.y = elapsedTime * 0.5;

	sphere.rotation.x = -elapsedTime * 0.5;
	plane.rotation.x = -elapsedTime * 0.5;
	thorus.rotation.x = -elapsedTime * 0.5;

	controls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

function configureIrredescence(material, gui) {
	material.iridescence = 1;
	material.iridescenceIOR = 1;
	material.iridescenceThicknessRange = [100, 800];
	gui.add(material, "iridescence").min(0).max(1).step(0.0001);
	gui.add(material, "iridescenceIOR").min(1).max(2.333).step(0.0001);
	gui.add(material.iridescenceThicknessRange, "0").min(1).max(1000).step(1);
	gui.add(material.iridescenceThicknessRange, "1").min(1).max(1000).step(1);
}

function configureTransmission(material, gui) {
	material.transmission = 1;
	material.ior = 1.5;
	material.thickness = 0.5;

	gui.add(material, "transmission").min(0).max(1).step(0.0001);
	gui.add(material, "ior").min(1).max(10).step(0.0001);
	gui.add(material, "thickness").min(0).max(1).step(0.0001);
}

function configureSheen(material, gui) {
	material.sheen = 1;
	material.sheenRoughness = 0.25;
	material.sheenColor.set(1, 1, 1);
	gui.add(material, "sheen").min(0).max(1).step(0.0001);
	gui.add(material, "sheenRoughness").min(0).max(1).step(0.0001);
	gui.addColor(material, "sheenColor");
}

function configureClearcoat(material, gui) {
	material.clearcoat = 1;
	material.clearcoatRoughness = 0;
	gui.add(material, "clearcoat").min(0).max(1).step(0.0001);
	gui.add(material, "clearcoatRoughness").min(0).max(1).step(0.0001);
}

function getToonMaterial() {
	const material = new THREE.MeshToonMaterial();
	gradientTexture.minFilter = THREE.NearestFilter;
	gradientTexture.magFilter = THREE.NearestFilter;
	gradientTexture.generateMipmaps = false;
	material.gradientMap = gradientTexture;
	return material;
}

function getMeshPhysicalMaterial() {
	const material = new THREE.MeshPhysicalMaterial();
	material.map = doorColorTexture;
	material.aoMap = doorAmbientOcclusionTexture;
	material.displacementMap = doorHeightTexture;
	material.displacementScale = 0.1;
	material.side = THREE.DoubleSide;
	material.metalnessMap = doorMetalnessTexture;
	material.roughnessMap = doorRoughnessTexture;
	material.normalMap = doorNormalTexture;
	material.alphaMap = doorAlphaTexture;
	material.transparent = true;
	material.roughness = 1;
	material.metalness = 1;

	gui.add(material, "roughness", 0, 1).step(0.001);
	gui.add(material, "metalness", 0, 1).step(0.001);
	gui.add(material, "aoMapIntensity", 0, 1).step(0.001);

	return material;
}

function getMeshPhongMaterial() {
	const material = new THREE.MeshPhongMaterial();
	material.shininess = 100;
	material.specular = new THREE.Color(0x1188ff);
	return material;
}

function getMeshMatcapMaterial() {
	const material = new THREE.MeshMatcapMaterial();
	material.matcap = matcapTexture;
	return material;
}

function getMeshNormalMaterial() {
	return new THREE.MeshNormalMaterial();
}

function getMeshStandardMaterial() {
	const material = new THREE.MeshBasicMaterial({ map: doorColorTexture });
	material.alphaMap = doorAlphaTexture;
	material.transparent = true;
	material.side = THREE.DoubleSide;
	return material;
}

function addLights(scene) {
	const ambientLight = new THREE.AmbientLight(0xffffff, 1);
	scene.add(ambientLight);

	const pointLight = new THREE.PointLight(0xffffff, 30);
	pointLight.position.x = 2;
	pointLight.position.y = 3;
	pointLight.position.z = 4;
	scene.add(pointLight);
}
