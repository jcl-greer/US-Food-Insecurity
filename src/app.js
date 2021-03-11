import {select} from 'd3-selection';
import {csv, json} from 'd3-fetch';
import {scaleLinear, scaleTime, scaleBand} from 'd3-scale';
import {extent, min, max, sum} from 'd3-array';
import {axisBottom, axisLeft} from 'd3-axis';
import {format} from 'd3-format';
import {symbol, symbolTriangle, line} from 'd3-shape';
import {scaleQuantile} from 'd3-scale';
import {transition} from 'd3-transition';
import {ease, easeCubicIn, easeBounceOut, easeBackInOut} from 'd3-ease';
import './main.css';
import arrow1 from './charts/arrow1_trial';
import arrow2 from './charts/arrow2_trial';
import arrow3 from './charts/arrow3_trial';

json('./data/final_state_insecurity.json')
  .then(myVis)
  .catch(e => {
    console.log(e);
  });

function myVis(initialData) {
  console.log('the data is ', initialData);
  let data = initialData.filter(d => d.Year === 2018);

  console.log('The new data is ', data);

  const height = 500;
  const width = 800;
  const margin = {left: 100, top: 50, bottom: 50, right: 50};
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const xDim = 'Weighted Annual Food Budget Shortfall';
  const yDim = 'Annual Food Budget Shortfall Per 100000';

  const colorVar = '% With High Meal Costs';

  const xScale = scaleLinear()
    .domain([
      min(data, d => d[xDim] - 10000000),
      max(data, d => d[xDim] + 100000000),
    ])
    .range([0, plotWidth]);

  const yScale = scaleLinear()
    .domain([
      min(data, d => d[yDim] - 250000),
      max(data, d => d[yDim]) + 300000,
    ])
    .range([plotHeight, 0]);

  const colorScale = scaleQuantile()
    .domain(extent(data, d => d[colorVar]))
    .range(['#a7d4ff', '#bbd9f1', '#77aaff', '#4383ed', '#0960c5', '#003c99']);

  const svg = select('#slide-content')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // svg
  //   .selectAll('.budget-scatter')
  //   .data(data)
  //   .join('circle')
  //   .attr('class', 'budget-scatter')
  //   .attr('cx', d => xScale(d[xDim]))
  //   .attr('cy', d => yScale(d[yDim]))
  //   .attr('r', 5)
  //   .attr('fill', d => colorScale(d[colorVar]))
  //   .attr('stroke', 'black');
  const t = transition().duration(1500);
  svg
    .selectAll('.budget-scatter')
    .data(data)
    .join(enter =>
      enter
        .append('circle')
        .attr('cy', d => yScale(d[yDim]) * 0)
        .attr('cx', d => xScale(d[xDim]) * 2.5)
        .call(el =>
          el
            .transition(t)
            .ease(easeBackInOut.overshoot(1.5))
            .attr('cy', d => yScale(d[yDim]))
            .attr('cx', d => xScale(d[xDim])),
        ),
    )
    .attr('class', 'budget-scatter')

    .attr('r', 5)
    .attr('fill', d => colorScale(d[colorVar]))
    .attr('stroke', 'black');

  // svg
  // .selectAll('.circle')
  // .data(data)

  // .join(enter =>
  //   enter
  //     .append('circle')
  //     .attr('cy', d => yScale(d[yDim]) * 0)
  //     .attr('cx', d => xScale(d[xDim]) * 1.5)
  //     .call(el =>
  //       el
  //         .transition(t)
  //         .delay((d, i) => i * 0.5)
  //         .attr('cy', d => yScale(d[yDim]))
  //         .attr('cx', d => xScale(d[xDim])),
  //     ),
  // )
  // .attr('class', 'circle')
  // .filter(d => {
  //   return d.Year === 2012;
  // })
  // .attr('r', 4)
  // .attr('fill', '#1f77b4');

  svg
    .append('g')
    .selectAll('.text')
    .data(data)
    .join('text')
    .attr('class', 'text')

    .attr('x', d => 5 + xScale(d[xDim]))
    .attr('y', d => 3 + yScale(d[yDim]))
    .text(d => d['State'])
    .attr('font-size', '10px')
    .attr('fill', 'black');

  svg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${plotHeight})`)
    .call(axisBottom(xScale).ticks(11, '.2s'));

  svg
    .append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${-5})`)
    .call(axisLeft(yScale).ticks(15, '.2s'));

  svg
    .append('g')
    .append('text')
    .attr('class', 'title')
    .attr('text-anchor', 'middle')
    .attr('x', plotWidth / 2)
    .attr('y', 0 - margin.top / 2)
    .attr('font-size', 18)
    .text(
      'Large States Would Need to Spend a Lot More To Remedy Food Budget Shortfalls',
    );
  svg
    .append('g')
    .append('text')
    .attr('class', 'x-axis')
    .attr('text-anchor', 'middle')
    .attr('x', plotWidth / 2)
    .attr('y', plotHeight + 30)
    .text('Total Annual Budget Shortfall ($)')
    .attr('font-size', 14);

  svg
    .append('g')
    .append('text')
    .attr('class', 'y-label')
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .attr('x', 0 - plotHeight / 2)
    .attr('y', -margin.left / 2)
    .text('Annual Food Budget Shortage Per 100,000');
}

// svg
//   .selectAll('.budget-scatter')
//   .data(data)
//   .join((enter) =>
//     enter
//       .append('circle')
//       .transition(t)
//       .attr('cx', (d) => xScale(d[xDim]))
//       .attr('cy', (d) => yScale(d[yDim])),
//   )
//   .attr('class', 'budget-scatter')
//   .attr('cx', (d) => xScale(d[xDim]))
//   .attr('cy', (d) => yScale(d[yDim]))
//   .attr('r', 3)
//   .attr('stroke', 'grey')
//   .classed('adelie', (d) => d.Species === 'Adelie')
//   .classed('chinstrap', (d) => d.Species === 'Chinstrap')
//   .classed('gentoo', (d) => d.Species === 'Gentoo');
// }

// json('./data/state_covid.json')
//   .then(main)
//   .catch(e => {
//     console.log(e);
//   });

// const slides = [
//   {
//     title: 'Example Slide the first loyal subjects it has ',
//     content:
//       'Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
//     render: data => {
//       arrow1(data);
//     },
//   },

//   {
//     title: 'Example Slide the SECOND loyal subjects it has ',
//     content:
//       'Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
//     render: data => {
//       arrow2(data);
//     },
//   },

//   {
//     title: 'Example Slide the Third loyal subjects it has ',
//     content:
//       'Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
//     render: data => {
//       arrow3(data);
//     },
//   },
// ];

// function main(data) {
//   // state
//   console.log('The data is ', data);
//   let currentSlideIdx = 0;
//   const updateState = newIdx => {
//     currentSlideIdx = newIdx;
//     renderSlide();
//     drawProgress();
//   };

//   // configuration stuff

//   const header = select('#slide-detail h1');
//   const body = select('#slide-detail p');

//   select('#prev').on('click', () =>
//     updateState(currentSlideIdx ? currentSlideIdx - 1 : slides.length - 1),
//   );
//   select('#next').on('click', () =>
//     updateState((currentSlideIdx + 1) % slides.length),
//   );

//   function drawProgress() {
//     const numData = [...new Array(slides.length)].map((_, idx) => idx);
//     select('#progress')
//       .selectAll('.progress-dot')
//       .data(numData)
//       .join('div')
//       .attr('class', 'progress-dot')
//       .style('background-color', idx =>
//         currentSlideIdx < idx ? 'cornflower-blue' : 'black',
//       );
//   }

//   // draw loop
//   function renderSlide() {
//     const currentSlide = slides[currentSlideIdx];
//     header.text(currentSlide.title);
//     body.text(currentSlide.content);
//     currentSlide.render(data);
//   }
//   renderSlide();
//   drawProgress();
// }
