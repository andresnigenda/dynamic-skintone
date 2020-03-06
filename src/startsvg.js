// setup initial svg canvas
import * as d3 from "d3";

export default function startsvg() {
  // canvas setup function

  // container dimensions
  const containerStart = d3
    .select("#chart")
    .node()
    .getBoundingClientRect();
  //const width = containerStart.width;
  //const height = containerStart.height;
  //const margin = {top: 10, right: 30, bottom: 30, left: 30};
  var margin = { top: 18, right: 150, bottom: 150, left: 150 };
  var width = 750 - margin.left - margin.right;
  var height = 750 - margin.top - margin.bottom;
  //console.log(width, height);
  // append svg object to the body of the page
  var svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  // x-axis
  //console.log(width);
  // console.log(height);
  svg
    .append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(150," + height + ")");

  // y-axis
  svg
    .append("g")
    .attr("class", "yAxis")
    .attr("transform", "translate(149.9, 0)");

  // graph
  svg
    .append("g")
    .attr("id", "plotArea")
    .attr("transform", "translate(150, 0)");
}
