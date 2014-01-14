

function ltrim(str){
                return str.replace(/^\s+/, '');
            }

db = db.getMongo().getDB( "cookography" );
db.auth("cleanEats", 'EfcCyhlR27rJFBhtm9w3');

db.places.find().forEach(function(place) {
	place.permit_type = ltrim(place.permit_type);
db.places.save(place);
});