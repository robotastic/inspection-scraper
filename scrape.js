var searcher = require('./searcher-place');
var mars = require('./searcher-mars');
var inspection = require('./searcher-inspection');
var sys = require('sys');
var Inspections = require('./models/inspection');
var Places = require('./models/place');

var config = require('./config.json');
var mongo = require('mongodb');
var BSON = mongo.BSONPure;
var Db = mongo.Db,
  Connection = require('mongodb').Connection,
  Server = require('mongodb').Server;
var host = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : 'localhost';
var port = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : Connection.DEFAULT_PORT;
var clean = new Db('cookography', new Server(host, port, {}));
var db;

clean.open(function(err, cleanDb) {
  db = cleanDb;
  cleanDb.authenticate(config.dbUser, config.dbPass, function() {});
});



var placeThings = 0;
var inspectionThings = 0;

var placesAdded = 0;
var inspectionsAdded = 0;
var placesUpdated = 0;

function testDone() {
	if ((placeThings == 0) && (inspectionThings == 0))
	{
			Inspections.db.close();
			Places.db.close();
			db.close();
			console.log("\nPlaces Added: " + placesAdded);
			console.log("Places Updated: " + placesUpdated);
			console.log("Inspections Added: " + inspectionsAdded);
	
	}

}

searcher.on('item', function(places){
	var ps = places.slice(0);
	console.log("Processing " + ps.length + " Places… \n");
	

	function findInspection(inspections, inspection)
	{
		for (var i=0; i < inspections.length; i++) {
			if (inspections[i].inspection_id == inspection.inspection_id)
			{
				return true; // The inspection was found inside of the array of inspections
			}
		}
		return false; // The inspection was not found inside of the array of inspections

	}

	function updatePlace(place, dbPlace)
	{
		if (place.inspections.length > dbPlace.inspections.length)
		{
			for (var i=0; i < place.inspections.length; i++) {
				if (!findInspection(dbPlace.inspections, place.inspections[i]))
				{
					console.log("PLACE >> Adding inspection: " + place.inspections[i].inspection_id + " To Place: " + place.permit_id);
					//dbPlace.inspections.unshift(place.inspections[i]);
					dbPlace.inspections.push(place.inspections[i]);
					if (place.inspections[i].report_type == 'HTML')		//Now lets go pull down the Report and add it to the DB
					{
						inspectionThings++; // add one to the list of things being processed
						var inspection_res = {};
						inspection_res.permit_id = place.permit_id;
						inspection_res.inspection_id = place.inspections[i].inspection_id;
						inspection.search(place.inspections[i].query, inspection_res);
					}
				}
			}
			dbPlace.save(function(err, user_Saved){
			    if(err){
			        throw err;
			        console.log(err);
			    }else{
			    		placesUpdated++;
			        console.log('\nPLACE ' + dbPlace.permit_id + ' Updated >> ' + dbPlace.name + '\n' + dbPlace.address);
			        //console.log("MEM: "+process.memoryUsage().heapUsed);			
			    }
			});	
			
		}
	}

	function processPlace() {
		var place = ps.splice(0,1)[0];
		
		if (typeof place != "undefined")
		{
				
			placeThings++; // increase the count of things being processed
			
			Places.find({'permit_id': place.permit_id},function(err,dbPlaces) {
			 if (err) { throw err; } 
			  else { 
				if (dbPlaces.length > 1)
				{
					console.log("!!\nOdd, there is more than one Place with permit_id: "+place.permit_id+"\n!!");
					processPlace();
					placeThings--; // done processing this item
					testDone();
				}
				else
				{
					if (dbPlaces.length == 1) // It is in the DB already
					{
						updatePlace(place, dbPlaces[0]);
						processPlace();
						placeThings--; // done processing this item
						testDone();
					}
					else
					{
						// it is not in the DB yet so we have to go get its locations from MARS
						mars.search('str='+place.address, place, processLocation);
					}
				}
			}
			});
		}
	}

	function processLocation(item){
	try {
		if (isNaN(item.addressId))
		{
			item.addressId = -1;
			console.log("\n !Invalid Address! ");
			
		}
		
				for (var i = 0; i < item.inspections.length; i++)
				{
					if (item.inspections[i].report_type == 'HTML')
					{
						inspectionThings++; // add one to the list of things being processed
						var inspection_res = {};
						inspection_res.permit_id = item.permit_id;
						inspection_res.inspection_id = item.inspections[i].inspection_id;
						inspection.search(item.inspections[i].query, inspection_res);
					}
				}


				var place = new Places(item);
				
				place.save(function(err, user_Saved){
			    if(err){
			        console.log("Error saving place: " + err);
			        throw err;
			    }else{
			    		placesAdded++;
			        console.log('\nPLACE ' + item.permit_id + ' Saved >> ' + item.name + '\n' + item.address);				
							//console.log("MEM: "+process.memoryUsage().heapUsed);
							processPlace(); //get the next location to check
							placeThings--; // done processing this item
							testDone();
			    }
				});	
		
		 } catch (ex1) {
		            ex1.name = "Mongoose Place Model Creation";
		            console.log("Error: " + ex1);
					console.log(sys.inspect(item));
		}


	}

	processPlace(); // start checking places

});





searcher.on('complete', function(searcher){
	console.log('\nPLACE processing should be complete\n');
});


inspection.on('item', function(item){
	//console.log('Item found >> ' + sys.inspect(item))
	
	var inspection = new Inspections(item);
	
	
	inspection.save(function(err, user_Saved){
    if(err){
        throw err;
        console.log(err);
    }else{
    	inspectionsAdded++;
			console.log('\ninspection Saved >> ' + inspection.name + "\n" + inspection.address)
			//console.log("MEM: "+process.memoryUsage().heapUsed);
			inspectionThings--;
			testDone();
    }
	
});
	
});

inspection.on('complete', function(searcher){
	//console.log('inspection Complete Event Recvd!');
	//Inspections.db.close();
});

/*
var inspection_res = {};
inspection_res.permit_id = 1543;
inspection_res.inspection_id = 102380;
inspection.search("inspectionID=102380&wguid=1367&wgunm=sysact&wgdmn=431", inspection_res);
*/

searcher.search(); // Start things going! They will they goto to the Event handler when complete.

