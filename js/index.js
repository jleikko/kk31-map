
var channel;

$(document).ready(function(){

	// init connection
	var IFRAME_DOMAIN = "http://www.paikkatietoikkuna.fi";
	var iFrame = document.getElementById('oskari');
	channel = OskariRPC.connect(
	    iFrame,
	    IFRAME_DOMAIN
	);
	channel.onReady(function() {
	    //channel is now ready and listening.
	    channel.log('Map is now listening');
	    var expectedOskariVersion = '1.35.0';
	    channel.isSupported(expectedOskariVersion, function(blnSupported) {
	        if(blnSupported) {
	            channel.log('Client is supported and Oskari version is ' + expectedOskariVersion);
	        } else {
	            channel.log('Oskari-instance is not the one we expect (' + expectedOskariVersion + ') or client not supported');
	            // getInfo can be used to get the current Oskari version
	            channel.getInfo(function(oskariInfo) {
	                channel.log('Current Oskari-instance reports version as: ', oskariInfo);
	            });
	        }
	    });
	    channel.isSupported(function(blnSupported) {
	        if(!blnSupported) {
	            channel.log('Oskari reported client version (' + OskariRPC.VERSION + ') is not supported.' +
	            'The client might work, but some features are not compatible.');
	        } else {
	            channel.log('Client is supported by Oskari.');
	        }
	    });
	    drawRoute();
	});
});

function convertWGS84toETRSTM35FIN(lat, lon) {
		var wgsProjection = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
		//etrs-tm35fin
		var finnProjection = "+proj=utm +zone=35 +ellps=GRS80 +units=m +no_defs";
		
		return proj4(wgsProjection,finnProjection,[lat,lon]);
}

function resolveRoute10() {
	$.ajaxSetup( { "async": false } );
	var eka = $.getJSON('geojson_wgs84/toka.json').responseJSON;
	console.log(eka);
	var convertedCoordinates =
		eka.features[0].geometry.coordinates.map(function(point) {
			var lat = point[0];
			var lon = point[1];
			var converted = convertWGS84toETRSTM35FIN(lat, lon);
			return [converted[0], converted[1]];
		});
	var converted = {
          'type': 'FeatureCollection',
          'crs': {
            'type': 'name',
            'properties': {
              'name': 'EPSG:3067'
            }
          },
          'features': [
        	{
            	"type": "Feature",
            	"geometry": {
	                "type": "LineString",
                	"coordinates": convertedCoordinates
                }
            }]
        };
    console.log(converted);
	return converted;
}

function resolveRoute21() {
	$.ajaxSetup( { "async": false } );
	var eka = $.getJSON('geojson_wgs84/eka.json').responseJSON;
	console.log(eka);
	var convertedCoordinates =
		eka.features[0].geometry.coordinates.map(function(point) {
			var lat = point[0];
			var lon = point[1];
			var converted = convertWGS84toETRSTM35FIN(lat, lon);
			return [converted[0], converted[1]];
		});
	var converted = {
          'type': 'FeatureCollection',
          'crs': {
            'type': 'name',
            'properties': {
              'name': 'EPSG:3067'
            }
          },
          'features': [
        	{
            	"type": "Feature",
            	"geometry": {
	                "type": "LineString",
                	"coordinates": convertedCoordinates
                }
            }]
        };
    console.log(converted);
	return converted;
}

function drawRoute() {

        var geojsonObject = {
          'type': 'FeatureCollection',
          'crs': {
            'type': 'name',
            'properties': {
              'name': 'EPSG:3067'
            }
          },
          'features': [
            {
              'type': 'Feature',
              'geometry': {
                'type': 'Point',
                'coordinates': [384743.629,
                        6681677.290]
              },
              'properties': {
                'test_property': 'Start / Finish'
              }

            }

          ]
        };

    var testOptions = {
        'minResolution': 0,
        'maxResolution': 1000
    };
    var params = [geojsonObject, {
            clearPrevious: true,
            layerOptions: testOptions,
            centerTo: true,
            featureStyle: {
                fill: {
                    color: '#ff0000'
                },
                stroke : {
                    color: '#ff0000',
                    width: 1
                },
                text : {
                    scale : 3,
                    fill : {
                        color : 'rgba(142,196,73,1)'
                    },
                    stroke : {
                        color : 'rgba(14,104,59,1)',
                        width : 2
                    },
                    labelProperty: 'test_property'
                },
            prio: 1,
            minScale: 1451336
        }}];

    channel.postRequest(
        'MapModulePlugin.AddFeaturesToMapRequest',
        params
    );
    channel.log('MapModulePlugin.AddFeaturesToMapRequest posted with data', params);

    var route10 = resolveRoute10();

    var testOptions3 = {
        'minResolution': 0,
        'maxResolution': 1000
    };
    var params3 = [route10, {
            clearPrevious: false,
            layerOptions: testOptions3,
            centerTo: true,
            featureStyle: {
                stroke : {
                    color: 'rgba(142,196,73,1)',
                    width: 15
                }
            },
            prio: 3
        }];


    channel.postRequest(
        'MapModulePlugin.AddFeaturesToMapRequest',
        params3
    );
    channel.log('MapModulePlugin.AddFeaturesToMapRequest posted with data', params3);
    
    var route21 = resolveRoute21();

    var testOptions2 = {
        'minResolution': 0,
        'maxResolution': 1000
    };
    var params2 = [route21, {
            clearPrevious: false,
            layerOptions: testOptions2,
            centerTo: true,
            featureStyle: {
                stroke : {
                    color: '#0E683B',
                    width: 7
                }
            },
            prio: 2
        }];


    channel.postRequest(
        'MapModulePlugin.AddFeaturesToMapRequest',
        params2
    );
    channel.log('MapModulePlugin.AddFeaturesToMapRequest posted with data', params2);
               
}