import gsap from "gsap";
import GUI from "lil-gui";
import * as THREE from "three";
const objectsDistance = 4;
let particlesMaterial;
const parameters = {
	materialColor: "#ffeded",
};

const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("textures/gradients/3.jpg");
gradientTexture.magFilter = THREE.NearestFilter;
const material = new THREE.MeshToonMaterial({
	color: parameters.materialColor,
	gradientMap: gradientTexture,
});

const directionalLight = new THREE.DirectionalLight("#ffffff", 2.5);
directionalLight.position.set(1, 1, 0);

const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);
const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 3, 43), material);
const mesh3 = new THREE.Mesh(
	new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
	material,
);

mesh1.position.y = -objectsDistance * 0;
mesh2.position.y = -objectsDistance * 1;
mesh3.position.y = -objectsDistance * 2;

mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;

const meshes = [mesh1, mesh2, mesh3];

scene.add(directionalLight, mesh1, mesh2, mesh3);
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(
	35,
	sizes.width / sizes.height,
	0.1,
	100,
);
camera.position.z = 6;

const paralaxGroup = new THREE.Group();
paralaxGroup.add(camera);
scene.add(paralaxGroup);

const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	alpha: true,
});
// renderer.setClearColor("crimson");
// renderer.setClearAlpha(0.5);

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const clock = new THREE.Clock();

let scrollY = window.scrollY;
let currentSection = 0;
const cursor = { x: 0, y: 0 };
window.addEventListener("scroll", () => {
	scrollY = window.scrollY;
	const newSection = Math.round(Math.round(scrollY / sizes.height));
	if (newSection !== currentSection) {
		currentSection = newSection;

		console.log(currentSection);

		gsap.to(meshes[currentSection].rotation, {
			duration: 1.5,
			ease: "power2.inOut",
			x: "+=6",
			y: "+=3",
		});
	}
});

window.addEventListener("mousemove", (event) => {
	cursor.x = event.clientX / sizes.width - 0.5;
	cursor.y = event.clientY / sizes.height - 0.5;
});

let previousTime = 0;

initParticles();
const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	const delta = elapsedTime - previousTime;
	previousTime = elapsedTime;

	camera.position.y = (-scrollY * objectsDistance) / sizes.height;

	const parallaxX = cursor.x;
	const parallaxY = -cursor.y;

	paralaxGroup.position.x +=
		(parallaxX - paralaxGroup.position.x) * 0.7 * delta;
	paralaxGroup.position.y +=
		(parallaxY - paralaxGroup.position.y) * 0.7 * delta;

	for (const mesh of meshes) {
		mesh.rotation.x += delta * 0.1;
		mesh.rotation.y += delta * 0.12;
	}

	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};

tick();

function initParticles() {
	const particlesCount = 200;
	const positions = new Float32Array(particlesCount * 3);
	for (let i = 0; i < particlesCount; i++) {
		positions[i * 3] = (Math.random() - 0.5) * 10;
		positions[i * 3 + 1] =
			objectsDistance * 0.4 - Math.random() * objectsDistance * meshes.length;
		positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
	}

	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
	particlesMaterial = new THREE.PointsMaterial({
		size: 0.03,
		sizeAttenuation: true,
		color: "#ffffff",
		blending: THREE.AdditiveBlending,
	});
	const particles = new THREE.Points(geometry, particlesMaterial);
	scene.add(particles);
}

const gui = new GUI();

gui.addColor(parameters, "materialColor").onChange((value) => {
	material.color.set(value);
	particlesMaterial.color.set(value);
});
