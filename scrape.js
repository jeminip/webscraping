var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var properties = [];
request('http://9300realty.com/index.cfm?page=allRentals', function (error, response, html) {
  if (!error && response.statusCode == 200) {
  	// console.log(html)
    var $ = cheerio.load(html);
	   $('.dspListings2Elements').each(function(i, element){

	   	var address = $(element).find('b a');

	   	var listing = {
	   		url: address.attr('href'),
	   		street: address.text()
	   	}

	   	//console.log(listing);
	   	properties.push(listing);

		});


	   //async.map(properties, (property, callback) => {
	   	//request(property.url, (err, response, body) => {
	   	//	property.data = body;
	   	//	return cb();street

	   //	});
	   //});

  	}
  	else {
  		console.log(err)
  	}
});