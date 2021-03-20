import {select, selectAll} from 'd3-selection';
import {scaleLinear, scaleBand} from 'd3-scale';
import {extent} from 'd3-array';
import {axisBottom} from 'd3-axis';
import {line} from 'd3-shape';
import {transition} from 'd3-transition';

export default function(initialData) {
  if (!select('svg').empty()) {
    selectAll('svg').remove();
    select('#slide-content #filters div').remove();
  }
  let data = initialData.filter(({Year}) => 2012 && Year <= 2018);

  const height = 600;
  const width = 550;
  const margin = {top: 40, left: 40, right: 40, bottom: 40};
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const xDim = 'Food Insecurity Rate';
  const yDim = 'State';

  function getUnique(data, key) {
    return data.reduce((acc, row) => acc.add(row[key]), new Set());
  }
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

  const t = transition().duration(1500);

  svg
    .selectAll('.circle')
    .data(data)
    .join(enter =>
      enter
        .append('circle')
        .attr('cy', d => 0)
        .attr('cx', d => 0)
        .call(el =>
          el
            .transition(t)
            .delay((d, i) => i * 1)
            .attr('cy', d => yScale(d[yDim]))
            .attr('cx', d => xScale(d[xDim])),
        ),
    )
    .attr('class', 'circle')
    .filter(d => {
      return d.Year === 2012;
    })
    .attr('r', 4.5)
    .attr('fill', '#1f77b4');

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
    .attr('class', 'circle')
    .attr('x', plotWidth / 6)
    .attr('y', plotHeight / 15)
    .attr('width', 9)
    .attr('height', 9)
    .attr('rx', 100)
    .attr('ry', 100)
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
    .attr('font-size', '18px')
    .text(
      'Food Insecurity Rates Were Still High in 2012, Due to the Great Recession',
    );
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
