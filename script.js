const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
const req = new XMLHttpRequest();

let baseTemps;
let values = [];

const monthsArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
let yearsArray;
let tempsArray;
let legend;

let xScale;
let yScale;
const colorScale = d3.scaleThreshold()
  .domain([2.6, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8])
  .range(['#4575b4', '#74add1', '#abdae9', '#e0f3f8', '#ffffbf', '#fee190', '#fdaf61', '#f46c43', '#d73027']);
let legendScale;

const width = 1200;
const height = 500;
const padding = 60;
const legendWidth = 300;
const legendHeight = 20;
const legendPadding = 30;

const thresholds = colorScale.domain();
const colors = colorScale.range();

const canvas = d3.select('svg')
                 .attr('width', width)
                 .attr('height', height + 100)

const generateScale = () => {
  
  yearsArray = values.map((d) => new Date(d.year , 0, 1))
  
  xScale = d3.scaleTime()
             .range([padding, width - padding])
             .domain([d3.min(yearsArray), d3.timeYear.offset(d3.max(yearsArray), 2)])
  
  yScale = d3.scaleBand()
             .range([padding, height - padding])
             .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

  legendScale = d3.scaleLinear()
    .domain([d3.min(thresholds), d3.max(thresholds)])
    .range([0, legendWidth]);
}

const drawCells = () => {
  const tooltip = d3.select('#tooltip')
  
  const uniqueYears = [...new Set(values.map(d => d.year))].length;
  
  canvas.selectAll('rect')
        .data(values)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('data-year', d => d.year)
        .attr('data-month', d => d.month - 1)
        .attr('data-temp', d => baseTemps + d.variance)
        .attr('x', d => xScale(new Date(d.year, 0, 1)))
        .attr('y', d => yScale(d.month - 1) -25)
        .attr('width', (width - 2 * padding) / uniqueYears)
        .attr('height', (height - 2 * padding) / 12)
        .attr('fill', d => {
    temp = baseTemps + d.variance;
    if(temp <= 3.9) {
      return '#4575b4'
    } else if(temp <= 5.0) {
      return '#74add1'
    } else if(temp <= 6.1) {
      return '#abdae9'
    } else if(temp <= 7.2) {
      return '#e0f3f8'   
    } else if(temp <= 8.3) {
      return '#ffffbf'
    } else if(temp <= 9.5) {
      return '#fee190'
    } else if(temp <= 10.6) {
      return '#fdaf61'
    } else if(temp <= 11.7) {
      return '#f46c43'
    } else {
      return '#d73027'
    }
  })
      .on('mouseover', function(event, d) {
    tooltip.transition().duration(200).style('opacity', '0.8')
    tooltip.html(`${d.year} - ${monthsArray[d.month - 1]}<br>${(baseTemps + d.variance).toFixed(1)}℃<br>${d.variance.toFixed(1)}℃`)
           .style('left', `${event.pageX + 10}px`)
           .style('top', `${event.pageY + 28}px`)
           .attr('data-year', d.year)
   d3.select(this)
     .style('stroke', 'black')
     .style('stroke-width', 2)
  })
      .on('mouseout', function(){
    tooltip.transition().duration(500).style('opacity', '0')
    d3.select(this)
      .style('stroke-width', 0)
  })
}

const drawAxes = () => {
  
  const xAxis = d3.axisBottom(xScale)
                  .ticks(d3.timeYear.every(10))
  
  const yAxis = d3.axisLeft(yScale)
                  .tickValues(d3.range(12))
                  .tickFormat((d, i) => monthsArray[i])
                 
  canvas.append('g')
        .call(xAxis)
        .attr('transform', `translate(0, ${height - padding - 25})`)
        .attr('id', 'x-axis')
  
  canvas.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', `translate(${padding}, -25)`)
  
  const legendAxis = d3.axisBottom(legendScale)
    .tickValues(thresholds)
    .tickFormat(d3.format(".1f"));

  legend = canvas.append('g')
    .attr('transform', `translate(0, ${legendHeight})`)
    .attr('id', 'legend')
    .attr('transform', `translate(${(width - legendWidth) / 2}, ${height - 20})`)
    .call(legendAxis);
}

const drawlegend = () => {

  legend.selectAll('rect')
    .data(thresholds.map((t, i) => ({
      color: colors[i],
      start: t,
      end: thresholds[i + 1] || d3.max(thresholds)
    })))
    .enter()
    .append('rect')
    .attr('x', d => legendScale(d.start))
    .attr('y', -20)
    .attr('width', d => legendScale(d.end) - legendScale(d.start))
    .attr('height', legendHeight)
    .style('stroke', 'black')
    .style('stroke-width', 1)
    .attr('fill', d => d.color);
  
}

req.open('GET', url, true)
req.onload = () => {
  let response = JSON.parse(req.responseText);
  baseTemps = response.baseTemperature;
  values = response.monthlyVariance;
  
  generateScale();
  drawCells();
  drawAxes();
  drawlegend();
}
req.send()
