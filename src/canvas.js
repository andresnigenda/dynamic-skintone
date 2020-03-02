// setup initial svg canvas for transitions
import * as d3 from 'd3';

export default function canvas() {
    // canvas setup function

    // container dimensions
    const containerStart = d3.select("#chart").node().getBoundingClientRect();
    const width = containerStart.width;
    const height = containerStart.height;
    const margin = {top: 30, right: 30, bottom: 150, left: 150};

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // append svg object to the body of the page
    d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var svg = d3.select("#chart").select("svg");

    // axis
    svg.append("g")
        .attr("class", "xAxis");

    // y-axis
    svg.append("g")
        .attr("class", "yAxis");
    

    // append labels CHANGE THIS
    /*svg.selectAll(".xLabel")
        .data([{"label": ""}])
        .enter()
        .append("text")
        .attr("class", "xLabel")
        .attr("transform", "translate(0," + height + ")")
        .text(d => d.label)
        .attr("text-anchor", "middle")
        .attr("x", (0.5 * (plotWidth + margin.left)))
        .attr("y", margin.top - 25); */

    // append plot

    svg.append("g")
        .attr("id", "plot");
    


}