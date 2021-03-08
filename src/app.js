import {select} from 'd3-selection';
import {csv, json} from 'd3-fetch';
import {scaleLinear, scaleTime, scaleBand} from 'd3-scale';
import {extent, min, max} from 'd3-array';
import {axisBottom, axisLeft} from 'd3-axis';
import {symbol, symbolTriangle, line} from 'd3-shape';
import {transition, easeLinear} from 'd3-transition';
import './main.css';
import arrow1 from './charts/arrow1_trial';
import arrow2 from './charts/arrow2_trial';
import arrow3 from './charts/arrow3_trial';

// very helpful resource on transitions
// https://observablehq.com/@d3/selection-join

json('./data/state_covid.json')
  .then(main)
  .catch(e => {
    console.log(e);
  });

const slides = [
  {
    title: 'Example Slide the first loyal subjects it has ',
    content:
      'Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
    render: data => {
      arrow1(data);
    },
  },

  {
    title: 'Example Slide the SECOND loyal subjects it has ',
    content:
      'Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
    render: data => {
      arrow2(data);
    },
  },

  {
    title: 'Example Slide the Third loyal subjects it has ',
    content:
      'Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
    render: data => {
      arrow3(data);
    },
  },
];

function main(data) {
  // state
  console.log('The data is ', data);
  let currentSlideIdx = 0;
  const updateState = newIdx => {
    currentSlideIdx = newIdx;
    renderSlide();
    drawProgress();
  };

  // configuration stuff

  const header = select('#slide-detail h1');
  const body = select('#slide-detail p');

  select('#prev').on('click', () =>
    updateState(currentSlideIdx ? currentSlideIdx - 1 : slides.length - 1),
  );
  select('#next').on('click', () =>
    updateState((currentSlideIdx + 1) % slides.length),
  );

  function drawProgress() {
    const numData = [...new Array(slides.length)].map((_, idx) => idx);
    select('#progress')
      .selectAll('.progress-dot')
      .data(numData)
      .join('div')
      .attr('class', 'progress-dot')
      .style('background-color', idx =>
        currentSlideIdx < idx ? 'cornflower-blue' : 'black',
      );
  }

  // draw loop
  function renderSlide() {
    const currentSlide = slides[currentSlideIdx];
    header.text(currentSlide.title);
    body.text(currentSlide.content);
    currentSlide.render(data);
  }
  renderSlide();
  drawProgress();
}
