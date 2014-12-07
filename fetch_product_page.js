var request = require('request'),
    cheerio = require('cheerio'),
    async   = require('async'),
    winston = require('winston'),
    fs    = require('fs');

var maximum_concurrency = 100;
var error_string = "500 Service Unavailable Error";
var asin_file = 'asin.txt';
var product_directory = 'products/';

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: 'fetch_product_page.log' })
    ]
  });

var queue = async.queue(save_page, maximum_concurrency);
queue.drain = function(){
        console.log("queue is drain"); 
   	};
queue.empty = function(){
      console.log("queue is empty now");
    };

var exists_files = fs.readdirSync(product_directory);
fs.readFile(asin_file, 'utf8',function(err, results){
  console.log(results);
	asin_array = results.split('\n');
	asin_array.forEach(function(element){
		if (element.length > 8 && exists_files.indexOf('page-'+element) < 1){
			queue.push(element, function(msg){
    			console.log(msg);
  			});
		}
	});
});

function save_page(page_id, callback){
    var options = {
      url: 'http://www.amazon.com/dp/' + page_id,
      method: 'GET',
      headers:{
              'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language':'zh-CN,zh;q=0.8,en-US;q=0.6,en;q=0.4',
              'Referer':'www.amazon.com',
              'Cache-Control':'max-age=0',
              'Host': 'www.amazon.com',
              'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/37.0.2062.120 Chrome/37.0.2062.120 Safari/537.36',
          },
    }
    request(options, function (err, response, body){
      if (err){
        logger.error(err);
        queue.push(page_id, function(msg){
    			console.log(msg);
  			})
        callback("request page " + page_id + "... error happens!");
      }
      else{
        if (body.search(error_string) < 0){
          fs.writeFile(product_directory + "page-"+page_id, body.trim(), 'utf-8', function(){
            callback("page: " + page_id +" is saved!");
          });
        }else{
          queue.push(page_id, function(msg){
    			console.log(msg);
  			})
          callback("page: " + page_id +" error occur! refetch...")
        }
      }
    });
}
