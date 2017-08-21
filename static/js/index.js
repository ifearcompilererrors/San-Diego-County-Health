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
    onEachFeature: collectCentroids
  }));//.addTo(map);

  /* Set neighborhood style */
  function setStyle(features) {
    return {
      fillColor: 'floralwhite',
      fillOpacity: 0.8,
      weight: 1,
      opacity: 0.65,
      className: 'neighborhood '+features.properties.NAME.toLowerCase().replace(/\s+/g, '-')
    }
  }

  /* Get coordinates of the center of each neighborhood */
  function collectCentroids(features, layer) {
    centroids[layer.feature.properties.NAME.toLowerCase().replace(/\s+/g, '-')] = 
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
        L.circle(centroids[d['City'].toLowerCase().replace(/\s+/g, '-')].reverse(), {
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
      neighborhood = d['Area '].toLowerCase().replace(/\s+/g, '-');
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
      console.log(neighborhood, normalize, total, countyTotal)
      $('.'+neighborhood).css('fill', function(d) { 
        if(normalize > 0) return d3.interpolateBlues(normalize)
        else return 'floralwhite'
      });
    });
  });
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

function appendLegend() {
  // Dynamically set neighborhood hue based on population
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

function print(string) {
  console.log(string)
}
