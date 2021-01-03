import * as THREE from "three";
import { Interaction } from "three.interaction";
import { ElementRef, Injectable, NgZone, OnDestroy } from "@angular/core";

@Injectable({ providedIn: "root" })
export class EngineService implements OnDestroy {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;
  private cube: THREE.Mesh;
  private frameId: number = null;

  private gameBoard: THREE.Group = null;
  private cubes: Array<THREE.Mesh> = new Array(9);

  public constructor(private ngZone: NgZone) {}

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true, // transparent background
      antialias: true, // smooth edges
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // create the scene
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    var interaction = new Interaction(this.renderer, this.scene, this.camera);

    this.camera.position.z = 5;
    this.scene.add(this.camera);

    // soft white light
    this.light = new THREE.AmbientLight(0x404040);

    this.gameBoard = new THREE.Group();
    var cubes = new Array(9);

    const geometry = new THREE.BoxGeometry(1, 1, 1);

    for (var i = 0; i < 9; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: this.getRandomColor(),
      });

      const cube = new THREE.Mesh(geometry, material);
      cube.name = i.toString();

      cube.position.x = i % 3;
      if (i > 2 && i <= 5) {
        cube.position.y = 1;
      }
      if (i > 5) {
        cube.position.y = 2;
      }

      cubes[i] = cube;

      cubes[i].on("click", (ev) => {
        var cubeIndex = parseInt(ev.data.target.name);
        cubes[cubeIndex].material = new THREE.MeshBasicMaterial({
          color: this.getRandomColor(),
        });
      });

      this.gameBoard.add(cube);
    }

    this.scene.add(this.gameBoard);
  }

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== "loading") {
        this.render();
      } else {
        window.addEventListener("DOMContentLoaded", () => {
          this.render();
        });
      }

      window.addEventListener("resize", () => {
        this.resize();
      });
    });
  }

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    this.gameBoard.rotation.x += 0.01;
    this.gameBoard.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera);
  }

  public resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  public getRandomColor(): string {
    return (
      "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
    );
  }
}
