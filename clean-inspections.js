db = db.getMongo().getDB( "cookography" );
db.auth("cleanEats", 'EfcCyhlR27rJFBhtm9w3');
db.inspections.remove();
db.places.find().forEach(function(place) {

place.inspections = [];
db.places.save(place);

});