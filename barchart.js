import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

/**
 * Plots the cluster data for a subject as a bar chart.
 *
 * @param data {Object[]} The data to plot.
 * @param key {string} The key to get the cluster color of the datum.
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
});
