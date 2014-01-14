var Searcher = require('./searcher');
var jsdom = require('jsdom');
var sys = require('sys');
var data = {a:'Inspections',
		inputEstabName:'7-eleven',
		inputPermitType:'ANY',
		inputInspType:'ANY',
		inputWard:'Ward 7',
		inputQuad:'ANY',
		btnSearch:'Search'};
var fields = 'a=Inspections&inputEstabName=&inputPermitType=ANY&inputInspType=ANY&inputWard=ANY&inputQuad=ANY&btnSearch=Search';//JSON.stringify(data,'&','=');
var headers = {'Content-Length': fields.length, 
			Accept: "application/x-www-form-urlencoded",
			'Content-Type': "application/x-www-form-urlencoded"};

var searcher = new Searcher({
	uri:'http://washington.dc.gegov.com/webadmin/dhd_431/web/index.cfm',
	host:'washington.dc.gegov.com',
	path:'/webadmin/dhd_431/web/index.cfm',
	fields: fields,
	headers: headers
});


function cleanLicenseType(licenseType)
{
 switch(licenseType)
 {
 	case "New":	
 	case "Preop":
 	case "new":
 	case "NEW":
 	case "New License":
 		return "Preoperational";
 	break;
 	
 	case "follow up":
 	case "Complaint (Follow-up)":
 	case "5-Day Extension Follow-up":
 	case "follow-up":
 	case "Preoperational / Follow-up":
 	case "Preoperational - Follow-up":
 	case "preoperational":
 		return "Follow-up";
 	break;
 	
 	case "routine":
 		return "Routine";
 	break;
 	
 	case "":
 	case "Sweep":
 	case "0":
 	case  "Supervisor Reviewed":
 	case "joint inspection with Fire Department":
 		return "Other";
 	break;
 	
 	case "Complaint / License Renewal":
 		return "Complaint";
 	break;
 	
 	case "license renewal":
 	case "Renewal":
 	case "License renewal":
 	case "renewal":
 	case "LICENSE RENEWAL":
 	case "License Rene":
 	case "LIC. RENEWAL":
 	case "Lic renewal":
 	case "License Renewa":
 	case "RENEWAL":
 	case "pre-operational/license renewal":
 	case "LICENSE RENWAL":
 	case "License Reneal":
 	case "lICENSE RENWAL":
 		return "License Renewal";
 	break;
 	
 	case "Follow-up / License Transfer":
 	case "License transfer":
 	case "License":
 	case "lICENSE TRANSFER":
 	case "Out of Business":
 	case "Change of ownership":
 	case "change ownership":
 	case "License Transfer / Follow-up":
 	case "Change of Ownership":
 	case "Ownership Change":
 	case "license transfer":
 	case "ownership change":
 	case "change of ownership":
 	case "NEW OWNER":
 		return "License Transfer";
 	break;
 	
 	case "Restoration":
 	case "Fire":
 	case "License restoration":
 	case "Lic restoration":
 	case "RESTORATION":
 	case "restoration":
 	case "Renovation":
 	case "License Restoration / License Renewal":
 		return "License Restoration";
 	break;
 }
	return "Unknown";
}



//'a=Inspections&inputEstabName=7-eleven&inputPermitType=ANY&inputInspType=ANY&inputWard=Ward%207&inputQuad=ANY&btnSearch=Search'	
module.exports = searcher;
var document = jsdom.jsdom('<html><body>'); 
var window = document.createWindow();
jsdom.jQueryify(window, 'http://code.jquery.com/jquery-1.7.1.min.js', function() {});
	
searcher.parseHTML = function(resultData, object, callback) {
	var self = this;
	var places = new Array();
	var count = 1;
	//window = jsdom.jsdom(resultData).createWindow();
				// load jquery with DOM window and call the parser!

	
	 document.innerHTML = resultData; 
	 //console.log(resultData);
	 //var $ = window.$; 
	//jsdom.jQueryify(window, 'http://localhost:3000/javascripts/jquery-1.5.2.js', function() {
		window.$('div[id="divInspectionSearchResults"] > ul > li').each(function(){
			count++;	
			var responseObj = {};
	
			try {
			
				var today = new Date();
				responseObj.modified = new Date(today.getFullYear(), today.getMonth(), today.getDate());
				responseObj.created = new Date(today.getFullYear(), today.getMonth(), today.getDate());
				
				var item  = window.$(this);
				if ((item.find('h3').length > 0) && (item.find('h3').text().length > 0))
				{
					var name = item.find('h3').text();
					var query = item.find('h3 > a').attr('href');
					var pattern = /.*permitID=(\d*)/
					var matches = query.match(pattern);
					var permit_id = matches[1];
					//console.log("Name: " + name + " Permit ID: " + permit_id);
					var href = "http://washington.dc.gegov.com/webadmin/dhd_431/web/" + query;
					var body = item.clone()
			            .children()
			            .remove()
			            .end()
			            .html();
					pattern = /[\s]*(.*)[\s]*Ward:[Ward ]*([0-9]*)[\s]*\|[\s]*Quad:[\s]*([NW|SW|NE|SE]*)[\s]*[\s]*Type:[\s]*([\w ]*)/
					matches = body.match(pattern);
					
					var address = matches[1];
					var ward = isNaN(parseInt(matches[2])) ? 0 : parseInt(matches[2]);
					var permit_type = matches[4];
					
					var inspections = new Array();
					
					window.$('div[id="divInspectionSearchResultsListing"] > ul > li', item).each(function(){
						var inspectionReport = window.$(this);
						var inspection = {};
						
						pattern = /\s*(.+):\s(\w+),\s(\w+)\s(\d+),\s(\d+)/
						matches = inspectionReport.text().match(pattern);
						inspection.inspection_type = matches[1]; 
						inspection.weekday = matches[2];
						inspection.month = matches[3];
						inspection.day = parseInt(matches[4]);
						inspection.year = parseInt(matches[5]);
						inspection.date = matches[3] + ' ' + matches[4] + ', ' + matches[5];//new Date(matches[5], matches[3] ,matches[4]);  //matches[3] + ' ' + matches[4] + ', ' + matches[5];
		
						var report_type = inspectionReport.clone()
			            .children()
			            .remove()
			            .end()
			            .text();
		
						pattern = /\s*\((\w+)\)\s*/
						matches = report_type.match(pattern);
						inspection.report_type = matches[1];
						if (matches[1] == 'PDF')
						{
							inspection.query = inspectionReport.find('a').attr('href').substring(1);
							inspection.href = "http://washington.dc.gegov.com/webadmin/dhd_431/web/?" + inspection.query;
							pattern = /.*pdfFileID=(\d*)/
							inspection.inspection_id = parseInt(inspection.query.match(pattern)[1]);
						}
						else
						{
							var temp = inspectionReport.find('a').attr('href');
							inspection.query = temp.substring(temp.indexOf('?') + 1); 
							inspection.href = "http://washington.dc.gegov.com/webadmin/dhd_431/lib/mod/inspection/paper/_paper_food_inspection_report.cfm?" + inspection.query;
							pattern = /inspectionID=(\d*).*/
							inspection.inspection_id = parseInt(inspection.query.match(pattern)[1]);
						}
						
						inspections.push(inspection);
					});
		
		
					responseObj.name = name;
					responseObj.href = href;
					responseObj.address = address;
					responseObj.ward = ward;
					responseObj.permit_type = permit_type;
					responseObj.permit_id = permit_id;
					responseObj.inspections = inspections;
					places.push(responseObj);
				}					
			} catch (ex1) {
	            ex1.name = "Parsing List";
	            console.log("Error: " + ex1 + " length: "+ places.length + " Count: " + count + " Object: " + responseObj);
     		}
			
	
		});
		
	
		//self.onItem(responseObj);
		self.onItem(places);
	//	window.close();
	
	//});
		
}