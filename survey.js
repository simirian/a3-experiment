import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import { surveyBarChart } from "./barchart.js";

/**
 * TODO: make these colors actually correct based on survey results.
 * TODO: populate this will all of the sujects we covered.
 * TODO: something about the subjects which have subdomains.
 * @type {Object.<string, string>}
 */
const correctColors = {
  "Math": "#ff0000",
  "Science": "#00ff00",
  "History": "#0000ff",
  "English": "#ffff00",
};

/**
 * Generates a random color
 * @returns {d3.RGBColor}
 */
const randomColor = _ => d3.rgb(Math.random() * 256, Math.random() * 256, Math.random() * 256);

/**
 * Checks if colors are too close to be wrong.
 * @param a {d3.LabColor} A color to compare.
 * @param b {d3.LabColor} A color to compare.
 * @param distance {number?} The distance which is too close, defaults to 70.
 * @returns {boolean}
 */
const tooClose = (a, b, distance) => {
  return (a.l - b.l) ** 2 + (a.a - b.a) ** 2 + (a.b - b.b) ** 2
    < (typeof distance === "number" ? distance ** 2 : 4900);
}

/**
 * Gets a random color which is different from the given color.
 * @param subjects {string[]} The colors to map to different colors.
 * @param distance {number?} The minimum distance between the colors, defaults to 70.
 * @returns {string[]} The wrong color.
 */
const getDifferentColor = (color, distance) => {
  const clab = d3.lab(color);
  let dlab = d3.lab(randomColor());
  while (tooClose(clab, dlab, distance))
    dlab = d3.lab(randomColor());
  return dlab.formatHex();
};

/**
 * Tests the distance required between wrong colors by creating a color chart.
 * @returns {d3.Selection}
 */
const wrongColorTest = _ => {
  const color = randomColor().formatHex();

  const svg = d3.create("svg")
    .attr("width", 500)
    .attr("height", 500);

  for (let i = 0; i < 36; ++i) {
    const start = i / 36 * Math.PI * 2;
    const end = (i / 36 + 1 / 36) * Math.PI * 2;
    svg.append("path")
      .attr("transform", "translate(250, 250)")
      .attr("d", d3.arc()({
        innerRadius: 5,
        outerRadius: 250,
        startAngle: start,
        endAngle: end,
      }))
      .attr("fill", getDifferentColor(color, 70));
  }

  svg.append("circle")
    .attr("cx", 250)
    .attr("cy", 250)
    .attr("r", 200)
    .attr("fill", color);

  return svg;
};

/**
  * Shuffles an array in place.
  * @param a {any[]} The array to shuffle.
  * @returns {any[]} The shuffled array.
  */
const shuffle = a => {
  for (let i = a.length; i > 0; --i) {
    const j = Math.floor(Math.random() * i);
    const tmp = a[i - 1];
    a[i - 1] = a[j];
    a[j] = tmp;
  }
  return a;
};

/**
 * Creates a palette of evenly distributed grays which are in a random order.
 * @param len {number} The number of palette entries.
 * @returns {string[]}
 */
const randomGrayScale = len => {
  if (len == 0) return [];
  if (len == 1) return ["#000000"];
  /** @type {string[]} */
  const a = new Array(len);
  for (let i = 0; i < len; ++i) {
    const v = i / (len - 1) * 192; // 192 is 3/4 of 256
    a[i] = d3.rgb(v, v, v).formatHex();
  }
  return shuffle(a);
};

/**
 * Creates a palette of len instances of black.
 * @param len {number} The number of palette entires.
 * @returns {string[]}
 */
const blacks = len => new Array(len).fill("#000000");

/**
 * Generates a chart with random data for use in the color-association effect
 * survey.
 * @returns {d3.Selection}
 */
const generateChart = _ => {
  const subjects = Object.keys(correctColors);
  const values = new Array(subjects.length);
  for (let i = 0; i < values.length; ++i) {
    values[i] = Math.random();
  }
  let colors;
  switch (Math.floor(Math.random() * 4)) {
    case 1:
      colors = randomGrayScale(subjects.length);
      break;
    case 2:
      colors = subjects.map(e => getDifferentColor(correctColors[e]));
      break;
    case 3:
      colors = subjects.map(e => correctColors[e]);
      break;
    default:
      colors = blacks(subjects.length);
      break;
  }
  const max = Math.random() > 0.5 ? 1 : false;
  return surveyBarChart(subjects, values, colors, max);
};

window.addEventListener("load", _ => {
  const generate = document.getElementById("generate");
  generate.addEventListener("click", _ => {
    const oldChart = document.getElementById("chart");
    const newChart = generateChart();
    newChart.attr("id", "chart");
    newChart.attr("xmlns", "http://www.w3.org/2000/svg");
    if (oldChart)
      oldChart.remove();
    document.body.appendChild(newChart.node());
  });
  generate.click();

  const download = document.getElementById("download");
  download.addEventListener("click", _ => {
    const chart = document.getElementById("chart");
    if (!chart) return;
    const a = document.createElement("a");
    a.href = "data:image/svg," + encodeURIComponent(chart.outerHTML);
    a.download = "chart.svg";
    a.click();
  });

  const test = document.getElementById("test");
  test.addEventListener("click", _ => {
    const oldChart = document.getElementById("chart");
    const newChart = wrongColorTest();
    newChart.attr("id", "chart");
    newChart.attr("xmlns", "http://www.w3.org/2000/svg");
    if (oldChart)
      oldChart.remove();
    document.body.appendChild(newChart.node());
  });
});
