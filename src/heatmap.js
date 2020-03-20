import * as d3 from "d3";
import {
  annotation,
  annotationLabel,
  annotationCalloutCircle
} from "d3-svg-annotation";
import * as u from "./utils";
//import "./transition-polyfill";
//import transition from "d3-transition";
//import d3Tip from "d3-tip";

//reduceData(data, replaceVals, currentOption, specFilter)
var idx = 0;

export default function heatMap(
  data,
  currentOption,
  specFilter,
  selectId,
  response
) {
  //console.log(response.index);
  /* container dimensions */
  const containerStart = d3
    .select(selectId)
    .node()
    .getBoundingClientRect();
  const width = containerStart.width - 50;
  const height = containerStart.height - 50;
  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  var svg = d3.select(selectId).select("svg");

  const processedData = u.reduceData(
    data,
    socioLabelsD,
    currentOption,
    specFilter
  );

  /* x scale */
  var xScale = d3
    .scaleBand()
    .range([0, plotWidth])
    .domain(socioLabels)
    .padding(0.01);
  /* y scale */
  var yScale = d3
    .scaleBand()
    .range([plotHeight, 0])
    .domain(socioLabels)
    .padding(0.01);
  /* color scale */
  var myColor = d3
    .scaleLinear()
    .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
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
  /* tooltip */
  // https://stackoverflow.com/questions/16256454/d3-js-position-tooltips-using-element-position-not-mouse-position
  // https://bl.ocks.org/philipcdavis/6035183e3508e3c2e8de
  var div = d3
    .select(selectId)
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  var mouseover = function(d) {
    div
      .transition()
      .duration(200)
      .style("opacity", 0.9);
    div
      .html(
        "<div> <span class='light'> Average Skin Tone :</span> " +
          d.ratio +
          "</div>" +
          "</br>" +
          "<div> <span class='light'> Population :</span> " +
          d.Factor_Per +
          "</div>" +
          "</br>" +
          "<div> <span class='light'> Proportion :</span> " +
          d.prop +
          "</div>"
      )
      .style("left", parseInt(d3.select(this).attr("x")) + 220 + "px")
      .style("top", parseInt(d3.select(this).attr("y")) - 40 + "px");
    d3.select(this)
      .style("stroke", "purple")
      .style("stroke-width", 3)
      .style("opacity", 1);
  };

  var mouseleave = function(d) {
    div.style("opacity", 0);
    d3.select(this).style("stroke", "none");
  };

  /* x axis */
  svg
    .select(".xAxis")
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("dx", "1em")
    .attr("dy", "-0.5em")
    .style("text-anchor", "start")
    .attr("transform", "rotate(90)");

  /* y axis */
  svg.select(".yAxis").call(d3.axisLeft(yScale));

  /* line with steps */
  var line = d3
    .line()
    .x(function(d) {
      return xScaleBis(d);
    })
    .y(function(d) {
      return yScaleBis(d);
    })
    .curve(d3.curveStepBefore);

  // hacky (and probably bad) way to add an additional step
  var xScaleBis = d3
    .scaleBand()
    .range([0, plotWidth * 1.1])
    .domain(socioLabelsSteps)
    .padding(0.01);

  var yScaleBis = d3
    .scaleBand()
    .range([plotHeight * 1.1, 0])
    .domain(socioLabelsSteps)
    .padding(0.01);

  /* steps w/transition */
  svg
    .selectAll("path.line")
    .data([socioLabelsSteps])
    .enter()
    .append("path")
    .attr("class", "line")
    .attr("transform", "translate(150, 0)")
    .attr("d", d => {
      return line(d);
    })
    .attr("stroke", "purple")
    .attr("stroke-width", 3)
    .attr("fill", "none")
    .attr("stroke-dasharray", function(d) {
      return this.getTotalLength();
    })
    .attr("stroke-dashoffset", function(d) {
      return this.getTotalLength();
    })
    .transition()
    .duration(2500)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);

  /* annotations */
  const annotations = chooseAnnotation(response);
  //console.log(annotations[0].note.label);

  // make annotations function
  window.makeAnnotations = annotation()
    .annotations(annotations)
    .type(annotationLabel);
  /*     .editMode(true); */

  // add listener to steps
  /*   var activeStep = d3
    .select("#scrolly")
    .select("article")
    .selectAll(".step.is-active");

  console.log(activeStep.classed("is-active")); */
  //console.log(response);
  if (response.direction === "down") {
    var currentAnnotation = svg
      .append("g")
      .attr("class", "annotation-group")
      .call(window.makeAnnotations);
  }

  /* heatmap enter, update, exit cycle */
  // update even if rectangles don't exist
  var update = svg
    .select("#plotArea")
    .selectAll("rect")
    .data(processedData, function(d) {
      return d.socioPresent + ":" + d.socioPast;
    });

  // enter rectangles with appropriate position
  // call tooltip
  var enter = update
    .enter()
    .append("rect")
    .attr("class", "rect")
    .attr("x", function(d) {
      return xScale(d.socioPast);
    })
    .attr("y", function(d) {
      return yScale(d.socioPresent);
    })
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .on("mouseover", mouseover)
    .on("mouseout", mouseleave);

  var exit = update.exit();

  // update with transition
  update
    .transition()
    .duration(1000)
    .style("fill", function(d) {
      //console.log(myColor(d.ratio));
      return myColor(Math.round(d.ratio));
    });

  // enter rectangles with default color
  enter.style("fill", function(d) {
    return myColor(Math.round(d.ratio));
  });

  // exit rectangles that do not exist anymore
  exit
    .transition()
    .duration(1000)
    .style("fill", "grey")
    .attr("width", 0)
    .attr("height", 0)
    .remove();

  if (response.direction === "down") {
    // transition out currentAnnotation
    currentAnnotation
      .transition()
      .duration(10000)
      .style("opacity", 0);
  }
}

/* labels */
var educLabelsD = {
  "1": "No Schooling",
  "2": "Incomplete Primary",
  "3": "Complete Primary",
  "4": "Incomplete Secondary",
  "5": "Complete Secondary",
  "6": "High School",
  "7": "College or Higher",
  "9": "Not Specified"
};
var educLabels = [
  "No Schooling",
  "Incomplete Primary",
  "Complete Primary",
  "Incomplete Secondary",
  "Complete Secondary",
  "High School",
  "College or Higher"
];

var socioLabelsD = {
  "01": "1 - Lowest",
  "02": "2",
  "03": "3",
  "04": "4",
  "05": "5",
  "06": "6",
  "07": "7",
  "08": "8",
  "09": "9",
  "10": "10 - Highest"
};

var socioLabels = [
  "1 - Lowest",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10 - Highest"
];

var socioLabelsSteps = [
  "1 - Lowest",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10 - Highest",
  "11"
];

function chooseAnnotation(response) {
  if (response.index === 0) {
    return [
      {
        //below in makeAnnotations has type set to d3.annotationLabel
        //you can add this type value below to override that default
        type: annotationLabel,
        note: {
          label:
            "Bins with a higher perceived socioeconomic status than at age 14",
          title: "Direction of Highest Upward Mobility",
          wrap: 190
        },
        //settings for the subject, in this case the circle radius
        connector: {
          end: "arrow"
        },
        x: 188,
        y: 31,
        dy: 111,
        dx: 113
      },
      {
        //below in makeAnnotations has type set to d3.annotationLabel
        //you can add this type value below to override that default
        type: annotationLabel,
        note: {
          label:
            "Bins with a lower perceived socioeconomic status than at age 14",
          title: "Direction of Highest Downward Mobility",
          wrap: 190
        },
        //settings for the subject, in this case the circle radius
        connector: {
          end: "arrow"
        },
        x: 704,
        y: 554,
        dy: -119,
        dx: -112
      }
    ].map(function(d) {
      d.color = "black";
      return d;
    });
  } else if (response.index === 1) {
    return [
      {
        //below in makeAnnotations has type set to d3.annotationLabel
        //you can add this type value below to override that default
        type: annotationCalloutCircle,
        note: {
          label:
            "Women on the upper side of the graph experienced higher social mobility or reduced downward social mobility",
          title: "Better social mobility outcomes",
          wrap: 190
        },
        //settings for the subject, in this case the circle radius
        subject: {
          radius: 140
        },
        x: 416,
        y: 146,
        dx: 0,
        dy: 232
      }
    ].map(function(d) {
      d.color = "black";
      return d;
    });
  } else if (response.index === 2) {
    return [
      {
        //below in makeAnnotations has type set to d3.annotationLabel
        //you can add this type value below to override that default
        type: annotationCalloutCircle,
        note: {
          label: "There are empty buckets at the highest levels of mobility",
          title: "No high upward mobility",
          wrap: 180
        },
        //settings for the subject, in this case the circle radius
        subject: {
          radius: 90
        },
        x: 245,
        y: 97,
        dx: 114,
        dy: 6
      }
    ].map(function(d) {
      d.color = "black";
      return d;
    });
  } else if (response.index === 3) {
    return [
      {
        //below in makeAnnotations has type set to d3.annotationLabel
        //you can add this type value below to override that default
        type: annotationLabel,
        note: {
          label: "(if you are lighter-skinned)",
          title: "Highest mobility",
          wrap: 180
        },
        connector: {
          end: "dot"
        },
        x: 180,
        y: 33,
        dx: 81,
        dy: 41
      }
    ].map(function(d) {
      d.color = "black";
      return d;
    });
  } else {
    return [];
  }
}
