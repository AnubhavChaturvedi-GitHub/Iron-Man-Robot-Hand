import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2f3f4);
scene.fog = new THREE.Fog(0xf2f3f4, 24, 46);

const camera = new THREE.PerspectiveCamera(
  34,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(12.5, 8.6, 16.5);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
const envScene = new RoomEnvironment(renderer);
scene.environment = pmrem.fromScene(envScene, 0.03).texture;
pmrem.dispose();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.045;
controls.minDistance = 9;
controls.maxDistance = 26;
controls.minPolarAngle = Math.PI / 5;
controls.maxPolarAngle = Math.PI / 2.02;
controls.target.set(0, 5.4, 0.7);
controls.update();

const ambient = new THREE.HemisphereLight(0xffffff, 0xd8dee5, 1.4);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
keyLight.position.set(12, 16, 10);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 50;
keyLight.shadow.camera.left = -16;
keyLight.shadow.camera.right = 16;
keyLight.shadow.camera.top = 16;
keyLight.shadow.camera.bottom = -16;
keyLight.shadow.bias = -0.00018;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xdce6f4, 1.1);
fillLight.position.set(-13, 9, 11);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.75);
rimLight.position.set(2, 8, -16);
scene.add(rimLight);

const undersideLight = new THREE.PointLight(0xffffff, 22, 25, 2);
undersideLight.position.set(0, 2.2, 6);
scene.add(undersideLight);

const backdropMaterial = new THREE.MeshStandardMaterial({
  color: 0xf8f8f7,
  roughness: 1,
  metalness: 0,
  side: THREE.BackSide,
});

const backdrop = new THREE.Mesh(
  new RoundedBoxGeometry(52, 28, 52, 16, 4.5),
  backdropMaterial
);
backdrop.position.y = 13;
scene.add(backdrop);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(18, 96),
  new THREE.MeshStandardMaterial({
    color: 0xe8e9eb,
    roughness: 0.94,
    metalness: 0.02,
  })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const shadowCatcher = new THREE.Mesh(
  new THREE.CircleGeometry(11, 64),
  new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.18 })
);
shadowCatcher.rotation.x = -Math.PI / 2;
shadowCatcher.position.y = 0.002;
shadowCatcher.receiveShadow = true;
scene.add(shadowCatcher);

const baseMetal = new THREE.MeshPhysicalMaterial({
  color: 0x141518,
  metalness: 1,
  roughness: 0.44,
  clearcoat: 0.22,
  clearcoatRoughness: 0.45,
  envMapIntensity: 1.1,
});

const panelMetal = new THREE.MeshPhysicalMaterial({
  color: 0x1f2228,
  metalness: 1,
  roughness: 0.36,
  clearcoat: 0.18,
  clearcoatRoughness: 0.34,
  envMapIntensity: 1,
});

const graphiteMetal = new THREE.MeshPhysicalMaterial({
  color: 0x2a2f37,
  metalness: 0.95,
  roughness: 0.32,
  envMapIntensity: 1,
});

const accentMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xf1b61b,
  metalness: 0.88,
  roughness: 0.22,
  clearcoat: 0.35,
  clearcoatRoughness: 0.2,
  envMapIntensity: 1.2,
});

const cableMaterial = new THREE.MeshStandardMaterial({
  color: 0x181b20,
  roughness: 0.82,
  metalness: 0.06,
});

const rubberMaterial = new THREE.MeshStandardMaterial({
  color: 0x111214,
  roughness: 0.96,
  metalness: 0.02,
});

const satinMetal = new THREE.MeshStandardMaterial({
  color: 0x7b818b,
  roughness: 0.42,
  metalness: 0.88,
});

function makeRoundedBox(width, height, depth, radius, material, segments = 5) {
  return new THREE.Mesh(
    new RoundedBoxGeometry(width, height, depth, segments, radius),
    material
  );
}

function enableShadows(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return object;
}

function createCable(points, radius = 0.05) {
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, 48, radius, 12, false),
    cableMaterial
  );
}

function createBolt() {
  const bolt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.08, 12),
    satinMetal
  );
  bolt.rotation.z = Math.PI / 2;
  return bolt;
}

function createCasterAssembly() {
  const caster = new THREE.Group();

  const fork = makeRoundedBox(0.42, 0.52, 0.22, 0.05, panelMetal);
  fork.position.y = 0.3;
  caster.add(fork);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.12, 0.36, 20),
    graphiteMetal
  );
  stem.position.y = 0.74;
  caster.add(stem);

  const wheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.26, 28),
    rubberMaterial
  );
  wheel.rotation.z = Math.PI / 2;
  wheel.position.y = 0.18;
  caster.add(wheel);

  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.28, 16),
    satinMetal
  );
  hub.rotation.z = Math.PI / 2;
  hub.position.y = 0.18;
  caster.add(hub);

  return enableShadows(caster);
}

const robot = new THREE.Group();
scene.add(robot);

const mobileBase = new THREE.Group();
robot.add(mobileBase);

const lowerChassis = makeRoundedBox(9.6, 1.05, 6.5, 0.32, baseMetal, 7);
lowerChassis.position.y = 0.56;
mobileBase.add(lowerChassis);

const upperDeck = makeRoundedBox(8.4, 0.28, 5.45, 0.18, panelMetal, 6);
upperDeck.position.y = 1.15;
mobileBase.add(upperDeck);

const frontRail = makeRoundedBox(7.3, 0.12, 0.22, 0.05, graphiteMetal, 4);
frontRail.position.set(0, 1.22, 2.42);
mobileBase.add(frontRail);

const rearRail = frontRail.clone();
rearRail.position.z = -2.42;
mobileBase.add(rearRail);

const deckPanel = makeRoundedBox(3.6, 0.2, 1.9, 0.12, graphiteMetal, 4);
deckPanel.position.set(-1.7, 1.18, 0);
mobileBase.add(deckPanel);

const wheelOffsets = [
  [-3.95, 2.4],
  [3.95, 2.4],
  [-3.95, -2.4],
  [3.95, -2.4],
];

wheelOffsets.forEach(([x, z]) => {
  const caster = createCasterAssembly();
  caster.position.set(x, 0, z);
  mobileBase.add(caster);
});

const yawGroup = new THREE.Group();
yawGroup.position.y = 1.3;
robot.add(yawGroup);

const pedestalBase = new THREE.Mesh(
  new THREE.CylinderGeometry(1.4, 1.55, 0.62, 48),
  panelMetal
);
pedestalBase.position.y = 0.32;
yawGroup.add(pedestalBase);

const accentRing = new THREE.Mesh(
  new THREE.TorusGeometry(1.26, 0.12, 18, 60),
  accentMaterial
);
accentRing.rotation.x = Math.PI / 2;
accentRing.position.y = 0.62;
yawGroup.add(accentRing);

const pedestalColumn = new THREE.Mesh(
  new THREE.CylinderGeometry(0.78, 0.95, 1.5, 40),
  baseMetal
);
pedestalColumn.position.y = 1.32;
yawGroup.add(pedestalColumn);

const pedestalCap = new THREE.Mesh(
  new THREE.CylinderGeometry(1.04, 1.04, 0.34, 40),
  graphiteMetal
);
pedestalCap.position.y = 2.22;
yawGroup.add(pedestalCap);

const shoulderHousing = new THREE.Group();
shoulderHousing.position.y = 2.34;
yawGroup.add(shoulderHousing);

const shoulderBridge = new THREE.Mesh(
  new THREE.CylinderGeometry(0.58, 0.58, 1.74, 32),
  panelMetal
);
shoulderBridge.rotation.z = Math.PI / 2;
shoulderHousing.add(shoulderBridge);

[-0.82, 0.82].forEach((x) => {
  const cheek = makeRoundedBox(0.3, 1.2, 0.74, 0.08, graphiteMetal);
  cheek.position.set(x, 0.1, 0);
  shoulderHousing.add(cheek);

  const bolt = createBolt();
  bolt.position.set(x, 0.08, 0.42);
  shoulderHousing.add(bolt);
});

const upperArmPivot = new THREE.Group();
upperArmPivot.position.y = 0.18;
shoulderHousing.add(upperArmPivot);

const shoulderJoint = new THREE.Mesh(
  new THREE.CylinderGeometry(0.74, 0.74, 1.58, 40),
  graphiteMetal
);
shoulderJoint.rotation.z = Math.PI / 2;
upperArmPivot.add(shoulderJoint);

const upperArmFrame = new THREE.Group();
upperArmFrame.position.y = 0.5;
upperArmPivot.add(upperArmFrame);

[-0.42, 0.42].forEach((x) => {
  const rail = makeRoundedBox(0.42, 5.5, 0.5, 0.1, baseMetal);
  rail.position.set(x, 2.8, 0);
  upperArmFrame.add(rail);
});

[1.2, 2.8, 4.4].forEach((y) => {
  const crossBrace = makeRoundedBox(1.24, 0.16, 0.46, 0.05, graphiteMetal, 4);
  crossBrace.position.set(0, y, 0);
  upperArmFrame.add(crossBrace);
});

const upperSleeve = makeRoundedBox(0.94, 4.7, 1.08, 0.12, panelMetal, 6);
upperSleeve.position.set(0, 2.7, 0);
upperArmFrame.add(upperSleeve);

const upperArmCable = createCable(
  [
    new THREE.Vector3(0.58, 0.35, 0.42),
    new THREE.Vector3(0.66, 1.55, 0.6),
    new THREE.Vector3(0.68, 3.15, 0.58),
    new THREE.Vector3(0.56, 5.15, 0.38),
  ],
  0.06
);
upperArmFrame.add(upperArmCable);

const upperCableClamp = makeRoundedBox(0.22, 0.16, 0.82, 0.05, graphiteMetal, 3);
upperCableClamp.position.set(0.62, 3.2, 0.48);
upperArmFrame.add(upperCableClamp);

const elbowAssembly = new THREE.Group();
elbowAssembly.position.y = 5.5;
upperArmFrame.add(elbowAssembly);

const elbowCore = new THREE.Mesh(
  new THREE.CylinderGeometry(0.72, 0.72, 1.44, 36),
  graphiteMetal
);
elbowCore.rotation.z = Math.PI / 2;
elbowAssembly.add(elbowCore);

[-0.66, 0.66].forEach((x) => {
  const elbowPlate = makeRoundedBox(0.16, 1.04, 0.7, 0.05, panelMetal, 4);
  elbowPlate.position.set(x, 0, 0);
  elbowAssembly.add(elbowPlate);
});

const forearmPivot = new THREE.Group();
elbowAssembly.add(forearmPivot);

const forearmFrame = new THREE.Group();
forearmFrame.position.y = 0.4;
forearmPivot.add(forearmFrame);

const forearmMain = makeRoundedBox(1.02, 5, 1.16, 0.12, baseMetal, 7);
forearmMain.position.y = 2.55;
forearmFrame.add(forearmMain);

const forearmChannel = makeRoundedBox(0.44, 4.4, 0.34, 0.08, graphiteMetal, 5);
forearmChannel.position.set(0.58, 2.55, 0.34);
forearmFrame.add(forearmChannel);

[0.9, 2.35, 3.8].forEach((y) => {
  const seam = makeRoundedBox(0.9, 0.1, 1.03, 0.03, panelMetal, 3);
  seam.position.set(0, y, 0);
  forearmFrame.add(seam);
});

const forearmCable = createCable(
  [
    new THREE.Vector3(0.45, 0.4, 0.48),
    new THREE.Vector3(0.68, 1.35, 0.8),
    new THREE.Vector3(0.7, 2.8, 0.72),
    new THREE.Vector3(0.54, 4.8, 0.36),
  ],
  0.055
);
forearmFrame.add(forearmCable);

const elbowLoop = createCable(
  [
    new THREE.Vector3(-0.55, -0.05, 0.42),
    new THREE.Vector3(-0.95, 0.35, 1.15),
    new THREE.Vector3(-0.7, 0.9, 1.34),
    new THREE.Vector3(-0.42, 1.55, 0.72),
  ],
  0.04
);
forearmFrame.add(elbowLoop);

const wristPivot = new THREE.Group();
wristPivot.position.y = 5.18;
forearmFrame.add(wristPivot);

const wristJoint = new THREE.Mesh(
  new THREE.CylinderGeometry(0.5, 0.5, 1.1, 30),
  graphiteMetal
);
wristJoint.rotation.z = Math.PI / 2;
wristPivot.add(wristJoint);

const wristHousing = makeRoundedBox(0.86, 1.02, 0.9, 0.1, panelMetal, 5);
wristHousing.position.y = 0.56;
wristPivot.add(wristHousing);

const toolMount = makeRoundedBox(0.42, 0.62, 0.42, 0.08, satinMetal, 4);
toolMount.position.y = 1.12;
wristPivot.add(toolMount);

const gripperGroup = new THREE.Group();
gripperGroup.position.y = 1.2;
wristPivot.add(gripperGroup);

const gripperCore = new THREE.Mesh(
  new THREE.CylinderGeometry(0.42, 0.52, 1.14, 32),
  panelMetal
);
gripperCore.position.y = 0.52;
gripperGroup.add(gripperCore);

function createFinger(angle) {
  const radialGroup = new THREE.Group();
  radialGroup.rotation.y = angle;

  const basePivot = new THREE.Group();
  basePivot.position.set(0, 0.12, 0.78);
  radialGroup.add(basePivot);

  const baseSegment = makeRoundedBox(0.24, 1.18, 0.3, 0.06, baseMetal, 4);
  baseSegment.position.y = 0.6;
  basePivot.add(baseSegment);

  const baseKnuckle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.34, 18),
    satinMetal
  );
  baseKnuckle.rotation.z = Math.PI / 2;
  baseKnuckle.position.y = 1.08;
  basePivot.add(baseKnuckle);

  const midPivot = new THREE.Group();
  midPivot.position.y = 1.08;
  basePivot.add(midPivot);

  const midSegment = makeRoundedBox(0.2, 0.92, 0.26, 0.05, graphiteMetal, 4);
  midSegment.position.y = 0.46;
  midPivot.add(midSegment);

  const tipPivot = new THREE.Group();
  tipPivot.position.y = 0.9;
  midPivot.add(tipPivot);

  const tipSegment = makeRoundedBox(0.16, 0.7, 0.22, 0.04, panelMetal, 4);
  tipSegment.position.y = 0.35;
  tipPivot.add(tipSegment);

  return {
    radialGroup,
    basePivot,
    midPivot,
    tipPivot,
  };
}

const fingers = [
  createFinger(0),
  createFinger((Math.PI * 2) / 3),
  createFinger((Math.PI * 4) / 3),
];

fingers.forEach((finger) => {
  gripperGroup.add(finger.radialGroup);
});

const pedestalCable = createCable(
  [
    new THREE.Vector3(0.64, 1.15, 0.28),
    new THREE.Vector3(0.82, 1.8, 0.55),
    new THREE.Vector3(0.6, 2.45, 0.72),
    new THREE.Vector3(0.34, 2.88, 0.3),
  ],
  0.045
);
yawGroup.add(pedestalCable);

enableShadows(robot);
robot.rotation.y = THREE.MathUtils.degToRad(-16);

const sliders = {
  base: document.getElementById('base-slider'),
  shoulder: document.getElementById('shoulder-slider'),
  elbow: document.getElementById('elbow-slider'),
  wrist: document.getElementById('wrist-slider'),
  gripper: document.getElementById('gripper-slider'),
};

const state = {
  base: Number(sliders.base.value),
  shoulder: Number(sliders.shoulder.value),
  elbow: Number(sliders.elbow.value),
  wrist: Number(sliders.wrist.value),
  gripper: Number(sliders.gripper.value),
};

function applyPose() {
  yawGroup.rotation.y = THREE.MathUtils.degToRad(state.base);
  upperArmPivot.rotation.x = THREE.MathUtils.degToRad(state.shoulder);
  forearmPivot.rotation.x = THREE.MathUtils.degToRad(state.elbow);
  wristPivot.rotation.x = THREE.MathUtils.degToRad(state.wrist);

  const grip = state.gripper / 100;
  const baseCurl = 0.2 + grip * 0.55;
  const midCurl = 0.08 + grip * 0.42;
  const tipCurl = 0.02 + grip * 0.26;

  fingers.forEach((finger) => {
    finger.basePivot.rotation.x = baseCurl;
    finger.midPivot.rotation.x = midCurl;
    finger.tipPivot.rotation.x = tipCurl;
  });
}

Object.entries(sliders).forEach(([key, input]) => {
  input.addEventListener('input', (event) => {
    state[key] = Number(event.target.value);
    applyPose();
  });
});

applyPose();

function animate() {
  const elapsed = performance.now() * 0.001;

  robot.position.y = Math.sin(elapsed * 0.85) * 0.03;
  accentRing.rotation.z = Math.sin(elapsed * 0.8) * 0.02;
  upperArmCable.position.x = Math.sin(elapsed * 1.1) * 0.015;
  forearmCable.position.z = Math.cos(elapsed * 0.95) * 0.018;
  pedestalCable.position.x = Math.sin(elapsed * 0.9) * 0.01;

  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
