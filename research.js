db = db.getMongo().getDB( "cookography" );
db.auth("cleanEats", 'EfcCyhlR27rJFBhtm9w3');

placeMap = function() {
	if (this.inspections.length > 0)
	{
 		 emit(this.permit_type, {place: 1, inspected: 1}); 
	}
	else
	{
		emit(this.permit_type, {place: 1, inspected: 0});
	}
}

placeReduce = function(previous, current) {
    var placeCount = 0;
	var inspectedCount = 0;

 current.forEach(function(v) {
    placeCount += v['place'];
	inspectedCount += v['inspected'];
  });

    return {place:parseInt(placeCount), inspected: parseInt(inspectedCount)};
}




db.totals.remove();

db.places.mapReduce(placeMap, placeReduce, "totals");


db.totals.find().forEach(function (total) {
	print(  total._id + ", " + total.value.place + ", "+ total.value.inspected + ", " + total.value.inspected / total.value.place);
});


/*
reportMap = function() {

 	
	emit(this.permit_type, {inspection: 1}); 
}

reportReduce = function(previous, current) {
    var count = 0;

 current.forEach(function(v) {
    count += v['inspection'];
  });


    return {inspection:parseInt(count)};
}

placeMap = function() {

  emit(this.permit_type, {place: 1}); 
}

placeReduce = function(previous, current) {
    var count = 0;

 current.forEach(function(v) {
    count += v['place'];
  });

    return {place:parseInt(count)};
}




db.totals.remove();
db.placeTotals.remove();
db.reportTotals.remove();

db.places.mapReduce(placeMap, placeReduce, "placeTotals");
db.inspections.mapReduce(reportMap, reportReduce, "reportTotals");
db.placeTotals.find().forEach(function(total){
	var query = { _id: total._id};  
	db.reportTotals.find(query).forEach( function(x)
	{
		//printjson(x);
		db.totals.insert({'permit_type': total._id, 'places': total.value.place, 'inspections': x.value.inspection});
	});
});
db.totals.find().forEach(function (total) {
	print(  total.permit_type + ", " + total.places + ", "+ total.inspections + ", " + total.inspections / total.places);
});
*/



/*
db.totals.find().forEach(function (total) {
	db.places.update( { permit_id:total._id }, { $set: { follow_up_inspections : parseInt(total.value) } } );
});
*/
/*
map = function() {
  day = Date.UTC(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());

  emit({day: day, count: 1);
}

reduce = function(key, values) {
  var count = 0;

  values.forEach(function(v) {
    count += v['count'];
  });

  return {count: count};
}

db.inspections.mapReduce(map, reduce, {out: inspection_results});
*/
/*

reduce = function(previous, current) {
    var count = 0;

    for (index in current) {
        count += current[index];
    }

    return parseInt(count);
}

printjson(db.inspections.mapReduce(map, reduce, "totals"));

*/
