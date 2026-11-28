import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

/**
 * Plots the cluster data for a subject as a bar chart. The data is expected to
 * have a `cluster` field which is used to generate cluster counts. This field
 * should be the hex code of the cluster.
 *
 * @param data {Object[]} The data to plot.
 * @returns {d3.Selection} The svg node selection.
 */
const clusterBarChart = (data) => {
  const clusterCounts = {};
  for (const datum of data) {
    if (clusterCounts[datum.cluster])
      clusterCounts[datum.cluster] += 1;
    else
      clusterCounts[datum.cluster] = 1;
  }

  const width = 500;
  const height = 300;
  const margin = 20;

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height);

  const x = d3.scaleBand()
      .domain(Object.keys(clusterCounts).sort((a, b) => clusterCounts[b] - clusterCounts[a]))
      .range([margin, width - margin])
      .padding(0.1);
  const y = d3.scaleLinear()
      .domain([0, Math.max(...Object.values(clusterCounts))])
      .range([height - margin, margin]);

  for (const cluster in clusterCounts) {
    svg.append("rect")
        .attr("x", x(cluster))
        .attr("y", y(clusterCounts[cluster]))
        .attr("width", x.bandwidth())
        .attr("height", y(0) - y(clusterCounts[cluster]))
        .attr("fill", cluster);
  }

  svg.append("g")
      .attr("transform", `translate(0, ${height - margin})`)
      .call(d3.axisBottom(x));
  svg.append("g")
      .attr("transform", `translate(${margin}, 0)`)
      .call(d3.axisLeft(y));

  return svg;
};

/**
 * Takes data from an estimation experiment and generates a bar chart for it
 * with error bars. The data is expected to hae a `colors` field, which is the
 * color scheme used for that chart in the experiment, and an `error` field,
 * which is the respondant's estimation error.
 *
 * @param data {Object[]} The data to plot.
 * @returns {d3.Selection} The generated chart selection.
 */
const estimateBarChart = (data) => {
  const groups = ["Black", "Grays", "Wrong", "Correct"];
  const colors = ["#303030", "#a0a0a0", "#ff4040", "#40ff40"];
  const bars = groups.map(e => data.filter(d => d.colors === e));

  const width = 500;
  const height = 300;
  const margin = 20;

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height);

  const x = d3.scaleBand()
      .domain(groups)
      .range([margin, width - margin])
      .padding(0.1);
  const y = d3.scaleLinear()
      .domain([0, d3.max(data, e => e.error)])
      .range([height - margin, margin]);

  for (let i = 0; i < bars.length; ++i) {
    const min = d3.min(bars[i], e => e.error);
    const max = d3.max(bars[i], e => e.error);
    const median = d3.median(bars[i], e => e.error);
    svg.append("rect")
        .attr("x", x(groups[i]))
        .attr("y", y(median))
        .attr("width", x.bandwidth())
        .attr("height", y(0) - y(median))
        .attr("fill", colors[i]);

    // this is an I-shape path which is scaled to be an error bar based on the min and max
    const w = x.bandwidth() / 2;
    const h = y(min) - y(max);
    svg.append("path")
        .attr("d", `M 0 0 H ${w} H ${w / 2} V ${h} H 0 H ${w}`)
        .attr("transform", `translate(${x(groups[i]) + w / 2}, ${y(max)})`)
        .attr("fill", "none")
        .attr("stroke", "#000000")
        .attr("stroke-width", 3);
  }

  svg.append("g")
      .attr("transform", `translate(0, ${height - margin})`)
      .call(d3.axisBottom(x));
  svg.append("g")
      .attr("transform", `translate(${margin}, 0)`)
      .call(d3.axisLeft(y));

  return svg;
};

window.addEventListener("load", _ => {
  const colors = new Array(16);
  for (let i = 0; i < 16; ++i)
    colors[i] = d3.rgb(Math.random() * 256, Math.random() * 256, Math.random() * 256).formatHex();

  const clusterData = [];
  for (let i = 0; i < 16; ++i) {
    const count = Math.floor(Math.random() * 100);
    for (let j = 0; j < count; ++j)
      clusterData.push({cluster: colors[i]});
  }

  const clusterChart = clusterBarChart(clusterData);
  document.querySelector("body").appendChild(clusterChart.node());

  const estimateData = new Array(100);
  for (let i = 0; i < 100; ++i) {
    estimateData[i] = {
      error: Math.random() / 2,
      colors: ["Black", "Grays", "Correct", "Wrong"][Math.floor(Math.random() * 4)]
    };
  }
  const estimateChart = estimateBarChart(estimateData);
  document.querySelector("body").appendChild(estimateChart.node());
});
