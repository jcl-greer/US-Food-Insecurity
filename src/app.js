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
import dash from './charts/dashboard';

// // added a comment

Promise.all([
  json('./data/states-albers-10m.json'),
  json('./data/final_state_insecurity.json'),
  json('./data/state_covid.json'),
])
  .then(results => {
    const [geo, insecure, covid] = results;

    console.log('The results are ', geo, insecure);
    main(geo, insecure, covid);
  })
  .catch(e => {
    console.log(e);
  });

const slides = [
  {
    title: 'Food Insecurity Rates During / After the Great Recession',
    content:
      'Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
    render: data => {
      arrow1(data);
    },
  },

  {
    title:
      'Food Insecurity Rates Have Declined From the Heights during the recession',
    content:
      'Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
    render: data => {
      arrow2(data);
    },
  },

  {
    title: 'But The Estimated Impact of COVID-19 Has Reversed Those Declines',
    content:
      'The emergence of the COVID-19 pandemic has drastically reduced the ability of Americans to obtain essential needs like shelter and food, and it has likely exacerbated existing health disparities. While significant gains were made in reducing food insecurity in the decade following the Great Recession, these improvements have been threatened by the widespread economic and public health downturn resulting from the pandemic. Unemployment and poverty rates are two of the most significant indicators (per Feeding America), and the critical loss of income and jobs during the pandemic means that many more households are struggling to access adequate, healthy food.  Using estimated changes in unemployment and poverty adjusted based on actual rates at the start of the pandemic, Feeding America’s Map the Meal Gap study projects that food insecurity rates rose significantly across all states in 2020.  In most states, projected 2020 rates are higher than 2012 rates, which emphasizes the need to implement stronger policies at the state and federal level to combat food insecurity. ',
    render: data => {
      arrow3(data);
    },
  },
  {
    title: 'Exploring Food Insecurity From 2012 - 2018',
    content:
      'Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
    render: data => {
      console.log('THE NEW DATA IS ', data);
      dash(data[0], data[1]);
    },
  },
];

function main(geo, insecure, covid) {
  // state

  let slideData = new Object();

  slideData[0] = covid;
  slideData[1] = covid;
  slideData[2] = covid;
  slideData[3] = [geo, insecure];

  console.log('The data is ', covid);

  let currentSlideIdx = 0;
  const updateState = newIdx => {
    currentSlideIdx = newIdx;
    renderSlide();
    drawProgress();
  };

  // configuration stuff

  const header = select('#slide-detail h2');
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
    console.log('the current slide idx is ', currentSlideIdx);
    const currentSlide = slides[currentSlideIdx];
    header.text(currentSlide.title);
    body.text(currentSlide.content);
    currentSlide.render(slideData[currentSlideIdx]);
  }
  renderSlide();
  drawProgress();
}
