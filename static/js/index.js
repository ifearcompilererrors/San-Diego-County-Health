var death_no = [84,131,114,89,127,59];
var death_rate = [17.3,28.3,18.9,17.6,22.3,12.6];
var cx = [40,70,55,60,40,40];
var cy = [15,40,30,20,40,30];
var geo = ["Central Region", "East Region", "North Central Region", "North Coastal Region", "North Inland Region", "South Region" ];

/*Central Region        84  17.3
  East Region           131 28.3
  North Central Region  114 18.9
  North Coastal Region  89  17.6
  North Inland Region   127 22.3
  South Region          59  12.6*/

//var byNum

d3.csv("static/csv/2010-2012_Dementia.csv", function(error,data){
  console.log(data);
  console.log(error);

  var yoffset = 100; var xoffset = 0; 
  var ycount = 2; var xcount = 1;

  var node = d3.select("svg")
    .selectAll("circle")
      .data(data)
    .enter().append("circle")
      .attr("r", function(d){ if((+d["2012 Dementia Death No."]) > 200) return 0;
                              else return ((+d["2012 Dementia Death No."])+"px");})
      
      .attr("cy", function(d,i){ if( (d.Geography).search("Region") > -1 ){ yoffset=100*ycount; ycount+=4; return yoffset; }
                                 if( (d.Geography).search("Region") == -1 ){ return yoffset; } // not new region
                                  })
      .attr("cx", function(d,i){ if( (d.Geography).search("Region") > -1 ){ xcount=1; return 200; } 
                                 if( (d.Geography).search("Region") == -1 ){ xcount+=1; xoffset=230*xcount; return xoffset; }
                                 })
      .attr("fill", "steelblue");

  node.data(data)
      .append("title")
      .text(function(d){ return d.Geography+" "+(d["2012 Dementia Death No."]); });

  node.data(data)
      .append("text")
      .text(function(d){ return d.Geography+" "+(d["2012 Dementia Death No."]); })
      .attr("fill", "white")
      .attr("dy", function(d,i){ return i*52; });

  var div = d3.select("body")
    .selectAll("div")
      .data(data)
    .enter().append("div")
      .style("width", function(d){ return ((+d["2012 Dementia Death No."]))+"%";})
      .style("height", "3em")
      .style("y", function(d,i){ return i*52; })
      .style("background-color", "steelblue")
      .text(function(d){ return d.Geography+" "+(d["2012 Dementia Death No."]); });

  // node.data(cx)
  //   .attr("cx", function(d){ return d+"%"; });

  // node.data(cy)
  //   .attr("cy", function(d){ return d+"%"; });

});




