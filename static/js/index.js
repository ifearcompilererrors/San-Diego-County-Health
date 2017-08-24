var latlong = [33.026142, -116.696322],
    windowWidth   = $(window).width(),
    windowHeight  = $(window).height(),
    scale   = $(window).width() * 25,
    popup = new L.Popup({ autoPan: false }),
    centroids = {},
    patternWeights = {},
    geojsonLayer = L.layerGroup(),
    diseasedLayers = L.layerGroup(),
    co2Layer = L.layerGroup(),
    closeTooltip,
    svg;

// Draw map
L.mapbox.accessToken = 'pk.eyJ1IjoiaWZlYXJjb21waWxlcmVycm9ycyIsImEiOiJjaXUwOTFpdm0wMXNhMm9xcDZ1MmNiNmF0In0.ZVVzG5Amju9GXPtGPUwEwg';
var map = L.mapbox.map('map', 'mapbox.streets')
  .setView(latlong, 9);

// Append population color legend
appendLegend();

// Toggle switch!
$('.toggle').click(function(d) {
  switch(this.id) {

    // Display neighborhood income text
    case 'income':
      displayIncome($('#income:checkbox:checked').length);
      break; // end income

    // Display emissions layer
    case 'pollutant-CO2':
      if($('.co2').length == 0) {
        map.addLayer(co2Layer);
      } else {
        map.removeLayer(co2Layer);
      }
      break; // end pollutant-CO2

    // Display diesease layer
    case 'disease-dementia-no':
      if($('.dementia-no-layer').length == 0) {
        map.addLayer(diseasedLayers);
        setDiseaseStyle()
      } else {
        map.removeLayer(diseasedLayers);
      }

    default: break;
  }

  switch(this.className) {
    
    // Set neighborhood color based on population
    case 'toggle population':
      setPopulationColor();
      break; // end population
  }
});

// Create layers
// Neighborhood layer
d3.json("https://cdn.rawgit.com/ifearcompilererrors/San-Diego-County-Health/gh-pages/static/json/SRA2010tiger.geojson", function(geoError, geoData){
  var neighborhoodBounds = geoData.features;

  // Draw neighborhoods
  geojsonLayer.addLayer(
    L.geoJson(neighborhoodBounds, {
      style: setGeoStyle,
      onEachFeature: onEachFeatureGeoJson
    })
  ).addTo(map);

  // Draw untextured/unfilled disease layers
  diseasedLayers.addLayer(
    L.geoJson(neighborhoodBounds, {
      style: setDiseaseStyle
    })
  );

  /* Set neighborhood style */
  function setGeoStyle(features) {
    return {
      fillColor: 'floralwhite',
      fillOpacity: 0.8,
      weight: 1,
      opacity: 0.65,
      className: 'neighborhood '+massage(features.properties.NAME)
    }
  }

  /* Visualize data per layer */
  function onEachFeatureGeoJson(features, layer) {
    collectCentroids(features, layer);
    displayNames(features, layer);
  }

  /* Display neighborhood names */
  function displayNames(features, layer) {
    var neighborhood = massage(features.properties.NAME);
    var layerTooltip = layer.bindTooltip(massage_proper(neighborhood));
  }

  /* Get coordinates of the center of each neighborhood */
  function collectCentroids(features, layer) {
    centroids[massage(layer.feature.properties.NAME)] = 
      $.geo.centroid(layer.feature.geometry).coordinates;
  }

  /* Set diseased layers style */
  function setDiseaseStyle(features) {
    return {
      weight: 1,
      className: 'disease dementia-no-layer dementia-no-'+massage(features.properties.NAME)
    }
  }

  // Collect pattern weights for dementia no. 
  d3.csv("https://cdn.rawgit.com/ifearcompilererrors/San-Diego-County-Health/gh-pages/static/csv/2010-2012_Dementia.csv", function(disError,disData){
    disData.forEach(function(d) {
      patternWeights[massage(d.Geography)] = parseInt(d['2012 Dementia Death No.'])/10;
    }); // end disData iteration
  }); // end csv dementia

  // TODO: refactor!!!!; popup -> tooltip
  // Emissions data layer: circles at the center of a facility's neighborhood
  // Radius of circles are based on Total Reported Emissions
  d3.csv("https://cdn.rawgit.com/ifearcompilererrors/San-Diego-County-Health/gh-pages/static/csv/2010_CO2_emissions.csv", function(csverror,csvdata){
    var pollutantNhood,
        neighborhood,
        pollutantToggle;

    co2Layer = L.layerGroup();

    // Create emissions layer
    csvdata.forEach(function(d) {
      co2Layer.addLayer(
        L.circle(centroids[massage(d['City'])].reverse(), {
          setZIndex: 500,
          radius: normalizeRadius(d),
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

/* Fit radius of emissions to map */
function normalizeRadius(d) {
  var r = d['Total Reported Emissions']/25;
  if(r > 10000) return 20000
  return r
}

/* Display neighborhood median $$$ income $$$ */
function displayIncome(display) {
  d3.csv("https://cdn.rawgit.com/ifearcompilererrors/San-Diego-County-Health/gh-pages/static/csv/2012_San_Diego_Demographics_-_County_Vs_Subregional_Area_Income.csv", function(incomeError, incomeData){
    var neighborhoods = geojsonLayer.getLayers()[0]._layers,
        neighborhoodName,
        neighborhood,
        cashMoney,
        greens;

    for(var [key,value] of Object.entries(neighborhoods)) {
      neighborhoodName = massage(value.feature.properties.NAME);
      neighborhood = '.'+value.options.className.replace(/\s+/g, '.')

      if(display) {
          avg = getIncomeAvg(incomeData);

          incomeData.forEach(function(incomeDatum) {
            cashMoney = parseInt(incomeDatum['Median household income'].substr(1));
            if(massage(incomeDatum['Area']) === neighborhoodName) {
              if(cashMoney <= avg-20000) {
                greens = '$'
              }
              else if(cashMoney <= avg-10000) { 
                greens = '$$'
              }
              else if(cashMoney <= avg+10000) { 
                greens = '$$$'
              }
              else if(cashMoney >= avg+20000) { 
                greens = '$$$$'
              }
            }
          }); // end incomeData.forEach()


        value.bindTooltip(greens, {
          permanent: true,
          direction: 'center',
          className: 'income-tooltip'
        });
      } // end if(display)
      else {
        value.unbindTooltip()
      } // end else
    } // end neighborhoods loop
  }); // end csv
} // end displayIncome

/* Get San Diego median income average */
function getIncomeAvg(incomeData) {
  var totalIncome = 0;
  incomeData.forEach(function(d) {
    totalIncome += parseInt(d['Median household income'].substr(1));
  });

  return totalIncome/incomeData.length;
}

/* Dynamically set neighborhood layer fill color based on population demographics */
function setPopulationColor() {
  // color based on number
  // Get array of checked demographic boxes
  var display = $(".population:checkbox:checked"),
      countyTotalOnly = false,
      countyTotals = {},
      total,
      id,
      countyTotal,
      countyTotalData,
      normalize,
      fillColor;

  d3.csv("https://cdn.rawgit.com/ifearcompilererrors/San-Diego-County-Health/gh-pages/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(poperror,popdata){
    countyTotalData = popdata[popdata.length-1] // exclude last superfluous layer

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
        if(id === 'Total 2012 Population') {
          countyTotalOnly = true
          break;
        }
      }

      countyTotals[neighborhood] = total
      normalize = (total/countyTotal)*20
      $('.'+neighborhood).css('fill', function(d) { 
        if(normalize > 0) return d3.interpolateBlues(normalize)
        else return 'floralwhite'
      });
    });
  });

  setLegendText(countyTotals, countyTotalOnly)
}

/* Fill disease layer with disease pattern style */
function setDiseaseStyle() {
  var layers = diseasedLayers.getLayers()[0]._layers,
      neighborhood;

  for(var [key, value] of Object.entries(layers)) {
    neighborhood = massage(value.feature.properties.NAME)

    value.setStyle({
      fillOpacity: 0.65,
      fillPattern: new L.StripePattern({
        weight: patternWeights[neighborhood],
        opacity: 1,
      }).addTo(map)
    })
  }
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
function getPopMaxMin(data, category) {
  var population = [], max, min;
  data.forEach(function(d) {
    population.push(parseInt(d[category]));
  });
  max = population[0];
  min = population[0];
  
  for(var i = 0; i < population.length; i++) {
    if(population[i] > max) {max = population[i];}
    if(population[i] < min) {min = population[i];}
  }

  return [max, min]
}

function setLegendText(totals, countyOnly) {
  var categories = $(".population:checkbox:checked");
  if(!categories.length) {
    $('.domain-values').empty()
    return
  }

  var max = 0,
      min = Number.MAX_SAFE_INTEGER,
      domainValues = $('.domain-values'),
      category,
      maxmin;


  d3.csv("https://cdn.rawgit.com/ifearcompilererrors/San-Diego-County-Health/gh-pages/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(poperror,popdata){

    // Only display numbers for min and max of total county population
    if(countyOnly) {
      maxmin = getPopMaxMin(popdata, 'Total 2012 Population')
      max = maxmin[0]
      min = maxmin[1]
    } else {
      for(var i = 0; i < categories.length; i++) {
        category = categories[i].id.replace(/-/g, ' ');

        maxmin = getPopMaxMin(popdata, category)

        if(maxmin[0] > max) max = maxmin[0]
        if(maxmin[1] < min) min = maxmin[1]
      } // end categories iteration
  } // end else

    var x = d3.scaleLinear()
      .domain([1, 10])
      // .range([min,max])
      .rangeRound([10, 270]);

    var color = d3.scaleThreshold()
        .domain(d3.range(1, 10))
        .range(d3.schemeBlues[9])



    var g = d3.select('.key')

    if(domainValues.length) $('.domain-values').empty()

    g = g.append('g')
        .attr('class', 'domain-values')
    
    g = g.call(d3.axisBottom(x)
        .tickSize(13)
        .tickFormat(function(x, i) {
          if(x == 1) return min;
          else if(x == 9) return max;
          return Math.round(((max-min)/(10-1))*x);
        })
        .tickValues(color.domain()))
    g.selectAll('.tick').select('text')
        .attr('class', 'tick-text')
    g.select(".domain")
        .remove();

    g.selectAll('.tick-text')
        .style("text-anchor", "beginning")
        .attr('dx', '-2em')
        .attr('dy', '.17em')
        .attr("transform", "rotate(-30)")

  }); // end csv population
}

/* Color scale delimeters and labels */
function colorScale(max, min, canvas) {
  var x = d3.scaleLinear()
    .domain([1, 10])
    .range([min,max])
    .rangeRound([10, 270]);

  var color = d3.scaleThreshold()
      .domain(d3.range(1, 10))
      .range(d3.schemeBlues[9])

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
}

/* Help folks understand their data with colors of the wind */
function appendLegend() {
  d3.csv("https://cdn.rawgit.com/ifearcompilererrors/San-Diego-County-Health/gh-pages/static/csv/2012_San_Diego_Demographics_-_County_Population.csv", function(poperror,popdata){
    var neighborhood,
        neighborhoodList,
        maxmin, max, min;

    // Calculate max and min
    maxmin = getPopMaxMin(popdata, 'Total 2012 Population');

    // Create color scale
    svg = d3.select('body').append('svg')
      .attr('width', 350)
      .attr('height', 90)
      .attr('class', 'canvas')

    colorScale(maxmin[0], maxmin[1], svg);

  }); // end population csv
}

/* 'TurN THis' into 'turn-this' */
function massage(string) { return string.toLowerCase().replace(/\s+/g, '-'); }

/* 'turn-this' into 'Turn This' */
function massage_proper(string) { 
  string = string.replace(/-/g, ' ')
  return string.replace(/\w\S*/g, function(str){
    return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
  });
}

/* when ur too lazy during developmnt 2 typ */
function print(string) {
  console.log(string);
}
