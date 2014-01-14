var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/cookography');


/*
mongoose.model('places', {
 	name	: String,
	address	: String,
	ward	: String,
	quad	: String,
	permit_type	: String,
	long	: Number,
	lat		: Number,
	href	: String,
	modified : Date,
	dc_image	: String,
	street_view	: String

});*/



var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var Reports = new Schema({
	name	: String,
	address	: String,
    inspection_id : Number,
	pdf : String,
	inspection_type	: String,
    permit_id : Number,
	long	: Number,
	lat		: Number,
	href	: String,
	modified : Date,
	date : Date
});


mongoose.model('reports', Reports);

module.exports = mongoose.model('reports');