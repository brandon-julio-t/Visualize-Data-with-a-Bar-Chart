const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

const width = 640;
const height = 480;
const padding = 60;

async function main() {
  const dataset = await getDataset();
  const svg = createSvg();
  const data = transformData(dataset);

  const xScale = createXScale(data);
  const yScale = createYScale(data);

  createXAxis(svg, xScale);
  createYAxis(svg, yScale);
  createLegend(data);

  const tooltip = d3.select('#tooltip');

  svg
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('data-xvalue', d => d.year)
    .attr('data-yvalue', d => d.time)
    .attr('cx', d => xScale(d.year))
    .attr('cy', d => yScale(d.time))
    .attr('r', 5)
    .attr('fill', d => generateColorByNationality(d.original.Nationality))
    .on('mouseover', (_, d) => {
      tooltip.style('opacity', 1);
      tooltip.attr('data-date', d.time);
      tooltip.attr('data-year', d.year);
      tooltip.text(JSON.stringify(d));
    })
    .on('mouseout', () => tooltip.style('opacity', 0));
}

async function getDataset() {
  const resp = await fetch(url);
  return await resp.json();
}

function transformData(dataset) {
  return dataset.map(d => {
    const split = d.Time.split(':');
    const minutes = Number(split[0]);
    const seconds = Number(split[1]);

    // Change these three lines and the test won't pass. ¯\_(ツ)_/¯
    const date = new Date(null);
    date.setMinutes(minutes);
    date.setSeconds(seconds);

    return {
      year: d.Year,
      time: date,
      original: d,
    };
  });
}

function createSvg() {
  return d3.select('body').append('svg').attr('width', width).attr('height', height);
}

function createXScale(data) {
  data = data.map(d => d.year);
  return d3
    .scaleLinear()
    .domain(d3.extent(data))
    .rangeRound([padding, width - padding])
    .nice();
}

function createYScale(data) {
  data = data.map(d => d.time);
  return (
    d3
      .scaleUtc()
      // .domain(d3.extent(data))
      .domain([d3.max(data), d3.min(data)])
      .rangeRound([height - padding, padding])
      .nice()
  );
}

function createXAxis(svg, xScale) {
  const axis = d3.axisBottom(xScale).tickFormat(d => d.toString());

  svg
    .append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(0, ${height - padding})`)
    .call(axis);
}

function createYAxis(svg, yScale) {
  const axis = d3.axisLeft(yScale).tickFormat(d3.utcFormat('%M:%S'));

  svg.append('g').attr('id', 'y-axis').attr('transform', `translate(${padding}, 0)`).call(axis);
}

function createLegend(data) {
  data = [...new Set(data.map(d => d.original.Nationality))].map(d => ({
    nationality: d,
    color: generateColorByNationality(d),
  }));

  const svg = d3.select('body').append('svg').attr('id', 'legend').attr('height', 320);

  svg
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('r', 7)
    .attr('cx', 20)
    .attr('cy', (_, i) => i * 25 + 20)
    .attr('fill', d => d.color);

  svg
    .selectAll('text')
    .data(data)
    .enter()
    .append('text')
    .attr('x', 35)
    .attr('y', (_, i) => i * 25 + 25)
    .attr('fill', d => d.color)
    .text(d => d.nationality);
}

function generateColorByNationality(nationality) {
  const sum = nationality.split('').reduce((a, b) => a + b.charCodeAt(0), 0);

  const seed = Number(`0.${sum}`);
  const hex = Math.floor(seed * 16777215).toString(16);

  return `#${hex}`;
}

main();
