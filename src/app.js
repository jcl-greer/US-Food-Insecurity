import {select} from 'd3-selection';
import {json} from 'd3-fetch';
import './main.css';
import arrow1 from './charts/arrow1';
import arrow2 from './charts/arrow2';
import arrow3 from './charts/arrow3';
import dash from './charts/dashboard';

Promise.all([
  json('./data/states-albers-10m.json'),
  json('./data/final_state_insecurity.json'),
  json('./data/state_covid.json'),
])
  .then(results => {
    const [geo, insecure, covid] = results;
    main(geo, insecure, covid);
  })
  .catch(e => {
    console.log(e);
  });

const slides = [
  {
    title: 'Food Insecurity Rates Were High After The Great Recession',
    content:
      'Millions of people across the United States (approximately 1 in 9) suffer with food insecurity, meaning they lack regular access to adequate food. This project examines the trends in domestic food insecurity at the state level, from 2012 to 2020. The food insecurity crisis ballooned following the Great Recession, as higher unemployment rates and declines in median household incomes led to higher rates of household poverty. The United States was still in the midst of recovering from the Recession in 2012, and national food insecurity rates were far above pre-Recession levels. Southeastern states such as Mississippi, Arkansas, and Georgia suffered from food insecurity rates as high as ~22%, while the national statewide average was about 15%.',
    render: data => {
      arrow1(data);
    },
  },

  {
    title: "Insecurity Rates Declined Significantly over the 2010's",
    content:
      'By 2018, state level food insecurity rates had finally returned to pre-Recession levels. Over this period, food insecurity rates fell in all states - precipitously in most. The drop was especially profound in states like Georgia, South Carolina, and California, where either food insecurity rates or overall populations were previously quite high. The national statewide average had now dropped to approximately ~12%. Despite experiencing some of the higher drops in food insecurity rates, southeastern states still experienced, on average, higher food insecurity rates.',
    render: data => {
      arrow2(data);
    },
  },

  {
    title: 'But The Estimated Impact of COVID-19 Has Reversed Those Declines',
    content:
      'The emergence of the COVID-19 pandemic has drastically reduced the ability of Americans to obtain essential needs like shelter and food, and it has likely exacerbated existing health disparities. While significant gains were made in reducing food insecurity following the Great Recession, these improvements have been threatened by the widespread economic and public health downturn resulting from the pandemic.  Using estimated changes in unemployment and poverty adjusted based on actual rates at the start of the pandemic, Feeding America???s Map the Meal Gap study projects that food insecurity rates rose significantly across all states in 2020.  In most states, projected 2020 rates are higher than 2012 rates, which emphasizes the need to implement stronger policies at the state and federal level to combat food insecurity.',
    render: data => {
      arrow3(data);
    },
  },
  {
    title: 'Explore the Dashboard',
    content:
      'The dashboard contains food insecurity data from 2013 - 2018. In addition to food insecurity rates, it also includes the total food insecure population and accumulated food budget shortfalls per state. The Current Population Survey, which is administered by the Census Bureau, makes an effort to measure the budget shortfall of households suffering from food security. This budget shortfall measure represents the amount of additional money a food insecure person would need to spend to meet their food nutrition needs. Here, this figure is aggregated to the state level. High meal costs are defined as above the 75% percentile among meal costs at the county level.',
    render: data => {
      dash(data[0], data[1]);
    },
  },
];

function main(geo, insecure, covid) {
  let slideData = new Object();

  slideData[0] = covid;
  slideData[1] = covid;
  slideData[2] = covid;
  slideData[3] = [geo, insecure];

  let currentSlideIdx = 0;
  const updateState = newIdx => {
    currentSlideIdx = newIdx;
    renderSlide();
    drawProgress();
  };

  const header = select('#slide-detail h2');
  const body = select('#slide-detail p');
  const credits = select('#credits');

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
      .style('background-color', idx => {
        if (currentSlideIdx === idx) {
          return '#fba55c';
        } else if (currentSlideIdx < idx) {
          return '#4081ec';
        } else {
          return '#27313f';
        }
      });
  }

  // draw loop
  function renderSlide() {
    const currentSlide = slides[currentSlideIdx];
    header.text(currentSlide.title);
    body.text(currentSlide.content);
    if (currentSlideIdx === 3) {
      credits.style('display', 'inline-block');
    } else {
      credits.style('display', 'none');
    }

    currentSlide.render(slideData[currentSlideIdx]);
  }
  renderSlide();
  drawProgress();
}
