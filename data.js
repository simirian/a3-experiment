import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import { canvasColors } from "./cube.js";
import { clusterBarChart, estimateBarChart } from "./barchart.js";

var colors = [];
var estimates = [];
var categories = {};
const subjects = [
  "Art",
  "Science",
  "Math",
  "History",
  "English"
];

window.addEventListener("load", _ => {
  // generate random data
  for (const subject of subjects)
    categories[subject] = [];
  for (const subject of subjects) {
    for (let i = 0; i < Math.random() * 16; ++i) {
      const color = d3.rgb(Math.random() * 256, Math.random() * 256, Math.random() * 256).formatHex();
      categories[subject].push(color);
    }
    for (let i = 0; i < 50; ++i) {
      const color = d3.rgb(Math.random() * 256, Math.random() * 256, Math.random() * 256);
      const category = categories[subject][Math.floor(Math.random() * categories[subject].length)];
      colors.push({ color: color.formatHex(), subject: subject, category: category });
    }
  }

  // color space objects
  const rgbSpace = canvasColors(colors, d3.rgb);
  document.body.appendChild(rgbSpace.domElement);
  const hslSpace = canvasColors(colors, d3.hsl);
  document.body.appendChild(hslSpace.domElement);
  const labSpace = canvasColors(colors, d3.lab);
  document.body.appendChild(labSpace.domElement);

  // all the clusters
  const colorTitle = document.createElement("p");
  colorTitle.innerText = "All Subjects";
  document.body.appendChild(colorTitle);
  const colorChart = clusterBarChart(colors);
  document.body.appendChild(colorChart.node());

  // clusters by subject
  for (const subject of subjects) {
    const p = document.createElement("p");
    p.innerText = subject;
    document.body.appendChild(p);
    const chart = clusterBarChart(colors.filter(e => e.subject === subject));
    document.body.appendChild(chart.node());
  }

  for (let i = 0; i < 25; ++i) {
    estimates.push({
      error: Math.random() / 2,
      colors: ["Black", "Grayscale", "Correct", "Wrong"][Math.floor(Math.random() * 4)]
    });
  }
  const estimateChart = estimateBarChart(estimates);
  document.body.appendChild(estimateChart.node());
});
