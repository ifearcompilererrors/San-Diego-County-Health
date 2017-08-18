var latlong = [33.026142, -116.696322],
    windowWidth   = $(window).width(),
    windowHeight  = $(window).height(),
    scale   = $(window).width() * 25,
    popup = new L.Popup({ autoPan: false }),
    centroids = {},
    geojson,
    co2Layer,
    closeTooltip;

// Draw map
L.mapbox.accessToken = 'pk.eyJ1IjoiaWZlYXJjb21waWxlcmVycm9ycyIsImEiOiJjaXUwOTFpdm0wMXNhMm9xcDZ1MmNiNmF0In0.ZVVzG5Amju9GXPtGPUwEwg';
var map = L.mapbox.map('map', 'mapbox.streets')
    .setView(latlong, 9);

$('#pollutant-CO2').click(function() {
  if($('#pollutant-CO2').is(':checked') && $('.co2').length == 0) {
    map.addLayer(co2Layer);
  } else {
    map.removeLayer(co2Layer);
  }
});

// Create layers
// Neighborhood layer
d3.json("/static/json/SRA2010tiger.geojson", function(error, data){
  var neighborhoodBounds = data.features;

  // Draw neighborhoods
  geojson = L.geoJson(neighborhoodBounds, {
    style: setStyle,
    onEachFeature: collectCentroids
  }).addTo(map);

  /* Set neighborhood style */
  function setStyle(features) {
    return {
      fillColor: d3.interpolateBlues(1),
      fillOpacity: 0.8,
      weight: 1,
      opacity: 0.65,
      className: 'neighborhood '+features.properties.NAME.toLowerCase().replace(/\s+/g, '-')
    }
  }

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

    csvdata.forEach(function(d) {
      co2Layer.addLayer(
        L.circle(centroids[d['City'].toLowerCase().replace(/\s+/g, '-')].reverse(), {
          radius: d['Total Reported Emissions']/100,
          className: 'pollutant co2',
        })
      );
    });
  });
});