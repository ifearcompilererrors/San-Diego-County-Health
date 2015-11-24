var palette = ['rgba(110,170,190,.7)','rgba(90,150,170,.7)','rgba(70,130,150,.7)','rgba(50,110,130,.7)','rgba(30,90,110,.7)','rgba(10,70,90,.7)','rgba(230,230,250,.2)'];

var centroids = {};

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
  
  var path = d3.geo.path().projection(projection);
  var color = d3.scale.category20();

  var areas = group.append("path")
    .attr("d", path)
    .attr("class", "area")
    .attr("fill",function(d,i){ return 'rgba(255,255,255,.2)'; })
    .attr("id", function(d){ return d.properties.NAME.replace(/\s+/g, '-').toLowerCase(); })
    .text(function(d){ return d.properties.NAME; });

  var areas = group.append("path")
    .attr("d", path)
    .attr("class", "environment")
    .attr("fill",function(d,i){ return 'rgba(255,255,255,.2)'; })
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
    // .text("$");
});

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

    var grades = [5000, 10000, 50000, 100000, 200000, 5000000, 0];


    for(var i = 0; i < $("path").length; i++){
      for(key in pop_arr){
        if($("path")[i].id == key){
          cur = $("path")[i].id;
          // console.log(pop_arr[key]);
          if( pop_arr[key] < 5000  ) $("#"+cur).attr("fill", "rgba(110,170,190,.7)").attr("stroke", "");
          else if( pop_arr[key] < 10000  ) $("#"+cur).attr("fill", "rgba(90,150,170,.7)").attr("stroke", "");
          else if( pop_arr[key] < 50000  ) $("#"+cur).attr("fill", "rgba(70,130,150,.7)").attr("stroke", "");
          else if( pop_arr[key] < 100000  ) $("#"+cur).attr("fill", "rgba(50,110,130,.7)").attr("stroke", "");
          else if( pop_arr[key] < 200000  ) $("#"+cur).attr("fill", "rgba(30,90,110,.7)").attr("stroke", "");
          else if( pop_arr[key] < 5000000  ) $("#"+cur).attr("fill", "rgba(10,70,90,.7)").attr("stroke", "");
          else if( pop_arr[key] == 0  ) $("#"+cur).attr("fill", "rgba(230,230,250,.2)").attr("stroke", "");
          else if( pop_arr[key] == null  ) $("#"+cur).attr("fill", "rgba(230,230,250,.2)").attr("stroke", "");
          else $("#"+cur).attr("fill", "red").attr("stroke", "");
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
      $(".legend-color").append("<span class='value'>"+grades[i]+"</span><div class='key' style='background-color:"+palette[i]+";'></div>");
    }

    $(".ref-population span").empty().text("Overall");
  });
}

$(document).ready(function(){

var palette = ['rgba(110,170,190,.7)','rgba(90,150,170,.7)','rgba(70,130,150,.7)','rgba(50,110,130,.7)','rgba(30,90,110,.7)','rgba(10,70,90,.7)','rgba(230,230,250,.2)'];
var outline = 'RGB(200,70, 70)';
var titleToggle = true;
var incomeToggle = true;

population();

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

  for(var i = 0; i < $("path").length; i++)
  {
    cur = $("path")[i].id;
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

// Median household income
// [41936
// 45498
// 45873
// 47821
// 49948
// 52607
// 52692
// 54417
// 55429
// 56626
// 57946
// 59014
// 60434
// 60838
// 61044
// 61751
// 65489
// 68676
// 69316
// 70503
// 71155
// 71475
// 72011
// 73746
// 74965
// 78300
// 83094
// 83290
// 83438
// 85004
// 85455
// 88991
// 89108
// 91041
// 94927
// 99889
// 103305
// 104474
// 115528
// 117506
// 121168]

});

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

$(".disease-info").show();
$(".environmental-info").hide();
$(".population-info").hide();

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

$(".disease-select").change(function(){
  switch(this.value){
    case "dementia_no":
      $("#disease-hold").empty()
      d3.csv("/static/csv/2010-2012_Dementia.csv", function(error,data){
        var no_arr = {};
        
        d3.select("#disease-hold").selectAll("text")
          .data(data)
          .enter()
          .append("p")
          .text(function(d){ return d["Geography"] + " " + (+d["2012 Dementia Death No."]); })
          .attr("class", function(d){ no_arr[d["Geography"].replace(/\s+/g, '-').toLowerCase()] = +d["2012 Dementia Death No."];
                                      return d["Geography"] + " dementia-rate hover";})
          .attr("id", function(d){ return d["Geography"].replace(/\s+/g, '-').toLowerCase()});

        var cur = "";

        $(".dementia-rate").hide();

        if($(".dementia-no").length > 0)
          $(".dementia-no").show();
        else{
          for(var i = 0; i < $("path").length; i++)
          {
            for(key in no_arr)
            {
              if($("path")[i].id == key)
              {
                cur = $("path")[i].id;
                for(var j = 0; j < (no_arr[key])/5; j++)
                {
                  for(cent in centroids)
                  {
                    if(cent == key)
                      d3.select("#g-"+cur)
                        .append("circle")
                        .attr("cx", ((Math.random()*15)+centroids[cent][0]))
                        .attr("cy", ((Math.random()*15)+centroids[cent][1]))
                        .attr("r", "1")
                        .attr("fill", "black")
                        .attr("class", "dementia dementia-no");
                  }
                }
              }
            }
          }
        }

        $(".hover").mouseenter(function(){
          var id = this.id;
          // var fill = $("#"+this.id).attr("fill");
          // $("#"+id).attr("fill", "orange");
          $("#"+id).attr("stroke", "black").attr("stroke-width", "2");
          $(".hover").mouseleave(function(){
            // $("#"+id).attr("fill", fill);
            $("#"+id).attr("stroke", "").attr("stroke-width", "");
          });
        });

        $(".ref-disease span").empty().text("Dementia No.");
      });
      break;

    case "dementia_rate":
      $("#disease-hold").empty()
      d3.csv("/static/csv/2010-2012_Dementia.csv", function(error,data){

        var rate_arr = {};
        
        d3.select("#disease-hold").selectAll("text")
          .data(data)
          .enter()
          .append("p")
          .text(function(d){ return d["Geography"] + " " + (+d["2012 Dementia Death Rate*"]); })
          .attr("class", function(d){ rate_arr[d["Geography"].replace(/\s+/g, '-').toLowerCase()] = +d["2012 Dementia Death Rate*"];
                                      return d["Geography"] + " dementia-rate hover";})
          .attr("id", function(d){ return d["Geography"].replace(/\s+/g, '-').toLowerCase()});

        var cur = "";

        $(".dementia-no").hide();

        if($(".dementia-rateasdf").length > 0)
          $(".dementia-rateasdf").show();
        else
        {
          for(var i = 0; i < $("path").length; i++)
          {
            for(key in rate_arr)
            {
              if($("path")[i].id == key)
              {
                cur = $("path")[i].id;
                for(var j = 0; j < (rate_arr[key])/5; j++)
                {
                  for(cent in centroids)
                  {
                    if(cent == key)
                      d3.select("#g-"+cur)
                        .append("circle")
                        .attr("cx", ((Math.random()*15)+centroids[cent][0]))
                        .attr("cy", ((Math.random()*15)+centroids[cent][1]))
                        .attr("r", "1")
                        .attr("fill", "black")
                        .attr("class", "dementia dementia-rateasdf");
                  }
                }
              }
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

$(".population-select").change(function(){
  switch(this.value){
    case "population":
      $("#population-hold").empty()
      population();
      break;

    case "population-black":
      d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
        var pop_arr = {};
        
        d3.select("#population-hold").selectAll("text")
          .data(data)
          .enter()
          .append("p")
          .text(function(d){ return d["Area "] + " " + (+d["Black"]); })
          .attr("class", function(d){ pop_arr[d["Area "].replace(/\s+/g, '-').toLowerCase()] = +d["Black"];
                                      return d["Area "] + " population hover";})
          .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

        var cur = "";
        var grades = [100, 1000, 5000, 10000, 60000, 200000, 0];
// 139383
// 53047
// 23925
// 18380
// 18175
// 25470
// 18575
// 14054
// 10742
// 10062
// 7354
// 6701
// 6484
// 6459
// 5899
// 4965
// 4156
// 4034
// 3946
// 3695
// 3498
// 3233
// 2910
// 2538
// 2488
// 2409
// 2163
// 1668
// 1566
// 1441
// 1225
// 1207
// 963
// 835
// 828
// 784
// 581
// 546
// 475
// 283
// 206
// 186
// 174
// 136
// 111
// 83
// 70
// 36

        for(var i = 0; i < $("path").length; i++){
          for(key in pop_arr){
            if($("path")[i].id == key){
              cur = $("path")[i].id;
              // console.log(pop_arr[key]);
              if( pop_arr[key] < grades[0]  ) $("#"+cur).attr("fill", "rgba(110,170,190,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[1]  ) $("#"+cur).attr("fill", "rgba(90,150,170,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[2]  ) $("#"+cur).attr("fill", "rgba(70,130,150,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[3]  ) $("#"+cur).attr("fill", "rgba(50,110,130,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[4]  ) $("#"+cur).attr("fill", "rgba(30,90,110,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[5]  ) $("#"+cur).attr("fill", "rgba(10,70,90,.7)").attr("stroke", "");
              else if( pop_arr[key] == grades[6]  ) $("#"+cur).attr("fill", "rgba(230,230,250,.2)").attr("stroke", "");
              else if( pop_arr[key] == null  ) $("#"+cur).attr("fill", "rgba(230,230,250,.2)").attr("stroke", "");
              else $("#"+cur).attr("fill", "red").attr("stroke", "");
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
          $(".legend-color").append("<span class='value'>"+grades[i]+"</span><div class='key' style='background-color:"+palette[i]+";'></div>");
        }

        $(".ref-population span").empty().text("Black");
      });
      break;

    case "population-hispanic":
      d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
        var pop_arr = {};
        
        d3.select("#population-hold").selectAll("text")
          .data(data)
          .enter()
          .append("p")
          .text(function(d){ return d["Area "] + " " + (+d["Hispanic"]); })
          .attr("class", function(d){ pop_arr[d["Area "].replace(/\s+/g, '-').toLowerCase()] = +d["Hispanic"];
                                      return d["Area "] + " population hover";})
          .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

        var cur = "";
        var grades = [2000, 5000, 10000, 50000, 100000, 300000, 0];
        // 1035226
        // 10941
        // 10989
        // 11518
        // 122712

        // 150322
        // 173681
        // 212359
        // 285990
        // 48887
        // 60001
        // 62054
        // 66351
        // 71270
        // 77496
        // 81088
        // 83820
        // 90162
        // 94425
        // 38066
        // 34897
        // 34846
        // 34379
        // 27450
        // 18351
        // 17794
        // 16518
        // 13537
        // 13137
        // 13417
        // 12755
        // 8785
        // 8649
        // 8646
        // 8482
        // 8170
        // 7088
        // 6216
        // 5782
        // 3328
        // 3226
        // 3020
        // 2477
        // 2366
        // 1927
        // 1048
        // 1042
        // 987

        for(var i = 0; i < $("path").length; i++){
          for(key in pop_arr){
            if($("path")[i].id == key){
              cur = $("path")[i].id;
              // console.log(pop_arr[key]);
              if( pop_arr[key] < grades[0]  ) $("#"+cur).attr("fill", "rgba(110,170,190,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[1]  ) $("#"+cur).attr("fill", "rgba(90,150,170,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[2]  ) $("#"+cur).attr("fill", "rgba(70,130,150,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[3]  ) $("#"+cur).attr("fill", "rgba(50,110,130,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[4]  ) $("#"+cur).attr("fill", "rgba(30,90,110,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[5]  ) $("#"+cur).attr("fill", "rgba(10,70,90,.7)").attr("stroke", "");
              else if( pop_arr[key] == grades[6]  ) $("#"+cur).attr("fill", "rgba(230,230,250,.2)").attr("stroke", "");
              else if( pop_arr[key] == null  ) $("#"+cur).attr("fill", "rgba(230,230,250,.2)").attr("stroke", "");
              else $("#"+cur).attr("fill", "red").attr("stroke", "");
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
          $(".legend-color").append("<span class='value'>"+grades[i]+"</span><div class='key' style='background-color:"+palette[i]+";'></div>");
        }
      
        $(".ref-population span").empty().text("Hispanic");
      });
      break;

    case "population-asian":
      d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
        var pop_arr = {};
        
        d3.select("#population-hold").selectAll("text")
          .data(data)
          .enter()
          .append("p")
          .text(function(d){ return d["Area "] + " " + (+d["Asian/Pacific Islander"]); })
          .attr("class", function(d){ pop_arr[d["Area "].replace(/\s+/g, '-').toLowerCase()] = +d["Asian/Pacific Islander"];
                                      return d["Area "] + " population hover";})
          .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

        var cur = "";
        var grades = [100, 1000, 10000, 50000, 100000, 500000, 0];

        for(var i = 0; i < $("path").length; i++){
          for(key in pop_arr){
            if($("path")[i].id == key){
              cur = $("path")[i].id;
              console.log(pop_arr[key]);
              if( pop_arr[key] < grades[0]  ) $("#"+cur).attr("fill", "rgba(110,170,190,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[1]  ) $("#"+cur).attr("fill", "rgba(90,150,170,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[2]  ) $("#"+cur).attr("fill", "rgba(70,130,150,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[3]  ) $("#"+cur).attr("fill", "rgba(50,110,130,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[4]  ) $("#"+cur).attr("fill", "rgba(30,90,110,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[5]  ) $("#"+cur).attr("fill", "rgba(10,70,90,.7)").attr("stroke", "");
              else if( pop_arr[key] == grades[6]  ) $("#"+cur).attr("fill", "rgba(230,230,250,.2)").attr("stroke", "");
              else if( pop_arr[key] == null  ) $("#"+cur).attr("fill", "rgba(230,230,250,.2)").attr("stroke", "");
              else $("#"+cur).attr("fill", "red").attr("stroke", "");
            }
          }     
        }

// Asian/Pacific Islander
// 38
// 104
// 109
// 115
// 249
// 271
// 309
// 370
// 606
// 881
// 906
// 1163
// 1246
// 1252
// 1637
// 2184
// 2304
// 2363
// 3504
// 3670
// 4305
// 4506
// 4630
// 5488
// 6087
// 7597
// 8181
// 8630
// 8776
// 10570
// 12576
// 13036
// 20491
// 22408
// 24201
// 31654
// 30077
// 32380
// 56910
// 60676
// 65357
// 21639
// 27500
// 13748
// 10557
// 62503
// 114106
// 355935


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
        }});
        $(".ref-population span").empty().text("Asian");
      break;

    case "population-other":
      d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
        var pop_arr = {};
        
        d3.select("#population-hold").selectAll("text")
          .data(data)
          .enter()
          .append("p")
          .text(function(d){ return d["Area "] + " " + (+d["Other Race/ Ethnicity"]); })
          .attr("class", function(d){ pop_arr[d["Area "].replace(/\s+/g, '-').toLowerCase()] = +d["Other Race/ Ethnicity"];
                                      return d["Area "] + " population hover";})
          .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

        var cur = "";
        var grades = [500, 1000, 5000, 10000, 20000, 200000, 0];
// other
// [98
// 273
// 466
// 523
// 534
// 537
// 622
// 718
// 881
// 1033
// 1165
// 1282
// 1307
// 1372
// 1619
// 2160
// 2169
// 2581
// 2583
// 2598
// 2734
// 2743
// 2884
// 2929
// 3004
// 3133
// 3446
// 3491
// 3862
// 4177
// 4381
// 4573
// 5104
// 5287
// 5369
// 5433
// 5857
// 6513
// 6751
// 7061
// 7312
// 13629
// 16394
// 19225
// 21985
// 22048
// 27284
// 120565]


        for(var i = 0; i < $("path").length; i++){
          for(key in pop_arr){
            if($("path")[i].id == key){
              cur = $("path")[i].id;
              // console.log(pop_arr[key]);
              if( pop_arr[key] < grades[0]  ) $("#"+cur).attr("fill", "rgba(110,170,190,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[1]  ) $("#"+cur).attr("fill", "rgba(90,150,170,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[2]  ) $("#"+cur).attr("fill", "rgba(70,130,150,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[3]  ) $("#"+cur).attr("fill", "rgba(50,110,130,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[4]  ) $("#"+cur).attr("fill", "rgba(30,90,110,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[5]  ) $("#"+cur).attr("fill", "rgba(10,70,90,.7)").attr("stroke", "");
              else if( pop_arr[key] == grades[6]  ) $("#"+cur).attr("fill", "rgba(230,230,250,.2)").attr("stroke", "");
              else if( pop_arr[key] == null  ) $("#"+cur).attr("fill", "rgba(230,230,250,.2)").attr("stroke", "");
              else $("#"+cur).attr("fill", "red").attr("stroke", "");
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
          $(".legend-color").append("<span class='value'>"+grades[i]+"</span><div class='key' style='background-color:"+palette[i]+";'></div>");
        }});
        $(".ref-population span").empty().text("Other");
      break;

    case "population-white":
      d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
        var pop_arr = {};
        
        d3.select("#population-hold").selectAll("text")
          .data(data)
          .enter()
          .append("p")
          .text(function(d){ return d["Area "] + " " + (+d["White"]); })
          .attr("class", function(d){ pop_arr[d["Area "].replace(/\s+/g, '-').toLowerCase()] = +d["White"];
                                      return d["Area "] + " population hover";})
          .attr("id", function(d){ return d["Area "].replace(/\s+/g, '-').toLowerCase()});

        var cur = "";
        var grades = [5000, 10000, 50000, 100000, 500000, 2000000, 0];
        // [2853
        //  2986
        //  3033
        //  4010
        //  4394
        //  4589
        //  6400
        //  9231
        //  9693
        //  11562
        //  11668
        //  14536
        //  14651
        //  16865
        //  19675
        //  20420
        //  23295
        //  24928
        //  26942
        //  31514
        //  34483
        //  37118
        //  38061
        //  38123
        //  41013
        //  43217
        //  44892
        //  45619
        //  47479
        //  57809
        //  60021
        //  60540
        //  64134
        //  69771
        //  73306
        //  73383
        //  73992
        //  75851
        //  81444
        //  83559
        //  85260
        //  94874
        //  141599
        //  278179
        //  299147
        //  313555
        //  364966
        //  1492320]

        for(var i = 0; i < $("path").length; i++){
          for(key in pop_arr){
            if($("path")[i].id == key){
              cur = $("path")[i].id;
              // console.log(pop_arr[key]);
              if( pop_arr[key] < grades[0]  ) $("#"+cur).attr("fill", "rgba(110,170,190,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[1]  ) $("#"+cur).attr("fill", "rgba(90,150,170,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[2]  ) $("#"+cur).attr("fill", "rgba(70,130,150,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[3]  ) $("#"+cur).attr("fill", "rgba(50,110,130,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[4]  ) $("#"+cur).attr("fill", "rgba(30,90,110,.7)").attr("stroke", "");
              else if( pop_arr[key] < grades[5]  ) $("#"+cur).attr("fill", "rgba(10,70,90,.7)").attr("stroke", "");
              else if( pop_arr[key] == grades[6]  ) $("#"+cur).attr("fill", "rgba(230,230,250,.2)").attr("stroke", "");
              else if( pop_arr[key] == null  ) $("#"+cur).attr("fill", "rgba(230,230,250,.2)").attr("stroke", "");
              else $("#"+cur).attr("fill", "red").attr("stroke", "");
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
          $(".legend-color").append("<span class='value'>"+grades[i]+"</span><div class='key' style='background-color:"+palette[i]+";'></div>");
        }
      
        $(".ref-population span").empty().text("White");
      });
      break;

    case "none-population":
      d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(error,data){
        d3.select("svg").selectAll("path.area")
          .data(data)
          .attr("fill", "white")
          .attr("stroke", "black");
      });
      $(".legend-color").empty().hide();
      $(".ref-population span").empty().text("None");
      break;
  }
});

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
                if( co2_arr[key] < 10000  ) d3.select("#g-"+cur).append("circle").attr("r", "5").attr("cx", centroids[key][0]).attr("cy", centroids[key][1]).attr("fill", "rgba(255,0,0,.2)").attr("class", "co2-circle");
                else if( co2_arr[key] < 50000  ) d3.select("#g-"+cur).append("circle").attr("r", "10").attr("cx", centroids[key][0]).attr("cy", centroids[key][1]).attr("fill", "rgba(255,0,0,.2)").attr("class", "co2-circle");
                else if( co2_arr[key] < 150000  ) d3.select("#g-"+cur).append("circle").attr("r", "15").attr("cx", centroids[key][0]).attr("cy", centroids[key][1]).attr("fill", "rgba(255,0,0,.2)").attr("class", "co2-circle");
                else if( co2_arr[key] < 200000  ) d3.select("#g-"+cur).append("circle").attr("r", "20").attr("cx", centroids[key][0]).attr("cy", centroids[key][1]).attr("fill", "rgba(255,0,0,.2)").attr("class", "co2-circle");
                else if( co2_arr[key] < 300000  ) d3.select("#g-"+cur).append("circle").attr("r", "25").attr("cx", centroids[key][0]).attr("cy", centroids[key][1]).attr("fill", "rgba(255,0,0,.2)").attr("class", "co2-circle");
                else if( co2_arr[key] < 2000000  ) d3.select("#g-"+cur).append("circle").attr("r", "30").attr("cx", centroids[key][0]).attr("cy", centroids[key][1]).attr("fill", "rgba(255,0,0,.2)").attr("class", "co2-circle");
                else if( co2_arr[key] == 0  ) d3.select("#g-"+cur).append("circle").attr("r", "2").attr("cx", centroids[key][0]).attr("cy", centroids[key][1]).attr("fill", "rgba(255,0,0,.2)").attr("class", "co2-circle");
                else if( co2_arr[key] == null  ) d3.select("#g-"+cur).append("circle").attr("r", 2).attr("cx", centroids[key][0]).attr("cy", centroids[key][1]).attr("fill", "rgba(255,0,0,.2)").attr("class", "co2-circle");
                else d3.select("#g-"+cur).append("circle").attr("r", "2").attr("cx", centroids[key][0]).attr("cy", centroids[key][1]).attr("fill", "rgba(255,0,0,.2)").attr("class", "co2-circle");
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