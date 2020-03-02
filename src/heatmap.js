import * as d3 from 'd3';

export default function heatMapAll(data, response) {
    // container dimensions
    const containerStart = d3.select("#chart").node().getBoundingClientRect();
    const width = containerStart.width;
    const height = containerStart.height;
    const margin = {top: 10, right: 10, bottom: 10, left: 10};
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    var svg = d3.select("#chart").select("svg");

    const duration = 1000;

    // work with data
    var educLabelsD = {"1": "No Schooling", 
                        "2": "Incomplete Primary",
                        "3": "Complete Primary",
                        "4": "Incomplete Secondary",
                        "5": "Complete Secondary",
                        "6": "High School",
                        "7": "College or Higher",
                        "9": "Not Specified"};
    var educLabels = ["No Schooling", 
                        "Incomplete Primary",
                        "Complete Primary",
                        "Incomplete Secondary",
                        "Complete Secondary",
                        "High School",
                        "College or Higher"];
    
    const processedData = reduceData(data, educLabelsD);
    console.log(processedData);

    // scales
    var xScale = d3.scaleBand()
      .range([ 0, plotWidth])
      .domain(educLabels)
      .padding(0.01);
    var yScale = d3.scaleBand()
      .range([ height, 0 ])
      .domain(educLabels)
      .padding(0.01);
    var myColor = d3.scaleLinear()
      .range(["white", "#69b3a2"])
      .domain([1, 380000]); // add max function!
    

    // axis, labels PENDING
    console.log(height);
    svg.select(".xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("dx", "1em")
        .attr("dy", "-0.5em")
        .style("text-anchor", "start")
        .attr("transform", "rotate(90)");
    
    svg.append("text")
        .attr("transform",
              "translate(" + (width) + " ," + 
                             (height + margin.top + 115) + ")")
        .style("text-anchor", "middle")
        .text("Highest Degree Earned")
        .attr("font-size", "12px");
    
    svg.select(".yaxis")
        .call(d3.axisLeft(yScale));

    // plot
    svg.selectAll()
        .data(processedData, function(d) {return d.NivEsc_Inf + ":" + d.NivEsc_PP;})
        .enter()
        .append("rect")
        .attr("x", function(d) {return xScale(d.NivEsc_Inf)})
        .attr("y", function(d) {return yScale(d.NivEsc_PP)})
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill", function(d) { return myColor(d.Factor_Per)} )

}

function reduceData(data, replaceVals) {
    // reduces data grouped by two variables
    // https://stackoverflow.com/questions/46794232/group-objects-by-multiple-properties-in-array-then-sum-up-their-values
    var helper = {};
    //var idx = 0;
    var result = data.reduce(function(r, item) {
      //idx += 1;
      // filter row
      var filteredItem = (({ NivEsc_Inf, NivEsc_PP, Factor_Per, P10_2}) => ({ NivEsc_Inf, NivEsc_PP, Factor_Per, P10_2}))(item);
      if(!excludeThis(filteredItem)) {
        // define variables
        var informant = replaceVals[filteredItem.NivEsc_Inf];
        var princProv = replaceVals[filteredItem.NivEsc_PP];
        var pop = convertStringToNumber(filteredItem.Factor_Per);
        var skinTone = convertStringToNumber(filteredItem.P10_2);
        var key = informant + '-' + princProv;
        var finalItem = {NivEsc_Inf: informant, NivEsc_PP: princProv, Factor_Per: pop, P10_2: skinTone};
  
        if(!helper[key]) {
          helper[key] = Object.assign({}, finalItem);
          r.push(helper[key]);
        } else {
          helper[key].Factor_Per += pop;
          helper[key].P10_2 += skinTone;
        }}
        //console.log(r);
        return r;
      }, []);
    return result;
    //console.log(result);
  };

function convertStringToNumber(str) {
    // convert string to number
    return Number(str.split(",").join(""));
  };
  
function excludeThis(obj) {
    // checks if any entry in object is undefined or missing
    const entries = Object.entries(obj);
    var flag = false;
    for (const [key, value] of entries) {
      if (typeof value === 'undefined') {
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
  };
