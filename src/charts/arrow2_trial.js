import {select, selectAll} from 'd3-selection';
import {scaleLinear, scaleTime, scaleBand} from 'd3-scale';
import {extent, min, max} from 'd3-array';
import {axisBottom, axisLeft} from 'd3-axis';
import {symbol, symbolTriangle, line} from 'd3-shape';
import {transition, easeLinear} from 'd3-transition';
import {interpolatePath} from 'd3-interpolate-path';

// very helpful resource on transitions
// https://observablehq.com/@d3/selection-join

// helpful for potential shape changes
// https://stackoverflow.com/questions/17437408/how-to-change-a-circle-into-a-square-with-d3-js

export default function(initialData) {
  if (!select('svg').empty()) {
    selectAll('svg').remove();
    select('svg').remove();
  }
  let data = initialData.filter(({Year}) => 2012 && Year <= 2018);

  // configures data into form appropriate for line plotting
  function prepData(data) {
    const len = data.length;
    let fullArr = [];

    for (let i = 0; i < len; i++) {
      for (let j = 0; j < len; j++) {
        let rowArr = [];
        if (data[i].State === data[j].State && data[i].Year !== data[j].Year) {
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

  const height = 600;
  const width = 550;
  const margin = {top: 40, left: 40, right: 40, bottom: 40};
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const xDim = 'Food Insecurity Rate';
  const yDim = 'State';

  const yDomain = getUnique(data, yDim);

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

  lines
    .attr('stroke-dashoffset', function(d) {
      const pathLength = this.getTotalLength();
      return `${pathLength}`;
    })

    .attr('stroke-dasharray', function(d) {
      const pathLength = this.getTotalLength();
      return `${pathLength}`;
    })
    .transition()
    .delay((d, i) => i * 7)
    .style('opacity', 1)
    .duration(2200)
    .attr('stroke-dashoffset', 0);

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
    .attr('x', d => xScale(d[xDim]) - 4.5)
    .attr('y', d => yScale(d[yDim]) - 4.5)
    .attr('width', 9)
    .attr('height', 9)
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
        .size(35),
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
    .attr('x', d => 8 + xScale(d[xDim]))
    .attr('y', d => 4 + yScale(d[yDim]))
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
    .attr('font-size', '18px')
    .text('Insecurity Rates Dropped Among All States from 2012 to 2018');
  svg
    .append('g')
    .append('text')
    .attr('class', 'x-label')
    .attr('text-anchor', 'middle')
    .attr('x', plotWidth / 2)
    .attr('y', plotHeight + 30)
    .text('Food Insecurity Rate')
    .attr('font-size', '14px');
}
