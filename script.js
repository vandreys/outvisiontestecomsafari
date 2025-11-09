import * as THREE from "./applications/libs/three.js-r132/build/three.module.js";

document.addEventListener("DOMContentLoaded", async () => {
  const arButton = document.querySelector("#ar-button");

  // Detecta iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isIOS) {
    // --- AR Quick Look (iPhone/iPad) ---
    const link = document.createElement("a");
    link.rel = "ar";
    link.href = "/seahorse_anim_mtl_variant.usdz"; // seu modelo 3D em USDZ
    link.appendChild(arButton);
    document.body.appendChild(link);

    arButton.textContent = "View Seahorse in AR (iOS)";
    return;
  }

  // --- WebXR (Android/Chrome) ---
  const supported =
    navigator.xr && (await navigator.xr.isSessionSupported("immersive-ar"));

  if (!supported) {
    arButton.textContent = "AR Not Supported";
    arButton.disabled = true;
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  // Cria um cubo verde (visualização Android/WebXR)
  const geometry = new THREE.BoxGeometry(0.06, 0.06, 0.06);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 0, -0.3);
  scene.add(cube);

  // Luz
  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  scene.add(light);

  let currentSession = null;

  const startAR = async () => {
    currentSession = await navigator.xr.requestSession("immersive-ar", {
      optionalFeatures: ["local", "dom-overlay"],
      domOverlay: { root: document.body },
    });

    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType("local");
    await renderer.xr.setSession(currentSession);

    arButton.textContent = "End AR";

    renderer.setAnimationLoop(() => {
      cube.rotation.x += 0.02;
      cube.rotation.y += 0.02;
      renderer.render(scene, camera);
    });
  };

  const endAR = async () => {
    await currentSession.end();
    currentSession = null;
    renderer.setAnimationLoop(null);
    arButton.textContent = "Start AR";
  };

  arButton.addEventListener("click", () => {
    if (currentSession) endAR();
    else startAR();
  });
});
