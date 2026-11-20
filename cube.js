import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as three from "https://cdn.jsdelivr.net/npm/three@v0.187.0/+esm";

const colors = [];

const d3toThree = color => {
  const rgb = d3.rgb(color);
  return new three.Color(rgb.r / 256, rgb.g / 256, rgb.b / 256);
}

const colorPos = (color, colorSpace) => {
  if (colorSpace === d3.rgb) {
    color = d3.rgb(color);
    return new three.Vector3(color.r / 128 - 1, color.g / 128 - 1, color.b / 128 - 1);
  } else if (colorSpace === d3.hsl) {
    color = d3.hsl(color);
    return new three.Vector3(color.h / 180 - 1, color.s * 2 - 1, color.l * 2 - 1);
  } else if (colorSpace === d3.lab) {
    color = d3.lab(color);
    return new three.Vector3(color.a / 80, color.l / 50 - 1, color.b / 80);
  }
  return new three.Vector3();
}

const colorDot = color => {
  const geo = new three.SphereGeometry(1 / 16);
  const material = new three.MeshBasicMaterial({ color: d3toThree(color) });
  return new three.Mesh(geo, material);
};

const canvasColors = (canvas, colorSpace) => {
  const scene = new three.Scene()
  const camera = new three.PerspectiveCamera(90, 1, 0.05, 100);
  camera.position.z = 5;
  const renderer = new three.WebGLRenderer({ canvas: canvas });

  for (const color of colors) {
    const dot = colorDot(color);
    dot.position.set(0,0,0);
    dot.position.add(colorPos(color, colorSpace));
    scene.add(dot);
  }

  renderer.setAnimationLoop(_ => {
    renderer.render(scene, camera);
  });
};

window.addEventListener("load", _ => {
  for (let i = 0; i < 256; ++i) {
    const color = d3.rgb(256 * Math.random(), 256 * Math.random(), 256 * Math.random());
    colors.push(color);
  }
  canvasColors(document.getElementById("canvas-rgb"), d3.rgb)
  canvasColors(document.getElementById("canvas-hsl"), d3.hsl)
  canvasColors(document.getElementById("canvas-lab"), d3.lab)
});
