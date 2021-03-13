import {select, selectAll} from 'd3-selection';
import {csv, json} from 'd3-fetch';
import {scaleLinear, scaleTime, scaleBand} from 'd3-scale';
import {extent, min, max} from 'd3-array';
import {axisBottom, axisLeft} from 'd3-axis';
import {symbol, symbolTriangle, line} from 'd3-shape';
import {transition, easeLinear} from 'd3-transition';
import {ease, easeCubicIn, easeBounceOut, easeBackInOut} from 'd3-ease';
// import './main.css';

// very helpful resource on transitions
// https://observablehq.com/@d3/selection-join

// for those pesky labels
// https://observablehq.com/@abebrath/scatterplot-of-text-labels

// json('./data/state_covid.json')
//   .then(x => x.filter(({Year}) => 2012 && Year <= 2018))
//   .then(data => arrow1(data))
//   .catch(e => {
//     console.log(e);
//   });

export default function(initialData) {
  if (!select('svg').empty()) {
    // select('svg').remove();
    selectAll('svg').remove();
  }
  let data = initialData.filter(({Year}) => 2012 && Year <= 2018);

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

  // console.log(extent(data, d => d[xDim]));
  // console.log(extent(data, d => d[yDim]));

  // console.log(data, height);

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

  const t = transition().duration(1500);

  // working transition circles
  svg
    .selectAll('.circle')
    .data(data)

    .join(enter =>
      enter
        .append('circle')
        .attr('cy', d => yScale(d[yDim]) * 0)
        .attr('cx', d => xScale(d[xDim]) * 1.5)
        .call(el =>
          el
            .transition(t)
            // .ease(easeBackInOut.overshoot(0.5))
            .delay((d, i) => i * 1)
            .attr('cy', d => yScale(d[yDim]))
            .attr('cx', d => xScale(d[xDim])),
        ),
    )
    .attr('class', 'circle')
    .filter(d => {
      return d.Year === 2012;
    })
    .attr('r', 5)
    .attr('fill', '#1f77b4');

  // Try out delay on this after the circles appear

  const t2 = transition().duration(3000);
  svg
    .append('g')
    .selectAll('.text')
    .data(data)
    .join(enter =>
      enter
        .append('text')
        .attr('opacity', 0)
        .call(el => el.transition(t2).attr('opacity', 1)),
    )
    .attr('class', 'text')
    .filter(d => {
      return d.Year === 2012;
    })
    .attr('x', d => 5 + xScale(d[xDim]))
    .attr('y', d => 3 + yScale(d[yDim]))
    .text(d => d[yDim])
    .attr('font-size', '11px')
    .attr('fill', '#1f77b4');

  svg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${plotHeight})`)
    .call(axisBottom(xScale).ticks(10, '.0%'));

  // Legends and Titles
  svg
    .append('rect')
    .attr('class', 'circle')
    .attr('x', plotWidth / 6)
    .attr('y', plotHeight / 15)
    .attr('width', 9)
    .attr('height', 9)
    .attr('fill', '#1f77b4');

  svg
    .append('text')
    .attr('x', plotWidth / 5)
    .attr('y', plotHeight / 13)
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
    .text(
      'State Food Insecurity Rates in 2012 Were Still High Due to the Great Recession',
    );
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
