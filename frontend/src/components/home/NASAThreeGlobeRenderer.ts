import * as THREE from "three";
import earthTextureUrl from "/textures/earth.jpg?url";
import marsTextureUrl from "/textures/mars.jpg?url";
import moonTextureUrl from "/textures/moon.jpg?url";
import cloudsTextureUrl from "/textures/earth_clouds.png?url";

export type GlobeViewMode = "earthrise" | "mars" | "earth" | "moon";

export class NASAThreeGlobeScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  // Earthrise mode objects (Apollo / Artemis Moon-to-Earth view)
  private earthriseGroup: THREE.Group;
  private moonHorizonMesh: THREE.Mesh;
  private distantEarthGroup: THREE.Group;
  private distantEarthMesh: THREE.Mesh;
  private distantCloudsMesh: THREE.Mesh;

  // Single planet mode objects (Mars / Earth / Moon standalone)
  private singlePlanetGroup: THREE.Group;
  private singlePlanetMesh: THREE.Mesh;
  private singleCloudsMesh: THREE.Mesh;

  private textureCache: Map<string, THREE.Texture> = new Map();
  private textureLoader: THREE.TextureLoader = new THREE.TextureLoader();

  private sunLight: THREE.DirectionalLight;
  private earthGlowLight: THREE.PointLight;

  private animFrameId: number | null = null;
  private currentMode: GlobeViewMode = "earthrise";
  private isRotating: boolean = true;
  private speedFactor: number = 1.0;
  private isDragging: boolean = false;
  private lastPointer: { x: number; y: number } = { x: 0, y: 0 };

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.scene = new THREE.Scene();

    // Perspective camera
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 5.0);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0); // 100% transparent deep space

    // 1. Cosmic solar lighting (Apollo 8 / Artemis Earthrise illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.08);
    this.scene.add(ambientLight);

    // Directional sunlight coming from the right / upper-right (matches uploaded image crescent)
    this.sunLight = new THREE.DirectionalLight(0xfff8ee, 3.8);
    this.sunLight.position.set(6.5, 2.2, 2.8);
    this.scene.add(this.sunLight);

    // Subtle blue atmospheric glow from Earth
    this.earthGlowLight = new THREE.PointLight(0x38bdf8, 0.4, 10);
    this.earthGlowLight.position.set(0.9, 0.7, -0.4);
    this.scene.add(this.earthGlowLight);

    // Preload textures
    const earthTex = this.loadTexture(earthTextureUrl);
    const moonTex = this.loadTexture(moonTextureUrl);
    const marsTex = this.loadTexture(marsTextureUrl);
    const cloudsTex = this.loadTexture(cloudsTextureUrl);

    // ==========================================
    // 2. EARTHRISE SCENE (Moon in foreground, rotating Earth in background)
    // ==========================================
    this.earthriseGroup = new THREE.Group();
    this.scene.add(this.earthriseGroup);

    // A. Massive Moon horizon in foreground with detailed craters
    const moonGeo = new THREE.SphereGeometry(3.2, 96, 96);
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTex,
      roughness: 0.96,
      metalness: 0.0,
    });
    this.moonHorizonMesh = new THREE.Mesh(moonGeo, moonMat);
    // Positioned so the cratered lunar horizon curves diagonally across the lower section
    this.moonHorizonMesh.position.set(-1.6, -2.4, 0.5);
    this.moonHorizonMesh.rotation.x = 0.35;
    this.moonHorizonMesh.rotation.y = 1.1;
    this.earthriseGroup.add(this.moonHorizonMesh);

    // B. Distant rotating Earth floating in deep space
    this.distantEarthGroup = new THREE.Group();
    this.distantEarthGroup.position.set(0.95, 0.7, -0.6);
    // Physical axial tilt of Earth
    this.distantEarthGroup.rotation.z = THREE.MathUtils.degToRad(23.44);
    this.earthriseGroup.add(this.distantEarthGroup);

    const earthGeo = new THREE.SphereGeometry(0.85, 96, 96);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.5,
      metalness: 0.08,
    });
    this.distantEarthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.distantEarthGroup.add(this.distantEarthMesh);

    // Clouds for distant Earth
    const cloudsGeo = new THREE.SphereGeometry(0.862, 80, 80);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: cloudsTex,
      transparent: true,
      opacity: 0.85,
      blending: THREE.NormalBlending,
      roughness: 0.9,
    });
    this.distantCloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    this.distantEarthGroup.add(this.distantCloudsMesh);

    // ==========================================
    // 3. STANDALONE SINGLE PLANET SCENE (for Mars / Earth / Moon standalone views)
    // ==========================================
    this.singlePlanetGroup = new THREE.Group();
    this.singlePlanetGroup.visible = false;
    this.scene.add(this.singlePlanetGroup);

    const singleGeo = new THREE.SphereGeometry(1.25, 96, 96);
    const singleMat = new THREE.MeshStandardMaterial({
      map: marsTex,
      roughness: 0.82,
      metalness: 0.0,
    });
    this.singlePlanetMesh = new THREE.Mesh(singleGeo, singleMat);
    this.singlePlanetGroup.add(this.singlePlanetMesh);

    const singleCloudsGeo = new THREE.SphereGeometry(1.262, 80, 80);
    this.singleCloudsMesh = new THREE.Mesh(singleCloudsGeo, cloudsMat);
    this.singleCloudsMesh.visible = false;
    this.singlePlanetGroup.add(this.singleCloudsMesh);

    this.setupInteractivity(canvas);
    this.setMode("earthrise");
    this.startLoop();
  }

  private loadTexture(url: string): THREE.Texture {
    if (this.textureCache.has(url)) {
      return this.textureCache.get(url)!;
    }
    const tex = this.textureLoader.load(url);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.generateMipmaps = true;
    if (this.renderer.capabilities.getMaxAnisotropy) {
      tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    }
    this.textureCache.set(url, tex);
    return tex;
  }

  public setMode(mode: GlobeViewMode): void {
    this.currentMode = mode;

    if (mode === "earthrise") {
      this.earthriseGroup.visible = true;
      this.singlePlanetGroup.visible = false;
      this.sunLight.position.set(6.5, 2.2, 2.8);
      this.sunLight.intensity = 3.8;
      this.earthGlowLight.intensity = 0.4;
    } else {
      this.earthriseGroup.visible = false;
      this.singlePlanetGroup.visible = true;
      this.earthGlowLight.intensity = 0.0;

      if (mode === "mars") {
        this.sunLight.position.set(-5.5, 1.8, 3.5);
        this.sunLight.intensity = 3.4;
        this.singlePlanetGroup.rotation.z = THREE.MathUtils.degToRad(25.19);
        this.singlePlanetMesh.material = new THREE.MeshStandardMaterial({
          map: this.textureCache.get(marsTextureUrl),
          roughness: 0.82,
          metalness: 0.0,
        });
        this.singleCloudsMesh.visible = false;
      } else if (mode === "earth") {
        this.sunLight.position.set(-5.5, 1.8, 3.5);
        this.sunLight.intensity = 3.4;
        this.singlePlanetGroup.rotation.z = THREE.MathUtils.degToRad(23.44);
        this.singlePlanetMesh.material = new THREE.MeshStandardMaterial({
          map: this.textureCache.get(earthTextureUrl),
          roughness: 0.52,
          metalness: 0.08,
        });
        this.singleCloudsMesh.visible = true;
      } else if (mode === "moon") {
        this.sunLight.position.set(-5.5, 1.8, 3.5);
        this.sunLight.intensity = 3.4;
        this.singlePlanetGroup.rotation.z = THREE.MathUtils.degToRad(1.54);
        this.singlePlanetMesh.material = new THREE.MeshStandardMaterial({
          map: this.textureCache.get(moonTextureUrl),
          roughness: 0.94,
          metalness: 0.0,
        });
        this.singleCloudsMesh.visible = false;
      }
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

      if (this.currentMode === "earthrise") {
        // In Earthrise mode, drag spins the rotating Earth in the distance and gently pans the Moon horizon
        this.distantEarthMesh.rotation.y += dx * 0.008;
        this.distantCloudsMesh.rotation.y += dx * 0.008;
        this.moonHorizonMesh.rotation.y += dx * 0.002;
        this.moonHorizonMesh.rotation.x = Math.max(0.1, Math.min(0.6, this.moonHorizonMesh.rotation.x + dy * 0.002));
      } else {
        // Single planet drag
        this.singlePlanetMesh.rotation.y += dx * 0.005;
        if (this.singleCloudsMesh) {
          this.singleCloudsMesh.rotation.y += dx * 0.005;
        }
      }

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
    const normalBaseSpeed = 0.0018;

    const animate = () => {
      if (this.isRotating && !this.isDragging) {
        if (this.currentMode === "earthrise") {
          // Earth is continuously rotating in deep space!
          this.distantEarthMesh.rotation.y += normalBaseSpeed * this.speedFactor;
          // Dynamic cloud parallax drift across Earth's atmosphere
          this.distantCloudsMesh.rotation.y += normalBaseSpeed * this.speedFactor * 1.18;
          // Very slow subtle lunar orbit progression
          this.moonHorizonMesh.rotation.y += normalBaseSpeed * this.speedFactor * 0.08;
        } else {
          this.singlePlanetMesh.rotation.y += normalBaseSpeed * this.speedFactor;
          if (this.singleCloudsMesh.visible) {
            this.singleCloudsMesh.rotation.y += normalBaseSpeed * this.speedFactor * 1.15;
          }
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
    this.moonHorizonMesh.geometry.dispose();
    this.distantEarthMesh.geometry.dispose();
    this.distantCloudsMesh.geometry.dispose();
    this.singlePlanetMesh.geometry.dispose();
    this.singleCloudsMesh.geometry.dispose();
    this.textureCache.forEach((tex) => tex.dispose());
    this.textureCache.clear();
    this.renderer.dispose();
  }
}
