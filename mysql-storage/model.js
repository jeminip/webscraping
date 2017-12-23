(() => {
    "use strict";
    var connection = require( "./mysql.js" );
    const addProperty = property => {
        console.log('adding property! ', property);
        return new Promise(resolve => {
            console.log('connection established! property: ', property.url);
            connection((err, connection) => {
                var addPropQuery = 'INSERT INTO properties (street) VALUES ("' + property.street + '")';
                connection.query(addPropQuery, (err, results) => {
                    console.log('err w query: ', err);
                    console.log('results: ', results);
                    resolve(results);
                });
            });
        })
    }
    module.exports = { addProperty }
})();