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
import startsvg from "./startsvg";
import startsvgC from "./compare";

/**
 * Scrolly section
 */

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
  // d.P1_1 === "2" - women
  // d.est_socio_ENH === "1" - bajo
  /* heatMap(data, currentOption, specFilter, selectId) */

  if (response.index === 0) {
    heatMap(dataContainer.mainData, "", d => d, ".chart"); // all
  } else if (response.index === 1) {
    heatMap(dataContainer.mainData, "", d => d.P1_1 === "2", ".chart"); // women
  } else if (response.index === 2) {
    heatMap(dataContainer.mainData, "", d => d.TamLoc_Ag1 === "1", ".chart"); // rural
  } else if (response.index === 3) {
    heatMap(dataContainer.mainData, "", d => d.NivEsc_Inf === "7", ".chart"); // college or more
  }
  handleResize();
}
//dataContainer.mainData, d => d.P1_1 === "2" && d.est_socio_ENH === "1",
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
 * Do all
 */

Promise.all([d3.csv("./data/MMSI_2016.csv")])
  .then(result => {
    /**
     *  Load data
     */
    dataContainer.mainData = result[0];

    /**
     *  Scrollytelling
     */
    init();
    startsvg("#chart");

    /**
     *  Compare
     */
    // initial map
    startsvgC("#chart1");
    heatMap(dataContainer.mainData, "", d => d, ".compare");
    // schooling dropdown
    var schoolDropDown = d3
      .select(".dropdown")
      .append("select")
      .attr("id", "schoolDropdown");

    var schoolOptions = schoolDropDown
      .selectAll("option")
      .data(educData)
      .enter()
      .append("option");

    schoolOptions
      .text(function(d) {
        return d.text;
      })
      .attr("value", function(d) {
        return d.value;
      });

    schoolDropDown.on("change", menuChanged);
    //raceDropDown.on("change")

    function menuChanged() {
      var selectedValue = d3.event.target.value;
      console.log(selectedValue);
      console.log(d3.event.target.id);
      heatMap(
        dataContainer.mainData,
        selectedValue,
        d => d.NivEsc_Inf === selectedValue,
        ".compare"
      );
    }
  })
  .catch(error => {
    console.log(error);
  });

// add listener

var educData = [
  { value: "all", text: "All" },
  { value: "1", text: "No Schooling" },
  { value: "2", text: "Incomplete Primary" },
  { value: "3", text: "Complete Primary" },
  { value: "4", text: "Incomplete Secondary" },
  { value: "5", text: "Complete Secondary" },
  { value: "6", text: "High School" },
  { value: "7", text: "College or Higher" }
];

var raceData = [
  { value: "all", text: "All" },
  { value: "1", text: "Black / Black-Mixed" },
  { value: "2", text: "Indigenous" },
  { value: "3", text: "Mixed" },
  { value: "4", text: "White" },
  { value: "5", text: "Other" },
  { value: "9", text: "Doesn't know" }
];
