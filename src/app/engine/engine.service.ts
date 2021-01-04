import * as THREE from "three";
import { Interaction } from "three.interaction";
import { ElementRef, Injectable, NgZone, OnDestroy } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { take } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class EngineService implements OnDestroy {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;
  private frameId: number = null;

  private gameBoard: THREE.Group = null;
  private cubes: Array<any> = new Array(9);
  private currentColors: Array<{ id: string; color: string }> = null;

  private stroe: AngularFirestore = null;

  public constructor(private ngZone: NgZone, private store: AngularFirestore) {
    this.store = store;
  }

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public Init(canvas: ElementRef<HTMLCanvasElement>) {
    // Get the first state
    this.store
      .collection("colors")
      .snapshotChanges()
      .pipe(take(1))
      .subscribe((res: any) => {
        if (res && res.length > 0) {
          this.currentColors = res.map((item, i) => {
            return {
              color: res[i].payload.doc.data().color,
              id: res[i].payload.doc.id,
            };
          });
          this.createScene(canvas, this.currentColors);
          this.animate();
        }
      });

    this.store
      .collection("colors")
      .valueChanges()
      .subscribe((res: any) => {
        //console.log(res);
        const newColors = res.map((item) => item.color);
        this.updateBoard(newColors);
      });
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>, colors): void {
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
    this.camera.position.z = 5;

    // Add events listener to "click" on the cubes
    new Interaction(this.renderer, this.scene, this.camera);

    this.scene.add(this.camera);

    // soft white light
    this.light = new THREE.AmbientLight(0x404040);

    this.gameBoard = new THREE.Group();

    const geometry = new THREE.BoxGeometry(1, 1, 1);

    for (var i = 0; i < 9; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: colors[i].color,
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

      this.cubes[i] = cube;

      this.cubes[i].on("click", (ev) => {
        var cubeIndex = parseInt(ev.data.target.name);
        this.store
          .collection("colors")
          .doc(this.currentColors[cubeIndex].id)
          .update({ color: this.getRandomColor() });
      });

      // Add the cube to the boardGame element
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

  public updateBoard(newColors: Array<string>) {
    for (var i = 0; i < newColors.length; i++) {
      if (this.currentColors[i].color !== newColors[i]) {
        this.cubes[i].material = new THREE.MeshBasicMaterial({
          color: newColors[i],
        });
      }
    }
  }

  public getRandomColor(): string {
    return (
      "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
    );
  }
}
