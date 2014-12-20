var request = require('request'),
cheerio = require('cheerio'),
async   = require('async'),
winston = require('winston'),
moment  = require('moment'),
fs    = require('fs');

var product_directory = 'products/';
var info_file = 'info.txt';
fs.writeFileSync(info_file, '', 'utf8');
// var current_date = moment('2014-11-28 09:00:00','YYYY-MM-DD HH:MM:SS');
var current_date = moment().format('YYYY-MM-DD HH:MM:SS');
var content_array = [];
var product_files = fs.readdirSync(product_directory);
// product_files = [product_files[0],product_files[1]];

product_files.forEach(function(element){
//	console.log(element);
	var asin = element.replace('page-','');
	var url = 'http://www.amazon.com/dp/' + asin;
	//console.log(url);
	var body = fs.readFileSync(product_directory + element,'utf8');
	var $ = cheerio.load(body);
	//check if ban by the amazon, <title dir="ltr">Robot Check</title>
	var robot_check = $('title').text();
	if(robot_check == "Robot Check")
	{
		console.log("Error, Robot Check");
		//warning 
	}
	else {	
		var title = $('#productTitle')? $('#productTitle').text().replace('\n',' '):'N/A';
		var review_text = $('#acrCustomerReviewText')?$('#acrCustomerReviewText').text().trim():'';
		var review_num = 0;
		if (review_text){
			review_num = review_text.match(/\d+,\d+|\d+/)[0];
			review_num = review_num.replace(',','');
		}
		var review_star = $('#acrPopover').length > 0 ? $('#acrPopover').attr('title'):0;
		if (review_star){
			review_star = review_star.match(/\d+.\d+|\d+/)[0];
		}
		var image_url = $('#landingImage').data('a-dynamic-image')? Object.keys($('#landingImage').data('a-dynamic-image'))[0]:'';
		var max_price, min_price;
		max_price = min_price = 0;
		var price = $('#priceblock_ourprice')?$('#priceblock_ourprice').text():'';
		var saleprice = $('#priceblock_saleprice')?$('#priceblock_saleprice').text():'';
		var dealprice = $('#priceblock_dealprice span')?$('#priceblock_dealprice span').first().text():'';
		if (price.length < 2){
			price = saleprice;
			if (price.length < 2){
				price = dealprice;
			}
		}
		if (price.length > 1){
			var price_tmp = price.replace(/[^0-9.-]/g,'');
			var price_array = price_tmp.split('-');
			if (price_array.length > 1){
				min_price = price_array[0];
				max_price = price_array[1];
			}else{
				min_price = max_price = price_array[0];
			}
		}
		var rank_div = $('#SalesRank');
		var rank = 'N/A';
		var category = '';
		if (rank_div){
			rank_div.children().remove();
			var rank_text = rank_div.text().trim();
			if (rank_text.indexOf('Sports') > 0){
				rank = rank_text.match(/\d+,\d+|\d+|\d+,\d+,\d+/)[0];
				rank = rank.replace(',','');
				category = 'Sports';
			} else {
				rank = 0;
				category = 'Others';
			}
	            // .match(/\d+,\d+|\d+/)[0];
	    }
	    var result = {
	        	asin: asin,
	        	url: url,
	        	title: title,
	        	image: image_url,
	        	review_text: review_text,
	        	review_num: review_num,
	        	review_star: review_star,
	        	price: price,
	        	min_price: min_price,
	        	max_price: max_price,
	        	rank: rank,
	        	category: category
        	};
		//console.log(result);
		//var current_date = moment().format('YYYY-MM-DD HH:MM:SS');
		//console.log(current_date);
		var data = asin + '\t' + url + '\t'+title + '\t' + image_url +'\t'+review_num + '\t'+review_star + '\t' + min_price + '\t' + max_price+ '\t'+rank +'\t'+category + '\t' + current_date + '\n';
		console.log(data);
		console.log("Fetch info sucess!");
		fs.writeFileSync(info_file, data, {flag:'a'});
	}
});



