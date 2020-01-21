import * as THREE from 'three';

let camera: any, scene: any, renderer: any;
let geometry: any, material: any, mesh: any;

const WIDTH = 600;
const HEIGHT = 400;

export function init() {
    camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 0.01, 10);
    camera.position.z = 1;

    scene = new THREE.Scene();

    geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    material = new THREE.MeshNormalMaterial();

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(WIDTH, HEIGHT);

    // @ts-ignore
    document.getElementById('three-sample').appendChild(renderer.domElement);
}

export function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;
    renderer.render(scene, camera);
}

