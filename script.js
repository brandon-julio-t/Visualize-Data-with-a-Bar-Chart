// !! IMPORTANT README:

// You may add additional external JS and CSS as needed to complete the project, however the current external resource MUST remain in place for the tests to work. BABEL must also be left in place.

/***********
INSTRUCTIONS:
  - Select the project you would
    like to complete from the dropdown
    menu.
  - Click the "RUN TESTS" button to
    run the tests against the blank
    pen.
  - Click the "TESTS" button to see
    the individual test cases.
    (should all be failing at first)
  - Start coding! As you fulfill each
    test case, you will see them go
    from red to green.
  - As you start to build out your
    project, when tests are failing,
    you should get helpful errors
    along the way!
    ************/

// PLEASE NOTE: Adding global style rules using the * selector, or by adding rules to body {..} or html {..}, or to all elements within body or html, i.e. h1 {..}, has the potential to pollute the test suite's CSS. Try adding: * { color: red }, for a quick example!

// Once you have read the above messages, you can delete all comments.

const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';

const width = 800;
const height = 420;
const padding = 80;

async function main() {
  const dataset = await getDataset();
  const svg = createSvg();

  const data = dataset.data.map(d => ({
    date: new Date(d[0]),
    gdp: Number(d[1]),
    ori: d,
  }));

  const dates = data.map(d => d.date);
  const values = data.map(d => d.gdp);

  const xScale = createXScale(dates);
  const yScale = createYScale(values);

  createYAxis(svg, yScale);
  createXAxis(svg, xScale);

  const tooltip = createTooltip();

  svg
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('fill', 'black')
    .attr('class', 'bar')
    .attr('data-date', d => d.ori[0])
    .attr('data-gdp', d => d.gdp)
    .attr('width', 10)
    .attr('height', d => height - padding - yScale(d.gdp))
    .attr('y', d => yScale(d.gdp))
    .attr('x', d => xScale(d.date))
    .on('mouseover', (_, d) => {
      tooltip.attr('data-date', d.ori[0]).style('opacity', 1).text(`GDP: ${d.gdp} | date: ${d.date}`);
    })
    .on('mouseout', () => tooltip.style('opacity', 0));
}

async function getDataset() {
  const resp = await fetch(url);
  return await resp.json();
}

function createSvg() {
  return d3.select('body').append('svg').attr('id', 'dat-viz').attr('height', height).attr('width', width);
}

function createXScale(data) {
  return d3
    .scaleTime()
    .domain(d3.extent(data, d => d))
    .range([padding, width - padding]);
}

function createYScale(data) {
  return d3
    .scaleLinear()
    .domain([0, d3.max(data)])
    .range([height - padding, padding]);
}

function createYAxis(svg, yScale) {
  const yAxis = d3.axisLeft(yScale);

  svg.append('g').attr('id', 'y-axis').attr('transform', `translate(${padding}, 0)`).call(yAxis);
}

function createXAxis(svg, xScale) {
  const xAxis = d3.axisBottom(xScale);

  svg
    .append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(0, ${height - padding})`)
    .call(xAxis);
}

function createTooltip() {
  return d3.select('body').append('div').style('opacity', 0).attr('id', 'tooltip');
}

main();
