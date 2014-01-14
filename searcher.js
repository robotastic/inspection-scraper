// External Modules
var sys = require('sys'),		// System
events = require('events'),	// EventEmitter
http = require('http'),
request = require('request');	// JsDom https://github.com/tmpvar/jsdom

var jQueryPath = 'http://code.jquery.com/jquery-1.7.1.min.js';
var headers = {
   	Accept: "application/x-www-form-urlencoded",
	'Content-Type': "application/x-www-form-urlencoded"
  };
var method = 'POST';
http.Agent.defaultMaxSockets = 20;

// Export searcher
module.exports = Searcher;


function Searcher(param) {
	if (param.headers) {
		this.headers = param.headers;
	} else {
		this.headers = headers;
	}

	if (param.method) {
		this.method = param.method;
	} else {
		this.method = method;
	}

	//this.uri = param.uri;
	this.fields = param.fields;
	this.host = param.host;
	this.path = param.path;
}

// Inherit from EventEmitter
Searcher.prototype = new process.EventEmitter;

Searcher.prototype.search = function(query, responseObj, finishedFunc) {
	var self = this;
	
	if (this.method == 'POST') {
		var options = {
			host: this.host,
			path: this.path,
			port: 80,
			method: this.method,
			headers : this.headers,
			body: this.fields + query
		};
	} else {
		var options = {
			host: this.host,
			path: this.path + '?' + query,
			port: 80,  //80,
			method: this.method,
			headers : this.headers,
			body: ''
		}
	}

	
//	console.log('\nREQUEST: ' + options.host + options.path + "\nBody: " + options.body);


try {

    var responseHdr = function(clientResponse) {
        try {
            var isSent = false;
            if (clientResponse){
                //clearTimeout(timeoutHdr);
                var resultData = '';
                var numOfTry = 0;
                var dataParseCallback = function(error, data) {
                    if (error) {
                        if (error.errType == 'timeout' && numOfTry < 1) {

                            clientResponse.resume();
                            numOfTry++;
                        } else {        
                            next(error);
                        }
                    } else {
                        next(null, data);
                    }
                };

                clientResponse.setEncoding('utf8');
                clientResponse.on('data', function (chunk) {
                    resultData += chunk;
                });

                clientResponse.on('end', function(chunk) {
                    if (chunk) {
                        console.error("Chunk has Data");
                    }

                    if (resultData) {
                        isSent = true;
						//console.log("\nRESPONSE: " + options.host + " SIZE: " + resultData.length + " MEM: " + process.memoryUsage().heapUsed);
						if (resultData.length < 1000)
						{
							console.log("DATA: " + resultData);
						}
						self.parseHTML(resultData,responseObj, finishedFunc);
			        } else {
                        console.error("userLogin - Client Response Data is undefined. ");
                    }
                });
            } else {
                clientRequest.abort();

                if (! isSent) { 

                    console.error('http client Timeout - userLogin');
                } else {

                    console.error('userLogin - Timeout is sent.' + myCounter);
                }
            }
        } catch (ex1) {
            ex1.name = "remote userLogin Inner Loop";
            console.log("Error: " + ex1);
        }
    };


    var clientRequest = http.request(options, responseHdr );

   /* var timeoutHdr = setTimeout(function() {
        clientRequest.emit('req-timeout');
    }, 1000000);

    //cfg.http_client_response_timeout
    clientRequest.on("req-timeout", responseHdr);
*/

    clientRequest.on('error', function(e) {

        //clearTimeout(timeoutHdr);
        console.error('Ok.. clientrequest error' + e);
    });
	if (this.method == 'POST') {
		//console.log(" - SENDING: " + options.body );
		clientRequest.write(options.body);
	}
    clientRequest.end();
} catch (ex) {
    console.log("Error: " + ex);
}

	
}

// Implemented in inhetired class
Searcher.prototype.getSearchUrl = function(query) {
	throw "getSearchUrl() is unimplemented!";
}
// Implemented in inhetired class
Searcher.prototype.parseHTML = function(window) {
	throw "parseForBook() is unimplemented!";
}
// Emits 'item' events when an item is found.
Searcher.prototype.onItem = function(item) {
	this.emit('item', item);
}
// Emits 'complete' event when searcher is done
Searcher.prototype.onComplete = function(searcher) {
	//console.log("Emitting complete event");
	this.emit('complete', searcher);
}
// Emit 'error' events
Searcher.prototype.onError = function(error) {
	console.log(sys.inspect(error));
	this.emit('error', error);
}

Searcher.prototype.toString = function() {
	return this.merchantName + "(" + this.merchantUrl + ")";
}