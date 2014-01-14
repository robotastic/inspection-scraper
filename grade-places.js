// this is a script to be run by Mongo
// to run, simply go: mongo cleanup-everything.js


db = db.getMongo().getDB( "cookography" );
db.auth("cleanEats", 'EfcCyhlR27rJFBhtm9w3');


   function trim(str) {
        return str.replace(/^\s+|\s+$/g,"");
    }

db.places.find().forEach(function(place) {
	var total_violations=0;
	var total_inspections=0;
	var scores = new Array();
	if (place.inspections.length > 0) {
		var i=0;
		for (i=0; i < place.inspections.length; i++)
		{
			var inspection = place.inspections[i];
			if (inspection.report_type == "HTML")
			{
				var report = db.inspections.findOne({'permit_id': place.permit_id, 'inspection_id': inspection.inspection_id});
		
				
					scores.push((2*parseInt(report.critical_violations)) - parseInt(report.cv_cos) + parseInt(report.noncritical_violations) - parseInt(report.nv_cos));
				
				
			
			}
		}
	}
	
	
	

	
	print(place.name + " Total Violations: " + place.total_violations + " Inspections: " + place.total_inspections);
	for (i=0; i < scores.length; i++)
	{
		print(scores[i] + " ");
	}

});