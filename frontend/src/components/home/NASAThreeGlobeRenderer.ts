import * as THREE from "three";
import earthTextureUrl from "/textures/earth.jpg?url";
import marsTextureUrl from "/textures/mars.jpg?url";
import moonTextureUrl from "/textures/moon.jpg?url";
import cloudsTextureUrl from "/textures/earth_clouds.png?url";

export type GlobePlanet = "mars" | "earth" | "moon";

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
  mars: {
    name: "Mars",
    textureUrl: marsTextureUrl,
    axialTiltDeg: 25.19,
    rotationPeriod: "24.62 hours",
    glowColor: 0xf97316,
    oceanSpecular: false,
    provenance: "NASA Viking & MOLA Global Map",
  },
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
  private currentPlanet: GlobePlanet = "mars";
  private isRotating: boolean = true;
  private speedFactor: number = 1.0;
  private isDragging: boolean = false;
  private lastPointer: { x: number; y: number } = { x: 0, y: 0 };
  private pitch: number = 0;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.scene = new THREE.Scene();

    // Cinematic perspective camera (SpaceX scale)
    this.camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    this.camera.position.z = 3.65;

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

    // Deep space realistic solar lighting (SpaceX aesthetic)
    // 1. Very faint ambient light so the shadow side fades seamlessly into deep space black #000000
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.035);
    this.scene.add(ambientLight);

    // 2. Powerful directional sunlight coming from the left / front-left
    // Creates the high-contrast day/night terminator line matching SpaceX imagery
    const sunLight = new THREE.DirectionalLight(0xfff6ec, 3.8);
    sunLight.position.set(-7.5, 0.4, 2.0);
    this.scene.add(sunLight);

    // 3. Faint warm rim light on the dark silhouette
    const rimLight = new THREE.DirectionalLight(0x7c2d12, 0.16);
    rimLight.position.set(5.5, 0.0, -3.0);
    this.scene.add(rimLight);

    // High tessellation sphere for crisp spherical surface
    const sphereGeo = new THREE.SphereGeometry(1.55, 96, 96);
    this.material = new THREE.MeshStandardMaterial({
      roughness: 0.85,
      metalness: 0.0,
    });
    this.sphereMesh = new THREE.Mesh(sphereGeo, this.material);
    this.planetGroup.add(this.sphereMesh);

    // Cloud layer for Earth
    const cloudsGeo = new THREE.SphereGeometry(1.565, 80, 80);
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
    this.cloudsMesh.visible = false;
    this.planetGroup.add(this.cloudsMesh);

    // Subtle Atmospheric Glow Shell
    const atmosGeo = new THREE.SphereGeometry(1.58, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    this.atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
    this.planetGroup.add(this.atmosphereMesh);

    this.setupInteractivity(canvas);
    this.setPlanet("mars");
    this.startLoop();
  }

  public setPlanet(planet: GlobePlanet): void {
    this.currentPlanet = planet;
    const cfg = PLANET_CONFIGS[planet];

    // Apply accurate physical axial tilt
    this.planetGroup.rotation.z = THREE.MathUtils.degToRad(cfg.axialTiltDeg);

    // Planet-specific surface materials
    if (planet === "mars") {
      this.cloudsMesh.visible = false;
      this.material.roughness = 0.82;
      this.material.metalness = 0.0;
    } else if (planet === "earth") {
      this.cloudsMesh.visible = true;
      this.material.roughness = 0.55;
      this.material.metalness = 0.06;
    } else {
      this.cloudsMesh.visible = false;
      this.material.roughness = 0.95;
      this.material.metalness = 0.0;
    }

    const atmosMat = this.atmosphereMesh.material as THREE.MeshBasicMaterial;
    atmosMat.color.setHex(cfg.glowColor);
    atmosMat.opacity = planet === "earth" ? 0.22 : planet === "mars" ? 0.08 : 0.0;

    // Load texture with anisotropic filtering for maximum crispness
    if (this.textureCache.has(cfg.textureUrl)) {
      this.material.map = this.textureCache.get(cfg.textureUrl)!;
      this.material.needsUpdate = true;
    } else {
      this.textureLoader.load(cfg.textureUrl, (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.generateMipmaps = true;
        if (this.renderer.capabilities.getMaxAnisotropy) {
          tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        }
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

      this.sphereMesh.rotation.y += dx * 0.005;
      if (this.cloudsMesh) {
        this.cloudsMesh.rotation.y += dx * 0.005;
      }
      this.pitch = Math.max(-0.5, Math.min(0.5, this.pitch + dy * 0.005));
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
    // Majestic, calm axial rotation (~1 rotation every 65 seconds)
    const normalBaseSpeed = 0.0014;

    const animate = () => {
      if (this.isRotating && !this.isDragging) {
        this.sphereMesh.rotation.y += normalBaseSpeed * this.speedFactor;
        if (this.currentPlanet === "earth" && this.cloudsMesh) {
          this.cloudsMesh.rotation.y += normalBaseSpeed * this.speedFactor * 1.14;
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
