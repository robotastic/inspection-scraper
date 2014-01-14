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

var Inspection = new Schema({
	inspection_type: String,
    weekday: String,
    month: String,
    day: Number,
    year: Number,
    date: Date,
    report_type: String,
    query: String,
    href: String,
	total_violations: Number,
    inspection_id: Number })

var Places = new Schema({
	name	: String,
	address	: String,
  addressId : Number,
	fullAddress: String,
	streetName: String,
	streetType: String,
	quadrant: String,
	city: String,
	state: String,
	zipcode: Number,
	ward	: Number,
	quad	: String,
	permit_type	: String,
  permit_id : Number,
	longitude	: Number,
	latitude	: Number,
	href	: String,
	modified : Date,
	created : Date,
	imageUrl	: String,
	streetview	: String,
	resType: String,
	inspections: [Inspection],
	total_violations : Number,
	total_inspections : Number
});


mongoose.model('places', Places);

module.exports = mongoose.model('places');