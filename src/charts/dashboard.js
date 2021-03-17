import {select, create, pointer} from 'd3-selection';
import {scaleLinear, scaleTime, scaleBand} from 'd3-scale';
import {extent, min, max, sum, range} from 'd3-array';
import {axisBottom, axisLeft} from 'd3-axis';
import {format} from 'd3-format';
import {scaleQuantile, scaleQuantize} from 'd3-scale';
import {transition} from 'd3-transition';
import {schemeBlues, schemeOrRd} from 'd3-scale-chromatic';
import {geoPath, geoAlbersUsa} from 'd3-geo';
import * as topojson from 'topojson-client';
import {ease, easeCubicIn, easeBounceOut, easeBackInOut} from 'd3-ease';
import {legendColor} from 'd3-svg-legend';

export default function(us, insecure) {
  console.log('MADE IT TO THIS COOL FUNCTION', insecure);
  if (!select('svg').empty()) {
    select('svg').remove();
  }

  // helper function for tooltip
  const callout = (g, value) => {
    if (!value) return g.style('display', 'none');

    g.style('display', null)
      .style('pointer-events', 'none')
      .style('font', '11px Gill Sans');

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

  // util function for filtering values - used for highlighting points
  function columnHas(data, col, allowedValues) {
    const rows = [];
    for (let i = 0; i < data.length; i += 1) {
      if (allowedValues.includes(data[i][col])) {
        rows.push(data[i]);
      }
    }
    return rows;
  }

  // possible metrics
  // Child Food Insecurity Rate
  // Food Insecurity Rate
  // # of Food Insecure Children
  // # of Food Insecure Persons

  // this for the tooltip
  // https://bl.ocks.org/d3noob/180287b6623496dbb5ac4b048813af52

  map(us, insecure, callout, columnHas);
  scatter(us, insecure, callout, columnHas);
  stackedBar(us, insecure, callout, columnHas);
}

function map(us, insecure, callout, columnHas, marker = null) {
  const height = 650;
  const width = 1000;
  const margin = {left: 10, top: 10, bottom: 10, right: 20};
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  // let projection = geoAlbersUsa();

  const colorDim = 'Food Insecurity Rate';

  insecure = insecure.filter(d => d.Year === 2018);

  let data = insecure.reduce(
    (obj, item) => Object.assign(obj, {[item.id]: item[colorDim]}),
    {},
  );

  const color = scaleQuantize()
    .domain(extent(insecure, d => d[colorDim]))
    .range(schemeBlues[5]);

  let path = geoPath();

  let states = (states = new Map(
    us.objects.states.geometries.map(d => [d.id, d.properties]),
  ));

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
    .attr('class', 'state')
    .attr('fill', d => color(data[d.id]))
    .attr('d', path)
    .on('mouseover', function(d, i) {
      select(this)
        .transition()
        .duration('50')
        .attr('fill', '#fba55c');
      select('.budget-scatter')
        .selectAll('*')
        .remove();
      scatter(us, insecure, callout, columnHas, i['id']);
      select('.stacked-bar')
        .selectAll('*')
        .remove();
      stackedBar(us, insecure, callout, columnHas, i['id']);
    })
    .on('mouseout', function(d, i) {
      select(this)
        .transition()
        .duration('50')
        .attr('opacity', '1')
        .attr('fill', d => color(data[d.id]))
        .attr('stroke', 'white');
      select('.budget-scatter')
        .selectAll('*')
        .remove();
      scatter(us, insecure, callout, columnHas);
      select('.stacked-bar')
        .selectAll('*')
        .remove();

      stackedBar(us, insecure, callout, columnHas);
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

  // const callout = (g, value) => {
  //   if (!value) return g.style('display', 'none');

  //   g.style('display', null)
  //     .style('pointer-events', 'none')
  //     .style('font', '11px Gill Sans');

  //   const path = g
  //     .selectAll('path')
  //     .data([null])
  //     .join('path')
  //     .attr('fill', 'white')
  //     .attr('stroke', 'black');

  //   const text = g
  //     .selectAll('text')
  //     .data([null])
  //     .join('text')
  //     .call(text =>
  //       text
  //         .selectAll('tspan')
  //         .data((value + '').split(/\n/))
  //         .join('tspan')
  //         .attr('x', 0)
  //         .attr('font-size', '14px')
  //         .attr('y', (d, i) => `${i * 1.1}em`)
  //         .style('font-weight', (_, i) => (i ? null : 'bold'))
  //         .text(d => d),
  //     );

  //   const {x, y, width: w, height: h} = text.node().getBBox();
  //   console.log('this function was fired');

  //   text.attr('transform', `translate(${-w / 2},${15 - y})`);
  //   path.attr(
  //     'd',
  //     `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`,
  //   );
  // };

  const tooltip = svg.append('g');
  svg
    .selectAll('.state')
    .on('touchmove mousemove', function(event, d) {
      tooltip.call(
        callout,
        `${d.properties.name}
        ${colorDim} ${(100 * data[d.id]).toFixed(2) + '%'}`,
      );
      tooltip
        .attr('transform', `translate(${pointer(event)})`)
        .select('#map')
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

  svg
    .append('g')
    .append('text')
    .attr('class', 'title')
    .attr('text-anchor', 'middle')
    .attr('x', plotWidth / 2.5)
    .attr('y', margin.top * 2)
    .attr('font-size', '22px')
    .text('Food Insecurity Rates by State');

  svg
    .append('g')
    .attr('class', 'legendQuant')
    .attr('font-size', '11.5px')
    .attr('transform', `translate(${plotWidth - margin.right * 21}, 1)`);

  let colorLegend = legendColor()
    .labelFormat(format('.1%'))
    .scale(color)
    .shapeHeight(20)
    .shapeWidth(70)
    .orient('horizontal')
    .titleWidth(200);

  svg.select('.legendQuant').call(colorLegend);

  select('svg').attr('transform', 'scale(.75)');
}

function scatter(us, initialData, callout, columnHas, marker = null) {
  console.log('the budget scatter data is ', initialData);
  let data = initialData.filter(d => d.Year === 2018);

  const height = 350;
  const width = 425;
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
    .domain(extent(data, d => d[colorVar]))
    // .range([
    //   '#bfdbff',
    //   '#9dc5fe',
    //   // '#7daefc',
    //   '#5f97f9',
    //   '#4280f4',
    //   // '#2667ec',
    //   '#084de3',
    //   '#002fd6',
    // ]);
    .range(schemeBlues[5]);

  const svg = select('#slide-content #map-budget .budget-scatter')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  svg
    .selectAll('.budget-scatter')
    .data(data)
    .join('circle')
    .attr('class', 'budget-scatter')
    .attr('cx', d => xScale(d[xDim]))
    .attr('cy', d => yScale(d[yDim]))
    .attr('r', 4.5)
    .attr('fill', d => colorScale(d[colorVar]))
    .attr('stroke', 'black')
    .on('mouseover', function(d, i) {
      select(this)
        .transition()
        .duration('50')
        .attr('fill', '#fba55c');
      select('.stacked-bar')
        .selectAll('*')
        .remove();
      stackedBar(us, initialData, callout, columnHas, i['id']);
      // select('#map')
      //   .selectAll('*')
      //   .remove();
      // map(us, initialData, callout, i['id']);
    })
    .on('mouseout', function(d, i) {
      select(this)
        .transition()
        .duration('50')
        .attr('fill', '#1f77b4');
      select('.stacked-bar')
        .selectAll('*')
        .remove();
      stackedBar(us, initialData, callout, columnHas);
      // select('#map')
      //   .selectAll('*')
      //   .remove();
      // stackedBar(us, initialData, callout);
    });

  const t = transition().duration(1500);
  // svg
  //   .selectAll('#budget-scatter')
  //   .data(data)
  //   .join(enter =>
  //     enter
  //       .append('circle')
  //       .attr('cy', d => yScale(d[yDim]) * 0)
  //       .attr('cx', d => xScale(d[xDim]) * 2.5)
  //       .call(el =>
  //         el
  //           .transition(t)
  //           .ease(easeBackInOut.overshoot(1.5))
  //           .attr('cy', d => yScale(d[yDim]))
  //           .attr('cx', d => xScale(d[xDim])),
  //       ),
  //   )
  //   .attr('id', 'budget-scatter')

  //   .attr('r', 3.5)
  //   .attr('fill', d => colorScale(d[colorVar]))
  //   .attr('stroke', 'black');

  if (marker !== null) {
    console.log('THE MARKER IS ', [marker]);
    let selectedState = columnHas(data, 'id', marker);
    console.log(
      'the selected STate is ',
      selectedState,
      selectedState[0][yDim],
      selectedState[0][xDim],
    );
    svg
      .append('g')
      .append('circle')
      .attr('cy', yScale(selectedState[0][yDim]))
      .attr('cx', xScale(selectedState[0][xDim]))
      .attr('fill', '#fba55c')
      .attr('stroke', 'black')
      .attr('stroke-width', '1px')
      // .attr('id', 'budget-scatter_' + d.id)
      .attr('r', 4.5);
  } else {
    console.log('NOOOOOOOOOO MARKER');
  }

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
    .titleWidth(110);

  svg.select('.legendQuant').call(colorLegend);

  // svg
  //   .append('g')
  //   .selectAll('.text')
  //   .data(data)
  //   .join('text')
  //   .attr('class', 'text')

  //   .attr('x', d => 5 + xScale(d[xDim]))
  //   .attr('y', d => 3 + yScale(d[yDim]))
  //   .text(d => d['State'])
  //   .attr('font-size', '10px')
  //   .attr('fill', 'black');

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
    .text('Annual Food Budget Shortfalls by State ($)');
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
    .text('Food Budget Shortage Per 100,000 ($)')
    .attr('font-size', '12px');

  const form = format('$.2s');

  const tooltip = svg.append('g');
  svg
    .selectAll('.budget-scatter')
    .on('touchmove mousemove', function(event, d) {
      tooltip.call(
        callout,
        `${'State: ' + d.State}
              ${'Budget Shortfall: ' + form(d[xDim])}
              ${'Shortfall per 100k: ' + form(d[yDim])}`,
      );
      tooltip
        .attr('transform', `translate(${pointer(event)})`)
        .select('.budget-scatter')
        .attr('font-size', '11px')
        .raise();
    })
    .on('touchend mouseleave', function() {
      tooltip
        .call(callout, null)
        .select('.budget-scatter')
        .attr('stroke', null)
        .lower();
    });
}

function prepStackData(data) {
  let fullArr = [];
  for (let i = 0; i < data.length; i++) {
    let obj = data[i];
    let newObj = {
      state: obj.State,
      id: obj.id,
      value: obj['# of Food Insecure Persons'],
    };
    fullArr.push(newObj);
  }
  return fullArr;
}

function stackedBar(us, initialData, callout, columnHas, marker = null) {
  console.log('the data is ', initialData);
  let yearData = initialData.filter(d => d.Year === 2018);
  const xDim = '# of Food Insecure Persons';
  let data = prepStackData(
    yearData.sort((a, b) => (a[xDim] > b[xDim] ? 1 : -1)),
  );

  let div = select('#slide-content .stacked-bar')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

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
      id: d.id,
      rawValue: d.value,
      value: d.value / total,
      startValue: value / total,
      endValue: (value += d.value) / total,
    }));
  }

  let stackData = stack(data);
  console.log('The stack data is ', stackData);
  const t1 = transition().duration(600);

  const xScale = scaleLinear()
    .domain([0, 1])
    .range([margin.left, plotWidth - margin.right]);

  // // const yScale = scaleBand()
  // //   .domain(yDomain)
  // //   .range([0, plotHeight]);

  const svg = select('#slide-content .stacked-bar')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // what to change this to update only
  // svg
  //   .selectAll('.rect')
  //   .data(stackData)
  //   .join(enter =>
  //     enter
  //       .append('rect')
  //       .attr('opacity', 0)
  //       .call(el =>
  //         el
  //           .transition(t1)
  //           .delay((d, i) => i * 20)
  //           .attr('opacity', 1),
  //       ),
  //   )
  //   .attr('id', 'stacked-bar')
  //   .attr('x', d => xScale(d.startValue))
  //   .attr('y', plotHeight / 5)
  //   .attr('width', d => xScale(d.endValue) - xScale(d.startValue))
  //   .attr('height', plotHeight / 6)
  //   .attr('fill', 'steelblue')
  //   .attr('stroke', 'white');

  svg
    .selectAll('.stacked-bar')
    .data(stackData)
    .join('rect')
    .attr('class', 'stacked-bar')
    .attr('id', d => 'bar_' + d.id)
    .attr('x', d => xScale(d.startValue))
    .attr('y', plotHeight / 5)
    .attr('width', d => xScale(d.endValue) - xScale(d.startValue))
    .attr('height', plotHeight / 6)
    .attr('fill', '#1f77b4')
    .attr('stroke', 'white')
    .on('mouseover', function(d, i) {
      select(this)
        .transition()
        .duration('50')
        .attr('fill', '#fba55c');
      select('.budget-scatter')
        .selectAll('*')
        .remove();
      scatter(us, initialData, callout, columnHas, i['id']);
      // select('#map')
      //   .selectAll('*')
      //   .remove();
      // map(us, initialData, callout, i['id']);
    })
    .on('mouseout', function(d, i) {
      select(this)
        .transition()
        .duration('50')
        .attr('fill', '#1f77b4');
      select('.budget-scatter')
        .selectAll('*')
        .remove();
      scatter(us, initialData, callout, columnHas);
      // select('#map')
      //   .selectAll('*')
      //   .remove();
      // stackedBar(us, initialData, callout);
    });

  svg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${plotHeight / 2.5})`)
    .call(axisBottom(xScale).ticks(10, '%'));

  const form = format(',');

  const tooltip = svg.append('g');
  svg
    .selectAll('.stacked-bar')
    .on('touchmove mousemove', function(event, d) {
      tooltip.call(
        callout,
        `${'State: ' + d.state}
          ${'Total Food Insecure Persons: ' + form(d.rawValue)}`,
      );
      tooltip
        .attr('transform', `translate(${pointer(event)})`)
        .select('#stacked-bar')
        .attr('font-size', '12px')
        .raise();
    })
    .on('touchend mouseleave', function() {
      tooltip
        .call(callout, null)
        .select('#stacked-bar')
        .attr('stroke', null)
        .lower();
    });

  if (marker !== null) {
    console.log('THE MARKER IS ', [marker]);
    let selectedState = columnHas(stackData, 'id', marker);
    console.log('the selected STate is ', selectedState);

    svg
      .append('g')
      .append('rect')
      .attr('x', xScale(selectedState[0].startValue))
      .attr('y', plotHeight / 5)
      .attr(
        'width',
        xScale(selectedState[0].endValue) - xScale(selectedState[0].startValue),
      )
      .attr('height', plotHeight / 6)
      .attr('fill', '#fba55c')
      .attr('stroke', 'black')
      .attr('stroke-width', '2px');
  }

  svg
    .append('g')
    .append('text')
    .attr('class', 'title')
    .attr('text-anchor', 'middle')
    .attr('x', plotWidth / 2)
    .attr('y', margin.top * 2)
    .attr('font-size', '18px')
    .text('Total Food Insecure Persons by State');

  svg
    .append('g')
    .append('text')
    .attr('class', 'x-label')
    .attr('text-anchor', 'middle')
    .attr('x', plotWidth / 2)
    .attr('y', plotHeight / 1.75)
    .text('% Share of Food Insecure Persons')
    .attr('font-size', '14px');
}
