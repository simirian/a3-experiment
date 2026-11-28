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
 * @returns {boolean}
 */
const tooClose = (a, b) => (a.l - b.l) ** 2 + (a.a - b.a) ** 2 + (a.b - b.b) ** 2 < 50;

/**
 * Maps a list of structures to colors which are not associated with them.
 * @param subjects {string[]} The subjects to map to wrong colors.
 * @returns {string[]} The wrong color.
 */
const getWrongColors = subjects => {
  return subjects.map(subject => {
    const correct = d3.lab(correctColors[subject]);
    let wrong = d3.lab(randomColor());
    while(tooClose(correct, wrong))
      wrong = d3.lab(randomColor());
    return wrong.formatHex();
  });
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
const blacks = len =>  new Array(len).fill("#000000");

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
      colors = getWrongColors(subjects);
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
    a.href = "data:image/svg," + encodeURI(chart.outerHTML);
    a.download = "chart.svg";
    a.click();
  })
});
