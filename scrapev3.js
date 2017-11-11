//requesting node??
var request = require('request');
//loading cheerio
var cheerio = require('cheerio');

//loading async
var async = require('async');

/*requesting website, if there's no error then creating a variable "$" and passing elements through cheerio to pull out information */
var test =[];
request('http://9300realty.com/index.cfm?page=allRentals', function (error, response, html) {
  if (!error && response.statusCode == 200) {
 
    var $ = cheerio.load(html);
	   $('.dspListings2Elements').each(function(i, element){

	   	//going to the <b> and then <a> tags within dspListings2Elements
	   	var address = $(element).find('b a');

	   	//taking the info from the <a> tag and assigning them as properties to the "listngs" variable
	   	var listing = {
	   		url: 'http://www.9300realty.com/'+address.attr('href'),
	   		street: address.text()
	   	}
	
	//taking the properties from each listing and putting them into an array defined at the    	
	   	
	   	test.push(listing);

	   	});
	   async.map(test, myfunc, doneFunc) 

	}
  		else {
  		console.log(err)
  	}
});

	   //async.map passes an array, a function, then callback

// I should rename this funtion to something more descriptive
var myfunc = (item, cb) => {
	console.log(item);
	request(item.url, (err, response, body) => {   	
  		if (!err && response.statusCode == 200) {
			var $ = cheerio.load(body);
	   		$('.mainImage').each(function(i, element){
	   			console.log(i);
	   		 	var imgID = $(element).find('img');
	   		 	var img = imgID.attr('src');

	   			//test.data = body;
	   			console.log (img);
	   			item.img = img;
	   		})
		   	return cb(null, item);
		}
		else {
			console.log(err)
		}
	}); 		
};

var doneFunc = (err, results) => {
	console.log(results);
	// console.log (test.img);
	console.log('help me') 
};



	 

