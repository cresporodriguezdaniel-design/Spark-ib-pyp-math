import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

interface ThreePlanetHeroProps {
  onPlanetClick: () => void;
  interactive?: boolean;
}

export const ThreePlanetHero: React.FC<ThreePlanetHeroProps> = ({
  onPlanetClick,
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const onPlanetClickRef = useRef(onPlanetClick);
  onPlanetClickRef.current = onPlanetClick;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let frameId = 0;
    let isDisposed = false;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Environment Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio Lights
    const keyLight = new THREE.DirectionalLight(0xfff4e0, 2.5);
    keyLight.position.set(5, 4, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.8);
    rimLight.position.set(-6, -2, -4);
    scene.add(rimLight);

    const ambientLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.8);
    scene.add(ambientLight);

    // Earth Procedural Texture Generation (Canvas 512x256)
    const earthCanvas = document.createElement('canvas');
    earthCanvas.width = 1024;
    earthCanvas.height = 512;
    const ctx = earthCanvas.getContext('2d')!;

    // Deep ocean base
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
    oceanGrad.addColorStop(0, '#173f7a');
    oceanGrad.addColorStop(0.5, '#1e5bb8');
    oceanGrad.addColorStop(1, '#173f7a');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Procedural continents & landmasses
    ctx.fillStyle = '#22c55e'; // Green lush land
    const drawBlob = (cx: number, cy: number, r: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
        const rad = r * (0.8 + Math.sin(angle * 4 + cx) * 0.2 + Math.cos(angle * 3) * 0.15);
        const x = cx + Math.cos(angle) * rad;
        const y = cy + Math.sin(angle) * rad;
        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    };

    // Draw stylized continents
    drawBlob(260, 180, 120, '#34d399'); // North America
    drawBlob(340, 320, 90, '#10b981');  // South America
    drawBlob(540, 160, 110, '#34d399'); // Europe
    drawBlob(560, 290, 130, '#eab308'); // Africa
    drawBlob(720, 170, 160, '#10b981'); // Asia
    drawBlob(820, 350, 80, '#f59e0b');  // Australia
    drawBlob(500, 480, 60, '#f8fafc');  // Antarctica ice
    drawBlob(500, 20, 50, '#f8fafc');   // Arctic ice

    // Clouds overlay on canvas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let i = 0; i < 40; i++) {
      const rx = (i * 97) % 1024;
      const ry = 80 + (i * 63) % 350;
      ctx.beginPath();
      ctx.ellipse(rx, ry, 60 + (i % 5) * 15, 18 + (i % 3) * 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const earthTexture = new THREE.CanvasTexture(earthCanvas);
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Planet Earth Mesh
    const earthGeometry = new THREE.SphereGeometry(1.8, 48, 48);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.65,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);

    // Atmosphere Glow Sphere
    const atmosGeometry = new THREE.SphereGeometry(1.88, 32, 32);
    const atmosMaterial = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeometry, atmosMaterial);
    scene.add(atmosMesh);

    // Orbit Ring for the Golden Prism Star
    const orbitRadius = 2.9;
    const ringGeometry = new THREE.RingGeometry(orbitRadius - 0.03, orbitRadius + 0.03, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const orbitRing = new THREE.Mesh(ringGeometry, ringMaterial);
    orbitRing.rotation.x = Math.PI * 0.38;
    orbitRing.rotation.y = Math.PI * 0.15;
    scene.add(orbitRing);

    // Spark Golden Star Prism Group
    const starGroup = new THREE.Group();

    // Central 3D Octahedron / Stellate Star Prism
    const starGeom = new THREE.OctahedronGeometry(0.55, 0);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.45,
      roughness: 0.18,
      metalness: 0.9,
    });
    const mainStar = new THREE.Mesh(starGeom, starMat);
    starGroup.add(mainStar);

    // Secondary intersecting rotated diamond prism for 8-point sparkle
    const starSecondaryGeom = new THREE.OctahedronGeometry(0.48, 0);
    const starSecondaryMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xb45309,
      emissiveIntensity: 0.3,
      roughness: 0.2,
      metalness: 0.85,
    });
    const secondaryStar = new THREE.Mesh(starSecondaryGeom, starSecondaryMat);
    secondaryStar.rotation.x = Math.PI / 4;
    secondaryStar.rotation.y = Math.PI / 4;
    starGroup.add(secondaryStar);

    // Mini orbiting sparkles
    const sparklesCount = 6;
    const sparklesMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
    for (let i = 0; i < sparklesCount; i++) {
      const miniGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), sparklesMat);
      const angle = (i / sparklesCount) * Math.PI * 2;
      miniGem.position.set(Math.cos(angle) * 0.75, Math.sin(angle) * 0.75, 0);
      starGroup.add(miniGem);
    }

    scene.add(starGroup);

    // Raycaster for clicking Earth or Star
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getPointerPos = (e: MouseEvent | Touch) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      return { x, y };
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (!interactive) return;
      const pos = getPointerPos(e);
      mouse.x = pos.x;
      mouse.y = pos.y;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([earthMesh, mainStar], true);
      const hovered = intersects.length > 0;
      setIsHovered(hovered);
      container.style.cursor = hovered ? 'pointer' : 'default';
    };

    const handleClick = (e: MouseEvent) => {
      if (!interactive) return;
      const pos = getPointerPos(e);
      mouse.x = pos.x;
      mouse.y = pos.y;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([earthMesh, mainStar, secondaryStar], true);
      if (intersects.length > 0) {
        onPlanetClickRef.current();
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handleClick);

    // Animation Loop
    let orbitAngle = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (isDisposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);

      // Rotate planet
      earthMesh.rotation.y += dt * 0.45;
      earthMesh.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.05;

      // Orbit the Golden Prism Star around the Earth on inclined plane
      orbitAngle += dt * 0.95;
      const ox = Math.cos(orbitAngle) * orbitRadius;
      const oz = Math.sin(orbitAngle) * orbitRadius;
      // apply inclination
      const starPos = new THREE.Vector3(ox, oz * 0.35, oz * 0.92);
      starGroup.position.copy(starPos);

      // Spin the prism star itself
      mainStar.rotation.x += dt * 1.8;
      mainStar.rotation.y += dt * 2.2;
      secondaryStar.rotation.y -= dt * 1.5;

      // Soft hover scale reaction
      const targetScale = isHovered ? 1.05 : 1.0;
      earthMesh.scale.setScalar(THREE.MathUtils.damp(earthMesh.scale.x, targetScale, 6, dt));

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handleClick);

      earthGeometry.dispose();
      earthMaterial.dispose();
      earthTexture.dispose();
      atmosGeometry.dispose();
      atmosMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      starGeom.dispose();
      starMat.dispose();
      starSecondaryGeom.dispose();
      starSecondaryMat.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive, isHovered]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div
        ref={mountRef}
        className="w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] cursor-pointer relative"
      />
    </div>
  );
};
