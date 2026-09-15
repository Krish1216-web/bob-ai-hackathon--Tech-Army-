import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface Maritime3DBackgroundProps {
  opacity?: number;
  className?: string;
  theme?: 'dark-ocean' | 'cyber-maritime' | 'light-luminous' | 'subtle';
  activeRoute?: string;
  interactiveScroll?: boolean;
}

export function Maritime3DBackground({
  opacity = 0.88,
  className = '',
  theme = 'cyber-maritime',
  activeRoute = '/app',
  interactiveScroll = true
}: Maritime3DBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef(activeRoute);

  useEffect(() => {
    routeRef.current = activeRoute;
  }, [activeRoute]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. SCENE, ATMOSPHERE & RENDERER
    // ─────────────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020817);
    scene.fog = new THREE.FogExp2(0x041126, 0.0075);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1200);
    camera.position.set(-16, 15, 52);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    container.appendChild(renderer.domElement);

    // ─────────────────────────────────────────────────────────────────────────
    // 2. MULTI-POINT LUMINOUS LIGHTING SYSTEM
    // ─────────────────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x183b63, 3.4);
    scene.add(ambientLight);

    const sunCyan = new THREE.DirectionalLight(0x38bdf8, 6.2);
    sunCyan.position.set(45, 60, 45);
    scene.add(sunCyan);

    const rimBlue = new THREE.PointLight(0x168bff, 6.8, 170);
    rimBlue.position.set(-50, -5, 40);
    scene.add(rimBlue);

    const emeraldAccent = new THREE.PointLight(0x10b981, 4.5, 120);
    emeraldAccent.position.set(30, 20, -15);
    scene.add(emeraldAccent);

    const overheadLight = new THREE.PointLight(0x08b5e5, 4.2, 130);
    overheadLight.position.set(0, 40, 10);
    scene.add(overheadLight);

    // ─────────────────────────────────────────────────────────────────────────
    // 3. AUTONOMOUS CYBER CONTAINER SHIP MODEL
    // ─────────────────────────────────────────────────────────────────────────
    const shipGroup = new THREE.Group();
    scene.add(shipGroup);
    shipGroup.position.set(-4, -2, 4);

    // Materials
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x0a1c36,
      roughness: 0.18,
      metalness: 0.92,
      emissive: 0x031024
    });

    const waterlineGlowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });

    const bridgeMat = new THREE.MeshStandardMaterial({
      color: 0x0f294d,
      roughness: 0.15,
      metalness: 0.94
    });

    const windowGlowMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.95
    });

    // Hull Lower Body
    const hullLowerGeo = new THREE.BoxGeometry(11, 4.2, 42, 4, 2, 8);
    const hullLower = new THREE.Mesh(hullLowerGeo, hullMat);
    hullLower.position.y = 1.0;
    shipGroup.add(hullLower);

    // Hull Flared Bow
    const bowGeo = new THREE.ConeGeometry(5.6, 11.0, 4);
    const bowMesh = new THREE.Mesh(bowGeo, hullMat);
    bowMesh.rotation.x = -Math.PI / 2;
    bowMesh.rotation.y = Math.PI / 4;
    bowMesh.position.set(0, 1.2, 23);
    bowMesh.scale.set(1.0, 1.4, 0.7);
    shipGroup.add(bowMesh);

    // Bulbous Bow Sphere
    const bulbGeo = new THREE.SphereGeometry(1.8, 16, 16);
    const bulbMesh = new THREE.Mesh(bulbGeo, hullMat);
    bulbMesh.position.set(0, -0.6, 27);
    bulbMesh.scale.set(0.9, 0.7, 1.6);
    shipGroup.add(bulbMesh);

    // Waterline Neon Hull Strip
    const waterlineGeo = new THREE.BoxGeometry(11.4, 0.45, 42.5);
    const waterline = new THREE.Mesh(waterlineGeo, waterlineGlowMat);
    waterline.position.y = 0.2;
    shipGroup.add(waterline);

    // Superstructure Navigation Bridge (Stern)
    const bridgeBaseGeo = new THREE.BoxGeometry(9.0, 7.5, 8.0);
    const bridgeBase = new THREE.Mesh(bridgeBaseGeo, bridgeMat);
    bridgeBase.position.set(0, 6.2, -14);
    shipGroup.add(bridgeBase);

    // Bridge Wing Platforms
    const wingGeo = new THREE.BoxGeometry(14.0, 1.2, 3.8);
    const wing = new THREE.Mesh(wingGeo, bridgeMat);
    wing.position.set(0, 8.0, -14);
    shipGroup.add(wing);

    // Panoramic Windows Strip
    const windowStripGeo = new THREE.BoxGeometry(13.6, 1.0, 4.0);
    const windowStrip = new THREE.Mesh(windowStripGeo, windowGlowMat);
    windowStrip.position.set(0, 8.1, -14);
    shipGroup.add(windowStrip);

    // Exhaust Funnel Stacks
    const funnelGeo = new THREE.CylinderGeometry(0.9, 1.2, 5.2, 8);
    const funnelMat = new THREE.MeshStandardMaterial({ color: 0x08b5e5, roughness: 0.2, metalness: 0.85 });
    const funnel = new THREE.Mesh(funnelGeo, funnelMat);
    funnel.position.set(0, 10.6, -16.5);
    funnel.rotation.x = -0.15;
    shipGroup.add(funnel);

    // Radar Mast & Rotating Scanner
    const mastGeo = new THREE.CylinderGeometry(0.14, 0.22, 5.8, 6);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(0, 11.6, -13.5);
    shipGroup.add(mast);

    const radarBarGeo = new THREE.BoxGeometry(2.8, 0.35, 0.45);
    const radarBarMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const radarScanner = new THREE.Mesh(radarBarGeo, radarBarMat);
    radarScanner.position.set(0, 14.4, -13.5);
    shipGroup.add(radarScanner);

    // Navigation Beacon Lights
    const navLightGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const greenNav = new THREE.Mesh(navLightGeo, new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    greenNav.position.set(7.0, 8.2, -14);
    shipGroup.add(greenNav);

    const redNav = new THREE.Mesh(navLightGeo, new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    redNav.position.set(-7.0, 8.2, -14);
    shipGroup.add(redNav);

    // ─────────────────────────────────────────────────────────────────────────
    // 4. MODULAR 3D CARGO CONTAINERS (48 Units)
    // ─────────────────────────────────────────────────────────────────────────
    const containerColors = [0x08b5e5, 0x168bff, 0x10b981, 0x38bdf8, 0x60a5fa, 0x06b6d4];
    const containerGeos = [
      new THREE.BoxGeometry(2.4, 2.4, 6.0),
      new THREE.BoxGeometry(2.4, 2.4, 7.0)
    ];

    const containerGroup = new THREE.Group();
    shipGroup.add(containerGroup);

    const rows = 5;
    const cols = 3;
    const tiers = 3;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const heightTier = Math.floor(Math.random() * tiers) + 1;
        for (let t = 0; t < heightTier; t++) {
          const colHex = containerColors[(r * 3 + c + t) % containerColors.length];
          const cMat = new THREE.MeshStandardMaterial({
            color: colHex,
            roughness: 0.25,
            metalness: 0.7,
            emissive: colHex,
            emissiveIntensity: 0.4
          });

          const cMesh = new THREE.Mesh(containerGeos[(r + c) % containerGeos.length], cMat);
          const posX = (c - 1) * 2.8;
          const posY = 3.9 + t * 2.5;
          const posZ = -3 + r * 4.2;
          cMesh.position.set(posX, posY, posZ);

          const edgeGeo = new THREE.EdgesGeometry(cMesh.geometry);
          const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
          const edges = new THREE.LineSegments(edgeGeo, edgeMat);
          cMesh.add(edges);

          containerGroup.add(cMesh);
        }
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. WAKE & FOAM PARTICLES
    // ─────────────────────────────────────────────────────────────────────────
    const wakeCount = 180;
    const wakeGeo = new THREE.BufferGeometry();
    const wakePositions = new Float32Array(wakeCount * 3);

    const wakeData = Array.from({ length: wakeCount }, (_, i) => ({
      x: (Math.random() - 0.5) * (i * 0.3 + 4.8),
      y: -0.2,
      z: -18 - (i * 0.75 + Math.random() * 2),
      speed: 0.48 + Math.random() * 0.35,
      spread: (Math.random() - 0.5) * 0.1
    }));

    for (let i = 0; i < wakeCount; i++) {
      wakePositions[i * 3] = wakeData[i].x;
      wakePositions[i * 3 + 1] = wakeData[i].y;
      wakePositions[i * 3 + 2] = wakeData[i].z;
    }

    wakeGeo.setAttribute('position', new THREE.BufferAttribute(wakePositions, 3));
    const wakeMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 2.4,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const wakeSystem = new THREE.Points(wakeGeo, wakeMat);
    shipGroup.add(wakeSystem);

    // ─────────────────────────────────────────────────────────────────────────
    // 6. UNDULATING OCEANIC NEON CYBER WAVES
    // ─────────────────────────────────────────────────────────────────────────
    const oceanCols = 60;
    const oceanRows = 60;
    const oceanGeo = new THREE.PlaneGeometry(280, 280, oceanCols, oceanRows);
    const oceanMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.42
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanMesh.rotation.x = -Math.PI / 2;
    oceanMesh.position.set(0, -3.2, 0);
    scene.add(oceanMesh);

    // ─────────────────────────────────────────────────────────────────────────
    // 7. FLOATING OCEAN NAVIGATION BUOYS
    // ─────────────────────────────────────────────────────────────────────────
    const buoys: { mesh: THREE.Group; baseY: number; floatSpeed: number; floatOffset: number }[] = [];
    const buoyPositions = [
      { x: -38, z: 30, col: 0xef4444 },
      { x: 38, z: 22, col: 0x10b981 },
      { x: -32, z: -14, col: 0xef4444 },
      { x: 34, z: -24, col: 0x10b981 },
      { x: -40, z: -55, col: 0xef4444 },
      { x: 42, z: -60, col: 0x10b981 }
    ];

    buoyPositions.forEach((pos, idx) => {
      const buoyGroup = new THREE.Group();
      
      const bGeo = new THREE.CylinderGeometry(0.9, 1.5, 2.6, 8);
      const bMat = new THREE.MeshStandardMaterial({ color: 0x132a4e, metalness: 0.85 });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      buoyGroup.add(bMesh);

      const beaconLightGeo = new THREE.SphereGeometry(0.55, 8, 8);
      const beaconLightMat = new THREE.MeshBasicMaterial({ color: pos.col });
      const bLight = new THREE.Mesh(beaconLightGeo, beaconLightMat);
      bLight.position.y = 2.4;
      buoyGroup.add(bLight);

      const bRingGeo = new THREE.RingGeometry(1.4, 2.4, 16);
      const bRingMat = new THREE.MeshBasicMaterial({ color: pos.col, side: THREE.DoubleSide, transparent: true, opacity: 0.65 });
      const bRing = new THREE.Mesh(bRingGeo, bRingMat);
      bRing.rotation.x = -Math.PI / 2;
      bRing.position.y = 0.1;
      buoyGroup.add(bRing);

      buoyGroup.position.set(pos.x, -3.0, pos.z);
      scene.add(buoyGroup);

      buoys.push({
        mesh: buoyGroup,
        baseY: -3.0,
        floatSpeed: 1.2 + Math.random() * 0.5,
        floatOffset: idx * 1.1
      });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 8. GLOBAL TRADE CORRIDOR ARCS
    // ─────────────────────────────────────────────────────────────────────────
    const arcCurves: THREE.QuadraticBezierCurve3[] = [];
    const arcBeacons: { mesh: THREE.Mesh; curveIndex: number; t: number; speed: number }[] = [];
    const arcMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });

    const corridors = [
      { start: new THREE.Vector3(-75, -1, 55), end: new THREE.Vector3(65, -1, 40), h: 36 },
      { start: new THREE.Vector3(-60, -1, 20), end: new THREE.Vector3(80, -1, -30), h: 42 },
      { start: new THREE.Vector3(-45, -1, -40), end: new THREE.Vector3(60, -1, -85), h: 38 }
    ];

    corridors.forEach((cr, idx) => {
      const mid = new THREE.Vector3().addVectors(cr.start, cr.end).multiplyScalar(0.5).add(new THREE.Vector3(0, cr.h, 0));
      const curve = new THREE.QuadraticBezierCurve3(cr.start, mid, cr.end);
      arcCurves.push(curve);

      const pts = curve.getPoints(36);
      const curveLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), arcMat);
      scene.add(curveLine);

      const bcn = new THREE.Mesh(
        new THREE.SphereGeometry(0.85, 8, 8),
        new THREE.MeshBasicMaterial({ color: idx % 2 === 0 ? 0x08b5e5 : 0x10b981 })
      );
      scene.add(bcn);
      arcBeacons.push({ mesh: bcn, curveIndex: idx, t: Math.random(), speed: 0.003 + (idx + 1) * 0.001 });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 9. 2,500 PARTICLES & ATMOSPHERIC CYBER DUST
    // ─────────────────────────────────────────────────────────────────────────
    const particleCount = 2500;
    const partGeo = new THREE.BufferGeometry();
    const partPositions = new Float32Array(particleCount * 3);
    const partColors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color(0x38bdf8),
      new THREE.Color(0x08b5e5),
      new THREE.Color(0x10b981),
      new THREE.Color(0x93c5fd),
      new THREE.Color(0xffffff)
    ];

    for (let i = 0; i < particleCount; i++) {
      partPositions[i * 3] = (Math.random() - 0.5) * 320;
      partPositions[i * 3 + 1] = Math.random() * 110 - 15;
      partPositions[i * 3 + 2] = (Math.random() - 0.5) * 280;

      const c = palette[Math.floor(Math.random() * palette.length)];
      partColors[i * 3] = c.r;
      partColors[i * 3 + 1] = c.g;
      partColors[i * 3 + 2] = c.b;
    }

    partGeo.setAttribute('position', new THREE.BufferAttribute(partPositions, 3));
    partGeo.setAttribute('color', new THREE.BufferAttribute(partColors, 3));

    const partMat = new THREE.PointsMaterial({
      size: 1.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(partGeo, partMat);
    scene.add(particleSystem);

    // ─────────────────────────────────────────────────────────────────────────
    // 10. ROUTE CAMERA POSITIONS & DYNAMIC STAGING
    // ─────────────────────────────────────────────────────────────────────────
    const getTargetCameraForRoute = (route: string) => {
      switch (route) {
        case '/shipments':
          // Low-angle deck view focusing on container stacks
          return { camX: -8, camY: 8, camZ: 36, lookX: 0, lookY: 4, lookZ: 0 };
        case '/disruptions':
          // Dramatic storm bow-facing angle
          return { camX: 4, camY: 9, camZ: 44, lookX: -5, lookY: 2, lookZ: 10 };
        case '/fleet':
          // Wide elevated convoy view showing main ship and escort vessels
          return { camX: -22, camY: 28, camZ: 65, lookX: 0, lookY: 0, lookZ: -5 };
        case '/cold-chain':
          // Cryo reefer container inspection angle
          return { camX: -12, camY: 10, camZ: 32, lookX: -2, lookY: 5, lookZ: 2 };
        case '/command-center':
          // High-altitude satellite tactical overview
          return { camX: -18, camY: 34, camZ: 58, lookX: 5, lookY: 0, lookZ: -10 };
        case '/copilot':
          // Digital twin cyberpunk holographic perspective
          return { camX: -6, camY: 14, camZ: 42, lookX: -2, lookY: 3, lookZ: 0 };
        case '/what-if':
          // Tactical simulation trajectory perspective
          return { camX: -15, camY: 22, camZ: 50, lookX: 2, lookY: 1, lookZ: -8 };
        case '/login':
        case '/signup':
          // Prominent showcase angle spanning left & center
          return { camX: -14, camY: 12, camZ: 48, lookX: -2, lookY: 2, lookZ: 2 };
        case '/app':
        case '/control-tower':
        default:
          // Isometric 3/4 navigation corridor
          return { camX: -16, camY: 15, camZ: 52, lookX: 0, lookY: 2, lookZ: 0 };
      }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // 11. SCROLL & MOUSE INTERACTIVITY (Supports Window & Div Scrolling)
    // ─────────────────────────────────────────────────────────────────────────
    let scrollY = window.scrollY || 0;
    let targetScrollProgress = 0;
    let currentScrollProgress = 0;

    const handleScroll = (e?: Event) => {
      const scrollable = document.querySelector('.main-area') || document.querySelector('.content-area') || document.documentElement;
      const target = (e && e.target && (e.target as HTMLElement).scrollHeight) ? (e.target as HTMLElement) : null;
      const el = target || (scrollable.scrollHeight > window.innerHeight ? scrollable : document.documentElement);
      const curScroll = el.scrollTop || window.scrollY || window.pageYOffset || 0;
      const maxScroll = Math.max(1, el.scrollHeight - (el.clientHeight || window.innerHeight));
      scrollY = curScroll;
      targetScrollProgress = Math.min(1, Math.max(0, curScroll / maxScroll));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    handleScroll();

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);

    // ─────────────────────────────────────────────────────────────────────────
    // 12. REAL-TIME ANIMATION LOOP
    // ─────────────────────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth interpolation for scroll & mouse
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.08;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const sp = currentScrollProgress;
      const targetCam = getTargetCameraForRoute(routeRef.current);

      const targetCamX = targetCam.camX + sp * 28 + mouseX * 3.5;
      const targetCamY = targetCam.camY + Math.sin(sp * Math.PI) * 8 - mouseY * 2.5;
      const targetCamZ = targetCam.camZ - sp * 45;

      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.position.z += (targetCamZ - camera.position.z) * 0.05;

      const lookTarget = new THREE.Vector3(
        targetCam.lookX + shipGroup.position.x * 0.2,
        targetCam.lookY + shipGroup.position.y * 0.2,
        targetCam.lookZ
      );
      camera.lookAt(lookTarget);

      // Ship floating buoyancy physics
      shipGroup.position.y = -1.8 + Math.sin(time * 1.2) * 0.7;
      shipGroup.rotation.z = Math.sin(time * 0.95) * 0.04;
      shipGroup.rotation.x = Math.cos(time * 0.75) * 0.035 + sp * 0.05;
      shipGroup.rotation.y = 0.18 + Math.sin(time * 0.35) * 0.02 + sp * 0.2;

      // Rotate Radar Scanner
      radarScanner.rotation.y = time * 4.2;

      // Animate Undulating Waves
      const posAttr = oceanGeo.attributes.position;
      const waveSpeed = time * 1.5 + sp * 3.5;
      for (let i = 0; i < posAttr.count; i++) {
        const vx = posAttr.getX(i);
        const vy = posAttr.getY(i);
        const zWave = Math.sin(vx * 0.07 + waveSpeed) * 2.3 +
                      Math.cos(vy * 0.08 + waveSpeed * 0.9) * 1.7 +
                      Math.sin((vx + vy) * 0.05 + waveSpeed * 1.2) * 1.0;
        posAttr.setZ(i, zWave);
      }
      posAttr.needsUpdate = true;

      // Animate Wake Particles
      const wakePos = wakeGeo.attributes.position;
      for (let i = 0; i < wakeCount; i++) {
        let wz = wakePositions[i * 3 + 2] - wakeData[i].speed;
        if (wz < -85) {
          wz = -18;
        }
        wakePositions[i * 3 + 2] = wz;
        wakePositions[i * 3] += wakeData[i].spread;
        if (Math.abs(wakePositions[i * 3]) > 16) {
          wakePositions[i * 3] = (Math.random() - 0.5) * 4.8;
        }
      }
      wakePos.needsUpdate = true;

      // Animate Navigation Buoys
      buoys.forEach(b => {
        b.mesh.position.y = b.baseY + Math.sin(time * b.floatSpeed + b.floatOffset) * 0.8;
        b.mesh.rotation.z = Math.sin(time * b.floatSpeed * 0.8) * 0.08;
      });

      // Animate Trade Corridor Arcs
      arcBeacons.forEach(b => {
        b.t = (b.t + b.speed) % 1;
        const curve = arcCurves[b.curveIndex];
        if (curve) {
          b.mesh.position.copy(curve.getPoint(b.t));
        }
      });

      // Drift starfield particles
      particleSystem.rotation.y = time * 0.02 + sp * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    // ─────────────────────────────────────────────────────────────────────────
    // 13. CLEANUP ON UNMOUNT
    // ─────────────────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      hullLowerGeo.dispose();
      bowGeo.dispose();
      bulbGeo.dispose();
      waterlineGeo.dispose();
      bridgeBaseGeo.dispose();
      wingGeo.dispose();
      windowStripGeo.dispose();
      funnelGeo.dispose();
      mastGeo.dispose();
      radarBarGeo.dispose();
      navLightGeo.dispose();
      wakeGeo.dispose();
      oceanGeo.dispose();
      partGeo.dispose();
    };
  }, [theme]);

  return (
    <div
      ref={mountRef}
      className={`maritime-3d-background ${className}`}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: opacity,
        overflow: 'hidden',
        transition: 'opacity 0.5s ease'
      }}
    />
  );
}

export default Maritime3DBackground;
