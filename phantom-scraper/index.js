/*jshint esversion: 6 */
// ^^ this is for the 'linters' (text editor plugin thing - ignore it)

// set module dependencies
const cheerio = require('cheerio');
const fs = require('fs');
// you must have phantom running on your computer for this to work
const phantom = require('phantom');
const request = require('request');

// setup some convenience variables
const baseUrl = 'http://9300realty.com';
const urlSourceUrl = baseUrl + '/index.cfm?page=allRentals';

// and this is the array that we'll fill with listings and their various
// parameters throughout the function
const listings = [];

// setup some functions to use in the main execution function (all the way at
// the bottom) and then call the execution function:

// get all the urls we'll be scraping
const getAllUrls = () => {
	// this is a "promise", which is just an alterntive to providing a
	// "callback function" as a function parameter. basically, it allow the 
	// program to do something after this function is finished running even
	// though the function is doing something "asynchronous". using this 
	// pattern avoids a common javascript programming pitfall: "callback hell"
	// this is why you will see 'then()' statements throughout the code
	return new Promise((resolve, reject) => {
		request(urlSourceUrl, function (error, response, html) {
			if (error || response.statusCode !== 200) return reject(error);
		    const $ = cheerio.load(html);
		    const urls = [];
			   
			$('.dspListings2Elements').each(function(i, element){
			   	const address = $(element).find('b a');
			   	const url = 'http://www.9300realty.com/' + address.attr('href');
			   	listings.push({
			   		url,
			   		street: address.text()
			   	});
			   	urls.push(url);
			});
			resolve(urls);
		});
	});
};

const getPhantomHTML = url => {
	return new Promise((resolve, reject) => {
		let phantomInstance;
		let sitePage;
		console.log('creating phantom page');
		phantom.create()
			.then(ph => {
				// save this as a function-scoped variable so we can end
				// the phantom instance later, outside of this function
				phantomInstance = ph;
				return ph.createPage();
			})
			.then(page => {
				// same reasoning as the phantomInstance right above this
				sitePage = page;
				return page.open(url);
			})
			.then(status => {
				console.log('phantom page created');
				return sitePage.property('content');
			})
			.then(content => {
				resolve(content);
				return sitePage.close();
			})
			.then(() => phantomInstance.exit())
			.catch(reject);
	});
};

const getImagesForListing = url => {
	// get html for url
	return new Promise((resolve, reject) => {
		getPhantomHTML(url)
			.then(html => {
				// console.log('got html: ', html);
				const $ = cheerio.load(html);
				const imageElement = $('.mainImage').find('#property_image');
				// console.log('image element: ', imageElement);
				const image = imageElement.attr('src');
	   		 	console.log('got image for listing: ', image);
	   		 	resolve([image]);
			})
			.catch(reject);
	});
};

const execute = (oneByOne) => {
	console.log('running phantom script');
	getAllUrls()
		.then(theUrls => {
			// let urls = theUrls.slice(0,4);
			let urls = theUrls;
			let allImages = [];

			function getImagesForAllUrls(urls) {
			  return urls.reduce((promise, url) => {
			    return promise
			      .then(result => {
			        console.log(`url: ${ url }`);
			        return getImagesForListing(url).then(images => {
						const listingIndex = listings.findIndex(listing => listing.url === url);
						listings[listingIndex].images = images;
			        	allImages.push(result);
			       	});
			      })
			      .catch(console.error);
			  }, Promise.resolve());
			}

			if (oneByOne) {
				getImagesForAllUrls(urls)
				  .then(() => console.log(`Listings is ${ listings }`));
			}
			else {
				// get images for each url & store as a promise for those images
				urls.forEach(url => {
					getImagesForListing(url)
						.then(images => {
							allImages.push(images);
							const listingIndex = listings.findIndex(listing => listing.url === url);
							listings[listingIndex].images = images;
							if (allImages.length === urls.length) {
								console.log('got all listings. there are ' + listings.length + ' of them');
								console.log('here are a few for example: ', listings.slice(0,5));
							}
							return listings;
						})
						.catch(err => console.log('err: ', err ));
				});
			}

		})
		.catch(console.error);
};

// execute(true); // one by one
// execute(false); // all at once

module.exports = {
	phantom: execute
};
