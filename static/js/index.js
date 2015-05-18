var palette =  ['rgb(70,130,180)','rgb(70,130,170)','rgb(70,130,160)','rgb(70,130,150)','rgb(70,130,140)','rgb(70,130,130)','rgb(70,130,120)','rgb(70,130,110)',' rgb(70,130,100)','rgb(70,130,90)','rgb(70,130,80)' ];

var array;

d3.json("/static/json/san-diego.geojson", function(error,data){
  var group = d3.select("svg").selectAll("g")
    .data(data.features)
    .enter()
    .append("g");

function random(){ return Math.floor(Math.random()*10); }

  var projection = d3.geo.mercator().scale(99000).translate([202800,60700]);
  var path = d3.geo.path().projection(projection);
  var color = d3.scale.category20();

  // var color = d3.scale.threshold()
  //     .domain([1, 10, 50, 100, 500, 1000, 2000, 5000])
  //     .range(["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"]);

  var areas = group.append("path")
    .attr("d", path)
    .attr("class", "area")
    .attr("fill",function(d,i){ return "lavender"; })
    // .attr("fill",function(d,i){ return color(i); })
    .attr("id", function(d){ return d.properties.name; })
    .text(function(d){ return d.properties.name; });

  group.append("title")
    .text(function(d){ return d.properties.name; });

  // areas.attr("fill", palette[random()]);

  group.append("text")
    .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(function(d){ return d.properties.name; });

  d3.csv("/static/csv/2010-2012_Dementia.csv", function(error,data){
    d3.select("svg").selectAll("path")
      .data(data)
      .attr("fill", function(d){ if( (+d["2012 Dementia Death No."]) < 20  ) return 'rgb(70,130,110)';
                                 if( (+d["2012 Dementia Death No."]) < 50  ) return 'rgb(70,130,150)';
                                 if( (+d["2012 Dementia Death No."]) < 80  ) return 'rgb(70,130,170)';
                                 if( (+d["2012 Dementia Death No."]) < 110  ) return 'rgb(70,130,190)';
                                 if( (+d["2012 Dementia Death No."]) < 200  ) return 'rgb(70,130,220)'
                                 if( (+d["2012 Dementia Death No."]) < 500  ) return 'rgb(70,130,250)';
                                });
  });

});



$(document).ready(function(){
$("#dementia_no").click(function(){
  $("#hold").text("");
  d3.csv("/static/csv/2010-2012_Dementia.csv", function(error,data){
    var list = d3.select("#hold").selectAll("text")
    .data(data)
    .enter()
    .append("p")
    .attr("id", function(d){ return d["Geography"]; })
    .attr("class", "hover")
    .text(function(d){ return d["Geography"]+" "+(+d["2012 Dementia Death No."]); });
    
    $(".hover").mouseenter(function(){
      console.log(this.id);
      var id = this.id;
      var fill = $("#"+this.id).attr("fill");
      $("#"+id).attr("fill", "orange");
      $(".hover").mouseleave(function(){
        $("#"+id).attr("fill", fill);
      });
    });
  });
});

$("#dementia_rate").click(function(){
  $("#hold").text("");
  d3.csv("/static/csv/2010-2012_Dementia.csv", function(error,data){
    var list = d3.select("#hold").selectAll("text")
    .data(data)
    .enter()
    .append("p")
    .attr("id", function(d){ return d["Geography"]; })
    .attr("class", "hover")
    .text(function(d){ return d["Geography"]+" "+(+d["2012 Dementia Death Rate*"]); });
    
    $(".hover").mouseenter(function(){
      console.log(this.id);
      var id = this.id;
      var fill = $("#"+this.id).attr("fill");
      $("#"+id).attr("fill", "orange");
      $(".hover").mouseleave(function(){
        $("#"+id).attr("fill", fill);
      });
    });
  });
});

$("#population").click(function(){
  $("#hold").text("");
  d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
    var list = d3.select("#hold").selectAll("text")
    .data(data)
    .enter()
    .append("p")
    .attr("id", function(d){ return d["Area"]; })
    .attr("class", "hover")
    .text(function(d){ return d["Area "]+" "+(+d["Total 2012 Population"]); });

    $(".hover").mouseenter(function(){
      console.log(this.id);
      var id = this.id;
      var fill = $("#"+this.id).attr("fill");
      $("#"+id).attr("fill", "orange");
      $(".hover").mouseleave(function(){
        $("#"+id).attr("fill", fill);
      });
    });
  });
});



});