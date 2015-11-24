var palette = ['rgb(110,170,190)','rgb(90,150,170)','rgb(70,130,150)','rgb(50,110,130)','rgb(30,90,110)','rgb(10,70,90)','rgb(230,230,250)'];

var centroids = {};
var no_arr = {};
var rate_arr = {};
var area_color = {};

var res;

var dementia_rate = false;
var dementia_no = false;

d3.json("/static/json/SRA2010tiger.geojson", function(error,data){
  var group = d3.select("svg").selectAll("g")
    .data(data.features)
    .enter()
    .append("g")
    .attr("id", function(d){ return "g-"+(d.properties.NAME.replace(/\s+/g, '-').toLowerCase()); });

  function random(){ return Math.floor(Math.random()*10); }

  var width = $(window).width();
  var height = $(window).height();
  var scale = $(window).width() * 25;

 var projection = d3.geo.mercator().scale(scale)
                                    .center([-116.83874700000001,33.020922699224])
                                    .translate([width/3,height-335]);
  var path = d3.geo.path().projection(projection);
  var color = d3.scale.category20();
  
  var areas = group.append("path")
    .attr("d", path)
    .attr("fill", "rgba(230,230,250,.7)")
    .attr("class", "area")
    .attr("style", "z-index:-9999999;")
    .attr("id", function(d){ return d.properties.NAME.replace(/\s+/g, '-').toLowerCase(); })
    .text(function(d){ return d.properties.NAME; });

  group.append("title")
    .text(function(d){ return d.properties.NAME; });

  group.append("text")
    .attr("transform", function(d) {  centroids[d.properties.NAME.replace(/\s+/g, '-').toLowerCase()] = path.centroid(d);
                                      return "translate(" + path.centroid(d) + ")"; })
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("class", "text")
    .text(function(d){ return d.properties.NAME; });

  group.append("text")
    .attr("class", function(d){ return "income "+d.properties.NAME.replace(/\s+/g, '-').toLowerCase(); })
    .attr("id", function(d){ return d.properties.NAME.replace(/\s+/g, '-').toLowerCase(); })
    .attr("text-anchor", "middle")
    .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; });

  d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Vs_Subregional_Area_Income.csv", function(error,data){
    var income = {};

    d3.select("g").selectAll("path.area")
      .data(data)
      .enter()
      .append("p")
      .attr("id", function(d){  income[d["Area"].replace(/\s+/g, '-').toLowerCase()] = +(d["Median household income"].replace(/['$']/g, ''));
                                return "income-"+d["Area"].replace(/\s+/g, '-').toLowerCase(); })
      .text(function(d){ return d["Median household income"]; });

    var cur = "";
    var grades = [60000, 80000, 100000, 200000, 0];

    for(var k = 0; k < $("path.area").length; k++)
    {
      cur = $("path.area")[k].id;
      for(key in income)
      {
        if(cur == key)
        {
          if(income[key] < grades[0]) $("text."+cur).text("$").attr("style", "color:green;font-size:1em;");
          else if(income[key] < grades[1]) $("text."+cur).text("$$").attr("style", "color:green;font-size:1em;");
          else if(income[key] < grades[2]) $("text."+cur).text("$$$").attr("style", "color:green;font-size:1em;");
          else if(income[key] < grades[3]) $("text."+cur).text("$$$$").attr("style", "color:green;font-size:1em;");
        }
      }
    }

    $("text.carlsbad").text("$$").attr("style", "color:green;font-size:1em;");  

    // Median household income
    // [41936, 45498, 45873, 47821, 49948, 52607, 52692, 54417, 55429, 56626, 57946, 59014, 60434, 60838, 61044, 61751, 65489, 68676, 69316, 70503, 71155, 71475, 72011, 73746, 74965, 78300, 83094, 83290, 83438, 85004, 85455, 88991, 89108, 91041, 94927, 99889, 103305, 104474, 115528, 117506, 121168]

    });

  group.select("path").attr("fill",function(d,i){ return 'rgba(230,230,250,.7)'; })
    .attr("stroke", "#fff");
    // .attr("style", "opacity:.7;");

  ////////////////////////////////////////// DISEASE //////////////////////////////////////////

  var diseaseToggle = false;
  var urlBG = {};

  $(".disease-toggle").click(function(){
    diseaseToggle = !diseaseToggle;
    var cur = "";
    if(diseaseToggle)
    {
      for(var i = 0; i < $("path").length; i++)
      {
        cur = $("path")[i].id;
        urlBG[cur] = $("#"+cur).attr("fill");
      }
      $("defs").hide();
      colorMap(res);
    }
    else
    {
      // $("defs").parent().attr("fill", "");
      $("defs").show();
      for(key in urlBG)
      {
        $("#"+key).attr("fill", urlBG[key]);
      }
    }
  });

  $(".disease-select").change(function(){
    switch(this.value){
    case "dementia_no":
      dementia_no = true;
      dementia_rate = false;
      $("#disease-hold").empty();
      d3.csv("/static/csv/2010-2012_Dementia.csv", function(error,data){
        d3.select("#disease-hold").selectAll("text")
          .data(data)
          .enter()
          .append("p")
          .text(function(d){ return d["Geography"] + " " + (+d["2012 Dementia Death No."]); })
          .attr("class", function(d){ no_arr[d["Geography"].replace(/\s+/g, '-').toLowerCase()] = +d["2012 Dementia Death No."];
                                      return d["Geography"] + " dementia-no hover";})
          .attr("id", function(d){ return d["Geography"].replace(/\s+/g, '-').toLowerCase()});

        var cur = "";

        d3.json("/static/json/SRA2010tiger.geojson", function(error,data){
          var disease_grades = [10, 30, 50, 70];

          var t;
          for(var i = 0; i < $("path.area").length; i++)
          {
            for(key in no_arr)
            {
              if($("path.area")[i].id == key)
              {
                cur = $("path.area")[i].id ;

                // colorMap(res);

                if     (no_arr[key] < disease_grades[0]) t = textures.lines().size(6).strokeWidth(1).stroke("black").background("rgb("+area_color[key][0]+","+area_color[key][1]+","+area_color[key][2]+")");
                else if(no_arr[key] < disease_grades[1]) t = textures.lines().size(5).strokeWidth(1).stroke("black").background("rgb("+area_color[key][0]+","+area_color[key][1]+","+area_color[key][2]+")");
                else if(no_arr[key] < disease_grades[2]) t = textures.lines().size(6).strokeWidth(2).stroke("black").background("rgb("+area_color[key][0]+","+area_color[key][1]+","+area_color[key][2]+")");
                else if(no_arr[key] < disease_grades[3]) t = textures.lines().size(5).strokeWidth(2).stroke("black").background("rgb("+area_color[key][0]+","+area_color[key][1]+","+area_color[key][2]+")");

                group.call(t);

                if(cur != "mountain-empire" && cur != "pendleton" && cur != "coronado" && cur != "miramar" && cur != "jamul" && cur != "pauma" && cur != "palomar-julian" && cur != "laguna-pine-valley" && cur != "anza-borrego-springs" )
                  $("#"+cur).attr("fill", t.url());
              }
            }
          }
          });

        $(".hover").mouseenter(function(){
          var id = this.id;
          $("#"+id).attr("stroke", "black").attr("stroke-width", "2");

          $(".hover").mouseleave(function(){
            $("#"+id).attr("stroke", "").attr("stroke-width", "");
          });

        });

        $(".ref-disease span").empty().text("Dementia No.");
      });

      break;

      case "dementia_rate":
        dementia_rate = true;
        dementia_no = false;
        $("#disease-hold").empty()
        d3.csv("/static/csv/2010-2012_Dementia.csv", function(error,data){
          d3.select("#disease-hold").selectAll("text")
            .data(data)
            .enter()
            .append("p")
            .text(function(d){ return d["Geography"] + " " + (+d["2012 Dementia Death Rate*"]); })
            .attr("class", function(d){ rate_arr[d["Geography"].replace(/\s+/g, '-').toLowerCase()] = +d["2012 Dementia Death Rate*"];
                                        return d["Geography"] + " dementia-rate hover";})
            .attr("id", function(d){ return d["Geography"].replace(/\s+/g, '-').toLowerCase()});

          var cur = "";

          d3.json("/static/json/SRA2010tiger.geojson", function(error,data){
            var disease_grades = [10, 20, 30, 70];

            var t;

            for(var i = 0; i < $("path.area").length; i++)
            {
              for(key in rate_arr)
              {
                // console.log(rate_arr[key])
                if($("path.area")[i].id == key)
                {
                  cur = $("path.area")[i].id ;

                  // colorMap(res);

                  if     (rate_arr[key] < disease_grades[0]) t = textures.lines().size(6).strokeWidth(1).stroke("black").background("rgb("+area_color[key][0]+","+area_color[key][1]+","+area_color[key][2]+")");
                  else if(rate_arr[key] < disease_grades[1]) t = textures.lines().size(5).strokeWidth(1).stroke("black").background("rgb("+area_color[key][0]+","+area_color[key][1]+","+area_color[key][2]+")");
                  else if(rate_arr[key] < disease_grades[2]) t = textures.lines().size(6).strokeWidth(2).stroke("black").background("rgb("+area_color[key][0]+","+area_color[key][1]+","+area_color[key][2]+")");
                  else if(rate_arr[key] < disease_grades[3]) t = textures.lines().size(5).strokeWidth(2).stroke("black").background("rgb("+area_color[key][0]+","+area_color[key][1]+","+area_color[key][2]+")");

                  group.call(t);

                  // $("#"+cur).attr("fill", t.url()).attr("class", "dementia-rate-strokes");
                  $("#"+cur).attr("fill", t.url());
                }
              }
            }
          });

          $(".hover").mouseenter(function(){
            var id = this.id;
            $("#"+id).attr("stroke", "black").attr("stroke-width", "2");
          
            $(".hover").mouseleave(function(){
              $("#"+id).attr("stroke", "").attr("stroke-width", "");
            });
          
          });
        });
        $(".ref-disease span").empty().text("Dementia Rate");
        
        break;

      case "none-disease":
        d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
          // d3.select("svg").selectAll("path.area")
          //   .data(data)
          //   .attr("fill", function(d){ return 'rgba(230,230,250,.2)'; });
          $(".dementia").hide();
        });
        $(".legend-color").empty().hide();
        break;

      default: break;
    }
  });

  //////////////////////////////////////////////// POPULATION COLORS ////////////////////////////////////////////////


  var cur_palette = [ [0,0,0], [0,0,0], [0,0,0], [0,0,0], [0,0,0], [0,0,0] ];
  var pop_palette = [[130,210,130],[90,160,90],[70,130,70],[50,100,50],[30,70,30],[10,40,10]];
  var cur_grades = [0, 0, 0, 0, 0, 0];
  var pop_arr_input = {};
  var pop = [7700, 18000, 80000, 220000, 680000, 3200000];

  function resetPopArr(){
  d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
    d3.select("#dummy").selectAll("text")
      .data(data)
      .enter()
      .append("p")
      .text(function(d){ return d["Area "] + " " + (+d["Black"]); })
      .attr("class", function(d){ pop_arr_input[d["Area "].replace(/\s+/g, '-').toLowerCase()] = 0;
                                  return d["Area "] + " population hover";})
      .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

    $("#dummy").empty();
  });
  }

  resetPopArr();

  function calc(grades, offset, adjust){
  if(!adjust){
    for(i in grades){
      for(j in pop_palette[i]){
        cur_palette[i][j] = cur_palette[i][j] + (offset + pop_palette[i][j]);
        cur_palette[i][j] = Math.round(cur_palette[i][j]/2)
      }
      cur_grades[i] += grades[i];
    }
  }
  else{
    for(i in grades){
      for(j in pop_palette[i]){
        cur_palette[i][j] = Math.round(cur_palette[i][j] * 2);
        cur_palette[i][j] = cur_palette[i][j] - (offset + pop_palette[i][j]);
        if($(".population-input:checked").length == 0) cur_palette[i][j] = 0;
      }
      cur_grades[i] -= grades[i];
    }
  }

  for(m in cur_palette){
    console.log("cur_palette "+m+": "+cur_palette[m]);
  }

  console.log("cur_grades: " + cur_grades);
  console.log("cur_palette: "+ cur_palette);
  console.log("pop_arr_input['escondido']: " + pop_arr_input["escondido"]);

  return cur_palette;
  }

  function legend(str){

  $(".legend-color").empty().show();

  for(var i = 0; i < cur_palette.length-1; i++)
  {
    $(".legend-color").append("<span class='value'> < "+cur_grades[i]+"</span><div class='key' style='background-color:rgb("+cur_palette[i][0]+","+cur_palette[i][1]+","+cur_palette[i][2]+");'></div>");
  }

  $(".ref-population span").empty().text(str);
  }

  $(".population-input").click(function(){
  switch(this.value){
    case "population-overall":
      var disabled = $(".population-specific").attr("disabled");
      $(".population-specific").attr("disabled", !disabled);
      if ( $("input.population-overall:checked").length == 1 ){
        population();
      }
      else if ( $("input.population-overall:checked").length != 1 ){
        colorMap(res);
      }
      break;
    
    case "population-black":
      var grades = [100, 1000, 5000, 10000, 60000, 200000, 0];
      var offset = 20;
      if ( $("input.population-black:checked").length == 1 ){
        d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
          // var pop_arr = {};
          
          d3.select("#dummy").selectAll("text")
            .data(data)
            .enter()
            .append("p")
            .text(function(d){ return d["Area "] + " " + (+d["Black"]); })
            .attr("class", function(d){ pop_arr_input[d["Area "].replace(/\s+/g, '-').toLowerCase()] += +d["Black"];
                                        return d["Area "] + " population hover";})
            .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

          $("#dummy").empty();

          var cur = "";
          res = calc(grades,offset,false);
          colorMap(res);
          legend("Black");
        });
      }
      else if ( $("input.population-black:checked").length != 1 ){
        d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
          // var pop_arr = {};
          
          d3.select("#dummy").selectAll("text")
            .data(data)
            .enter()
            .append("p")
            .text(function(d){ return d["Area "] + " " + (+d["Black"]); })
            .attr("class", function(d){ pop_arr_input[d["Area "].replace(/\s+/g, '-').toLowerCase()] -= +d["Black"];
                                        return d["Area "] + " population hover";})
            .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

          $("#dummy").empty();

          var cur = "";
          res = calc(grades,offset,true);
          colorMap(res);
          legend("Black");
        });
      }
      break;

   case "population-l-c":
      var grades = [2000, 5000, 10000, 50000, 100000, 300000];
      var offset = 3;
      if ( $("input.population-l-c:checked").length == 1 ){
        d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
          // var pop_arr_input = {};
          
          d3.select("#dummy").selectAll("text")
            .data(data)
            .enter()
            .append("p")
            .text(function(d){ return d["Area "] + " " + (+d["Hispanic"]); })
            .attr("class", function(d){ pop_arr_input[d["Area "].replace(/\s+/g, '-').toLowerCase()] += +d["Hispanic"];
                                        return d["Area "] + " population hover";})
            .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

          $("#dummy").empty();

          var cur = "";
          res = calc(grades,offset,false);
          // $("#dummy").html(res);
          colorMap(res);
          legend("Hispanic");
        });
      }
      else if ( $("input.population-l-c:checked").length != 1 ){
        d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
          // var pop_arr = {};
          
          d3.select("#dummy").selectAll("text")
            .data(data)
            .enter()
            .append("p")
            .text(function(d){ return d["Area "] + " " + (+d["Hispanic"]); })
            .attr("class", function(d){ pop_arr_input[d["Area "].replace(/\s+/g, '-').toLowerCase()] -= +d["Hispanic"];
                                        return d["Area "] + " population hover";})
            .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

          $("#dummy").empty();

          var cur = "";
          res = calc(grades,offset,true);
          colorMap(res);
          legend("Hispanic");
        });
      }
      break;

    case "population-api":
      var grades = [100, 1000, 10000, 50000, 100000, 500000];
      var offset = 5;
      if ( $("input.population-api:checked").length == 1 ){
        d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
          // var pop_arr_input = {};
          
          d3.select("#dummy").selectAll("text")
            .data(data)
            .enter()
            .append("p")
            .text(function(d){ return d["Area "] + " " + (+d["Asian/Pacific Islander"]); })
            .attr("class", function(d){ pop_arr_input[d["Area "].replace(/\s+/g, '-').toLowerCase()] += +d["Asian/Pacific Islander"];
                                        return d["Area "] + " population hover";})
            .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

          $("#dummy").empty();

          var cur = "";
          res = calc(grades,offset,false);
          // $("#dummy").html(res);
          colorMap(res);
          legend("Asian/Pacific Islander");
        });
      }
      else if ( $("input.population-api:checked").length != 1 ){
        d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
          // var pop_arr = {};
          
          d3.select("#dummy").selectAll("text")
            .data(data)
            .enter()
            .append("p")
            .text(function(d){ return d["Area "] + " " + (+d["Asian/Pacific Islander"]); })
            .attr("class", function(d){ pop_arr_input[d["Area "].replace(/\s+/g, '-').toLowerCase()] -= +d["Asian/Pacific Islander"];
                                        return d["Area "] + " population hover";})
            .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

          $("#dummy").empty();

          var cur = "";
          res = calc(grades,offset,true);
          colorMap(res);
          legend("Asian/Pacific Islander");
        });
      }
      break;

    case "population-other":
      var grades = [500, 1000, 5000, 10000, 20000, 200000];
      var offset = 10;
      if ( $("input.population-other:checked").length == 1 ){
        d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
          // var pop_arr_input = {};
          
          d3.select("#dummy").selectAll("text")
            .data(data)
            .enter()
            .append("p")
            .text(function(d){ return d["Area "] + " " + (+d["Other Race/ Ethnicity"]); })
            .attr("class", function(d){ pop_arr_input[d["Area "].replace(/\s+/g, '-').toLowerCase()] += +d["Other Race/ Ethnicity"];
                                        return d["Area "] + " population hover";})
            .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

          $("#dummy").empty();

          var cur = "";
          res = calc(grades,offset,false);
          // $("#dummy").html(res);
          colorMap(res);
          legend("Other Race/ Ethnicity");
        });
      } else if ( $("input.population-other:checked").length != 1 ){
        d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
          // var pop_arr = {};
          
          d3.select("#dummy").selectAll("text")
            .data(data)
            .enter()
            .append("p")
            .text(function(d){ return d["Area "] + " " + (+d["Other Race/ Ethnicity"]); })
            .attr("class", function(d){ pop_arr_input[d["Area "].replace(/\s+/g, '-').toLowerCase()] -= +d["Other Race/ Ethnicity"];
                                        return d["Area "] + " population hover";})
            .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

          $("#dummy").empty();

          var cur = "";
          res = calc(grades,offset,true);
          colorMap(res);
          legend("Other Race/ Ethnicity");
        });
      }
      break;

    case "population-white":
      var grades = [5000, 10000, 50000, 100000, 500000, 2000000];
      if ( $("input.population-white:checked").length == 1 ){
        d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
          // var pop_arr_input = {};
          
          d3.select("#dummy").selectAll("text")
            .data(data)
            .enter()
            .append("p")
            .text(function(d){ return d["Area "] + " " + (+d["White"]); })
            .attr("class", function(d){ pop_arr_input[d["Area "].replace(/\s+/g, '-').toLowerCase()] += +d["White"];
                                        return d["Area "] + " population hover";})
            .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

          $("#dummy").empty();

          var cur = "";
          res = calc(grades,1,false);
          // $("#dummy").html(res);
          colorMap(res);
          legend("White");
        });
      } else if ( $("input.population-white:checked").length != 1 ){
        d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
          // var pop_arr = {};
          
          d3.select("#dummy").selectAll("text")
            .data(data)
            .enter()
            .append("p")
            .text(function(d){ return d["Area "] + " " + (+d["White"]); })
            .attr("class", function(d){ pop_arr_input[d["Area "].replace(/\s+/g, '-').toLowerCase()] -= +d["White"];
                                        return d["Area "] + " population hover";})
            .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

          $("#dummy").empty();

          var cur = "";
          res = calc(grades,1,true);
          colorMap(res);
          legend("White");
        });
      }
      break;
    }
  });


  //////////////////////////////////////////////// POPULATION INFO ////////////////////////////////////////////////

  function colorMap(popSpecArr){
    for(var i = 0; i < $("path.area").length; i++){
      for(key in pop_arr_input){
        if($("path.area")[i].id == key){
          cur = $("path.area")[i].id;
          if( pop_arr_input[key] < cur_grades[0]  ) { $("#"+cur).attr("fill", 'rgb('+(popSpecArr[0][0])+','+(popSpecArr[0][1])+','+(popSpecArr[0][2])+')').attr("stroke", ""); area_color[key] = popSpecArr[0]; }
          else if( pop_arr_input[key] < cur_grades[1]  ) { $("#"+cur).attr("fill", 'rgb('+(popSpecArr[1][0])+','+(popSpecArr[1][1])+','+(popSpecArr[1][2])+')').attr("stroke", ""); area_color[key] = popSpecArr[1]; }
          else if( pop_arr_input[key] < cur_grades[2]  ) { $("#"+cur).attr("fill", 'rgb('+(popSpecArr[2][0])+','+(popSpecArr[2][1])+','+(popSpecArr[2][2])+')').attr("stroke", ""); area_color[key] = popSpecArr[2]; }
          else if( pop_arr_input[key] < cur_grades[3]  ) { $("#"+cur).attr("fill", 'rgb('+(popSpecArr[3][0])+','+(popSpecArr[3][1])+','+(popSpecArr[3][2])+')').attr("stroke", ""); area_color[key] = popSpecArr[3]; }
          else if( pop_arr_input[key] < cur_grades[4]  ) { $("#"+cur).attr("fill", 'rgb('+(popSpecArr[4][0])+','+(popSpecArr[4][1])+','+(popSpecArr[4][2])+')').attr("stroke", ""); area_color[key] = popSpecArr[4]; }
          else if( pop_arr_input[key] < cur_grades[5]*2  ) { $("#"+cur).attr("fill", 'rgb('+(popSpecArr[5][0])+','+(popSpecArr[5][1])+','+(popSpecArr[5][2])+')').attr("stroke", ""); area_color[key] = popSpecArr[5]; }
          // else if( pop_arr_input[key] == gradesArr[6]  ) $("#"+cur).attr("fill", 'rgb('+(popSpecArr[6][0])+','+(popSpecArr[6][1])+','+(popSpecArr[6][0])+')').attr("stroke", "");
          // else if( pop_arr_input[key] == null  ) $("#"+cur).attr("fill", 'rgb('+(popSpecArr[6][0])+','+(popSpecArr[6][1])+','+(popSpecArr[6][0])+')').attr("stroke", "");
          else $("#"+cur).attr("fill", "rgba(230,230,250,.7)").attr("stroke", "");
        }
      }     
    }
    dementia();
  }

  function dementia(){
    if(dementia_rate)
    {
      d3.csv("/static/csv/2010-2012_Dementia.csv", function(error,data){
        d3.select("#disease-hold").selectAll("text")
          .data(data)
          .enter()
          .append("p")
          .text(function(d){ return d["Geography"] + " " + (+d["2012 Dementia Death Rate*"]); })
          .attr("class", function(d){ rate_arr[d["Geography"].replace(/\s+/g, '-').toLowerCase()] = +d["2012 Dementia Death Rate*"];
                                      return d["Geography"] + " dementia-rate hover";})
          .attr("id", function(d){ return d["Geography"].replace(/\s+/g, '-').toLowerCase()});

        var cur = "";

        d3.json("/static/json/SRA2010tiger.geojson", function(error,data){
          var disease_grades = [10, 20, 30, 70];

          var t;

          for(var i = 0; i < $("path.area").length; i++)
          {
            for(key in rate_arr)
            {
              // console.log(rate_arr[key])
              if($("path.area")[i].id == key)
              {
                cur = $("path.area")[i].id ;

                if     (rate_arr[key] < disease_grades[0]) t = textures.lines().size(6).strokeWidth(1).stroke("rgba(10,10,10,.3)").background("rgb("+area_color[key][0]+","+area_color[key][1]+","+area_color[key][2]+")");
                else if(rate_arr[key] < disease_grades[1]) t = textures.lines().size(5).strokeWidth(1).stroke("rgba(10,10,10,.3)").background("rgb("+area_color[key][0]+","+area_color[key][1]+","+area_color[key][2]+")");
                else if(rate_arr[key] < disease_grades[2]) t = textures.lines().size(6).strokeWidth(2).stroke("rgba(10,10,10,.5)").background("rgb("+area_color[key][0]+","+area_color[key][1]+","+area_color[key][2]+")");
                else if(rate_arr[key] < disease_grades[3]) t = textures.lines().size(5).strokeWidth(2).stroke("rgba(10,10,10,.5)").background("rgb("+area_color[key][0]+","+area_color[key][1]+","+area_color[key][2]+")");

                group.call(t);

                // $("#"+cur).attr("fill", t.url()).attr("class", "dementia-rate-strokes");
                $("#"+cur).attr("fill", t.url());
              }
            }
          }
        });
      });
    }
    else if(dementia_no)
    {
      d3.csv("/static/csv/2010-2012_Dementia.csv", function(error,data){
        d3.select("#disease-hold").selectAll("text")
          .data(data)
          .enter()
          .append("p")
          .text(function(d){ return d["Geography"] + " " + (+d["2012 Dementia Death No."]); })
          .attr("class", function(d){ no_arr[d["Geography"].replace(/\s+/g, '-').toLowerCase()] = +d["2012 Dementia Death No."];
                                      return d["Geography"] + " dementia-no hover";})
          .attr("id", function(d){ return d["Geography"].replace(/\s+/g, '-').toLowerCase()});

        var cur = "";

        d3.json("/static/json/SRA2010tiger.geojson", function(error,data){
          var disease_grades = [10, 30, 50, 70];

          var t;
          for(var i = 0; i < $("path.area").length; i++)
          {
            for(key in no_arr)
            {
              if($("path.area")[i].id == key)
              {
                cur = $("path.area")[i].id ;

                if (no_arr[key] == 0) console.log(key);

                if     (no_arr[key] < disease_grades[0]) t = textures.lines().size(6).strokeWidth(1).stroke("rgba(10,10,10,.3)").background("rgb("+area_color[key][0]+","+area_color[key][1]+","+area_color[key][2]+")");
                else if(no_arr[key] < disease_grades[1]) t = textures.lines().size(5).strokeWidth(1).stroke("rgba(10,10,10,.3)").background("rgb("+area_color[key][0]+","+area_color[key][1]+","+area_color[key][2]+")");
                else if(no_arr[key] < disease_grades[2]) t = textures.lines().size(6).strokeWidth(2).stroke("rgba(10,10,10,.2)").background("rgb("+area_color[key][0]+","+area_color[key][1]+","+area_color[key][2]+")");
                else if(no_arr[key] < disease_grades[3]) t = textures.lines().size(5).strokeWidth(2).stroke("rgba(10,10,10,.2)").background("rgb("+area_color[key][0]+","+area_color[key][1]+","+area_color[key][2]+")");
                else if(no_arr[key] < 1) console.log("hAhAhah");//t = textures.lines().size(0).strokeWidth(0).background("rgb("+area_color[key][0]+","+area_color[key][1]+","+area_color[key][2]+")");

                group.call(t);

                if(cur != "mountain-empire" && cur != "pendleton" && cur != "coronado" && cur != "miramar" && cur != "jamul" && cur != "pauma" && cur != "palomar-julian" && cur != "laguna-pine-valley" && cur != "anza-borrego-springs" )
                  $("#"+cur).attr("fill", t.url());
              }
            }
          }
        });
      });
    }
  }

  $(".population-info").click(function(){
    switch(this.value){
      case "population-overall":
        $("#population-hold").empty()
        d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
          var pop_arr = {};

          d3.select("#population-hold").selectAll("text")
            .data(data)
            .enter()
            .append("p")
            .text(function(d){ return d["Area "] + " " + (+d["Total 2012 Population"]); })
            .attr("class", function(d){ pop_arr[d["Area "].replace(/\s+/g, '-').toLowerCase()] = +d["Total 2012 Population"];
                                        return d["Area "].replace(/\s+/g, '-').toLowerCase() + " population hover";})
            .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

        var grades = [5000, 10000, 50000, 100000, 200000, 5000000, 0];

        $(".hover").mouseenter(function(){
            var id = this.id;
            $("#"+id).attr("stroke", "black").attr("stroke-width", "2");
            $(".hover").mouseleave(function(){
              $("#"+id).attr("stroke", "").attr("stroke-width", "");
            });
          });

          $(".legend-color").empty().show();

          for(var i = 0; i < palette.length-1; i++)
          {
            $(".legend-color").append("<span class='value'>"+grades[i]+"</span><div class='key' style='background-color:"+palette[i]+";'></div>");
          }

          $(".ref-population span").empty().text("Overall");
        });
        break;

      case "population-black":
        $("#population-hold").empty()
        d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
          var pop_arr = {};

          d3.select("#population-hold").selectAll("text")
            .data(data)
            .enter()
            .append("p")
            .text(function(d){ return d["Area "] + " " + (+d["Black"]); })
            .attr("class", function(d){ pop_arr[d["Area "].replace(/\s+/g, '-').toLowerCase()] = +d["Black"];
                                        return d["Area "].replace(/\s+/g, '-').toLowerCase() + " population hover";})
            .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

          var grades = [100, 1000, 5000, 10000, 60000, 200000, 0];

          $(".hover").mouseenter(function(){
            var id = this.id;
            $("#"+id).attr("stroke", "black").attr("stroke-width", "2");
            $(".hover").mouseleave(function(){
              $("#"+id).attr("stroke", "").attr("stroke-width", "");
            });
          });
        });
        break;
      
      case "population-l-c":
        $("#population-hold").empty()
        d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
          var pop_arr = {};

          d3.select("#population-hold").selectAll("text")
            .data(data)
            .enter()
            .append("p")
            .text(function(d){ return d["Area "] + " " + (+d["Hispanic"]); })
            .attr("class", function(d){ pop_arr[d["Area "].replace(/\s+/g, '-').toLowerCase()] = +d["Hispanic"];
                                        return d["Area "].replace(/\s+/g, '-').toLowerCase() + " population hover";})
            .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

          var grades = [2000, 5000, 10000, 50000, 100000, 300000, 0];

          $(".hover").mouseenter(function(){
            var id = this.id;
            $("#"+id).attr("stroke", "black").attr("stroke-width", "2");
            $(".hover").mouseleave(function(){
              $("#"+id).attr("stroke", "").attr("stroke-width", "");
            });
          });
        });
        break;
      
      case "population-api":
        $("#population-hold").empty()
        d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
          var pop_arr = {};

          d3.select("#population-hold").selectAll("text")
            .data(data)
            .enter()
            .append("p")
            .text(function(d){ return d["Area "] + " " + (+d["Asian/Pacific Islander"]); })
            .attr("class", function(d){ pop_arr[d["Area "].replace(/\s+/g, '-').toLowerCase()] = +d["Asian/Pacific Islander"];
                                        return d["Area "].replace(/\s+/g, '-').toLowerCase() + " population hover";})
            .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

          var grades = [100, 1000, 10000, 50000, 100000, 500000, 0];

          $(".hover").mouseenter(function(){
            var id = this.id;
            $("#"+id).attr("stroke", "black").attr("stroke-width", "2");
            $(".hover").mouseleave(function(){
              $("#"+id).attr("stroke", "").attr("stroke-width", "");
            });
          });
        });
        break;
      
      case "population-other":
        $("#population-hold").empty()
        d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
          var pop_arr = {};

          d3.select("#population-hold").selectAll("text")
            .data(data)
            .enter()
            .append("p")
            .text(function(d){ return d["Area "] + " " + (+d["Other Race/ Ethnicity"]); })
            .attr("class", function(d){ pop_arr[d["Area "].replace(/\s+/g, '-').toLowerCase()] = +d["Other Race/ Ethnicity"];
                                        return d["Area "].replace(/\s+/g, '-').toLowerCase() + " population hover";})
            .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

          var grades = [500, 1000, 5000, 10000, 20000, 200000, 0];

          $(".hover").mouseenter(function(){
            var id = this.id;
            $("#"+id).attr("stroke", "black").attr("stroke-width", "2");
            $(".hover").mouseleave(function(){
              $("#"+id).attr("stroke", "").attr("stroke-width", "");
            });
          });
        });
        break;
      
      case "population-white":
        $("#population-hold").empty()
        d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
          var pop_arr = {};

          d3.select("#population-hold").selectAll("text")
            .data(data)
            .enter()
            .append("p")
            .text(function(d){ return d["Area "] + " " + (+d["White"]); })
            .attr("class", function(d){ pop_arr[d["Area "].replace(/\s+/g, '-').toLowerCase()] = +d["White"];
                                        return d["Area "].replace(/\s+/g, '-').toLowerCase() + " population hover";})
            .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

          var grades = [5000, 10000, 50000, 100000, 500000, 2000000, 0];

          $(".hover").mouseenter(function(){
            var id = this.id;
            $("#"+id).attr("stroke", "black").attr("stroke-width", "2");
            $(".hover").mouseleave(function(){
              $("#"+id).attr("stroke", "").attr("stroke-width", "");
            });
          });
        });
        break;
    }
  });

}); // end SRA region

function population(){
  d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
    var pop_arr = {};
    
    d3.select("#population-hold").selectAll("text")
      .data(data)
      .enter()
      .append("p")
      .text(function(d){ return d["Area "] + " " + (+d["Total 2012 Population"]); })
      .attr("class", function(d){ pop_arr[d["Area "].replace(/\s+/g, '-').toLowerCase()] = +d["Total 2012 Population"];
                                  return d["Area "] + " population hover";})
      .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

    var cur = "";

    var pop_grades = [7700,18000,80000,220000,780000,3200000];
    var population_palette = [[132,209,132],[93,161,93],[74,132,74],[54,103,54],[35,74,35],[16,45,16]];
    cur_palette = population_palette;

    for(var i = 0; i < $("path").length; i++){
      for(key in pop_arr){
        if($("path")[i].id == key){
          cur = $("path")[i].id;
          // console.log(pop_arr[key]);
          if( pop_arr[key] < pop_grades[0]  ) $("#"+cur).attr("fill", 'rgb('+(population_palette[0][0])+','+(population_palette[0][1])+','+(population_palette[0][2])+')').attr("stroke", "");
          else if( pop_arr[key] < pop_grades[1]  ) $("#"+cur).attr("fill", 'rgb('+(population_palette[1][0])+','+(population_palette[1][1])+','+(population_palette[1][2])+')').attr("stroke", "");
          else if( pop_arr[key] < pop_grades[2]  ) $("#"+cur).attr("fill", 'rgb('+(population_palette[2][0])+','+(population_palette[2][1])+','+(population_palette[2][2])+')').attr("stroke", "");
          else if( pop_arr[key] < pop_grades[3]  ) $("#"+cur).attr("fill", 'rgb('+(population_palette[3][0])+','+(population_palette[3][1])+','+(population_palette[3][2])+')').attr("stroke", "");
          else if( pop_arr[key] < pop_grades[4]  ) $("#"+cur).attr("fill", 'rgb('+(population_palette[4][0])+','+(population_palette[4][1])+','+(population_palette[4][2])+')').attr("stroke", "");
          else if( pop_arr[key] < pop_grades[5]  ) $("#"+cur).attr("fill", 'rgb('+(population_palette[5][0])+','+(population_palette[5][1])+','+(population_palette[5][2])+')').attr("stroke", "");
          else if( pop_arr[key] == 0  ) $("#"+cur).attr("fill", "rgba(230,230,250,.7)").attr("stroke", "");
          else if( pop_arr[key] == null  ) $("#"+cur).attr("fill", "rgba(230,230,250,.7)").attr("stroke", "");
          else $("#"+cur).attr("fill", "rgba(230,230,250,.7)").attr("stroke", "");
        }
      }     
    }

    $(".hover").mouseenter(function(){
      var id = this.id;
      $("#"+id).attr("stroke", "black").attr("stroke-width", "2");
      $(".hover").mouseleave(function(){
        $("#"+id).attr("stroke", "").attr("stroke-width", "");
      });
    });

    $(".legend-color").empty().show();

    for(var i = 0; i < palette.length-1; i++)
    {
      $(".legend-color").append("<span class='value'>"+pop_grades[i]+"</span><div class='key' style='background-color:"+population_palette[i]+";'></div>");
    }

    $(".ref-population span").empty().text("Overall");
  });
}

$(document).ready(function(){

var palette = ['rgb(110,170,190)','rgb(90,150,170)','rgb(70,130,150)','rgb(50,110,130)','rgb(30,90,110)','rgb(10,70,90)','rgb(230,230,250)'];
var outline = 'RGB(200,70, 70)';
var titleToggle = true;
var incomeToggle = true;

// population();

// income was here

$("#title-toggle").click(function(){
  titleToggle = !titleToggle;
  if(!titleToggle)
    $(".text").hide();
  else
    $(".text").show();
});

$("#income-toggle").click(function(){
  incomeToggle = !incomeToggle;
  if(!incomeToggle)
    $(".income").hide();
  else
    $(".income").show();
});

$(".population-info").show();
$(".disease-info").hide();
$(".environmental-info").hide();

$(".type-select").change(function(){
  switch(this.value){
    case "tab-disease":
      $(".disease-info").show();
      $(".population-info").hide();
      $(".environmental-info").hide();
      break;
    case "tab-population":
      $(".disease-info").hide();
      $(".population-info").show();
      $(".environmental-info").hide();
      break;
    case "tab-environmental":
      $(".disease-info").hide();
      $(".population-info").hide();
      $(".environmental-info").show();
      break;
  }
});

// pop colors was here

// pop info was here

///////////////////////////////////////////////// ENVIRONMENT /////////////////////////////////////////////////

$(".environmental-select").change(function(){
  switch(this.value){
    case "CO2":
      $("#environmental-hold").empty();
      d3.csv("/static/csv/2010_CO2_emissions.csv", function(error,data){

        var co2_arr = {};
        
        d3.select("#environmental-hold").selectAll("text")
          .data(data)
          .enter()
          .append("p")
          .text(function(d){ co2_arr[d["City"].replace(/\s+/g, '-').toLowerCase()] = 0;
                              // console.log(d["City"]);
                             return d["Facility"] +" in "+ d["City"] + ": " + (+d["Total Reported Emissions"]); })
          .attr("class", function(d){ co2_arr[d["City"].replace(/\s+/g, '-').toLowerCase()] += (+d["Total Reported Emissions"]);
                                      return d["City"] + " population hover";})
          .attr("id", function(d){ return d["City"].replace(/\s+/g, '-').toLowerCase()});

        if($(".co2-circle").length > 0)
          $(".co2-circle").show();
        else
        {
          var cur = "";
          var grades = [10000, 50000, 150000, 200000, 300000, 2000000, 0];
  
          for(var i = 0; i < $("path").length; i++){
            for(key in co2_arr){
              if($("path")[i].id == key){
                cur = $("path")[i].id;
                if( co2_arr[key] < 10000  ) d3.select("#g-"+cur).append("circle").attr("r", "5").attr("cx", centroids[key][0]).attr("cy", centroids[key][1]).attr("fill", "rgba(255,0,0,.4)").attr("class", "co2-circle");
                else if( co2_arr[key] < 50000  ) d3.select("#g-"+cur).append("circle").attr("r", "10").attr("cx", centroids[key][0]).attr("cy", centroids[key][1]).attr("fill", "rgba(255,0,0,.4)").attr("class", "co2-circle");
                else if( co2_arr[key] < 150000  ) d3.select("#g-"+cur).append("circle").attr("r", "15").attr("cx", centroids[key][0]).attr("cy", centroids[key][1]).attr("fill", "rgba(255,0,0,.4)").attr("class", "co2-circle");
                else if( co2_arr[key] < 200000  ) d3.select("#g-"+cur).append("circle").attr("r", "20").attr("cx", centroids[key][0]).attr("cy", centroids[key][1]).attr("fill", "rgba(255,0,0,.4)").attr("class", "co2-circle");
                else if( co2_arr[key] < 300000  ) d3.select("#g-"+cur).append("circle").attr("r", "25").attr("cx", centroids[key][0]).attr("cy", centroids[key][1]).attr("fill", "rgba(255,0,0,.4)").attr("class", "co2-circle");
                else if( co2_arr[key] < 2000000  ) d3.select("#g-"+cur).append("circle").attr("r", "30").attr("cx", centroids[key][0]).attr("cy", centroids[key][1]).attr("fill", "rgba(255,0,0,.4)").attr("class", "co2-circle");
                else if( co2_arr[key] == 0  ) d3.select("#g-"+cur).append("circle").attr("r", "2").attr("cx", centroids[key][0]).attr("cy", centroids[key][1]).attr("fill", "rgba(255,0,0,.4)").attr("class", "co2-circle");
                else if( co2_arr[key] == null  ) d3.select("#g-"+cur).append("circle").attr("r", 2).attr("cx", centroids[key][0]).attr("cy", centroids[key][1]).attr("fill", "rgba(255,0,0,.4)").attr("class", "co2-circle");
                else d3.select("#g-"+cur).append("circle").attr("r", "2").attr("cx", centroids[key][0]).attr("cy", centroids[key][1]).attr("fill", "rgba(255,0,0,.4)").attr("class", "co2-circle");
              }
            }     
          }
        }

        // $(".legend-color").empty();

        // for(var i = 0; i < palette.length-1; i++)
        // {
        //   $(".legend-color").append("<span class='value'>"+grades[i]+"</span><div class='key' style='background-color:"+palette[i]+";'></div>");
        // }

// 1223051
//  279079
//  245580
//  239509
//  230278
//  200000
//  169221
//  153828
//  150000
//  127598
//  106060
//   50000
//   34609
//   27220
//   26940
//   13304
//    9578
//    7003

        $(".hover").mouseenter(function(){
          // console.log(this.id);
          var id = this.id;
          $("#"+id).attr("stroke", "white");
          $(".hover").mouseleave(function(){
            $("#"+id).attr("stroke", "");
          });
        });
      
        $(".ref-environment span").empty().text("CO2");
      });
      break;

    case "none-environment": 
      // d3.csv("/static/csv/2010_CO2_emissions.csv", function(error,data){
      //   d3.select("svg").selectAll("path.environment")
      //     .data(data)
      //     .attr("stroke", "").attr("stroke-width", "")
      // });
      $("co2-circle").hide();
      break;      

    default: break;
  }
});



});