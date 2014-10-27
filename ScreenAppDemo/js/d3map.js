/*
* D3 script to create map
* This map is based on @mbostock 's Symbol Map
* original : http://bl.ocks.org/mbostock/4342045
* Removed some states and added random fade in animation 
*/
var us, centroid;
var radius = d3.scale.sqrt()
    .domain([0, 1e7])
    .range([0, 10]);

function mapRender() {

  d3.select('#graph svg').remove();

  var width = window.innerWidth * 0.65,
      height = window.innerHeight - 3;

  var sc = 1250 * (width / 960);
  var projection = d3.geo.albersUsa()
      .scale(sc)
      .translate([width / 2, height / 2]);

  var path = d3.geo.path()
  .projection(projection);

  var svg = d3.select('#graph').append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('transform', 'translate(' + (width/2) +
         ',' + (height/2) + ')');
  svg.append('path')
      .attr('class', 'states')
      .datum(topojson.feature(us, us.objects.states))
      .attr('d', path);

  var circle = svg.selectAll('.symbol')
      .data(centroid.features.sort(function(a, b) { return b.properties.population - a.properties.population; }))
    .enter().append('path')
    .attr('d', path.pointRadius(function(d) { return radius(d.properties.population); }));

   function annimateCircle() {
     circle.attr('class', 'symbol')
      .attr('opacity', 0)
        .transition().delay(function(d,i){ return i*500 ; }).duration(500)
        .attr('opacity', function(){
          var rand = Math.ceil(Math.random()*10);
          if(rand > 8 ){
            return 1;
          }
          return 0;
        })
        .transition().duration(500)
        .attr('opacity',0)
        .each('end', annimateCircle);
    }
  annimateCircle();
}

function setData(error, usdata, centroiddata){
  us = usdata;
  centroid= centroiddata;
  mapRender();
}

queue().defer(d3.json, './js/data/us.json')
       .defer(d3.json, './js/data/city.json')
       .await(setData);
