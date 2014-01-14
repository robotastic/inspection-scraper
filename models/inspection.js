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

var Violation = new Schema({ 
	num: Number,
	description: String,
	note: String });

var Observation = new Schema({ 
	observation: String,
	code_num: String,
	code: String });


var Inspection = new Schema({ 
	name: String,
	address: String,
	phone: String,
	email: String,
	date: Date,
	modified : Date,
	permit_id: Number,
	inspection_id: Number,
	license_holder: String,
	license_num: String,
	license_start: Date,
	license_end: Date,
	inspection_type: String,
	permit_type: String,
	risk_category: Number,
	trash: String,
	grease: String,
	pest: String,
	critical_violations: Number,
	cv_cos: Number,
	cv_repeat: Number,
	noncritical_violations: Number,
	nv_cos: Number,
	nv_repeat: Number,
	total_violations: Number,
	violations: [Violation],
	observations: [Observation],
	suspension: Boolean
});



mongoose.model('inspection', Inspection);

module.exports = mongoose.model('inspection');