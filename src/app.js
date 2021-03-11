import {select, create} from 'd3-selection';
import {csv, json} from 'd3-fetch';
import {scaleLinear, scaleTime, scaleBand} from 'd3-scale';
import {extent, min, max, sum, range} from 'd3-array';
import {axisBottom, axisLeft} from 'd3-axis';
import {format} from 'd3-format';
import {symbol, symbolTriangle, line} from 'd3-shape';
import {scaleQuantile, scaleQuantize} from 'd3-scale';
import {transition} from 'd3-transition';
import {schemeBlues, schemeOrRd} from 'd3-scale-chromatic';
import {geoPath, geoAlbersUsa} from 'd3-geo';
import * as topojson from 'topojson-client';
import {ease, easeCubicIn, easeBounceOut, easeBackInOut} from 'd3-ease';
import {legendColor} from 'd3-svg-legend';
import './main.css';

import arrow1 from './charts/arrow1_trial';
import arrow2 from './charts/arrow2_trial';
import arrow3 from './charts/arrow3_trial';

// console.log('the data is ', initialData);

// console.log('The new data is ', data);

Promise.all([
  json('./data/states-albers-10m.json'),
  json('./data/final_state_insecurity.json'),
])
  .then(results => {
    const [us, insecure] = results;
    console.log('The results are ', us, insecure);
    myVis(us, insecure);
  })
  // .then()
  .catch(e => {
    // handle error here
    console.log('the error is ', e);
  });

// json('./data/states-albers-10m.json')
//   .then(myVis)
//   .catch(e => {
//     console.log(e);
//   });

function myVis(us, insecure) {
  console.log('starting this function');
  const height = 700;
  const width = 1200;
  const margin = {left: 100, top: 50, bottom: 50, right: 50};
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  let projection = geoAlbersUsa();

  // const xDim = 'Weighted Annual Food Budget Shortfall';
  // const yDim = 'Annual Food Budget Shortfall Per 100000';
  const colorDim = 'Food Insecurity Rate';

  const color = scaleQuantize()
    .domain([0.02, 0.35])
    .range(schemeOrRd[9]);

  insecure = insecure.filter(d => d.Year === 2018);

  let data = insecure.reduce(
    (obj, item) => Object.assign(obj, {[item.id]: item[colorDim]}),
    {},
  );

  console.log('the object is ', data);

  // let data = Object.assign(
  //   new Map(insecure),
  //   ({state, rate}) => [state, +rate],
  //   {
  //     title: 'Unemployment rate (%)',
  //   },
  // );
  console.log('data is ', insecure);
  console.log('the us is ', us);

  let path = geoPath();

  let states = (states = new Map(
    us.objects.states.geometries.map(d => [d.id, d.properties]),
  ));

  console.log(
    'tjhe topojson features thing is ',
    topojson.feature(us, us.objects.states).features,
  );

  // const svg = create('svg').attr('viewBox', [0, 0, 975, 610]);

  const svg = select('#slide-content')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('viewBox', [0, 0, 975, 610])
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  svg
    .append('g')
    .selectAll('path')
    .data(topojson.feature(us, us.objects.states).features)
    .join('path')
    // .attr('fill', '#4280f4')
    .attr('fill', d => color(data[d.id]))
    .attr('d', path);

  svg
    .append('path')
    .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-linejoin', 'round')
    .attr('d', path);
  // .on('click', d => {
  //   const node = svg.node();
  //   node.value = value = value === d.id ? null : d.id;
  //   node.dispatchEvent(new CustomEvent('input'));
  //   outline.attr('d', value ? path(d) : null);
  // });
}
// svg
//   .append('path')
//   .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
//   .attr('fill', 'none')
//   .attr('stroke', 'white')
//   .attr('stroke-linejoin', 'round')
//   .attr('pointer-events', 'none')
//   .attr('d', path);

// const outline = svg
//   .append('path')
//   .attr('fill', 'none')
//   .attr('stroke', 'black')
//   .attr('stroke-linejoin', 'round')
//   .attr('pointer-events', 'none');

// return Object.assign(svg.node(), {value: null});

// added a comment

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
