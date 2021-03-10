import {select} from 'd3-selection';
import {csv, json} from 'd3-fetch';
import {scaleLinear, scaleTime, scaleBand} from 'd3-scale';
import {extent, min, max, sum} from 'd3-array';
import {axisBottom, axisLeft} from 'd3-axis';
import {symbol, symbolTriangle, line} from 'd3-shape';
import {transition, easeLinear} from 'd3-transition';
import './main.css';
import arrow1 from './charts/arrow1_trial';
import arrow2 from './charts/arrow2_trial';
import arrow3 from './charts/arrow3_trial';

// very helpful resource on stacked bars
// https://observablehq.com/@d3/single-stack-normalized-horizontal-bar-chart

json('./data/final_state_insecurity.json')
  .then(myVis)
  .catch(e => {
    console.log(e);
  });

// function getUnique(data, key) {
//   return data.reduce((acc, row) => acc.add(row[key]), new Set());
// }

function prepData(data) {
  let fullArr = [];
  for (let i = 0; i < data.length; i++) {
    let obj = data[i];
    let newObj = {state: obj.State, value: obj['# of Food Insecure Persons']};
    // console.log('The New Object is ', newObj);
    fullArr.push(newObj);
  }
  return fullArr;
}

function myVis(initialData) {
  console.log('the data is ', initialData);
  let yearData = initialData.filter(d => d.Year === 2018);
  const xDim = '# of Food Insecure Persons';
  let data = prepData(yearData.sort((a, b) => (a[xDim] > b[xDim] ? 1 : -1)));

  console.log('the new data is ', data);
  const height = 600;
  const width = 1600;
  const margin = {top: 10, left: 60, right: 60, bottom: 10};
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  function stack(data) {
    const total = sum(data, d => d.value);
    let value = 0;
    return data.map(d => ({
      state: d.state,
      value: d.value / total,
      startValue: value / total,
      endValue: (value += d.value) / total,
    }));
  }

  let stackData = stack(data);

  const xScale = scaleLinear()
    .domain([0, 1])
    .range([margin.left, plotWidth - margin.right]);

  // // const yScale = scaleBand()
  // //   .domain(yDomain)
  // //   .range([0, plotHeight]);

  const svg = select('#slide-content')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  svg
    .selectAll('.rect')
    .data(stackData)
    .join('rect')
    .attr('x', d => xScale(d.startValue))
    .attr('y', plotHeight / 1.3)
    .attr('width', d => xScale(d.endValue) - xScale(d.startValue))
    .attr('height', plotHeight / 6)
    .attr('fill', 'steelblue')
    .attr('stroke', 'white');

  svg
    .append('g')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 12)
    .selectAll('text')
    .data(stackData)
    .join('text')
    .attr('transform', d => `translate(${xScale(d.startValue) + 6}, 6)`)
    .call(text =>
      text
        .append('tspan')
        .attr('x', 0)
        .attr('y', 430)
        .attr('fill-opacity', 0.7)
        .text(d => d.state),
    );
}
