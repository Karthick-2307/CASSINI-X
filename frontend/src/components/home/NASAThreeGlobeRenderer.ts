import * as THREE from "three";
import earthTextureUrl from "/textures/earth.jpg?url";
import moonTextureUrl from "/textures/moon.jpg?url";

export class NASAThreeGlobeScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  // Earth horizon objects (wide Google Earth / NASA high-contrast satellite Earth)
  private earthGroup: THREE.Group;
  private earthMesh: THREE.Mesh;

  // Moon orbiting Earth in the space sky
  private moonMesh: THREE.Mesh;
  private moonOrbitAngle: number = 0.45;

  private textureCache: Map<string, THREE.Texture> = new Map();
  private textureLoader: THREE.TextureLoader = new THREE.TextureLoader();

  private animFrameId: number | null = null;
  private isRotating: boolean = true;
  private speedFactor: number = 1.0;
  private isDragging: boolean = false;
  private lastPointer: { x: number; y: number } = { x: 0, y: 0 };

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.scene = new THREE.Scene();

    // Perspective camera with wide view for the orbital horizon
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
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

    // Enable ACES Filmic Tone Mapping and sRGB color space for rich contrast and deep blacks
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    // 1. High-contrast space lighting: deep dark navy oceans and rich, vivid land
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.16);
    this.scene.add(ambientLight);

    // Warm directional sunlight from upper-right
    const sunLight = new THREE.DirectionalLight(0xfff6ea, 2.6);
    sunLight.position.set(6.0, 3.5, 3.5);
    this.scene.add(sunLight);

    // Subtle edge rim light placed behind the limb to highlight atmospheric curvature
    const rimBackLight = new THREE.DirectionalLight(0x38bdf8, 0.25);
    rimBackLight.position.set(-5.5, 3.5, -2.5);
    this.scene.add(rimBackLight);

    // Preload textures: Google Earth satellite map (cloud-free, high contrast) and Moon
    const earthTex = this.loadTexture(earthTextureUrl);
    const moonTex = this.loadTexture(moonTextureUrl);

    // ==========================================
    // 2. WIDE GOOGLE EARTH SATELLITE HORIZON (HIGH CONTRAST, DEEP OCEANS)
    // ==========================================
    this.earthGroup = new THREE.Group();
    // Positioned so the curved horizon spans wide across the webpage
    // Lowered slightly and tilted to show vibrant temperate/equatorial oceans & continents
    this.earthGroup.position.set(0.0, -4.15, 0.1);
    this.earthGroup.rotation.z = THREE.MathUtils.degToRad(-12.0);
    this.earthGroup.rotation.x = THREE.MathUtils.degToRad(-6.0);
    this.scene.add(this.earthGroup);

    // High-contrast Earth sphere: deep navy oceans, vivid terrain relief
    const earthRadius = 4.6;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 128, 128);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.65,
      metalness: 0.02,
    });
    this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
    // Initial rotation to showcase the vibrant Atlantic Ocean, Europe, Africa & Americas
    this.earthMesh.rotation.y = 1.2;
    this.earthGroup.add(this.earthMesh);

    // ==========================================
    // 3. SPHERICAL MOON IN THE SKY (orbiting around Earth)
    // ==========================================
    const moonRadius = 0.52;
    const moonGeo = new THREE.SphereGeometry(moonRadius, 96, 96);
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTex,
      roughness: 0.94,
      metalness: 0.0,
    });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.updateMoonPosition();
    this.scene.add(this.moonMesh);

    this.setupInteractivity(canvas);
    this.startLoop();
  }

  private updateMoonPosition(): void {
    // Orbital path: sweeps through the sky in the upper-right quadrant
    const radiusX = 2.2;
    const radiusY = 0.40;
    const centerX = 0.6;
    const centerY = 1.45;

    const x = centerX + Math.cos(this.moonOrbitAngle) * radiusX;
    const y = centerY + Math.sin(this.moonOrbitAngle) * radiusY;
    const z = Math.sin(this.moonOrbitAngle) * 0.7 - 0.2;

    this.moonMesh.position.set(x, y, z);
    this.moonMesh.rotation.y = this.moonOrbitAngle + Math.PI;
  }

  private loadTexture(url: string): THREE.Texture {
    if (this.textureCache.has(url)) {
      return this.textureCache.get(url)!;
    }
    const tex = this.textureLoader.load(url);
    // CRITICAL: Set sRGB color space so Three.js renders textures with correct gamma and rich contrast
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.generateMipmaps = true;
    if (this.renderer.capabilities.getMaxAnisotropy) {
      tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    }
    this.textureCache.set(url, tex);
    return tex;
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

      // Drag to rotate Earth and advance Moon orbit
      this.earthMesh.rotation.y += dx * 0.006;
      this.moonOrbitAngle += dx * 0.002;
      this.updateMoonPosition();

      this.earthGroup.rotation.x = Math.max(
        THREE.MathUtils.degToRad(-16),
        Math.min(THREE.MathUtils.degToRad(12), this.earthGroup.rotation.x + dy * 0.003)
      );

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
    const earthBaseSpeed = 0.0016;
    const moonOrbitSpeed = 0.0006;

    const animate = () => {
      if (this.isRotating && !this.isDragging) {
        // 1. Earth rotates smoothly on its axis with clear landmasses and dark oceans
        this.earthMesh.rotation.y += earthBaseSpeed * this.speedFactor;

        // 2. Moon orbits around Earth in the space sky
        this.moonOrbitAngle += moonOrbitSpeed * this.speedFactor;
        this.updateMoonPosition();
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
    this.earthMesh.geometry.dispose();
    this.moonMesh.geometry.dispose();
    this.textureCache.forEach((tex) => tex.dispose());
    this.textureCache.clear();
    this.renderer.dispose();
  }
}
