import * as d3 from "d3";
import transition from "d3-transition";
import d3Tip from "d3-tip";
//import "./transition-polyfill";

export default function heatMap(data, my_filter, response) {
  // container dimensions
  console.log(response.index);
  const containerStart = d3
    .select(".chart")
    .node()
    .getBoundingClientRect();
  const width = containerStart.width - 50;
  const height = containerStart.height - 50;
  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  var svg = d3.select(".chart").select("svg");

  // work with data
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

  const processedData = reduceData(data, educLabelsD, my_filter);

  // x scale
  var xScale = d3
    .scaleBand()
    .range([0, plotWidth])
    .domain(educLabels)
    .padding(0.01);
  // y scale
  var yScale = d3
    .scaleBand()
    .range([plotHeight, 0])
    .domain(educLabels)
    .padding(0.01);
  // color scale
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

  // tooltip
  var div = d3
    .select(".chart")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // https://stackoverflow.com/questions/16256454/d3-js-position-tooltips-using-element-position-not-mouse-position
  // https://bl.ocks.org/philipcdavis/6035183e3508e3c2e8de
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
      .style("left", parseInt(d3.select(this).attr("x")) + 150 + "px")
      .style("top", parseInt(d3.select(this).attr("y")) - 5 + "px");
    d3.select(this)
      .style("stroke", "purple")
      .style("stroke-width", 2)
      .style("opacity", 1);
  };

  var mouseleave = function(d) {
    div.style("opacity", 0);
    d3.select(this).style("stroke", "none");
  };

  // steps
  svg
    .select("#plotArea")
    .data(processedData)
    .enter()
    .append("line")
    .attr("class", "line")
    .style("stroke", "orange")
    .style("opacity", 1)
    .attr("x", function(d) {
      return xScale(d.NivEsc_PP);
    })
    .attr("y", function(d) {
      return yScale(d.NivEsc_PP);
    })
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth());

  // x axis
  svg
    .select(".xAxis")
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("dx", "1em")
    .attr("dy", "-0.5em")
    .style("text-anchor", "start")
    .attr("transform", "rotate(90)");

  // y axis
  svg.select(".yAxis").call(d3.axisLeft(yScale));

  // plot + transition v5
  // update even if rectangles don't exist
  var update = svg
    .select("#plotArea")
    .selectAll("rect")
    .data(processedData, function(d) {
      return d.NivEsc_Inf + ":" + d.NivEsc_PP;
    });

  // enter rectangles with appropriate position
  // call tooltip
  var enter = update
    .enter()
    .append("rect")
    .attr("class", "rect")
    .attr("x", function(d) {
      return xScale(d.NivEsc_PP);
    })
    .attr("y", function(d) {
      return yScale(d.NivEsc_Inf);
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
      console.log(myColor(d.ratio));
      return myColor(d.ratio);
    });

  // enter rectangles with default color
  enter.style("fill", function(d) {
    console.log(d.ratio);
    console.log(Math.round(d.ratio));
    console.log(myColor(Math.round(d.ratio)));
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
}

// HELPER FUNCTIONS
function reduceData(data, replaceVals, filter) {
  // reduces data grouped by two variables
  // filters according to provided selections
  // https://stackoverflow.com/questions/46794232/group-objects-by-multiple-properties-in-array-then-sum-up-their-values
  var helper = {};
  var result = data
    .filter(d => {
      return filter(d);
    })
    .reduce(function(r, item) {
      //idx += 1;
      // filter row
      var filteredItem = (({ NivEsc_Inf, NivEsc_PP, Factor_Per, P10_2 }) => ({
        NivEsc_Inf,
        NivEsc_PP,
        Factor_Per,
        P10_2
      }))(item);
      if (!excludeThis(filteredItem)) {
        // define variables
        var informant = replaceVals[filteredItem.NivEsc_Inf];
        var princProv = replaceVals[filteredItem.NivEsc_PP];
        var pop = convertStringToNumber(filteredItem.Factor_Per);
        var skinTone = convertStringToNumber(filteredItem.P10_2);
        var skinToneWeight = pop * skinTone;
        var key = informant + "-" + princProv;
        var finalItem = {
          NivEsc_Inf: informant,
          NivEsc_PP: princProv,
          Factor_Per: pop,
          sktw: skinToneWeight
        };

        if (!helper[key]) {
          helper[key] = Object.assign({}, finalItem);
          r.push(helper[key]);
        } else {
          helper[key].Factor_Per += pop;
          helper[key].sktw += skinToneWeight;
        }
      }
      //console.log(r);
      return r;
    }, []);
  // total population
  let initialValue = 0;
  let totalPop = result.reduce(function(accumulator, currentValue) {
    return accumulator + currentValue.Factor_Per;
  }, initialValue);
  // add average skintone and proportion of population
  result.forEach(function(element) {
    element.ratio = Math.round((element.sktw / element.Factor_Per) * 100) / 100;
    element.prop =
      parseFloat((element.Factor_Per / totalPop) * 100).toFixed(2) + "%";
  });
  console.log(result);
  return result;
}

function convertStringToNumber(str) {
  // convert string to number
  return Number(str.split(",").join(""));
}

function excludeThis(obj) {
  // checks if any entry in object is undefined or missing
  const entries = Object.entries(obj);
  var flag = false;
  for (const [key, value] of entries) {
    if (typeof value === "undefined") {
      flag = true;
      return flag;
    } else if (value === " ") {
      flag = true;
      return flag;
    } else if (value === "9") {
      flag = true;
      return flag;
    }
  }
  return flag;
}

function getMaxVal(array) {
  // gets the max value of the specified variable in the array
  //console.log(array);
  var maxVal = Math.max.apply(
    Math,
    array.map(function(o) {
      return o.Factor_Per;
    })
  );
  return maxVal;
}
