db = db.getMongo().getDB( "cookography" );
db.auth("cleanEats", 'EfcCyhlR27rJFBhtm9w3');

function formatDate(d)
{
	var curr_date = d.getDate();
  var curr_month = d.getMonth() + 1; //months are zero based
  var curr_year = d.getFullYear();
  return(curr_month + "/" + curr_date + "/" + curr_year);
}



var today = new Date();
var lastWeek = new Date();
lastWeek.setDate( today.getDate()-7 );

print("<h2>Licensed Businesses</h2>");
print("<ul>");
db.places.find({modified: {$gte: lastWeek, $lte: today}}).sort({modified:-1}).forEach(function(place) {
	print("<li>");
	print("<a href='http://cleaneats.org/business/" + place.permit_id + "/'><b>" + place.name + "</b></a> - "); 
	print(formatDate(place.modified) + " -  " + place.address + "  <br>");
	print("Inspections: " + place.inspections.length);
	
	print("</li>");

});
print("</ul>");


print("<h2>Inspections</h2>");

print("<ul>");
db.inspections.find({date: {$gte: lastWeek, $lte: today}}).sort({suspension: -1, date:-1}).forEach(function(report) {
	print("<li>");
	print("<a href='http://cleaneats.org/report/" + report.permit_id + "/" + report.inspection_id + "/'><b>" + report.name + "</b></a> - "); 
	print(formatDate(report.date) + " - " + report.address + "<br>");
	if (report.suspension) {
		print("<b>SUSPENDED</b> ");
	}
	print(" ( " + report.inspection_type + " ) ");
	print(" Critical: " + report.critical_violations + " Non-Critical Violations: " + report.noncritical_violations);
	
	print("</li>");
});
print("</ul>");

print("<h2>Observations</h2>");

print("<ul>");
db.inspections.find({date: {$gte: lastWeek, $lte: today}}).sort({suspension: -1, date:-1}).forEach(function(report) {
	print("<li>");
	print("<a href='http://cleaneats.org/report/" + report.permit_id + "/" + report.inspection_id + "/'><h3>" + report.name + "</h3></a>"); 
	print(formatDate(report.date) + " - " + report.address + "<br>");
	if (report.suspension) {
		print("<b>SUSPENDED</b> ");
	}
	print(" ( " + report.inspection_type + " ) ");
	print(" Critical: " + report.critical_violations + " Non-Critical Violations: " + report.noncritical_violations);
	
	print("<ol>");
		for (var i=0; i < report.observations.length; i++)
		{
			
			print("<li>" + report.observations[i].observation + "</li>");
		}
	
	print("</ol>");
	//print("<b>Inspector Comments:</b> " + report.comments);
	print("</li>");
});
print("</ul>");