var Searcher = require('./searcher');
var jsdom = require('jsdom');
var sys = require('sys');


var fields = 'a=Inspections&inputEstabName=7-eleven&inputPermitType=ANY&inputInspType=ANY&inputWard=Ward%207&inputQuad=ANY&btnSearch=Search';//JSON.stringify(data,'&','=');
var headers = {'Content-Length': fields.length, 
			Accept: "application/x-www-form-urlencoded",
			'Content-Type': "application/x-www-form-urlencoded"};



var searcher = new Searcher({
	uri:'http://citizenatlas.dc.gov/newwebservices/locationverifier.asmx/findLocation',
	host: 'citizenatlas.dc.gov',
	path: '/newwebservices/locationverifier.asmx/findLocation',
	fields: ''	
});

module.exports = searcher;
var document = jsdom.jsdom('<html><body>'); 
var window = document.createWindow();
jsdom.jQueryify(window, 'http://code.jquery.com/jquery-1.7.1.min.js', function() {});


searcher.parseHTML = function(resultData, responseObj,finishedFunc) {
	var self = this;

	//window = jsdom.jsdom().createWindow();
    
	//jsdom.jQueryify(window, 'http://localhost:3000/javascripts/jquery-1.5.2.js', function() {
		//var doc = window.jQuery(resultData);
			document.innerHTML = resultData; 
			//console.log(resultData);
			
			var doc = window.$('NewDataSet');
			//console.log(sys.inspect(doc));
			responseObj.addressId = parseInt(doc.find('ADDRESS_ID').text());
			
			if (!isNaN(responseObj.addressId)) {
				responseObj.fullAddress = doc.find('FULLADDRESS').text();
				responseObj.addressNum = doc.find('ADDRNUM').text();
				responseObj.streetName = doc.find('STNAME').text();
				responseObj.streetType = doc.find('STREET_TYPE').text();
				responseObj.quadrant = doc.find('QUADRANT').text();
				responseObj.city = doc.find('CITY').text();
				responseObj.state = doc.find('STATE').text();
				//responseObj.ward = parseInt(doc.find('WARD').text());
				responseObj.zipcode = parseInt(doc.find('ZIPCODE').text());
				responseObj.latitude = parseFloat(doc.find('LATITUDE').text());
				responseObj.longitude = parseFloat(doc.find('LONGITUDE').text());
				responseObj.streetview = doc.find('STREETVIEWURL').text();
				responseObj.resType = doc.find('RES_TYPE').text();
				responseObj.imageUrl = doc.find('IMAGEURL').text() + '/' + doc.find('IMAGEDIR').text() + '/' + doc.find('IMAGENAME').text();
			}
		//self.onItem(responseObj,finishedFunc);
			finishedFunc(responseObj);
			//window.close();

		//self.onComplete({searcher: self});
	
	//});
	

}