d3.json("/static/json/san-diego.geojson", function(error,data){
  var group = d3.select("svg").selectAll("g")
    .data(data.features)
    .enter()
    .append("g");

  var projection = d3.geo.mercator().scale(80000).translate([164000,49090]);
  var path = d3.geo.path().projection(projection);

  var areas = group.append("path")
    .attr("d", path)
    .attr("class", "area")
    .attr("fill", "steelblue")
    .text(function(d){ return d.properties.name });

  group.append("title")
    .text(function(d){ return d.properties.name });

});