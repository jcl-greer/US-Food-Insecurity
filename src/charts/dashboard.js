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
// import './main.css';

// Promise.all([
//   json('./data/states-albers-10m.json'),
//   json('./data/final_state_insecurity.json'),
// ])
//   .then(results => {
//     const [us, insecure] = results;
//     console.log('The results are ', us, insecure);
//     map(us, insecure);
//     scatter(insecure);
//     stackedBar(insecure);
//   })
//   // .then()
//   .catch(e => {
//     // handle error here
//     console.log('the error is ', e);
//   });

export default function(us, insecure) {
  console.log('MADE IT TO THIS COOL FUNCTION', us, insecure);
  if (!select('svg').empty()) {
    select('svg').remove();
  }
  map(us, insecure);
  scatter(insecure);
  stackedBar(insecure);
}

function map(us, insecure) {
  console.log('starting this function', this);
  const height = 650;
  const width = 1000;
  const margin = {left: 10, top: 10, bottom: 10, right: 50};
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

  const svg = select('#slide-content #map-budget #map')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('viewBox', [10, 10, 900, 530])
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
      // console.log('this is ', this);
      select(this)
        .transition()
        .duration('50')
        .attr('opacity', '.5')
        .attr('fill', 'black')
        .attr('stroke', 'black')
        .attr('stroke-width', 2);
    })
    .on('mouseout', function(d, i) {
      select(this)
        .transition()
        .duration('50')
        .attr('opacity', '1')
        .attr('fill', d => color(data[d.id]))
        .attr('stroke', 'white');
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
  // console.log('this is ', this);
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
}

function scatter(initialData) {
  console.log('the data is ', initialData);
  let data = initialData.filter(d => d.Year === 2018);

  console.log('The new data is ', data);

  const height = 430;
  const width = 475;
  const margin = {left: 65, top: 50, bottom: 50, right: 20};
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

  const colorScale = scaleQuantize()
    // .nice()
    .domain(extent(data, d => d[colorVar]))
    // .range(['#a7d4ff', '#bbd9f1', '#77aaff', '#4383ed', '#0960c5', '#003c99']);
    .range([
      '#bfdbff',
      '#9dc5fe',
      '#7daefc',
      // '#5f97f9',
      '#4280f4',
      '#2667ec',
      '#084de3',
      '#002fd6',
    ]);

  const svg = select('#slide-content #map-budget #budget-scatter')
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
    .selectAll('#budget-scatter')
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
    .attr('id', 'budget-scatter')

    .attr('r', 3.5)
    .attr('fill', d => colorScale(d[colorVar]))
    .attr('stroke', 'black');

  svg
    .append('g')
    .attr('class', 'legendQuant')
    .attr('font-size', '10.5px')
    .attr('transform', `translate(${plotWidth - margin.right * 4}, -10)`);

  let colorLegend = legendColor()
    .labelFormat(format('.1%'))
    .scale(colorScale)
    .shapeHeight(10)
    .shapeWidth(10)
    .title('% of Food Insecure in Areas with High Meal Costs')
    .titleWidth(100);

  svg.select('.legendQuant').call(colorLegend);

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
    .attr('font-size', '16px')
    .text('Annual Food Budget Shortfalls by State');
  svg
    .append('g')
    .append('text')
    .attr('class', 'x-label')
    .attr('text-anchor', 'middle')
    .attr('x', plotWidth / 2)
    .attr('y', plotHeight + 30)

    .text('Total Annual Budget Shortfall ($)')
    .attr('font-size', '12px');

  svg
    .append('g')
    .append('text')
    .attr('class', 'y-label')
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .attr('x', 0 - plotHeight / 2)
    .attr('y', -margin.left / 1.15)
    .text('Food Budget Shortage Per 100,000')
    .attr('font-size', '12px');
}

function prepData(data) {
  let fullArr = [];
  for (let i = 0; i < data.length; i++) {
    let obj = data[i];
    let newObj = {state: obj.State, value: obj['# of Food Insecure Persons']};
    // console.log('The New Object is ', newObj);
    fullArr.push(newObj);
  }
  return fullArr;
}

function stackedBar(initialData) {
  console.log('the data is ', initialData);
  let yearData = initialData.filter(d => d.Year === 2018);
  const xDim = '# of Food Insecure Persons';
  let data = prepData(yearData.sort((a, b) => (a[xDim] > b[xDim] ? 1 : -1)));

  console.log('the new data is ', data);
  const height = 300;
  const width = 1200;
  const margin = {top: 10, left: 60, right: 60, bottom: 10};
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  function stack(data) {
    const total = sum(data, d => d.value);
    let value = 0;
    return data.map(d => ({
      state: d.state,
      value: d.value / total,
      startValue: value / total,
      endValue: (value += d.value) / total,
    }));
  }

  let stackData = stack(data);
  const t1 = transition().duration(600);

  const xScale = scaleLinear()
    .domain([0, 1])
    .range([margin.left, plotWidth - margin.right]);

  // // const yScale = scaleBand()
  // //   .domain(yDomain)
  // //   .range([0, plotHeight]);

  const svg = select('#slide-content #stacked-bar')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  svg
    .selectAll('.rect')
    .data(stackData)
    .join(enter =>
      enter
        .append('rect')

        // .attr('cy', d => yScale(d[yDim]))
        // .attr('cx', d => xScale(d[xDim]))
        .attr('opacity', 0)
        .call(el =>
          el
            .transition(t1)
            .delay((d, i) => i * 20)
            .attr('opacity', 1),
        ),
    )
    .attr('id', 'stacked-bar')
    .attr('x', d => xScale(d.startValue))
    .attr('y', plotHeight / 5)
    .attr('width', d => xScale(d.endValue) - xScale(d.startValue))
    .attr('height', plotHeight / 6)
    .attr('fill', 'steelblue')
    .attr('stroke', 'white');

  svg
    .append('g')
    .append('text')
    .attr('class', 'title')
    .attr('text-anchor', 'middle')
    .attr('x', plotWidth / 2)
    .attr('y', 40)
    .attr('font-size', 20)
    .text
    // 'Due to COVID-19, Estimated 2020 State Insecurity Rates Exceed 2012 Rates in Many States',
    ();

  // svg
  //   .append('g')
  //   .attr('font-family', 'sans-serif')
  //   .attr('font-size', 12)
  //   .selectAll('text')
  //   .data(stackData)
  //   .join('text')
  //   .attr('transform', d => `translate(${xScale(d.startValue) + 6}, 6)`)
  //   .call(text =>
  //     text
  //       .append('tspan')
  //       .attr('x', 0)
  //       .attr('y', 430)
  //       .attr('fill-opacity', 0.7)
  //       .text(d => d.state),
  //   );
}
