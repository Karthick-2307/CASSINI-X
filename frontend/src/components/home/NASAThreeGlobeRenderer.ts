import * as THREE from "three";
import earthTextureUrl from "/textures/earth.jpg?url";
import earthNormalUrl from "/textures/earth_normal.jpg?url";
import earthSpecularUrl from "/textures/earth_specular.jpg?url";
import cloudsTextureUrl from "/textures/earth_clouds.png?url";
import moonTextureUrl from "/textures/moon.jpg?url";

export class NASAThreeGlobeScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  // Earth horizon objects (wide NASA Blue Marble Earth spanning lower webpage)
  private earthGroup: THREE.Group;
  private earthMesh: THREE.Mesh;
  private cloudsMesh: THREE.Mesh;
  private atmosphereLimb: THREE.Mesh;

  // Moon orbiting Earth in the space sky
  private moonMesh: THREE.Mesh;
  private moonOrbitAngle: number = 0.35;

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

    // 1. Balanced orbital solar lighting for photorealistic NASA Blue Marble
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.22);
    this.scene.add(ambientLight);

    // Key sunlight from the upper-right (creates natural terminator and specular reflection)
    const sunLight = new THREE.DirectionalLight(0xfffaea, 2.8);
    sunLight.position.set(7.5, 3.5, 3.5);
    this.scene.add(sunLight);

    // Subtle blue atmospheric rim fill
    const blueRimLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    blueRimLight.position.set(-4.0, 2.5, 1.0);
    this.scene.add(blueRimLight);

    // Preload official NASA textures
    const earthTex = this.loadTexture(earthTextureUrl);
    const earthNormalTex = this.loadTexture(earthNormalUrl);
    const earthSpecularTex = this.loadTexture(earthSpecularUrl);
    const moonTex = this.loadTexture(moonTextureUrl);
    const cloudsTex = this.loadTexture(cloudsTextureUrl);

    // ==========================================
    // 2. WIDE NASA BLUE MARBLE EARTH HORIZON
    // ==========================================
    this.earthGroup = new THREE.Group();
    // Positioned low so its curved upper surface spans wide across the webpage
    this.earthGroup.position.set(0.1, -3.95, 0.2);
    // Real axial tilt of Earth (23.44°)
    this.earthGroup.rotation.z = THREE.MathUtils.degToRad(-15.0);
    this.earthGroup.rotation.x = THREE.MathUtils.degToRad(18.0);
    this.scene.add(this.earthGroup);

    // Photorealistic Earth sphere with NASA topography normal map & ocean specular map
    const earthRadius = 4.6;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 128, 128);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      normalMap: earthNormalTex,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: earthSpecularTex,
      roughness: 0.65,
      metalness: 0.08,
    });
    this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.earthGroup.add(this.earthMesh);

    // Realistic delicate NASA cloud layer with atmospheric parallax
    const cloudsGeo = new THREE.SphereGeometry(earthRadius + 0.02, 128, 128);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: cloudsTex,
      transparent: true,
      opacity: 0.55, // Translucent clouds so Blue Marble continents and oceans shine through
      blending: THREE.NormalBlending,
      roughness: 0.95,
      metalness: 0.0,
    });
    this.cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    this.earthGroup.add(this.cloudsMesh);

    // Glowing Atmospheric Limb Ring (AdditiveBlending to prevent dark borders)
    const atmosGeo = new THREE.SphereGeometry(earthRadius + 0.035, 96, 96);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });
    this.atmosphereLimb = new THREE.Mesh(atmosGeo, atmosMat);
    this.earthGroup.add(this.atmosphereLimb);

    // ==========================================
    // 3. SPHERICAL MOON IN THE SKY (orbiting around Earth)
    // ==========================================
    const moonRadius = 0.65;
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
    const radiusX = 2.4;
    const radiusY = 0.45;
    const centerX = 0.4;
    const centerY = 1.35;

    const x = centerX + Math.cos(this.moonOrbitAngle) * radiusX;
    const y = centerY + Math.sin(this.moonOrbitAngle) * radiusY;
    const z = Math.sin(this.moonOrbitAngle) * 0.8 - 0.2;

    this.moonMesh.position.set(x, y, z);
    this.moonMesh.rotation.y = this.moonOrbitAngle + Math.PI;
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
      this.cloudsMesh.rotation.y += dx * 0.006;
      this.moonOrbitAngle += dx * 0.002;
      this.updateMoonPosition();

      this.earthGroup.rotation.x = Math.max(
        THREE.MathUtils.degToRad(8),
        Math.min(THREE.MathUtils.degToRad(28), this.earthGroup.rotation.x + dy * 0.003)
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
        // 1. Earth rotates on its own axis
        this.earthMesh.rotation.y += earthBaseSpeed * this.speedFactor;

        // 2. Delicate cloud parallax drift
        this.cloudsMesh.rotation.y += earthBaseSpeed * this.speedFactor * 1.15;

        // 3. Moon orbits around Earth in the space sky
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
    this.cloudsMesh.geometry.dispose();
    this.atmosphereLimb.geometry.dispose();
    this.moonMesh.geometry.dispose();
    this.textureCache.forEach((tex) => tex.dispose());
    this.textureCache.clear();
    this.renderer.dispose();
  }
}
