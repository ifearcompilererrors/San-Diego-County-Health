var palette =  ['rgb(70,130,180)','rgb(70,130,170)','rgb(70,130,160)','rgb(70,130,150)','rgb(70,130,140)','rgb(70,130,130)','rgb(70,130,120)','rgb(70,130,110)',' rgb(70,130,100)','rgb(70,130,90)','rgb(70,130,80)' ];


d3.json("/static/json/san-diego.geojson", function(error,data){
  var group = d3.select("svg").selectAll("path")
    .data(data.features)
    .enter()
    .append("g");

function random(){ return Math.floor(Math.random()*10); }

  var projection = d3.geo.mercator().scale(80000).translate([164000,49090]);
  var path = d3.geo.path().projection(projection);
  var color = d3.scale.category20();

  var areas = group.append("path")
    .attr("d", path)
    .attr("class", "area")
    .attr("fill",function(d,i){return color(i);})
    .attr("id", function(d){ return d.properties.name; })
    .text(function(d){ return d.properties.name; });

  group.append("title")
    .text(function(d){ return d.properties.name; });

  // areas.attr("fill", palette[random()]);

  group.append("text")
    // .attr("x", function(d){ return path.centroid(d); })
    // .attr("y", function(d){ return path.centroid(d); })
    .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(function(d){ return d.properties.name; });

});

// for(var i = 0; i < $("path").length; ++i){
//   $("path:nth-child("+i+")").attr("fill", palette[random]);
//   console.log($("path:nth-child("+i+")").innerHTML);
// }

$(document).ready(function(){
$("#dementia_no").click(function(){
  $("#hold").text("");
  d3.csv("/static/csv/2010-2012_Dementia.csv", function(error,data){
    var list = d3.select("#hold").selectAll("text")
    .data(data)
    .enter()
    .append("div")
    .text(function(d){ return d["Geography"]+" "+(+d["2012 Dementia Death No."]); });
  });
});

$("#dementia_rate").click(function(){
  $("#hold").text("");
  d3.csv("/static/csv/2010-2012_Dementia.csv", function(error,data){
    var list = d3.select("#hold").selectAll("text")
    .data(data)
    .enter()
    .append("div")
    .text(function(d){ return d["Geography"]+" "+(+d["2012 Dementia Death Rate*"]); });
  });
});

$("#population").click(function(){
  $("#hold").text("");
  d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
    var list = d3.select("#hold").selectAll("text")
    .data(data)
    .enter()
    .append("div")
    .text(function(d){ return d["Area "]+" "+(+d["Total 2012 Population"]); });
  });
});


});