// this is a script to be run by Mongo
// to run, simply go: mongo cleanup-everything.js


db = db.getMongo().getDB( "cookography" );
db.auth("cleanEats", 'EfcCyhlR27rJFBhtm9w3');

/*
map = function() {

    if (this.inspection_type!="Follow-up") {
        return;
    }
	emit(this.permit_id, 1); 
}

reduce = function(previous, current) {
    var count = 0;

    for (index in current) {
        count += current[index];
    }

    return parseInt(count);
}

printjson(db.inspections.mapReduce(map, reduce, "totals"));

db.totals.find().forEach(function (total) {
	db.places.update( { permit_id:total._id }, { $set: { follow_up_inspections : parseInt(total.value) } } );
});


map = function() {
   	emit(this.permit_id, 1); 
}

reduce = function(previous, current) {
    var count = 0;

    for (index in current) {
        count += current[index];
    }

    return parseInt(count);
}

printjson(db.inspections.mapReduce(map, reduce, "totals"));

db.totals.find().forEach(function (total) {
	db.places.update( { permit_id:total._id }, { $set: { total_inspections : parseInt(total.value) } } );
});
*/

   function trim(str) {
        return str.replace(/^\s+|\s+$/g,"");
    }

db.places.find().forEach(function(place) {
	var total_violations=0;
	var total_inspections=0;
	if (place.inspections.length > 0) {
		var i=0;
		for (i=0; i < place.inspections.length; i++)
		{
			var inspection = place.inspections[i];
			if (inspection.report_type == "HTML")
			{
				var report = db.inspections.findOne({'permit_id': place.permit_id, 'inspection_id': inspection.inspection_id});
		
				if (report)
				{
					inspection.total_violations = parseInt(report.total_violations);
					total_violations = total_violations + parseInt(report.total_violations);
				
			/*	if ((report.critical_violations - report.cv_cos) > 5) 
				{
					report.suspension = true;
				}
				else 
				{*/
					if (report.comments && (report.comments.search(/suspension/i)!=-1))
					{
						report.suspension = true;
					}
					else
					{
						report.suspension = false;
					}
					
				//}
				if (report.comments )
				{
					report.comments = report.comments.replace(/(\n)+/g, "<br>");
				}
				db.inspections.save(report);
				
				if (i == 0)		// the newest reports are always addded to the fron of the array (unshift) hence, 0 should = newest
				{
					place.license_holder = report.license_holder;
					place.license_num = report.license_num;
					place.license_start = report.license_start;
					place.license_end = report.license_end;
					place.risk_category = report.risk_category;
					place.trash = report.trash;
					place.grease = report.grease;
					place.pest = report.pest;
				}
				}
			}
		}
	}
	place.total_violations = total_violations;
	place.total_inspections = place.inspections.length;
	
	

	db.places.save(place);
	//print(place.name + " violations: " + place.total_violations + " Inspections: " + place.total_inspections);

});