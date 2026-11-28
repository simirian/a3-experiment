import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

/**
 * Plots the category data for a subject as a bar chart. The data is expected to
 * have a `category` field which is used to generate category counts. This field
 * should be the hex code of the category.
 *
 * @param data {Object[]} The data to plot.
 * @returns {d3.Selection} The svg node selection.
 */
export const clusterBarChart = (data) => {
  const categoryCounts = {};
  for (const datum of data) {
    if (categoryCounts[datum.category])
      categoryCounts[datum.category] += 1;
    else
      categoryCounts[datum.category] = 1;
  }

  const width = 500;
  const height = 300;
  const margin = 20;

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleBand()
    .domain(Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]))
    .range([margin, width - margin])
    .padding(0.1);
  const y = d3.scaleLinear()
    .domain([0, Math.max(...Object.values(categoryCounts))])
    .range([height - margin, margin]);

  for (const category in categoryCounts) {
    svg.append("rect")
      .attr("x", x(category))
      .attr("y", y(categoryCounts[category]))
      .attr("width", x.bandwidth())
      .attr("height", y(0) - y(categoryCounts[category]))
      .attr("fill", category);
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
export const estimateBarChart = (data) => {
  const groups = ["Black", "Grayscale", "Wrong", "Correct"];
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

/**
 * Creates a survey bar chart from the given categories, values, colors, and
 * maximum. The data is supposed to be randomly generated and cureated.
 * @param categories {string[]} The category (subject) names.
 * @param values {number[]} The numbers per category, should be 0-1.
 * @param volors {string[]} The colors for each bar.
 * @param max {number} The maximum of the chart. If falsey, the maximum of `values` will be used.
 * @returns {d3.Selection}
 */
export const surveyBarChart = (categories, values, colors, max) => {
  const width = 500;
  const height = 300;
  const margin = 30;

  max = max || d3.max(values);

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleBand()
    .domain(categories)
    .range([margin, width - margin])
    .padding(0.1);
  const y = d3.scaleLinear()
    .domain([0, max])
    .range([height - margin, margin]);

  for (let i = 0; i < categories.length; ++i) {
    svg.append("rect")
      .attr("x", x(categories[i]))
      .attr("y", y(values[i]))
      .attr("width", x.bandwidth())
      .attr("height", y(0) - y(values[i]))
      .attr("fill", colors[i]);
  }

  svg.append("g")
    .attr("transform", `translate(0, ${height - margin})`)
    .call(d3.axisBottom(x));
  svg.append("g")
    .attr("transform", `translate(${margin}, 0)`)
    .call(d3.axisLeft(y));


  return svg;
};
