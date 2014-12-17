var cheerio = require('cheerio'),
	fs    = require('fs');

var page_directory = 'pages/';
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
	// console.log($('.s-result-item').length);
    // console.log('works');
    $('.s-result-item').each(function(){
		//console.log($(this).data('asin'));
		fs.appendFile(asin_file, $(this).data('asin') + "\n", function(err) {
		    if(err) {
		        console.log(err);
		    }
		});
	});
}
