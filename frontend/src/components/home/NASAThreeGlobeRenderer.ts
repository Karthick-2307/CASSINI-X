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
  private material: THREE.MeshStandardMaterial;
  private cloudsMaterial: THREE.MeshStandardMaterial;
  private sunLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
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

    // Perspective camera tuned so the entire round spherical silhouette is fully visible with breathing room
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 4.8);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0); // 100% transparent background - no square box

    this.planetGroup = new THREE.Group();
    this.scene.add(this.planetGroup);

    // Realistic deep space solar lighting (SpaceX / Apollo orbital perspective)
    // Ambient cosmic background light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.08);
    this.scene.add(ambientLight);

    // Key sunlight illuminating the visible round hemisphere from the upper-left
    this.sunLight = new THREE.DirectionalLight(0xfff8ee, 3.4);
    this.sunLight.position.set(-5.5, 1.8, 3.5);
    this.scene.add(this.sunLight);

    // Subtle edge rim light highlighting the spherical limb in space
    this.rimLight = new THREE.DirectionalLight(0xf97316, 0.25);
    this.rimLight.position.set(4.5, -0.5, -2.5);
    this.scene.add(this.rimLight);

    // Perfectly round sphere geometry with high subdivision for ultra-smooth silhouette
    // Radius = 1.25 gives an unmistakably round sphere taking ~76% of canvas with clean margins
    const sphereGeo = new THREE.SphereGeometry(1.25, 96, 96);
    this.material = new THREE.MeshStandardMaterial({
      roughness: 0.82,
      metalness: 0.0,
    });
    this.sphereMesh = new THREE.Mesh(sphereGeo, this.material);
    this.planetGroup.add(this.sphereMesh);

    // Cloud layer for Earth (round shell just above Earth's surface)
    const cloudsGeo = new THREE.SphereGeometry(1.262, 80, 80);
    const cloudsTex = this.textureLoader.load(cloudsTextureUrl);
    cloudsTex.wrapS = THREE.RepeatWrapping;
    this.cloudsMaterial = new THREE.MeshStandardMaterial({
      map: cloudsTex,
      transparent: true,
      opacity: 0.82,
      blending: THREE.NormalBlending,
      roughness: 0.9,
    });
    this.cloudsMesh = new THREE.Mesh(cloudsGeo, this.cloudsMaterial);
    this.cloudsMesh.visible = false;
    this.planetGroup.add(this.cloudsMesh);

    this.setupInteractivity(canvas);
    this.setPlanet("mars");
    this.startLoop();
  }

  public setPlanet(planet: GlobePlanet): void {
    this.currentPlanet = planet;
    const cfg = PLANET_CONFIGS[planet];

    // Apply accurate physical axial tilt
    this.planetGroup.rotation.z = THREE.MathUtils.degToRad(cfg.axialTiltDeg);

    // Planet-specific surface materials and lighting colors
    if (planet === "mars") {
      this.cloudsMesh.visible = false;
      this.material.roughness = 0.82;
      this.material.metalness = 0.0;
      this.rimLight.color.setHex(0xf97316);
      this.rimLight.intensity = 0.22;
    } else if (planet === "earth") {
      this.cloudsMesh.visible = true;
      this.material.roughness = 0.52;
      this.material.metalness = 0.08;
      this.rimLight.color.setHex(0x38bdf8);
      this.rimLight.intensity = 0.35;
    } else {
      // Moon
      this.cloudsMesh.visible = false;
      this.material.roughness = 0.94;
      this.material.metalness = 0.0;
      this.rimLight.color.setHex(0xe2e8f0);
      this.rimLight.intensity = 0.20;
    }

    // Load texture with anisotropic filtering for crisp craters and terrain relief
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
      this.pitch = Math.max(-0.4, Math.min(0.4, this.pitch + dy * 0.005));
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
    // Majestic, calm axial rotation (~1 rotation every 60 seconds)
    const normalBaseSpeed = 0.0016;

    const animate = () => {
      if (this.isRotating && !this.isDragging) {
        this.sphereMesh.rotation.y += normalBaseSpeed * this.speedFactor;
        if (this.currentPlanet === "earth" && this.cloudsMesh) {
          this.cloudsMesh.rotation.y += normalBaseSpeed * this.speedFactor * 1.15;
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
    this.textureCache.forEach((tex) => tex.dispose());
    this.textureCache.clear();
    this.renderer.dispose();
  }
}
