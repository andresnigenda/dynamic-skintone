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
 * legend
 */
var keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
var myColor = d3
  .scaleLinear()
  .domain(keys)
  .range([
    "#322d27",
    "#3d230d",
    "#4a382e",
    "#694d3f",
    "#7e6455",
    "#96775b",
    "#b4997e",
    "#dec198",
    "#e1b8b2",
    "#f0d1ce",
    "#faebee"
  ]);

// #legend"

setupLegend("#legend", 40, 330, 55, myColor, keys);
setupLegend("#legend2", 30, 50, 40, myColor, keys);

function setupLegend(tagId, size, height, heightY, colors, keys) {
  var legendSVG = d3
    .select(tagId)
    .append("svg")
    .attr("width", size * 11)
    .attr("height", height);

  legendSVG
    .selectAll(".legend")
    .data(keys)
    .enter()
    .append("rect")
    .attr("x", function(d, i) {
      return i * size;
    })
    .attr("width", size)
    .attr("height", size)
    .style("fill", function(d) {
      return colors(d);
    });

  legendSVG
    .selectAll(".labels")
    .data(keys)
    .enter()
    .append("text")
    .attr("y", heightY)
    .attr("x", function(d, i) {
      return size * 0.4 + i * size;
    })
    .attr("width", size)
    .attr("height", size)
    .style("fill", "black")
    .text(function(d) {
      return d;
    })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle");
}

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
  //console.log(response);
  //console.log(dataContainer.mainData);
  // response = { element, direction, index }

  // add color to current step only
  step.classed("is-active", function(d, i) {
    return i === response.index;
  });

  // update graphic based on step
  if (response.index === 0) {
    heatMap(dataContainer.mainData, "", d => d, ".chart", response); // all
  } else if (response.index === 1) {
    heatMap(
      dataContainer.mainData,
      "",
      d => d.P1_1 === "2", // women
      ".chart",
      response
    ); // women
  } else if (response.index === 2) {
    heatMap(
      dataContainer.mainData,
      "",
      d => d.P10_3 === "1", // black
      ".chart",
      response
    ); // rural
  } else if (response.index === 3) {
    heatMap(
      dataContainer.mainData,
      "",
      d => d.est_socio_ENH === "4", // high socioeconomic
      ".chart",
      response
    ); // college or more
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
    heatMap(dataContainer.mainData, "", d => d, ".compare", NaN);
    // schooling dropdown
    var schoolDropDown = setDropDown(
      "#schooling",
      "schoolDropdown",
      schoolData
    );
    schoolDropDown.on("change", menuChanged);

    // mother's education
    var agegroupDropDown = setDropDown(
      "#agegroup",
      "agegroupDropdown",
      agegroupData
    );
    agegroupDropDown.on("change", menuChanged);

    // race dropdown
    var raceDropDown = setDropDown("#race", "raceDropdown", raceData);
    raceDropDown.on("change", menuChanged);

    // gender
    var genderDropDown = setDropDown("#gender", "genderDropdown", genderData);
    genderDropDown.on("change", menuChanged);

    // census sociostatus
    var sociostatusDropDown = setDropDown(
      "#sociostatus",
      "sociostatusDropdown",
      sociostatusData
    );
    sociostatusDropDown.on("change", menuChanged);
  })
  .catch(error => {
    console.log(error);
  });

var elements = document.getElementsByTagName("select");
// add listener

function menuChanged() {
  var selectedValue = d3.event.target.value;
  //console.log(selectedValue);
  var dropdownType = d3.event.target.id;
  if (dropdownType === "schoolDropdown") {
    heatMap(
      dataContainer.mainData,
      selectedValue,
      d => d.NivEsc_Inf === selectedValue,
      ".compare",
      NaN
    );
  } else if (dropdownType === "raceDropdown") {
    heatMap(
      dataContainer.mainData,
      selectedValue,
      d => d.P10_3 === selectedValue,
      ".compare",
      NaN
    );
  } else if (dropdownType === "genderDropdown") {
    heatMap(
      dataContainer.mainData,
      selectedValue,
      d => d.P1_1 === selectedValue,
      ".compare",
      NaN
    );
  } else if (dropdownType === "sociostatusDropdown") {
    heatMap(
      dataContainer.mainData,
      selectedValue,
      d => d.est_socio_ENH === selectedValue,
      ".compare",
      NaN
    );
  } else if (dropdownType === "agegroupDropdown") {
    heatMap(
      dataContainer.mainData,
      selectedValue,
      d => d.Edad_Ag2 === selectedValue,
      ".compare",
      NaN
    );
  }
}

function setDropDown(myClass, myId, optionsData) {
  // race dropdown
  var dropDown = d3
    .select(myClass)
    .append("select")
    .attr("id", myId);

  var options = dropDown
    .selectAll("option")
    .data(optionsData)
    .enter()
    .append("option");

  options
    .text(function(d) {
      return d.text;
    })
    .attr("value", function(d) {
      return d.value;
    });
  return dropDown;
}

var schoolData = [
  { value: "all", text: "All" },
  { value: "1", text: "No Schooling" },
  { value: "2", text: "Incomplete Primary" },
  { value: "3", text: "Complete Primary" },
  { value: "4", text: "Incomplete Secondary" },
  { value: "5", text: "Complete Secondary" },
  { value: "6", text: "High School" },
  { value: "7", text: "College or Higher" }
];

var agegroupData = [
  { value: "all", text: "All" },
  { value: "1", text: "25 to 34 yrs" },
  { value: "2", text: "35 to 44 yrs" },
  { value: "3", text: "45 to 54 yrs" },
  { value: "4", text: "55 to 64 yrs" }
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

var raceData = [
  { value: "all", text: "All" },
  { value: "1", text: "Black / Black-Mixed" },
  { value: "2", text: "Indigenous" },
  { value: "3", text: "Mixed" },
  { value: "4", text: "White" },
  { value: "5", text: "Other" },
  { value: "9", text: "Doesn't know" }
];

var genderData = [
  { value: "all", text: "All" },
  { value: "1", text: "Male" },
  { value: "2", text: "Female" }
];

var sociostatusData = [
  { value: "all", text: "All" },
  { value: "1", text: "Low" },
  { value: "2", text: "Medium low" },
  { value: "3", text: "Medium high" },
  { value: "4", text: "High" }
];
