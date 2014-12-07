var mysql      = require('mysql');

var config = {
	host: 'localhost',
	port: 8889,
	db: 'amazon', 
	table: 'info_test',
	user: 'root',
	password: 'root',
};

var connection = mysql.createConnection({
  host     : config.host,
  port 	   : config.port,
  user     : config.user,
  password : config.password,
  database : config.db
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
});
connection.query('TRUNCATE TABLE info_test;', function(err, result){
	console.log(result);
	connection.query("LOAD DATA LOCAL INFILE '/Users/yzhao/Documents/Projects/amazon/listpge/info.txt' INTO TABLE info_test LINES TERMINATED BY '\n' (asin , url, title , image_url, review_num , review_star ,min_price , max_price, rank , category , time_created);", function(err, result){
		if (err)throw err;
		console.log(result);
	});
});

// SELECT asin,url,title,image_url,time_created INTO OUTFILE '/Users/yzhao/Documents/Projects/amazon/listpge/detail.txt' FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' FROM info_test WHERE category='Sports' AND rank < 1100;
// connection.end();