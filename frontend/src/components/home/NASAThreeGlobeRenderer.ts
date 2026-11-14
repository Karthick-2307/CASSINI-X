import * as THREE from "three";
import earthTextureUrl from "/textures/earth.jpg?url";
import marsTextureUrl from "/textures/mars.jpg?url";
import moonTextureUrl from "/textures/moon.jpg?url";
import cloudsTextureUrl from "/textures/earth_clouds.png?url";

export type GlobePlanet = "earth" | "moon" | "mars";

export interface PlanetConfig {
  name: string;
  textureUrl: string;
  axialTiltDeg: number;
  rotationPeriod: string;
  glowColor: number;
  oceanSpecular: boolean;
  provenance: string;
}

export const PLANET_CONFIGS: Record<GlobePlanet, PlanetConfig> = {
  earth: {
    name: "Earth (Terra)",
    textureUrl: earthTextureUrl,
    axialTiltDeg: 23.44,
    rotationPeriod: "23.93 hours",
    glowColor: 0x38bdf8,
    oceanSpecular: true,
    provenance: "NASA Visible Earth • Blue Marble",
  },
  moon: {
    name: "Moon (Luna)",
    textureUrl: moonTextureUrl,
    axialTiltDeg: 1.54,
    rotationPeriod: "27.32 days",
    glowColor: 0x94a3b8,
    oceanSpecular: false,
    provenance: "NASA LRO / Clementine Mosaic",
  },
  mars: {
    name: "Mars",
    textureUrl: marsTextureUrl,
    axialTiltDeg: 25.19,
    rotationPeriod: "24.62 hours",
    glowColor: 0xf97316,
    oceanSpecular: false,
    provenance: "NASA Viking & MOLA Global Map",
  },
};

export class NASAThreeGlobeScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private planetGroup: THREE.Group;
  private sphereMesh: THREE.Mesh;
  private cloudsMesh: THREE.Mesh;
  private atmosphereMesh: THREE.Mesh;
  private material: THREE.MeshStandardMaterial;
  private cloudsMaterial: THREE.MeshStandardMaterial;
  private textureCache: Map<string, THREE.Texture> = new Map();
  private textureLoader: THREE.TextureLoader = new THREE.TextureLoader();
  private animFrameId: number | null = null;
  private currentPlanet: GlobePlanet = "earth";
  private isRotating: boolean = true;
  private speedFactor: number = 1.0;
  private isDragging: boolean = false;
  private lastPointer: { x: number; y: number } = { x: 0, y: 0 };
  private pitch: number = 0;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.z = 4.2;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.planetGroup = new THREE.Group();
    this.scene.add(this.planetGroup);

    // Natural solar lighting for NASA-style illuminated planet and shadow terminator
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.28);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8ee, 2.4);
    sunLight.position.set(-6.0, 2.2, 4.0);
    this.scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.35);
    rimLight.position.set(5.5, -2.0, -2.5);
    this.scene.add(rimLight);

    // Subtle 3D background starfield particles
    const starCount = 500;
    const starGeo = new THREE.BufferGeometry();
    const starCoords = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starCoords[i] = (Math.random() - 0.5) * 60;
      starCoords[i + 1] = (Math.random() - 0.5) * 60;
      starCoords[i + 2] = -10 - Math.random() * 25;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starCoords, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.16,
      transparent: true,
      opacity: 0.7,
    });
    const starField = new THREE.Points(starGeo, starMat);
    this.scene.add(starField);

    // High tessellation sphere for surface
    const sphereGeo = new THREE.SphereGeometry(1.5, 64, 64);
    this.material = new THREE.MeshStandardMaterial({
      roughness: 0.55,
      metalness: 0.05,
    });
    this.sphereMesh = new THREE.Mesh(sphereGeo, this.material);
    this.planetGroup.add(this.sphereMesh);

    // Real atmospheric cloud layer for Earth
    const cloudsGeo = new THREE.SphereGeometry(1.514, 64, 64);
    const cloudsTex = this.textureLoader.load(cloudsTextureUrl);
    cloudsTex.wrapS = THREE.RepeatWrapping;
    this.cloudsMaterial = new THREE.MeshStandardMaterial({
      map: cloudsTex,
      transparent: true,
      opacity: 0.88,
      blending: THREE.NormalBlending,
      roughness: 0.9,
    });
    this.cloudsMesh = new THREE.Mesh(cloudsGeo, this.cloudsMaterial);
    this.planetGroup.add(this.cloudsMesh);

    // Atmospheric Glow Halo Shell
    const atmosGeo = new THREE.SphereGeometry(1.528, 48, 48);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
    });
    this.atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
    this.planetGroup.add(this.atmosphereMesh);

    this.setupInteractivity(canvas);
    this.setPlanet("earth");
    this.startLoop();
  }

  public setPlanet(planet: GlobePlanet): void {
    this.currentPlanet = planet;
    const cfg = PLANET_CONFIGS[planet];

    // Apply accurate physical axial tilt
    this.planetGroup.rotation.z = THREE.MathUtils.degToRad(cfg.axialTiltDeg);

    // Cloud layer visibility & planetary material tuning
    if (planet === "earth") {
      this.cloudsMesh.visible = true;
      this.material.roughness = 0.55;
      this.material.metalness = 0.06;
    } else if (planet === "moon") {
      this.cloudsMesh.visible = false;
      this.material.roughness = 0.92;
      this.material.metalness = 0.0;
    } else {
      this.cloudsMesh.visible = false;
      this.material.roughness = 0.72;
      this.material.metalness = 0.03;
    }

    const atmosMat = this.atmosphereMesh.material as THREE.MeshBasicMaterial;
    atmosMat.color.setHex(cfg.glowColor);
    atmosMat.opacity = planet === "earth" ? 0.25 : 0.12;

    // Load or reuse cached texture
    if (this.textureCache.has(cfg.textureUrl)) {
      this.material.map = this.textureCache.get(cfg.textureUrl)!;
      this.material.needsUpdate = true;
    } else {
      this.textureLoader.load(cfg.textureUrl, (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.generateMipmaps = true;
        this.textureCache.set(cfg.textureUrl, tex);
        if (this.currentPlanet === planet) {
          this.material.map = tex;
          this.material.needsUpdate = true;
        }
      });
    }
  }

  public setRotation(rotating: boolean): void {
    this.isRotating = rotating;
  }

  public setSpeed(multiplier: number): void {
    this.speedFactor = multiplier;
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private setupInteractivity(canvas: HTMLCanvasElement): void {
    const onDown = (clientX: number, clientY: number) => {
      this.isDragging = true;
      this.lastPointer = { x: clientX, y: clientY };
    };

    const onMove = (clientX: number, clientY: number) => {
      if (!this.isDragging) return;
      const dx = clientX - this.lastPointer.x;
      const dy = clientY - this.lastPointer.y;

      this.sphereMesh.rotation.y += dx * 0.006;
      if (this.cloudsMesh) {
        this.cloudsMesh.rotation.y += dx * 0.006;
      }
      this.pitch = Math.max(-0.6, Math.min(0.6, this.pitch + dy * 0.006));
      this.planetGroup.rotation.x = this.pitch;

      this.lastPointer = { x: clientX, y: clientY };
    };

    const onUp = () => {
      this.isDragging = false;
    };

    canvas.addEventListener("mousedown", (e) => onDown(e.clientX, e.clientY));
    window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
    window.addEventListener("mouseup", onUp);

    canvas.addEventListener("touchstart", (e) => {
      if (e.touches[0]) onDown(e.touches[0].clientX, e.touches[0].clientY);
    });
    window.addEventListener("touchmove", (e) => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    });
    window.addEventListener("touchend", onUp);
  }

  private startLoop(): void {
    const normalBaseSpeed = 0.0022; // ~1 rotation every 47 seconds at 1x speed

    const animate = () => {
      if (this.isRotating && !this.isDragging) {
        this.sphereMesh.rotation.y += normalBaseSpeed * this.speedFactor;
        if (this.currentPlanet === "earth" && this.cloudsMesh) {
          // Dynamic cloud parallax drift across continents
          this.cloudsMesh.rotation.y += normalBaseSpeed * this.speedFactor * 1.16;
        }
      }
      this.renderer.render(this.scene, this.camera);
      this.animFrameId = requestAnimationFrame(animate);
    };

    animate();
  }

  public dispose(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.sphereMesh.geometry.dispose();
    this.material.dispose();
    this.cloudsMesh.geometry.dispose();
    this.cloudsMaterial.dispose();
    this.atmosphereMesh.geometry.dispose();
    (this.atmosphereMesh.material as THREE.Material).dispose();
    this.textureCache.forEach((tex) => tex.dispose());
    this.textureCache.clear();
    this.renderer.dispose();
  }
}
