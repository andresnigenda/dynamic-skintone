// setup initial svg canvas
import * as d3 from 'd3';

export default function canvas() {
    // canvas setup function

    // container dimensions
    const containerStart = d3.select("#chart").node().getBoundingClientRect();
    //const width = containerStart.width;
    //const height = containerStart.height;
    //const margin = {top: 10, right: 30, bottom: 30, left: 30};
    var margin = {top: 30, right: 30, bottom: 150, left: 150};
    var width = 750 - margin.left - margin.right;
    var height = 750 - margin.top - margin.bottom;
    console.log(width);
    // append svg object to the body of the page
    d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var svg = d3.select("#chart").select("svg");

    // axis
    svg.append("g")
        .attr("class", "xAxis");

    // y-axis
    svg.append("g")
        .attr("class", "yAxis");

    // graph
    svg.append("g")
        .attr("id", "myGraph");

}