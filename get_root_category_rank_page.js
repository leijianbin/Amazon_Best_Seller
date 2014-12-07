var request = require('request'),
    cheerio = require('cheerio'),
    async   = require('async'),
    winston = require('winston'),
    fs    = require('fs');

var maximum_concurrency = 20;
var storage_directory = 'pages/';
var error_string = "500 Service Unavailable Error";
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: 'get_top_rank_page.log' })
    ]
  });
var root_category = 3375301;
var queue = async.queue(save_page, maximum_concurrency);
for (var i = 1; i <= 5; i++){
        queue.push({category_id: root_category, page_id: i }, function(msg){
          console.log(msg);
        })  
      }
queue.drain = function(){
        console.log("queue is drain"); 
      };
queue.empty = function(){
      console.log("queue is empty now");
    };

function save_page(page, callback){
    var options = {
      url: 'http://www.amazon.com/gp/bestsellers/sporting-goods/ref=zg_bs_sporting-goods_pg_'+ page.page_id + '?_encoding=UTF8&pg='+ page.page_id,
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
        queue.push(page, function(msg){
          console.log(msg);
        })
        callback("request category:" + page.category_id + " pageid:"+ page.page_id+ "... error happens!");
      }
      else{
        if (body.search(error_string) < 0){
          fs.writeFile(storage_directory + page.category_id + '-'+page.page_id, body.trim(), 'utf-8', function(){
            callback("page: "+ page.category_id + " pageid:"+ page.page_id+ " is saved!");
          });
        }else{
          queue.push(page, function(msg){
          console.log(msg);
        })
          callback("page: "+ page.category_id + " pageid:"+ page.page_id+ " error occur! refetch...")
        }
      }
    });
}