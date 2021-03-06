import {select, selectAll} from 'd3-selection';
import {scaleLinear, scaleBand} from 'd3-scale';
import {extent} from 'd3-array';
import {axisBottom} from 'd3-axis';
import {symbol, symbolTriangle, line} from 'd3-shape';
import {transition} from 'd3-transition';
import {easeBackOut} from 'd3-ease';

export default function(data) {
  if (!select('svg').empty()) {
    selectAll('svg').remove();
    select('svg').remove();
    select('#slide-content #filters div').remove();
  }
  // create data structure for lines
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

  const lineData = data.filter(({Year}) => Year === 2018 || Year === 2020);
  const preppedLine = prepData(lineData);

  let lines = svg
    .selectAll('.line-between')
    .data(preppedLine)
    .join('path')
    .attr('class', 'line-between')
    .attr('d', d => lineScale(d))
    .attr('stroke', '#fba55c')
    .attr('stroke-width', '2')
    .attr('fill', 'none');

  lines
    .attr('stroke-dashoffset', function(d) {
      if (d[0].Year === 2018) {
        const pathLength = this.getTotalLength();
        return `${pathLength}`;
      } else if (d[0].Year === 2020) {
        const pathLength = this.getTotalLength();
        return `${-pathLength}`;
      } else {
        const pathLength = this.getTotalLength();
        return `${-pathLength}`;
      }
    })

    .attr('stroke-dasharray', function(d) {
      const pathLength = this.getTotalLength();
      return `${pathLength + ' ' + pathLength}`;
    })
    .transition()
    .delay((d, i) => i * 3)
    .style('opacity', 1)
    .duration(2200)
    .attr('stroke-dashoffset', 0);

  const t = transition().duration(1600);
  const t1 = transition().duration(600);

  svg
    .selectAll('.rect')
    .data(data)
    .join(enter =>
      enter
        .append('rect')
        .attr('rx', 100)
        .attr('ry', 100)
        .attr('x', d => xScale(d[xDim]) - 5)
        .attr('y', d => yScale(d[yDim]) - 5)
        .attr('class', 'rect')
        .attr('opacity', d => {
          if (d.Year === 2012) {
            return 1;
          } else {
            return 0;
          }
        })
        .attr('width', 9)
        .attr('height', 9)
        .call(el =>
          el
            .transition(t)
            .attr('rx', 0)
            .attr('ry', 0)
            .attr('class', 'rect')
            .attr('opacity', d => {
              if (d.Year === 2012) {
                return 0.75;
              } else {
                return 0;
              }
            })
            .attr('x', d => xScale(d[xDim]) - 1.5)
            .attr('y', d => yScale(d[yDim]) - 4.5)
            .attr('width', 3)
            .attr('height', 9),
        ),
    )

    .filter(d => {
      return d.Year === 2012;
    })

    .attr('fill', '#1f77b4');

  svg
    .selectAll('.circle')
    .data(data)
    .join(enter =>
      enter
        .append('circle')

        .attr('cy', d => yScale(d[yDim]))
        .attr('cx', d => xScale(d[xDim]))
        .attr('opacity', 0)
        .call(el => el.transition(t1).attr('opacity', 1)),
    )
    .attr('class', 'circle')
    .filter(d => {
      return d.Year === 2018;
    })
    .attr('r', 4.5)
    .attr('fill', '#aec7e8');

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
            xScale(d[xDim] * -1) +
            ',' +
            yScale(d[yDim]) +
            ') rotate(330)'
          );
        })
        .call(el =>
          el
            .transition(t)
            .ease(easeBackOut.overshoot(0.25))
            .delay((d, i) => i * 3)
            .attr('transform', function(d) {
              return (
                'translate(' +
                xScale(d[xDim]) +
                ',' +
                yScale(d[yDim]) +
                ') rotate(330)'
              );
            }),
        ),
    )
    .filter(d => {
      return d.Year === 2020;
    })
    .attr('class', 'triangle')
    .attr(
      'd',
      symbol()
        .type(symbolTriangle)
        .size(35),
    )
    .attr('fill', '#923124');

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
      return d.Year === 2018;
    })
    .attr('x', d => -25 + xScale(d[xDim]))
    .attr('y', d => 3 + yScale(d[yDim]))
    .text(d => d[yDim])
    .attr('font-size', '11px')
    .attr('fill', '#aec7e8')
    .attr('font-weight', '500');

  svg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${plotHeight})`)
    .call(axisBottom(xScale).ticks(10, '.0%'));

  // Legends and Titles
  svg
    .append('rect')
    .attr('class', 'rect')
    .attr('x', plotWidth / 5.8)
    .attr('y', plotHeight / 25)
    .attr('width', 4)
    .attr('height', 9)
    .attr('fill', '#1f77b4');

  svg
    .append('rect')
    .attr('class', 'circle')
    .attr('x', plotWidth / 6)
    .attr('y', plotHeight / 15)
    .attr('width', 9)
    .attr('height', 9)
    .attr('rx', 100)
    .attr('ry', 100)
    .attr('fill', '#aec7e8');

  svg
    .append('path')
    .attr('class', 'triangle')
    .attr(
      'd',
      symbol()
        .type(symbolTriangle)
        .size(35),
    )
    .attr('transform', function(d) {
      return 'translate(' + '82,' + '52' + ') rotate(330)';
    })
    .attr('fill', '#923124');

  svg
    .append('text')
    .attr('x', plotWidth / 5)
    .attr('y', plotHeight / 9.75)
    .text('2020')
    .style('font-size', '14px')
    .attr('alignment-baseline', 'middle');

  svg
    .append('text')
    .attr('x', plotWidth / 5)
    .attr('y', plotHeight / 13)
    .text('2018')
    .style('font-size', '14px')
    .attr('alignment-baseline', 'middle');

  svg
    .append('text')
    .attr('x', plotWidth / 5)
    .attr('y', plotHeight / 20)
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
    .attr('font-size', 17)
    .text(
      'Estimated 2020 Food Insecurity Rates Exceed 2012 Rates in Many States',
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
