var Places = require('./models/place');
var sys = require('sys');
var fs = require('fs');

var output = {"type" : "FeatureCollection",
  "crs":{
        "type":"OGC", 
        "properties":{
            "urn":"urn:ogc:def:crs:OGC:1.3:CRS84"
        }
      }};

var features = new Array();


function addPlace(place)
{
	var feature ={"type": "Feature"};
		feature.id = place.permit_id;
	var geometry = {"type" : "Point"};
	geometry.coordinates = new Array(place.longitude, place.latitude);
	var properties = {};
	properties.name = place.name;
	properties.address = place.fullAddress;
	properties.violations = place.total_violations;
	properties.inspections = place.total_inspections;
	properties.permit_type = place.permit_type;
	properties.permit_id = place.permit_id;
	feature.properties = properties;
	feature.geometry = geometry;
	features.push(feature);
}
	Places.find({},["permit_id","name", "fullAddress", "longitude", "latitude", "total_violations", "total_inspections","permit_type"],{},function(err,p) {
		if (err) { throw err; } 
		else {
			for (var i = 0; i < p.length; i++)
			{
				addPlace(p[i]);		
			}
		}
		output.features = features;
		//fs.writeFile("places.geojson",JSON.stringify(output, null, 4) , function(err) {
		fs.writeFile("places.geojson",JSON.stringify(output) , function(err) {
		    if(err) {
		        sys.puts(err);
		    } else {
		        sys.puts("The file was saved!");

		    }
			Places.close();
		});

	});
