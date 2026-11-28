import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as three from "https://cdn.jsdelivr.net/npm/three@v0.187.0/+esm";
import * as ta from "https://cdn.jsdelivr.net/npm/three-addons@1.2.0/+esm";

/**
 * Converts a d3 color to a three.js color.
 * @param color {d3.Color} The color to convert.
 * @returns {three.Color} The color in three.js form.
 */
const d3toThree = color => {
  const rgb = d3.rgb(color);
  return new three.Color(rgb.r / 256, rgb.g / 256, rgb.b / 256);
}

/**
 * Gets the position that a color should be placed at.
 * @param color {d3.Color} The color as a d3 color.
 * @param colorSpace {d3.ColorFactory} The color space that should be used to place the color.
 * @returns {three.Vector3} The position at which to place the color.
 */
const colorPos = (color, colorSpace) => {
  if (colorSpace === d3.rgb) {
    color = d3.rgb(color);
    return new three.Vector3(color.r / 128 - 1, color.g / 128 - 1, color.b / 128 - 1);
  } else if (colorSpace === d3.hsl) {
    color = d3.hsl(color);
    return new three.Vector3(color.h / 180 - 1, color.l * 2 - 1, color.s * 2 - 1);
  } else if (colorSpace === d3.lab) {
    color = d3.lab(color);
    return new three.Vector3(color.a / 80, color.l / 40 - 1, color.b / 80);
  }
  return new three.Vector3();
}

/**
 * Creates a mesh instance for the color.
 * @param color {d3.Color} The color of the dot.
 * @returns {three.Mesh} The new mesh.
 */
const colorDot = color => {
  const geo = new three.SphereGeometry(1 / 16);
  const material = new three.MeshBasicMaterial({ color: d3toThree(color) });
  return new three.Mesh(geo, material);
};

/**
 * Converts a canvas to a 3D color dot map. Expects the data to have a `color`
 * field, which is used to plot the points. The color may be a d3 color or a hex
 * code.
 *
 * @param data {any[]} The data to add to the color space map.
 * @param colorSpace {d3.ColorFactory} The color space to use.
 * @returns {three.WebGLRenderer} The renderer for the scene.
 */
export const canvasColors = (data, colorSpace) => {
  const scene = new three.Scene();
  const renderer = new three.WebGLRenderer();
  renderer.setSize(500, 500);

  const camera = new three.PerspectiveCamera(90, 1, 0.05, 10);
  camera.position.z = 3;

  const group = new three.Group();
  scene.add(group);

  const dots = [];
  for (const color of data.map(e => e.color)) {
    const dot = colorDot(color);
    dot.position.set(0, 0, 0);
    dot.position.add(colorPos(color, colorSpace));
    group.add(dot);
    dots.push(dot);
  }

  new ta.OrbitControls(camera, renderer.domElement);

  renderer.setAnimationLoop(_ => {
    renderer.render(scene, camera);
  });

  return renderer;
};
