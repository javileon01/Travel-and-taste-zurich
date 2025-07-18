const margin = { top: 40, right: 30, bottom: 50, left: 60 };
const baseWidth = 800;
const baseHeight = 400;
const width = baseWidth - margin.left - margin.right;
const height = baseHeight - margin.top - margin.bottom;

const svg = d3.select("#grafico_temperatura")
  .attr("viewBox", `0 0 ${baseWidth} ${baseHeight}`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "auto");

const g = svg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("#tooltip");

d3.csv("../assets/data/temperaturas_zurich.csv").then(data => {
  data.forEach(d => {
    d.Temperatura = +d.Temperatura;
  });

  const colorScale = d3.scaleLinear()
  .domain([d3.min(data, d => d.Temperatura), d3.mean(data, d => d.Temperatura), d3.max(data, d => d.Temperatura)])
  .range(["#2176FF", "#FFA500", "#A71A06"]); // azul → naranja → rojo

  const xScale = d3.scalePoint()
    .domain(data.map(d => d.Mes))
    .range([0, width])
    .padding(0.5);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Temperatura)])
    .range([height, 0]);

  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("font-size", "11px");

  g.append("g")
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .style("font-size", "14px");

  const line = d3.line()
    .x(d => xScale(d.Mes))
    .y(d => yScale(d.Temperatura));

  g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#f5c722")
    .attr("stroke-width", 3)
    .attr("d", line);

  g.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.Mes))
    .attr("cy", d => yScale(d.Temperatura))
    .attr("r", 5)
    .attr("fill", d => colorScale(d.Temperatura))
    .style("cursor", "pointer")
    .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 8)
          .attr("fill", d => d3.color(colorScale(d.Temperatura)).darker(1))

          tooltip.style("visibility", "visible")
                 .html(`<span class="mes-tooltip">${d.Mes}</span><br>${d.Temperatura} °C`);
    })
    .on("mousemove", function (event) {
        tooltip.style("top", (event.pageY - 5) + "px")
               .style("left", (event.pageX + 20) + "px");
    })
    .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 5)
          .attr("fill", d => colorScale(d.Temperatura))

          tooltip.style("visibility", "hidden");
    });

  g.selectAll("text.label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", d => xScale(d.Mes) + 3)
    .attr("y", d => yScale(d.Temperatura) - 15)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("fill", "white")
    .text(d => `${d.Temperatura}°`);
});