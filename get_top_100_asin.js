var cheerio = require('cheerio'),
	fs    = require('fs');

// var page_directory = 'pages/';
var page_directory = 'top100-pages/';
var asin_file = 'asin.txt';

fs.readdir(page_directory, function(err, files){
	// console.log(files[1]);
	// get_asin_from_file(files[1]);
	files.forEach(function(element){
		get_asin_from_file(element);
	});
});

function get_asin_from_file(filename){
	var content = fs.readFileSync(page_directory + filename, 'utf8');
	var $ = cheerio.load(content);

// http://www.amazon.com/Nalgene-Tritan-BPA-Free-Bottle-1-Quart/dp/B001NCDE84/ref=zg_bs_sporting-goods_21
    $('.zg_title a').each(function(){
    	var href_text = $(this).attr('href');
		// console.log(href_text);
		$asin = href_text.match(/dp\/(.+)\/ref/)[1]; //parse the asin from the url
		console.log($asin);
		fs.appendFile(asin_file, $asin + "\n", function(err) {
		    if(err) {
		        console.log(err);
		    }
		});
	});
}
