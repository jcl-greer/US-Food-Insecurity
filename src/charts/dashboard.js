import {select, selectAll, pointer} from 'd3-selection';
import {scaleLinear} from 'd3-scale';
import {extent, min, max, sum} from 'd3-array';
import {axisBottom, axisLeft} from 'd3-axis';
import {format} from 'd3-format';
import {scaleQuantize} from 'd3-scale';
import {transition} from 'd3-transition';
import {schemeBlues} from 'd3-scale-chromatic';
import {geoPath, geoIdentity} from 'd3-geo';
import * as topojson from 'topojson-client';
import {legendColor} from 'd3-svg-legend';

// this for the tooltip
// https://bl.ocks.org/d3noob/180287b6623496dbb5ac4b048813af52

// this for the map
// https://observablehq.com/@d3/state-choropleth

export default function(us, insecure) {
  if (!select('svg').empty()) {
    select('svg').remove();
  }

  // helper function for tooltip
  const callout = (g, value) => {
    if (!value) return g.style('display', 'none');

    g.style('display', null)
      .style('pointer-events', 'none')
      .style('font', '11px Gill Sans MT');

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

  // Call initial with Year Set to 2013
  map(us, insecure, callout, columnHas, 2013);
  scatter(us, insecure, callout, columnHas, 2013);
  stackedBar(us, insecure, callout, columnHas, 2013);

  let yearArr = [2013, 2014, 2015, 2016, 2017, 2018];

  const dropdowns = select('#slide-content #filters')
    .append('div')
    .selectAll('.drop-down')
    .data(['Year'])
    .join('div')
    .attr('id', 'drop');
  dropdowns
    .append('span')
    .attr('class', 'dropdown-title')
    .text(['Select a Year  '])
    .style('font-weight', 'bold');

  dropdowns
    .append('select')
    .on('change', (event, row) => {
      if (!select('svg').empty()) {
        selectAll('svg').remove();
      }
      // recalls functions when dropdown is used
      map(us, insecure, callout, columnHas, event.target.value);
      scatter(us, insecure, callout, columnHas, event.target.value);
      stackedBar(us, insecure, callout, columnHas, event.target.value);
    })
    .selectAll('options')
    .data(yearArr.map(year => ({year})))
    .attr('id', 'year-dropdown')
    .join('option')
    .text(d => d.year);
}

// CONSTRUCTS THE STATE LEVEL MAP
function map(us, insecure, callout, columnHas, selectedYear, marker = null) {
  const height = 600;
  const width = 800;
  const margin = {left: 10, top: 10, bottom: 10, right: 20};
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  let offset = [margin.left * 2, margin.top * 3];

  const colorDim = 'Food Insecurity Rate';

  insecure = insecure.filter(d => d.Year == selectedYear);
  let data = insecure.reduce(
    (obj, item) => Object.assign(obj, {[item.id]: item[colorDim]}),
    {},
  );

  const color = scaleQuantize()
    .domain(extent(insecure, d => d[colorDim]))
    .range(schemeBlues[5]);

  // let path = geoPath();

  let states = (states = new Map(
    us.objects.states.geometries.map(d => [d.id, d.properties]),
  ));
  let feature = topojson.feature(us, us.objects.states);

  let projection = geoIdentity()
    .fitSize([height * 1.33, width * 1.33], feature)
    .translate(offset);
  console.log('THE PROJECTION IS ', projection);

  let path = geoPath().projection(projection);

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
    .data(feature.features)
    .join('path')
    .attr('class', 'state')
    .attr('fill', d => color(data[d.id]))
    .attr('d', path)
    .attr('stroke', 'whitesmoke')
    .attr('stroke-width', '2px')
    .attr('stroke-linejoin', 'round')

    .on('mouseover', function(d, i) {
      select(this)
        .transition()
        .duration('50')
        .attr('fill', '#fba55c');
      select('.budget-scatter')
        .selectAll('*')
        .remove();
      scatter(us, insecure, callout, columnHas, selectedYear, i['id']);
      select('.stacked-bar')
        .selectAll('*')
        .remove();
      stackedBar(us, insecure, callout, columnHas, selectedYear, i['id']);
    })
    .on('mouseout', function(d, i) {
      select(this)
        .transition()
        .duration('50')
        .attr('opacity', '1')
        .attr('fill', d => color(data[d.id]));
      select('.budget-scatter')
        .selectAll('*')
        .remove();
      scatter(us, insecure, callout, columnHas, selectedYear);
      select('.stacked-bar')
        .selectAll('*')
        .remove();

      stackedBar(us, insecure, callout, columnHas, selectedYear);
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

  const tooltip = svg.append('g');
  svg
    .selectAll('.state')
    .on(
      'touchmove mousemove',
      function(event, d) {
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
      },
      {passive: true},
    )
    .on(
      'touchend mouseleave',
      function() {
        tooltip
          .call(callout, null)
          .select('#map')
          .attr('stroke', null)
          .lower();
      },
      {passive: true},
    );

  svg
    .append('g')
    .append('text')
    .attr('class', 'title')
    // .attr('text-anchor', 'middle')
    .attr('x', margin.left)
    .attr('y', margin.top * 2)
    .attr('font-size', '20px')
    .style('font-weight', 'bold')
    .text(selectedYear + ' Food Insecurity Rates by State');

  svg
    .append('g')
    .attr('class', 'legendQuant')
    .attr('font-size', '11px')
    .attr('transform', `translate(${plotWidth - margin.right * 20}, 1)`);

  let colorLegend = legendColor()
    .labelFormat(format('.1%'))
    .scale(color)
    .shapeHeight(15)
    .shapeWidth(70)
    .orient('horizontal');

  svg.select('.legendQuant').call(colorLegend);
}

// CONSTRUCTS THE BUDGET SCATTERPLOT
function scatter(
  us,
  initialData,
  callout,
  columnHas,
  selectedYear,
  marker = null,
) {
  let data = initialData.filter(d => d.Year == selectedYear);

  const height = 375;
  const width = 465;
  const margin = {left: 70, top: 50, bottom: 50, right: 60};
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
      stackedBar(us, initialData, callout, columnHas, selectedYear, i['id']);
    })
    .on('mouseout', function(d, i) {
      select(this)
        .transition()
        .duration('50')
        .attr('fill', d => colorScale(d[colorVar]));
      select('.stacked-bar')
        .selectAll('*')
        .remove();
      stackedBar(us, initialData, callout, columnHas, selectedYear);
    });

  // highlights if hovering over other chart
  if (marker !== null) {
    let selectedState = columnHas(data, 'id', marker);

    svg
      .append('g')
      .append('circle')
      .attr('cy', yScale(selectedState[0][yDim]))
      .attr('cx', xScale(selectedState[0][xDim]))
      .attr('fill', '#fba55c')
      .attr('stroke', 'black')
      .attr('stroke-width', '1px')
      .attr('r', 4.5);
  }

  svg
    .append('g')
    .attr('class', 'legendQuant')
    .attr('font-size', '11px')
    .attr('transform', `translate(${plotWidth - margin.right * 1.5}, -10)`);

  let colorLegend = legendColor()
    .labelFormat(format('.1%'))
    .scale(colorScale)
    .shapeHeight(10)
    .shapeWidth(10)
    .title('% of Food Insecure in Areas with High Meal Costs')
    .titleWidth(140);

  svg.select('.legendQuant').call(colorLegend);

  svg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${plotHeight})`)
    .call(axisBottom(xScale).ticks(6, '.2s'));

  svg
    .append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${-5})`)
    .call(axisLeft(yScale).ticks(12, '.2s'));

  svg
    .append('g')
    .append('text')
    .attr('class', 'title')
    .attr('text-anchor', 'middle')
    .attr('x', plotWidth / 2)
    .attr('y', 0 - margin.top / 2)
    .attr('font-size', '16px')
    .style('font-weight', 'bold')
    .text(selectedYear + ' Annual Food Budget Shortfalls by State ($)');
  svg
    .append('g')
    .append('text')
    .attr('class', 'x-label')
    .attr('text-anchor', 'middle')
    .attr('x', plotWidth / 2)
    .attr('y', plotHeight + 30)
    .style('font-weight', 'bold')
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
    .style('font-weight', 'bold')
    .text('Food Budget Shortage Per 100,000 ($)')
    .attr('font-size', '12px');

  const form = format('$.2s');

  const tooltip = svg.append('g');
  svg
    .selectAll('.budget-scatter')
    .on(
      'touchmove mousemove',
      function(event, d) {
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
      },
      {passive: true},
    )
    .on(
      'touchend mouseleave',
      function() {
        tooltip
          .call(callout, null)
          .select('.budget-scatter')
          .attr('stroke', null)
          .lower();
      },
      {passive: true},
    );
}

// util function for configuring data for stacked bar
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

// CONSTRUCTS THE STACKED BAR CHART
function stackedBar(
  us,
  initialData,
  callout,
  columnHas,
  selectedYear,
  marker = null,
) {
  let yearData = initialData.filter(d => d.Year == selectedYear);
  const xDim = '# of Food Insecure Persons';
  let data = prepStackData(
    yearData.sort((a, b) => (a[xDim] > b[xDim] ? 1 : -1)),
  );

  let div = select('#slide-content .stacked-bar')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

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

  const xScale = scaleLinear()
    .domain([0, 1])
    .range([margin.left, plotWidth - margin.right]);

  const svg = select('#slide-content .stacked-bar')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

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
      scatter(us, initialData, callout, columnHas, selectedYear, i['id']);
    })
    .on('mouseout', function(d, i) {
      select(this)
        .transition()
        .duration('50')
        .attr('fill', '#1f77b4')
        .attr('stroke', 'white');
      select('.budget-scatter')
        .selectAll('*')
        .remove();
      scatter(us, initialData, callout, columnHas, selectedYear);
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
    .on(
      'touchmove mousemove',
      function(event, d) {
        tooltip.call(
          callout,
          `${'State: ' + d.state}
          ${'Total Food Insecure Population: ' + form(d.rawValue)}`,
        );
        tooltip
          .attr('transform', `translate(${pointer(event)})`)
          .select('#stacked-bar')
          .attr('font-size', '12px')
          .raise();
      },
      {passive: true},
    )
    .on(
      'touchend mouseleave',
      function() {
        tooltip
          .call(callout, null)
          .select('#stacked-bar')
          .attr('stroke', null)
          .lower();
      },
      {passive: true},
    );

  // highlights if hovering over other chart
  if (marker !== null) {
    let selectedState = columnHas(stackData, 'id', marker);

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
    .text(
      'Share of Total Food Insecure Population by State (' + selectedYear + ')',
    );

  svg
    .append('g')
    .append('text')
    .attr('class', 'x-label')
    .attr('text-anchor', 'middle')
    .attr('x', plotWidth / 2)
    .attr('y', plotHeight / 1.75)
    .text('% Share of Food Insecure Population')
    .attr('font-size', '14px')
    .style('font-weight', 'bold');
}
