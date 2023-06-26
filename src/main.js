import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls";
import Stats from "three/addons/libs/stats.module";
import GUI from "lil-gui";

import "./style.css";
import { ShaderMaterial } from "three";

import myquadVertexShader from "./shaders/myquad/vertex.glsl";
import myquadFragmentShader from "./shaders/myquad/fragment.glsl";

const conf = {
  bg: "#393939",
  fov: 50,
  grid: true,
  axes: true,
};
window.conf = conf;

//
// scenes: 1 and 2
//

const scene1 = new THREE.Scene();
const scene2 = new THREE.Scene();
scene1.background = scene2.background = new THREE.Color(conf.bg);

THREE.ColorManagement.legacyMode = false;

//
// 🎥 camera
//

const camera = new THREE.PerspectiveCamera(
  conf.fov,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(7, 4, 21);

//
// cubeCameras
//

const cubeCamera1 = new THREE.CubeCamera(
  0.1,
  100000,
  new THREE.WebGLCubeRenderTarget(128, {
    // generateMipmaps: true,
    // minFilter: THREE.LinearMipmapLinearFilter,
  })
);
cubeCamera1.position.x = 0;
cubeCamera1.position.y = 1;
cubeCamera1.position.z = 5;
scene1.add(cubeCamera1);

const cubeCamera2 = new THREE.CubeCamera(
  0.1,
  100000,
  new THREE.WebGLCubeRenderTarget(128, {
    // generateMipmaps: true,
    // minFilter: THREE.LinearMipmapLinearFilter,
  })
);
cubeCamera2.position.x = 4;
cubeCamera2.position.y = 1;
cubeCamera2.position.z = 0;
scene2.add(cubeCamera2);

//
// 📷 renderer
//

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.toneMapping = THREE.ACESFilmicToneMapping; // https://threejs.org/docs/#api/en/constants/Renderer
// renderer.toneMappingExposure = 2.3;
// renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // https://threejs.org/docs/#api/en/constants/Renderer
document.body.appendChild(renderer.domElement);

const stats = new Stats();
document.body.appendChild(stats.dom);

const controls = new OrbitControls(camera, renderer.domElement);

//
// Meshes
//

// 🧊 cube

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshStandardMaterial({ color: "blue" })
);
cube1.castShadow = true;
cube1.position.y = 1;
scene1.add(cube1);

const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshStandardMaterial({ color: "purple" })
);
cube2.castShadow = true;
cube2.position.y = 1;
scene2.add(cube2);

//
// myquad
//

const myquad = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  // new THREE.MeshStandardMaterial({ color: "red" })
  new ShaderMaterial({
    uniforms: {
      map1: { value: cubeCamera1.renderTarget.texture },
      map2: { value: cubeCamera2.renderTarget.texture },
    },
    vertexShader: myquadVertexShader,
    fragmentShader: myquadFragmentShader,
  })
);
myquad.position.x = 3;
myquad.position.y = 2;
scene1.add(myquad);

// 🏀 sphere

const sphere1 = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1, 1),
  new THREE.MeshLambertMaterial({
    envMap: cubeCamera1.renderTarget.texture,
  })
);
sphere1.castShadow = true;
sphere1.position.copy(cubeCamera1.position); // position the sphere at the cubeCamera
scene1.add(sphere1);

const sphere2 = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1, 1),
  new THREE.MeshLambertMaterial({
    envMap: cubeCamera2.renderTarget.texture,
  })
);
sphere2.castShadow = true;
sphere2.position.copy(cubeCamera2.position); // position the sphere at the cubeCamera
scene1.add(sphere2);

// 🛬 ground plane

const ground1 = new THREE.Mesh(
  new THREE.BoxGeometry(100, 100, 0.1),
  new THREE.MeshStandardMaterial({
    color: "gray",
    transparent: true,
    opacity: 0.8,
  })
);
ground1.position.y = -0.1 / 2;
ground1.receiveShadow = true;
ground1.rotation.x = -Math.PI / 2;
scene1.add(ground1);

const ground2 = ground1.clone();
scene2.add(ground2);

//
// 💡 lights
//

// 🔦 spot

const spotLight1 = new THREE.SpotLight("white");
spotLight1.position.set(15, 15, 15);
spotLight1.penumbra = 1;
spotLight1.castShadow = true;
spotLight1.intensity = 2;
spotLight1.shadow.bias = -0.0001;
// spotLight.shadow.mapSize.width = 1024 * 4;
// spotLight.shadow.mapSize.height = 1024 * 4;
// spotLight.shadow.camera.near = 0.5; // default 0.5
// spotLight.shadow.camera.far = 10; // default 500
scene1.add(spotLight1);

const spotLight2 = spotLight1.clone();
scene2.add(spotLight2);
// scene.add(new THREE.SpotLightHelper(spotLight));

// 🌤️ ambient

const ambientLight1 = new THREE.AmbientLight();
ambientLight1.intensity = 0.2;
scene1.add(ambientLight1);

const ambientLight2 = ambientLight1.clone();
scene2.add(ambientLight2);

//
// 📐 dummies
//

const gridHelper = new THREE.GridHelper(30, 30);
scene1.add(gridHelper);
const axesHelper = new THREE.AxesHelper(5);
scene1.add(axesHelper);

//
// 🎛️ GUI
//

const gui = new GUI(); // see: https://lil-gui.georgealways.com/

gui
  .addColor(conf, "bg")
  .name("bg")
  .onChange(
    (val) => (scene1.background = scene2.background = new THREE.Color(val))
  );

gui
  .addFolder("camera")
  .close()
  .add(conf, "fov")
  .name("fov")
  .onChange((val) => {
    camera.fov = val;
    camera.updateProjectionMatrix();
  });

gui
  .add(conf, "grid")
  .name("grid")
  .onChange((val) => {
    gridHelper.visible = val;
  });

gui
  .add(conf, "axes")
  .name("axes")
  .onChange((val) => {
    axesHelper.visible = val;
  });

//
// 🎬 animation
//

function animate(t) {
  // Update the render target cube
  sphere1.visible = false;
  cubeCamera1.update(renderer, scene1);
  sphere1.visible = true;

  sphere2.visible = false;
  cubeCamera2.update(renderer, scene2);
  sphere2.visible = true;

  renderer.render(scene1, camera);
  // renderer.render(scene2, camera);

  stats.update();
}
renderer.setAnimationLoop(animate);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize, false);
