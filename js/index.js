
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

function resolveRoute() {
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

    var route = resolveRoute();

    var testOptions = {
        'minResolution': 0,
        'maxResolution': 1000
    };
    var params = [route, {
            clearPrevious: false,
            layerOptions: testOptions,
            centerTo: true,
            featureStyle: {
                stroke : {
                    color: '#0E683B',
                    width: 7
                }
            },
            prio: 1
        }];


    channel.postRequest(
        'MapModulePlugin.AddFeaturesToMapRequest',
        params
    );
    channel.log('MapModulePlugin.AddFeaturesToMapRequest posted with data', params2);
               
}