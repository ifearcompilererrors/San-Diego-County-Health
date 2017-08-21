// For development o nNLyyyYYYYYYYYY!!!!!!/!?!11!?1!?11111
var debugMode = true;

var latlong = [33.026142, -116.696322],
    windowWidth   = $(window).width(),
    windowHeight  = $(window).height(),
    scale   = $(window).width() * 25,
    popup = new L.Popup({ autoPan: false }),
    centroids = {},
    geojsonLayer = L.layerGroup(),
    co2Layer = L.layerGroup(),
    closeTooltip,
    svg,
    popBits = 000000; // In all flavors c; total, black, latinx, api, other, white

// Draw map
L.mapbox.accessToken = 'pk.eyJ1IjoiaWZlYXJjb21waWxlcmVycm9ycyIsImEiOiJjaXUwOTFpdm0wMXNhMm9xcDZ1MmNiNmF0In0.ZVVzG5Amju9GXPtGPUwEwg';
var map = L.mapbox.map('map', 'mapbox.streets')
  .setView(latlong, 9);
// Display neighborhood layer
geojsonLayer.addTo(map)

// Append population color legend
appendLegend();

// Toggle switch!
$('.toggle').click(function(d) {
  switch(this.id) {
    // Display neighborhood income text
    case 'income':
      displayIncome();
      break; // end income
    // Display emissions layer
    case 'pollutant-CO2':
      if($('.co2').length == 0) {
        map.addLayer(co2Layer);
      } else {
        map.removeLayer(co2Layer);
      }
      break; // end pollutant-CO2
    default: break;
  }
  switch(this.className) {
    // Set neighborhood color based on population
    case 'toggle population':
      // if( )// 'Total 2012 Population'
      setPopulationColor()
      break; // end population
  }
});

// Create layers
// Neighborhood layer
d3.json("/static/json/SRA2010tiger.geojson", function(error, data){
  var neighborhoodBounds = data.features;

  // Draw neighborhoods
  geojsonLayer.addLayer(
    L.geoJson(neighborhoodBounds, {
    style: setStyle,
    onEachFeature: onEachFeatureGeoJson
  }));//.addTo(map);

  /* Set neighborhood style */
  function setStyle(features) {
    return {
      fillColor: 'floralwhite',
      fillOpacity: 0.8,
      weight: 1,
      opacity: 0.65,
      className: 'neighborhood '+massage(features.properties.NAME)
    }
  }

  function onEachFeatureGeoJson(features, layer) {
    collectCentroids(features, layer);
    getIncome(features, layer);
  }

  /* Display neighborhood median $$$ income $$$ */
  function getIncome(features, layer) {
    var avg,
        neighborhood,
        income,
        cashMoney;

    d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Vs_Subregional_Area_Income.csv", function(incomeError,incomeData){
      avg = getIncomeAvg(incomeData);
      neighborhood = massage(layer.feature.properties.NAME);
      print(avg)

      incomeData.forEach(function(d) {
        cashMoney = parseInt(d['Median household income'].substr(1));
        if(massage(d['Area']) === neighborhood) {
          if(cashMoney <= avg/4) { 
            console.log(neighborhood, '$');
          }
          else if(cashMoney <= avg/2) { 
            console.log(neighborhood, '$$');
          }
          else if(cashMoney <= avg-(avg/4)) { 
            console.log(neighborhood, '$$$');
          }
          else if(cashMoney >= avg) { 
            console.log(neighborhood, '$$$$');
          }
        }
      });
      
    });
  }

  /* Get San Diego median income average */
  function getIncomeAvg(incomeData) {
    var totalIncome = 0;
    incomeData.forEach(function(d){
      totalIncome += parseInt(d['Median household income'].substr(1));
    });

    return totalIncome/incomeData.length;
  }

  /* Get coordinates of the center of each neighborhood */
  function collectCentroids(features, layer) {
    centroids[massage(layer.feature.properties.NAME)] = 
      $.geo.centroid(layer.feature.geometry).coordinates;
  }

  // Emissions data layer: circles at the center of a facility's neighborhood
  // Radius of circles are based on Total Reported Emissions
  d3.csv("/static/csv/2010_CO2_emissions.csv", function(csverror,csvdata){
    var pollutantNhood,
        neighborhood,
        pollutantToggle;

    co2Layer = L.layerGroup();

    // Create emissions layer
    csvdata.forEach(function(d) {
      co2Layer.addLayer(
        L.circle(centroids[massage(d['City'])].reverse(), {
          radius: d['Total Reported Emissions']/100,
          className: 'pollutant co2',
        })
        .on('mouseover', function(e) { // Add mouseover tooltip
          var layer = e.target,
              data = d;
          var titles = ["<div class='marker-title'>", "Facility: ", "City: " , "State: " , "Total Reported Emissions: " , "Sectors: "]
          var features = [data['Facility'], data['City'], data['State'], data['Total Reported Emissions'], data['Sectors']]
          var display = [];
          var content = "";

          for(var i = 0; i < features.length; i++) {
            if(features[i] !== null) {
              content = titles[i] + features[i];
              if(i === 0)
                display.push(content+"</div>");
              else
                display.push(content+"<br>");
            }
          }

          content = "";
          for(var x = 0; x < display.length; x++) {
            content += display[x];
          }

          popup.setLatLng(e.latlng);
          popup.setContent(content);

          if (!popup._map) popup.openOn(map);
          window.clearTimeout(closeTooltip);

          // highlight feature
          layer.setStyle({
            weight: 3,
            opacity: 0.3,
            fillOpacity: 0.9
          });

          if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
          }
        }) // end mouseover
        .on('mouseout', function(e) {
          closeTooltip = window.setTimeout(function() {
            map.closePopup();
          }, 100);
        }) // end mouseout
      ); // end addLayer
    }); // end forEach
  }); // end emissions csv
}); // end neighborhood json

/* Dynamically set neighborhood layer fill color based on population demographics */
function setPopulationColor() {
  // color based on number
  // Get array of checked demographic boxes
  var display = $(".population:checkbox:checked"),
      total,
      id,
      countyTotal,
      countyTotalData,
      normalize,
      fillColor;

  d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(poperror,popdata){
    countyTotalData = popdata[popdata.length-1]
    popdata.forEach(function(d) {
      countyTotal = parseInt(d['Total 2012 Population']);
      total = 0; // Agreggate population total; we'll base the color off this number

      // Get total population of checked boxes from each neighborhood
      neighborhood = massage(d['Area ']);
      for(var i = 0; i < display.length; i++) {
        id = display[i].id.replace(/-/g, ' ')
        total += parseInt(d[id])
        countyTotal += parseInt(countyTotalData[id])

        // If Total 2012 Population is on- that's IT it's OVER.
        if(id === 'Total 2012 Population'){
          break;
        }
      }

      normalize = (total/countyTotal)*20
      $('.'+neighborhood).css('fill', function(d) { 
        if(normalize > 0) return d3.interpolateBlues(normalize)
        else return 'floralwhite'
      });
    });
  });
}

function displayIncome() {
  geojsonLayer
}

/* Get averages for each population demographic */
function getPopAvgs(data) {
  var population = 0,
      demographic = {'Black': '','Hispanic': '','Asian/Pacific Islander': '','Other Race/ Ethnicity': '','White': '', 'Total 2012 Population': ''},
      count;

  for(var [key, value] of Object.entries(demographic)) {
    count = 0;
    data.forEach(function(d) {
      count += 1;
      population += parseInt(d[key]);
    });

    demographic[key] =
      Math.round(population / count);
  }

  return demographic
}

/* Get population overall min and max data */
function getPopMaxMin(data) {
  var population = [], max, min;
  data.forEach(function(d) {
    population.push(parseInt(d['Total 2012 Population']));
  });
  max = population[0];
  min = population[0];
  
  for(var i = 0; i < population.length; i++) {
    if(population[i] > max) {max = population[i];}
    if(population[i] < min) {min = population[i];}
  }

  return [max, min]
}

/* Color scale delimeters and labels */
function colorScale(max, min, canvas) {
  var x = d3.scaleLinear()
    .domain([1, 10])
    .range([min,max])
    .rangeRound([10, 270]);

  var color = d3.scaleThreshold()
      .domain(d3.range(2, 10))
      .range(d3.schemeBlues[9]);

  var g = canvas.append("g")
      .attr("class", "key")
      .attr("transform", "translate(0,20)");

  g.selectAll("rect")
    .data(color.range().map(function(d) {
        d = color.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
      }))
    .enter().append("rect")
      .attr("height", 8)
      .attr("x", function(d) { return x(d[0]); })
      .attr("width", function(d) { return x(d[1]) - x(d[0]); })
      .attr("fill", function(d) { return color(d[0]); })
      .attr("fill-opacity", 0.65 );

  g.append("text")
      .attr("class", "caption")
      .attr("x", x.range()[0])
      .attr("y", -6)
      .attr("fill", "#000")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text("Population");

  g.call(d3.axisBottom(x)
      .tickSize(13)
      .tickFormat(function(x, i) { return x; })
      .tickValues(color.domain()))
    .select(".domain")
      .remove();
}

/* Help folks understand their data with colors of the wind */
function appendLegend() {
  d3.csv("/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(poperror,popdata){
    if(poperror) print(poperror)    

    var neighborhood,
        neighborhoodList,
        populationAvgs,
        maxmin, max, min;

    // Calculate averages for each population demographic
    populationAvgs = getPopAvgs(popdata);

    // Calculate max and min
    maxmin = getPopMaxMin(popdata);

    // Create color scale
    svg = d3.select('body').append('svg')
      .attr('width', 350)
      .attr('height', 90)
      .attr('class', 'canvas')
    colorScale(maxmin[0], maxmin[1], svg);

  }); // end population csv
}

/* 'TurN THis' into turn-this */
function massage(string) { return string.toLowerCase().replace(/\s+/g, '-'); }

function print(string) {
  console.log(string)
}
