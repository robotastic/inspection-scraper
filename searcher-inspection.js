var Searcher = require('./searcher');
var jsdom = require('jsdom');

var headers = {
			Accept: "application/x-www-form-urlencoded",
			'Content-Type': "application/x-www-form-urlencoded"};

var searcher = new Searcher({
	host:'washington.dc.gegov.com',
	path:'/webadmin/dhd_431/lib/mod/inspection/paper/_paper_food_inspection_report.cfm',
	fields: '',
	method: 'GET',
	headers: headers
});
/*
var searcher = new Searcher({
	host:'localhost',
	path:'/other.html',
	fields: '',
	method: 'GET',
	headers: headers
});
*/


function cleanInspectionType(text)
{
	
 switch(text)
 {
 	case "New":	
 	case "Preop":
 	case "new":
 	case "NEW":
 	case "New License":
 	case "Initial":
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
 	
 	case "Routine":
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
 	//console.log("Inspection Type Not Found: " + text);
	return text;
}


module.exports = searcher;
var document = jsdom.jsdom('<html><body>'); 
var window = document.createWindow();
jsdom.jQueryify(window, 'http://code.jquery.com/jquery-1.7.1.min.js', function() {});
	


function ProcessRow(obj, index)
{
var item  = obj.eq(index+1);
if (item.css('color') == '#CC0000')
{
	var violation={};
	violation.num = parseInt(obj.eq(index+4).text());
	violation.description = obj.eq(index+5).text();
	violation.note = "";
	item = obj.eq(index+6).find(".checkbox");
	if (item.css("background-color") == "#000000")
	{
		violation.note += "Corrected on site";
	}
	
	item = obj.eq(index+7).find(".checkbox");
	if (item.css("background-color") == "#000000")
	{
		violation.note += " Repeat Violation";
	}

	return violation;
}	
return false;
}

searcher.parseHTML = function(resultData, responseObj) {
	var self = this;

	//window = jsdom.jsdom(resultData).createWindow();
	//jsdom.jQueryify(window, 'http://localhost:3000/javascripts/jquery-1.5.2.js', function() {
	
		document.innerHTML = resultData; 
		
		var today = new Date();
		responseObj.modified = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		responseObj.created = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		
	

		var header = window.$('table[class="pt8 times"] td > span');
		responseObj.name = header.eq(0).text().substring(1);
		responseObj.address = header.eq(1).text().substring(1) + header.eq(2).text();
		responseObj.phone = header.eq(3).text().substring(1);
		responseObj.email = header.eq(5).text();
		responseObj.date = new Date(header.eq(8).text(),header.eq(6).text() -1 ,header.eq(7).text());
		responseObj.license_holder = header.eq(15).text().substring(1);
		responseObj.license_num = header.eq(16).text().substring(1);
		responseObj.license_start = new Date(header.eq(19).text(),header.eq(17).text() -1 , header.eq(18).text());
		responseObj.license_end = new Date(parseInt(header.eq(22).text()), header.eq(20).text()-1 ,parseInt(header.eq(21).text()));
		responseObj.inspection_type = cleanInspectionType(header.eq(23).text());
		responseObj.permit_type = header.eq(24).text().substring(1);
				
		
		var risk = header.eq(25).find(".checkboxRed");
		for (var i=0; i < 5; i++)
		{
			if (risk.eq(i).css("background-color") == "#FF0000")
			{
				responseObj.risk_category = i+1;
			}
		}

		responseObj.trash = header.eq(29).text().substring(1);
		responseObj.grease = header.eq(30).text().substring(1);
		responseObj.pest = header.eq(31).text().substring(1);
		
		header = window.$('table[class="pt8 times"] td');
		responseObj.critical_violations = isNaN(parseInt(header.eq(13).text())) ? 0 : parseInt(header.eq(13).text());
		responseObj.cv_cos = isNaN(parseInt(header.eq(15).text())) ? 0 : parseInt(header.eq(15).text());
		responseObj.cv_repeat = isNaN(parseInt(header.eq(17).text())) ? 0 : parseInt(header.eq(17).text());
		responseObj.noncritical_violations = isNaN(parseInt(header.eq(19).text())) ? 0 : parseInt(header.eq(19).text());
		responseObj.nv_cos = isNaN(parseInt(header.eq(21).text())) ? 0 : parseInt(header.eq(21).text());
		responseObj.nv_repeat = isNaN(parseInt(header.eq(23).text())) ? 0 : parseInt(header.eq(23).text());
		responseObj.total_violations = parseInt(responseObj.critical_violations + responseObj.noncritical_violations);
		responseObj.comments = window.$('table[class="t2 l2 r2"] td[colspan="8"]').text().replace(/\t+/g, "").replace(/<b>Inspector Comments:<\/b>/,'');
		if (responseObj.comments.search(/suspension/i)!=-1)
		{
			responseObj.suspension = true;
		}
					//console.log(responseObj.suspension);
		/*each(function(index){
			var item  = window.$(this);
			console.log(index + ": " + item.text());
			
			
			//self.onItem(responseObj);
			
		});*/




		var leftCol = window.$('table[class="pt8"] td');
		

		var cells=[7,18,26,37,45,56,64,72,83,91,99,107,118,126,134,145,153,161,169,177,185,193,204,215,226];
		var violations = new Array();
		for (var i=0; i < cells.length; i++)
		{
			var violation = ProcessRow(leftCol, cells[i]);
			if (violation)
			{
				violations.push(violation);
			}
		}
			
		var rightCol = window.$('table[class="pt8 vioHeight"] td');
		
		cells=[7,15,23,34,42,50,58,69,80,88,96,104,112,123,131,139,147,158,166,174,185,193,201,209,217,225,233];
		
		for (var i=0; i < cells.length; i++)
		{
			var violation = ProcessRow(rightCol, cells[i]);
			if (violation)
			{
				violations.push(violation);
			}
		}
		responseObj.violations = violations;



		var bottom = window.$('table[class="times fs_10px"] td');
		var count=3;
		var observations = new Array();

		while (count < bottom.length)
		{
			var observation = {};
			var pattern = /\s*(.*)\s*(.*)\s*/
			var matches = bottom.eq(count).text().match(pattern);
			observation.observation = matches[1] + matches[2];
			observation.code_num = bottom.eq(count+1).text();
			pattern = /\s*(.*)\s*/
			matches = bottom.eq(count+2).text().match(pattern);
			observation.code = matches[1];

			if (observation.observation.length > 0) {
				observations.push(observation);
			}
			count = count +3;
		}

		responseObj.observations = observations;
		
		self.onItem(responseObj);
		//window.close();
		//self.onComplete({searcher: self});
	
	//});
}