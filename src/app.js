// if the data you are going to import is small, then you can import it using es6 import
// (I like to use use screaming snake case for imported json)
// import MY_DATA from './app/data/example.json'

import {select} from 'd3-selection';
import {csv, json} from 'd3-fetch';
import {axisTop, axisRight} from 'd3-axis';
import {scaleLinear, scaleTime, scaleBand} from 'd3-scale';
import {extent, min, max} from 'd3-array';
import {axisBottom, axisLeft} from 'd3-axis';
import {symbol, symbolTriangle} from 'd3-shape';
// this command imports the css file, if you remove it your css wont be applied!
import './main.css';

// this is just one example of how to import data. there are lots of ways to do it!
// csv('./data/state_covid.csv' function(d) {
//   return {
//   }
// }

function getUnique(data, key) {
  return data.reduce((acc, row) => acc.add(row[key]), new Set());
}

json('./data/state_covid.json')
  .then(data => myVis(data))
  .catch(e => {
    console.log(e);
    console.log('This SUCKS!');
  });

function myVis(data) {
  const height = 600;
  const width = 600;
  const margin = {top: 60, left: 60, right: 60, bottom: 60};
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const xDim = 'Food Insecurity Rate';
  const yDim = 'State';

  const yDomain = getUnique(data, yDim);

  console.log(extent(data, d => d[xDim]));
  console.log(extent(data, d => d[yDim]));

  console.log(data, height);
  console.log('Hi!');

  const xScale = scaleLinear()
    .domain(extent(data, d => d[xDim]))
    .range([0, plotWidth]);

  const yScale = scaleBand()
    .domain(yDomain)
    .range([0, plotHeight]);

  const svg = select('.charters')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  svg
    .selectAll('circle')
    // .append('g')
    .data(data)
    .join('circle')
    .filter(d => {
      return d.Year === 2012;
    })
    .attr('class', 'charters')
    .attr('cx', d => xScale(d[xDim]))
    .attr('cy', d => yScale(d[yDim]))
    .attr('r', 4)
    .attr('fill', '#1f77b4');

  console.log(symbol().type(symbolTriangle));

  svg
    .selectAll('triangle')
    // .append('g')
    .data(data)
    .join('path')
    .filter(d => {
      return d.Year === 2018;
    })
    .attr('class', 'charters')
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
    .selectAll('text')
    .join('text')
    .attr('class', 'charters')
    .data(data.filter(d => d.Year === 2012))
    // .filter(d => {
    //   console.log('made it');
    //   return ;
    // })
    .attr('x', d => xScale(d[xDim] - 10))
    .attr('y', d => yScale(d[yDim] - 20))
    .text(d => d[yDim]);

  console.log('made it here');

  // svg
  //   .selectAll('connect-line')
  //   .data(data)
  //   .join('circle')
  //   .filter(d => {
  //     return d.Year === 2018;
  //   })
  //   .attr('class', 'connect-line')
  //   .attr('cx', d => xScale(d[xDim]))
  //   .attr('cy', d => yScale(d[yDim]))
  //   .attr('r', 4)
  //   // .attr('stroke', 'grey')
  //   .attr('fill', '#aec7e8');

  svg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${plotHeight})`)
    .call(axisBottom(xScale).ticks(10, '.0%'));

  svg
    .append('g')
    .attr('class', 'y-axis')
    // .attr('transform', `translate(${}, 0)`)
    .call(axisLeft(yScale).ticks(10, '.0%'));
}
