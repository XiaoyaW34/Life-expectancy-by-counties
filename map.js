mapboxgl.accessToken = 'pk.eyJ1IjoiY2VudHJpZnVnZTEiLCJhIjoiY20wdnZuNXJwMDZ2ejJxb2xyZXN1ZWprYSJ9.-ydDpcvn4PY8L_TNR474Sg';

var map = L.map('map', {
  center: [37.8, -96],
  zoom: 4,
  minZoom: 3,
  maxZoom: 19
});

L.mapboxGL({
    accessToken: mapboxgl.accessToken,
    style: 'mapbox://styles/centrifuge1/cm33hszqi00z501pac0jl3d6j'
}).addTo(map);

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>Life Expectancy</h4>' +  (props ?
        '<b>' + props['County Value'] + '</b><br />' + props.State_name + ' State' + '</b><br />'+ props.NAME + ' County'
        : 'Hover over an area');
};

info.addTo(map);

function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    layer.bringToFront();
    info.update(layer.feature.properties)
}

function resetHighlight(e) {
    e.target.setStyle({
        weight: 0.3,
        color: "#848484",
        fillOpacity: 0.9
    });
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function applyInteractions(layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

function addLayer(dataUrl, styleFunc, interactions = false) {
    fetch(dataUrl)
        .then(response => response.json())
        .then(data => {
            const layer = L.geoJson(data, {
                style: styleFunc,
                onEachFeature: interactions ? function (feature, layer) {
                    applyInteractions(layer);
                } : null
            }).addTo(map);
        });
}

function getColor1(d) {
    return d > 76.1 ? '#fff4b2' :
          d > 75.4 ? '#fedf99' :
          d > 74.8  ? '#fec980' :
          d > 74.3  ? '#fdb367' :
          d > 73.8  ? '#f59053' :
          d > 73.125  ? '#eb6841' :
          d > 72.2125 ? '#e1412e' :
          d > 66 ? '#d7191c' :
                    '';
}

function getColor2(d) {
    return d > 82.5 ? '#2b83ba' :
          d > 81.5 ? '#4696b5' :
          d > 80.8  ? '#61a9b1' :
          d > 80.2  ? '#7cbcac' :
          d > 79.6  ? '#97cfa7' :
          d > 79.1  ? '#afdfa5' :
          d > 78.4  ? '#c1e6ab' :
          d > 77 ? '#d3edb1' :
                    '';
}

addLayer('data/normal_county.geojson', function (feature) {
    return {
        color: "#848484",
        weight: 0.3,
        fillColor: "#e3e3e3",
        fillOpacity: 0.9
    };
}, true); 

addLayer('data/counties_doughnut.geojson', function (feature) {
    return {
        color: "white",
        weight: 1,
        fillColor: "#696969",
        fillOpacity: 0.9
    };
}, true);

addLayer('data/counties_diamond.geojson', function (feature) {
    return {
        color: "#5b5b5b",
        weight: 1,
        fillColor: "white",
        fillOpacity: 0.9
    };
}, true);

addLayer('data/counties_coldspot.geojson', function (feature) {
    const countyValue = feature.properties['County Value'];
    return {
        color: "white",
        weight: 0.5,
        fillColor: getColor1(countyValue),
        fillOpacity: 0.9
    };
}, true);

addLayer('data/counties_hotspot.geojson', function (feature) {
    const countyValue = feature.properties['County Value'];
    return {
        color: "white",
        weight: 0.5,
        fillColor: getColor2(countyValue),
        fillOpacity: 0.9
    };
}, true);

addLayer('data/states_life_line.geojson', function () {
  return {
      color: "#000000",
      dashArray: '4',
      weight: 0.8,
      fillColor: null,
  };
});


var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

  var container = L.DomUtil.create('div', 'info legend');

  var div_coldspot = L.DomUtil.create('div', 'legend-section', container),
      coldspotGrades = [66, 72.2125, 73.125, 73.8, 74.3, 74.8, 75.4];
      
  div_coldspot.innerHTML = '<h4>Counties with low Life Expectancy</h4>' +
                          '<h4>Surrounded by Similar low Values</h4>';
  
  for (var i = 0; i < coldspotGrades.length; i++) {
      div_coldspot.innerHTML +=
          '<i style="background:' + getColor1(coldspotGrades[i] + 1) + '"></i> ' +
          coldspotGrades[i] + (coldspotGrades[i + 1] ? '&ndash;' + coldspotGrades[i + 1] + '<br>' : '+');
  }

  var div_hotspot = L.DomUtil.create('div', 'legend-section', container),
      hotspotGrades = [77, 78.4, 79.1, 79.6, 80.2, 80.8, 81.5, 82.5];
      
  div_hotspot.innerHTML = '<h4>Counties with high Life Expectancy</h4>' +
                          '<h4>Surrounded by Similar high Values</h4>';
  
  for (var i = 0; i < hotspotGrades.length; i++) {
      div_hotspot.innerHTML +=
          '<i style="background:' + getColor2(hotspotGrades[i] + 1) + '"></i> ' +
          hotspotGrades[i] + (hotspotGrades[i + 1] ? '&ndash;' + hotspotGrades[i + 1] + '<br>' : '+');
  }

  var div_doughnut = L.DomUtil.create('div', 'legend-section', container);
      
  div_doughnut.innerHTML = '<h4>Counties with low Life Expectancy</h4>' +
                          '<h4>Surrounded by high Values</h4>' +'<i style="background:' + "#696969" + '"></i> '

  var div_diamond = L.DomUtil.create('div', 'legend-section', container);
      
  div_diamond.innerHTML = '</b><br />'+'<h4>Counties with high Life Expectancy</h4>' +
                          '<h4>Surrounded by low Values</h4>' +'<i style="background: white; border: 1px solid black;"></i> '

  var div_normal = L.DomUtil.create('div', 'legend-section', container);

  div_normal.innerHTML = '</b><br /><h4>Normal Counties</h4>' +'<i style="background: #e3e3e3; border: 1px solid black;"></i> '
  
  return container;
};

legend.addTo(map);
