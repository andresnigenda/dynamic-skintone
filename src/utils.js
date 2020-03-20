// helper functions
import * as d3 from "d3";
function filterFunc(data, currentOption, specFilter) {
  return currentOption === "all" ? data : data.filter(specFilter);
}

/* data
    .filter(d => {
      return filter(d);
    }) */

export function reduceData(data, replaceVals, currentOption, specFilter) {
  // reduces data grouped by two variables
  // filters according to provided selections
  // https://stackoverflow.com/questions/46794232/group-objects-by-multiple-properties-in-array-then-sum-up-their-values
  var helper = {};
  var result = filterFunc(data, currentOption, specFilter).reduce(function(
    r,
    item
  ) {
    //idx += 1;
    // filter row
    //var filteredItem = (({ NivEsc_Inf, NivEsc_PP, Factor_Per, P10_2 }) => ({
    var filteredItem = (({ P12_1, P12_2, Factor_Per, P10_2 }) => ({
      P12_1,
      P12_2,
      Factor_Per,
      P10_2
    }))(item);
    if (!excludeThis(filteredItem)) {
      // define variables
      var present = replaceVals[filteredItem.P12_1];
      var past = replaceVals[filteredItem.P12_2];
      var pop = convertStringToNumber(filteredItem.Factor_Per);
      var skinTone = convertStringToNumber(filteredItem.P10_2);
      var skinToneWeight = pop * skinTone;
      var key = present + "-" + past;
      var finalItem = {
        socioPresent: present,
        socioPast: past,
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
  },
  []);
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
  //console.log(result);
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
    } /* else if (value === "9") {
        flag = true;
        return flag;
      } */
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
