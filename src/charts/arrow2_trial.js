import {select, selectAll} from 'd3-selection';
import {csv, json} from 'd3-fetch';
import {scaleLinear, scaleTime, scaleBand} from 'd3-scale';
import {extent, min, max} from 'd3-array';
import {axisBottom, axisLeft} from 'd3-axis';
import {symbol, symbolTriangle, line} from 'd3-shape';
import {transition, easeLinear} from 'd3-transition';
// import './main.css';

// very helpful resource on transitions
// https://observablehq.com/@d3/selection-join

// helpful for potential shape changes
// https://stackoverflow.com/questions/17437408/how-to-change-a-circle-into-a-square-with-d3-js

// [[{year: 2018}, {year: 2012, state: "WA"}], ...]

export default function(initialData) {
  if (!select('svg').empty()) {
    selectAll('svg').remove();
    select('svg').remove();
  }
  let data = initialData.filter(({Year}) => 2012 && Year <= 2018);

  // my bad iterative function
  function prepData(data) {
    const len = data.length;
    let fullArr = [];

    for (let i = 0; i < len; i++) {
      for (let j = 0; j < len; j++) {
        let rowArr = [];
        if (data[i].State === data[j].State && data[i].Year !== data[j].Year) {
          // console.log(data[i], data[j]);
          rowArr.push(data[i]);
          rowArr.push(data[j]);
          fullArr.push(rowArr);
        }
      }
    }
    console.log('the full arr is ', fullArr);

    return fullArr;
  }

  function getUnique(data, key) {
    return data.reduce((acc, row) => acc.add(row[key]), new Set());
  }

  const height = 900;
  const width = 800;
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

  const svg = select('#slide-content')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // [[{year: 2018}, {year: 2012, state: "WA"}], ...]
  // const preppedData = [];
  const preppedData = prepData(data);
  const t3 = transition().duration(1000);

  let lines = svg
    .selectAll('.line-between')
    .data(preppedData)
    .join('path')
    .attr('class', 'line-between')
    .attr('d', d => lineScale(d))
    .attr('stroke', '#fba55c')
    .attr('stroke-width', '2')
    .attr('fill', 'none');
  // .style('opacity', 0);

  lines
    .attr('stroke-dashoffset', function(d) {
      // Get the path length of the current element
      const pathLength = this.getTotalLength();
      // console.log(' the path length is ', pathLength);
      return `${-pathLength}`;
    })

    .attr('stroke-dasharray', function(d) {
      // Get the path length of the current element
      const pathLength = this.getTotalLength();
      // console.log(' the path length is ', pathLength);
      return `${2 * pathLength}`;
    })
    .transition()
    .delay((d, i) => i * 7)
    // .ease(easeLinear)
    .style('opacity', 1)
    .duration(2200)
    .attr('stroke-dashoffset', 0);

  // working static circles
  // svg
  //   .selectAll('.circle')
  //   .data(data)
  //   .join('circle')
  //   .filter(d => {
  //     return d.Year === 2012;
  //   })
  //   .attr('class', 'circle')
  //   .attr('cx', d => xScale(d[xDim]))
  //   .attr('cy', d => yScale(d[yDim]))
  //   .attr('r', 4)
  //   .attr('fill', '#1f77b4');

  // secret circle rect
  svg
    .selectAll('.circle')
    .data(data)
    .join('rect')
    .filter(d => {
      return d.Year === 2012;
    })
    .attr('class', 'circle')
    .attr('rx', 100)
    .attr('ry', 100)
    .attr('x', d => xScale(d[xDim]) - 5)
    .attr('y', d => yScale(d[yDim]) - 5)
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', '#1f77b4');

  const t = transition().duration(1600);
  svg
    .selectAll('.triangle')
    .append('g')
    .data(data)
    .join(enter =>
      enter
        .append('path')
        .attr('transform', function(d) {
          return (
            'translate(' +
            xScale(d[xDim]) * 5 +
            ',' +
            yScale(d[yDim]) +
            ') rotate(30)'
          );
        })
        .call(el =>
          el
            .transition(t)
            .delay((d, i) => i * 5)
            .attr('transform', function(d) {
              return (
                'translate(' +
                xScale(d[xDim]) +
                ',' +
                yScale(d[yDim]) +
                ') rotate(30)'
              );
            }),
        ),
    )

    .filter(d => {
      return d.Year === 2018;
    })
    .attr('class', 'triangle')
    .attr(
      'd',
      symbol()
        .type(symbolTriangle)
        .size(45),
    )
    .attr('fill', '#aec7e8');

  // huh huh huh
  svg
    .append('g')
    .selectAll('.text')
    .data(data)
    .join('text')
    .attr('class', 'text')
    .filter(d => {
      return d.Year === 2012;
    })
    .attr('x', d => 5 + xScale(d[xDim]))
    .attr('y', d => 3 + yScale(d[yDim]))
    .text(d => d[yDim])
    .attr('font-size', '10.5px')
    .attr('fill', '#1f77b4');

  svg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${plotHeight})`)
    .call(axisBottom(xScale).ticks(10, '.0%'));

  // Legends and Titles
  svg
    .append('rect')
    .attr('class', 'triangle')
    .attr('x', plotWidth / 15)
    .attr('y', plotHeight / 25)
    .attr('width', 9)
    .attr('height', 9)
    .attr('fill', '#1f77b4');

  svg
    .append('rect')
    .attr('class', 'circle')
    .attr('x', plotWidth / 15)
    .attr('y', plotHeight / 15)
    .attr('width', 9)
    .attr('height', 9)
    .attr('fill', '#aec7e8');

  svg
    .append('text')
    .attr('x', plotWidth / 11)
    .attr('y', plotHeight / 12.4)
    .text('2018')
    .style('font-size', '14px')
    .attr('alignment-baseline', 'middle');

  svg
    .append('text')
    .attr('x', plotWidth / 11)
    .attr('y', plotHeight / 19)
    .text('2012')
    .style('font-size', '14px')
    .attr('alignment-baseline', 'middle');

  svg
    .append('g')
    .append('text')
    .attr('class', 'title')
    .attr('text-anchor', 'middle')
    .attr('x', plotWidth / 2)
    .attr('y', 0 - margin.top / 2)
    .attr('font-size', 20)
    .text('Insecurity Rates Dropped Among All States from 2012 to 2018');
  svg
    .append('g')
    .append('text')
    .attr('class', 'x-label')
    .attr('text-anchor', 'middle')
    .attr('x', plotWidth / 2)
    .attr('y', plotHeight + 30)
    .text('Food Insecurity Rate')
    .attr('font-size', 14);
}
