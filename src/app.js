/**
 * Skin Tone and Social Mobility in Mexico
 * Andres Nigenda
 *
 * Scrollytelling implementation with scrollama
 */

import "intersection-observer";
import scrollama from "scrollama";
import * as d3 from "d3";
import "./stylesheets/main.css";
import heatMap from "./heatmap";
import updateHeatMap from "./updateHeatMap";
import startsvg from "./startsvg";

// set up
var scrolly = d3.select("#scrolly");
var figure = scrolly.select("figure");
var chart = scrolly.select("#chart");
var article = scrolly.select("article");
var step = article.selectAll(".step");
let dataContainer = [];

// initialize the scrollama
var scroller = scrollama();

// generic window resize listener event
function handleResize() {
  // 1. update height of step elements
  var stepH = Math.floor(window.innerHeight * 0.8);
  step.style("height", stepH + "px");

  // 2. update figure measures
  var figureH = window.innerHeight / 1.2;
  var figureMarginTop = (window.innerHeight - figureH) / 2;

  figure.style("height", figureH + "px").style("top", figureMarginTop + "px");

  // 3. update graph measures
  //console.log(figureH);
  var chartH = 600;
  var chartW = 600;

  chart.style("height", chartH + "px").style("width", chartW + "px");

  // 4. tell scrollama to update new element dimensions
  scroller.resize();
}

// scrollama event handlers
function handleStepEnter(response) {
  console.log(response);
  //console.log(dataContainer.mainData);
  // response = { element, direction, index }

  // add color to current step only
  step.classed("is-active", function(d, i) {
    return i === response.index;
  });

  // update graphic based on step
  //d => d.P1_1 === "1"

  if (response.index === 0) {
    heatMap(dataContainer.mainData, d => d, response);
  } else if (response.index === 1) {
    heatMap(dataContainer.mainData, d => d.P1_1 === "2", response);
  } else {
    heatMap(dataContainer.mainData, d => d.P1_1 === "1", response);
  }
  handleResize();
}

function setupStickyfill() {
  d3.selectAll(".sticky").each(function() {
    Stickyfill.add(this);
  });
}

function init() {
  setupStickyfill();

  // 1. force a resize on load to ensure proper dimensions are sent to scrollama
  handleResize();

  // 2. setup the scroller passing options
  // 		this will also initialize trigger observations
  // 3. bind scrollama event handlers (this can be chained like below)
  scroller
    .setup({
      step: "#scrolly article .step",
      offset: 0.33,
      debug: false
    })
    .onStepEnter(handleStepEnter);

  // setup resize event
  window.addEventListener("resize", handleResize);
}

/**
 * Loading data
 */

Promise.all([d3.csv("./data/MMSI_2016.csv")])
  .then(result => {
    // save data
    dataContainer.mainData = result[0];

    // initialize scrollama
    init();
    startsvg();
  })
  .catch(error => {
    console.log(error);
  });
