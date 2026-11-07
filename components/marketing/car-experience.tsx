"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const keyframes = [
  { at: 0, position: new THREE.Vector3(5.2, 2.4, 7.1), target: new THREE.Vector3(0, 0.35, 0), rotation: -0.35 },
  { at: 0.34, position: new THREE.Vector3(2.55, 1.85, 3.05), target: new THREE.Vector3(0.05, 0.85, 0), rotation: 0.06 },
  { at: 0.68, position: new THREE.Vector3(-3.15, 1.5, 3.85), target: new THREE.Vector3(-0.45, 0.35, 0), rotation: 0.65 },
  { at: 1, position: new THREE.Vector3(0.15, 4.2, 6.4), target: new THREE.Vector3(0, 0.2, 0), rotation: 1.25 },
];

function lerpKeyframes(progress: number) {
  let left = keyframes[0];
  let right = keyframes[keyframes.length - 1];
  for (let index = 0; index < keyframes.length - 1; index += 1) {
    if (progress >= keyframes[index].at && progress <= keyframes[index + 1].at) {
      left = keyframes[index];
      right = keyframes[index + 1];
      break;
    }
  }
  const local = THREE.MathUtils.smoothstep((progress - left.at) / Math.max(right.at - left.at, 0.0001), 0, 1);
  return {
    position: left.position.clone().lerp(right.position, local),
    target: left.target.clone().lerp(right.target, local),
    rotation: THREE.MathUtils.lerp(left.rotation, right.rotation, local),
  };
}

function buildFallbackMicrophone() {
  const microphone = new THREE.Group();
  const lime = new THREE.MeshStandardMaterial({ color: 0xb9ff39, metalness: 0.55, roughness: 0.25 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x111516, metalness: 0.75, roughness: 0.28 });
  const mesh = new THREE.MeshStandardMaterial({ color: 0x9ba3a0, metalness: 0.9, roughness: 0.38, wireframe: true });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.4, 0.22, 48), dark);
  base.position.y = -1.8;
  microphone.add(base);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 1.9, 24), dark);
  stem.position.y = -0.92;
  microphone.add(stem);
  const mount = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.08, 16, 48), lime);
  mount.position.y = 0.35;
  mount.rotation.x = Math.PI / 2;
  microphone.add(mount);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.62, 2.1, 48), dark);
  body.position.y = 0.65;
  microphone.add(body);
  const grille = new THREE.Mesh(new THREE.CapsuleGeometry(0.58, 0.7, 8, 24), mesh);
  grille.position.y = 1.78;
  microphone.add(grille);
  const light = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.64), new THREE.MeshBasicMaterial({ color: 0xcfff71 }));
  light.position.set(0, 0.7, 0.59);
  microphone.add(light);
  const popFilter = new THREE.Mesh(
    new THREE.CircleGeometry(0.83, 48),
    new THREE.MeshPhysicalMaterial({ color: 0x18201e, transparent: true, opacity: 0.78, transmission: 0.15, side: THREE.DoubleSide }),
  );
  popFilter.position.set(0.15, 1.25, 1.22);
  popFilter.rotation.x = -0.05;
  microphone.add(popFilter);
  return microphone;
}

function makeCaptionCard(text: string, accent: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "rgba(8,10,11,.86)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = accent;
    context.lineWidth = 8;
    context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
    context.font = "900 92px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#f3f5ef";
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 6);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const card = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 0.85),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide }),
  );
  card.userData.ownedTexture = texture;
  return card;
}

function buildCaptionRig() {
  const extras = new THREE.Group();
  const cardOne = makeCaptionCard("MAKE EVERY WORD", "#b9ff39");
  cardOne.position.set(-2.45, 1.55, -0.75);
  cardOne.rotation.y = 0.38;
  extras.add(cardOne);
  const cardTwo = makeCaptionCard("HIT THE MOMENT", "#6fd8ff");
  cardTwo.position.set(2.4, 0.2, -0.2);
  cardTwo.rotation.y = -0.42;
  extras.add(cardTwo);
  const cardThree = makeCaptionCard("SHIP THE STORY", "#f391ff");
  cardThree.position.set(-1.6, -1.2, 0.7);
  cardThree.rotation.y = 0.22;
  cardThree.scale.setScalar(0.76);
  extras.add(cardThree);
  const waveform = new THREE.Group();
  const barMaterial = new THREE.MeshBasicMaterial({ color: 0xb9ff39 });
  for (let index = 0; index < 24; index += 1) {
    const height = 0.15 + Math.abs(Math.sin(index * 0.68)) * 0.7;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, height, 0.06), barMaterial);
    bar.position.set((index - 11.5) * 0.11, -2.05 + height / 2, 0.7);
    bar.userData.waveIndex = index;
    waveform.add(bar);
  }
  extras.add(waveform);
  return extras;
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child.userData.ownedTexture instanceof THREE.Texture) child.userData.ownedTexture.dispose();
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry?.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => material.dispose());
  });
}

export function CreatorRigExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadState, setLoadState] = useState<"loading" | "model" | "fallback">("loading");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080a0b, 0.055);
    const camera = new THREE.PerspectiveCamera(42, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.copy(keyframes[0].position);
    scene.add(new THREE.HemisphereLight(0xe7f6ff, 0x171c16, 2.7));
    const key = new THREE.DirectionalLight(0xcaff62, 7.5);
    key.position.set(4, 6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x6fd8ff, 5.2);
    rim.position.set(-5, 2, -4);
    scene.add(rim);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(34, 34), new THREE.MeshStandardMaterial({ color: 0x0b0e0e, metalness: 0.2, roughness: 0.72 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.88;
    scene.add(floor);
    const grid = new THREE.GridHelper(28, 34, 0x9bd72c, 0x202923);
    grid.position.y = -0.86;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.26;
    scene.add(grid);
    const carPivot = new THREE.Group();
    scene.add(carPivot);
    const captionRig = buildCaptionRig();
    carPivot.add(captionRig);
    let activeCar: THREE.Object3D | null = null;
    let targetProgress = 0;
    let smoothProgress = 0;
    let pointerX = 0;
    let pointerY = 0;
    let frame = 0;
    let disposed = false;

    const setCar = (object: THREE.Object3D, source: "model" | "fallback") => {
      if (disposed) return disposeObject(object);
      const bounds = new THREE.Box3().setFromObject(object);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const scale = 4.8 / (Math.max(size.x, size.y, size.z) || 1);
      object.scale.setScalar(scale);
      object.position.sub(center.multiplyScalar(scale));
      object.position.y += 0.02;
      activeCar = object;
      carPivot.add(object);
      setLoadState(source);
    };

    const fallbackTimer = window.setTimeout(() => { if (!activeCar) setCar(buildFallbackMicrophone(), "fallback"); }, 4500);
    new GLTFLoader().load("/models/studio-microphone/scene.gltf", (gltf) => {
      window.clearTimeout(fallbackTimer);
      if (activeCar) { carPivot.remove(activeCar); disposeObject(activeCar); }
      setCar(gltf.scene, "model");
    }, undefined, () => {
      window.clearTimeout(fallbackTimer);
      if (!activeCar) setCar(buildFallbackMicrophone(), "fallback");
    });

    const updateScroll = () => {
      const story = canvas.closest(".car-story");
      if (!story) return;
      const rect = story.getBoundingClientRect();
      targetProgress = THREE.MathUtils.clamp(-rect.top / Math.max(rect.height - window.innerHeight, 1), 0, 1);
    };
    const updatePointer = (event: PointerEvent) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      const mobile = width < 760;
      carPivot.scale.setScalar(mobile ? 0.78 : 1);
      carPivot.position.x = mobile ? 1.35 : 0;
      if (captionRig.children[0]) captionRig.children[0].visible = !mobile;
    };
    const animate = () => {
      frame = window.requestAnimationFrame(animate);
      smoothProgress = reduceMotion ? targetProgress : THREE.MathUtils.lerp(smoothProgress, targetProgress, 0.055);
      const state = lerpKeyframes(smoothProgress);
      const elapsed = performance.now() * 0.001;
      camera.position.lerp(state.position, reduceMotion ? 1 : 0.075);
      if (!reduceMotion) { camera.position.x += pointerX * 0.055; camera.position.y -= pointerY * 0.035; }
      camera.lookAt(state.target);
      carPivot.rotation.y = THREE.MathUtils.lerp(carPivot.rotation.y, state.rotation, 0.07);
      carPivot.position.y = reduceMotion ? 0 : Math.sin(elapsed * 0.85) * 0.035;
      captionRig.children.forEach((child, index) => {
        if ("waveIndex" in child.userData) return;
        child.userData.baseY ??= child.position.y;
        child.position.y = child.userData.baseY + (reduceMotion ? 0 : Math.sin(elapsed * 0.8 + index) * 0.035);
      });
      captionRig.traverse((child) => {
        if (typeof child.userData.waveIndex === "number") {
          child.scale.y = 0.7 + Math.abs(Math.sin(elapsed * 2.6 + child.userData.waveIndex * 0.42)) * 0.8;
        }
      });
      rim.intensity = 4.8 + Math.sin(elapsed * 1.4) * 0.5;
      renderer.render(scene, camera);
    };
    updateScroll(); resize(); animate();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      disposed = true;
      window.clearTimeout(fallbackTimer);
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("resize", resize);
      if (activeCar) disposeObject(activeCar);
      disposeObject(captionRig);
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, []);

  return <div className="car-canvas-wrap"><canvas ref={canvasRef} className="car-canvas" /><div className={`model-status model-status-${loadState}`}><span />{loadState === "loading" ? "Loading creator rig" : loadState === "model" ? "Live 3D creator rig" : "3D creator preview"}</div></div>;
}
