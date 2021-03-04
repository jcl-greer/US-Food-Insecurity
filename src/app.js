import {select} from 'd3-selection';
import {csv, json} from 'd3-fetch';
import {axisTop, axisRight} from 'd3-axis';
import {scaleLinear, scaleTime, scaleBand} from 'd3-scale';
import {extent, min, max} from 'd3-array';
import {axisBottom, axisLeft} from 'd3-axis';
import {symbol, symbolTriangle, line} from 'd3-shape';
import './main.css';

function getUnique(data, key) {
  return data.reduce((acc, row) => acc.add(row[key]), new Set());
}

json('./data/state_covid.json')
  .then(x => x.filter(({Year}) => 2012 && Year <= 2018))
  .then(data => myVis(data))
  .catch(e => {
    console.log(e);
  });

// [[{year: 2018}, {year: 2012, state: "WA"}], ...]

function myVis(data) {
  // my bad iterative function
  function prepData(data) {
    const len = data.length;
    let fullArr = [];

    for (let i = 0; i < len; i++) {
      for (let j = 0; j < len; j++) {
        let rowArr = [];
        if (data[i].State === data[j].State && data[i].Year !== data[j].Year) {
          console.log(data[i], data[j]);
          rowArr.push(data[i]);
          rowArr.push(data[j]);
          fullArr.push(rowArr);
        }
      }
    }
    console.log('the full arr is ', fullArr);

    return fullArr;
  }

  const height = 700;
  const width = 700;
  const margin = {top: 60, left: 60, right: 60, bottom: 60};
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const xDim = 'Food Insecurity Rate';
  const yDim = 'State';

  const yDomain = getUnique(data, yDim);

  console.log(extent(data, d => d[xDim]));
  console.log(extent(data, d => d[yDim]));

  console.log(data, height);

  const xScale = scaleLinear()
    .domain(extent(data, d => d[xDim]))
    .range([0, plotWidth]);

  const yScale = scaleBand()
    .domain(yDomain)
    .range([0, plotHeight]);

  const lineScale = line()
    .x(d => xScale(d[xDim]))
    .y(d => yScale(d[yDim]));

  const svg = select('.charters')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // [[{year: 2018}, {year: 2012, state: "WA"}], ...]
  // const preppedData = [];
  const preppedData = prepData(data);

  svg
    .selectAll('.line-between')
    .data(preppedData)
    .join('path')
    .attr('class', 'line-between')
    .attr('d', d => lineScale(d))
    .attr('stroke', '#fba55c')
    .attr('stroke-width', '2')
    .attr('fill', 'none');

  svg
    .selectAll('.circle')
    .data(data)
    .join('circle')
    .filter(d => {
      return d.Year === 2012;
    })
    .attr('class', 'circle')
    .attr('cx', d => xScale(d[xDim]))
    .attr('cy', d => yScale(d[yDim]))
    .attr('r', 4)
    .attr('fill', '#1f77b4');

  svg
    .selectAll('.triangle')
    .append('g')
    .data(data)
    .join('path')
    .filter(d => {
      return d.Year === 2018;
    })
    .attr('class', 'triangle')
    .attr(
      'd',
      symbol()
        .type(symbolTriangle)
        .size(35),
    )
    .attr('transform', function(d) {
      return (
        'translate(' + xScale(d[xDim]) + ',' + yScale(d[yDim]) + ') rotate(30)'
      );
    })
    .attr('fill', '#aec7e8');

  svg
    .selectAll('.text')
    .join('text')
    .append('g')
    .attr('class', 'text')
    .filter(d => {
      return d.Year === 2012;
    })
    .attr('x', d => xScale(d[xDim]))
    .attr('y', d => yScale(d[yDim]))
    .text(d => d[yDim]);

  svg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${plotHeight})`)
    .call(axisBottom(xScale).ticks(10, '.0%'));

  svg
    .append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(-5, 0)`)
    .call(axisLeft(yScale).ticks(10, '.0%'));
}
