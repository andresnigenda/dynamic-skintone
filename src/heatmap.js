import * as d3 from "d3";
import { transition } from "d3-transition";
//import "./transition-polyfill";

export default function heatMap(data, my_filter, response) {
  // container dimensions
  console.log("meow");
  console.log(response.index);
  const containerStart = d3
    .select("#chart")
    .node()
    .getBoundingClientRect();
  const width = containerStart.width - 50;
  const height = containerStart.height - 50;
  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  var svg = d3.select("#chart").select("svg");

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
  //console.log(processedData);

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
    .scaleOrdinal()
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
    ])
    .domain([1, getMaxVal(processedData)]);
  // ['#322d27', '#3d230d', '#4a382e', '#694d3f', '#7e6455', '#96775b', '#b4997e', '#dec198', '#e1b8b2', '#f0d1ce', '#faebee']
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

  var heatMap = svg
    .select("#plotArea")
    .selectAll()
    .data(processedData, function(d) {
      return d.NivEsc_Inf + ":" + d.NivEsc_PP;
    })
    .join(
      enter =>
        enter
          .append("rect")
          .attr("x", function(d) {
            return xScale(d.NivEsc_Inf);
          })
          .attr("y", function(d) {
            return yScale(d.NivEsc_PP);
          })
          .attr("width", xScale.bandwidth())
          .attr("height", yScale.bandwidth())
          .call(enter =>
            enter
              .transition()
              .duration(1000)
              .style("fill", function(d) {
                return myColor(d.ratio);
              })
          ),
      update =>
        update.call(update =>
          update
            .transition()
            .duration(1000)
            .style("fill", "blue")
        )
    );
}

function reduceData(data, replaceVals, filter) {
  // reduces data grouped by two variables
  // filters according to provided filterz
  // https://stackoverflow.com/questions/46794232/group-objects-by-multiple-properties-in-array-then-sum-up-their-values
  var helper = {};
  //var idx = 0;
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
  result.forEach(function(element) {
    element.ratio = element.sktw / element.Factor_Per;
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
