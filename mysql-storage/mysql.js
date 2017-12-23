(function(){
'use strict';  

  var mysql = require('mysql');
  var config = require('../config');
  var db_config = config.db;

  //var connection;
  var pool = mysql.createPool(db_config);

  var getConnection = function(callback) {
    pool.getConnection(function(err, connection) {
        callback(err, connection);
    });
  };

  module.exports = getConnection;
})();