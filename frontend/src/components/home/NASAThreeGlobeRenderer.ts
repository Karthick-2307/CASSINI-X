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

  // Background deep space starfield
  private starPoints: THREE.Points;

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
    this.renderer.toneMappingExposure = 1.0;

    // 1. Natural space lighting: balanced ambient light so oceans are not overly dark, with warm sunlight
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.26);
    this.scene.add(ambientLight);

    // Warm directional sunlight from upper-right
    const sunLight = new THREE.DirectionalLight(0xfff6ea, 2.3);
    sunLight.position.set(6.0, 3.5, 3.5);
    this.scene.add(sunLight);

    // Soft atmospheric rim light placed behind the limb
    const rimBackLight = new THREE.DirectionalLight(0xe0f2fe, 0.18);
    rimBackLight.position.set(-5.5, 3.5, -2.5);
    this.scene.add(rimBackLight);

    // ==========================================
    // 2. BACKGROUND STARFIELD IN DEEP SPACE
    // ==========================================
    const starCount = 240;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      // Scatter across upper sky and deep background
      starPositions[i3] = (Math.random() - 0.5) * 16.0;
      starPositions[i3 + 1] = Math.random() * 4.2 - 0.2; // in the space sky above Earth
      starPositions[i3 + 2] = -2.0 - Math.random() * 8.0;

      // Realistic stellar colors: white, cyan-white, and warm gold
      const rand = Math.random();
      if (rand < 0.18) {
        // Warm golden star
        starColors[i3] = 1.0;
        starColors[i3 + 1] = 0.90;
        starColors[i3 + 2] = 0.75;
      } else if (rand < 0.40) {
        // Bright blue-white star
        starColors[i3] = 0.82;
        starColors[i3 + 1] = 0.92;
        starColors[i3 + 2] = 1.0;
      } else {
        // Pure diamond white star
        starColors[i3] = 0.95;
        starColors[i3 + 1] = 0.97;
        starColors[i3 + 2] = 1.0;
      }
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    this.starPoints = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starPoints);

    // Preload textures: Google Earth satellite map (cloud-free, high contrast) and Moon
    const earthTex = this.loadTexture(earthTextureUrl);
    const moonTex = this.loadTexture(moonTextureUrl);

    // ==========================================
    // 3. WIDE GOOGLE EARTH SATELLITE HORIZON (HIGH CONTRAST, DEEP OCEANS)
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
      roughness: 0.72,
      metalness: 0.0,
    });
    this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
    // Initial rotation to showcase the vibrant Atlantic Ocean, Europe, Africa & Americas
    this.earthMesh.rotation.y = 1.2;
    this.earthGroup.add(this.earthMesh);

    // ==========================================
    // 4. SPHERICAL MOON IN THE SKY (orbiting around Earth)
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

        // 3. Subtle celestial starfield drift
        this.starPoints.rotation.y += 0.00008 * this.speedFactor;
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
    this.starPoints.geometry.dispose();
    (this.starPoints.material as THREE.Material).dispose();
    this.textureCache.forEach((tex) => tex.dispose());
    this.textureCache.clear();
    this.renderer.dispose();
  }
}
