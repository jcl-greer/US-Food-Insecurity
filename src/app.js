import {select, create, pointer} from 'd3-selection';
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

// good map stuff
// https://observablehq.com/@d3/choropleth
// https://observablehq.com/@d3/state-choropleth?collection=@d3/d3-geo

// used this extensively for the tooltip
// https://observablehq.com/@duynguyen1678/choropleth-with-tooltip

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

function myVis(us, insecure) {
  console.log('starting this function', this);
  const height = 700;
  const width = 1200;
  const margin = {left: 100, top: 50, bottom: 50, right: 50};
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  let projection = geoAlbersUsa();

  // const xDim = 'Weighted Annual Food Budget Shortfall';
  // const yDim = 'Annual Food Budget Shortfall Per 100000';
  const colorDim = 'Food Insecurity Rate';

  insecure = insecure.filter(d => d.Year === 2018);

  let data = insecure.reduce(
    (obj, item) => Object.assign(obj, {[item.id]: item[colorDim]}),
    {},
  );

  const color = scaleQuantize()
    .domain(extent(insecure, d => d[colorDim]))
    .range(schemeOrRd[9]);

  console.log('the object is ', data);
  console.log('uncleaned (in js!) data is ', insecure);
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
    .attr('id', 'map')
    .selectAll('path')
    .data(topojson.feature(us, us.objects.states).features)
    .join('path')
    // .attr('fill', '#4280f4')
    .attr('class', 'state')
    .attr('fill', d => color(data[d.id]))
    .attr('d', path)
    .on('mouseover', function(d, i) {
      console.log('this is ', this);
      select(this)
        .transition()
        .duration('50')
        .attr('opacity', '.5');
    })
    .on('mouseout', function(d, i) {
      select(this)
        .transition()
        .duration('50')
        .attr('opacity', '1');
    });

  svg
    .select('#map')
    .append('path')
    .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', '1.5px')
    .attr('stroke-linejoin', 'round')
    .attr('d', path);

  const callout = (g, value) => {
    if (!value) return g.style('display', 'none');

    g.style('display', null)
      .style('pointer-events', 'none')
      .style('font', '10px sans-serif');

    const path = g
      .selectAll('path')
      .data([null])
      .join('path')
      .attr('fill', 'white')
      .attr('stroke', 'black');

    const text = g
      .selectAll('text')
      .data([null])
      .join('text')
      .call(text =>
        text
          .selectAll('tspan')
          .data((value + '').split(/\n/))
          .join('tspan')
          .attr('x', 0)
          .attr('font-size', '14px')
          .attr('y', (d, i) => `${i * 1.1}em`)
          .style('font-weight', (_, i) => (i ? null : 'bold'))
          .text(d => d),
      );

    const {x, y, width: w, height: h} = text.node().getBBox();
    console.log('this function was fired');

    text.attr('transform', `translate(${-w / 2},${15 - y})`);
    path.attr(
      'd',
      `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`,
    );
  };

  const tooltip = svg.append('g');
  console.log('this is ', this);
  svg
    .selectAll('.state')
    .on('touchmove mousemove', function(event, d) {
      tooltip.call(
        callout,
        `${d.properties.name}
        ${colorDim} ${data[d.id]}`,
      );
      tooltip
        .attr('transform', `translate(${pointer(event)})`)
        .select('#map')
        .attr('stroke', 'red')
        .attr('font-size', '12px')
        .raise();
    })
    .on('touchend mouseleave', function() {
      tooltip
        .call(callout, null)
        .select('#map')
        .attr('stroke', null)
        .lower();
    });

  // return svg.node();

  // .on('click', d => {
  //   const node = svg.node();
  //   node.value = value = value === d.id ? null : d.id;
  //   node.dispatchEvent(new CustomEvent('input'));
  //   outline.attr('d', value ? path(d) : null);
  // });
}

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
