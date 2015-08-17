var Promise = require("promise");
var _ = require('lodash');
var async = require("async");

var isPromise = function(v) {
   return _.isFunction(v.then) && _.isFunction(v.catch);
};

// Smart Each iterator
// Understands returned promises
module.exports = function(arr, cb) {
   return new Promise(function(resolve, reject) {
      var promises = [];
      _.each(arr, function(v, k) {
         promises.push(function(callback) {

            if (!cb && isPromise(v)) {
               return v.then(function(r) {
                  callback(null, r);
               }).catch(function(e) {
                  callback(e, null);
               });
            }
            var cbRes;
            try {
               cbRes = cb(v, k);
            } catch (e) {
               return callback(e, null);
            }
            if (isPromise(cbRes)) {
               cbRes.then(function(r) {
                  callback(null, r);
               }).catch(function(e) {
                  callback(e);
               });
            } else {
               process.nextTick(function() {
                  callback(null, cbRes);
               });
            }
         });
      });
      async.series(promises, function(err, results) {
         if (err !== undefined) {
            return reject(err);
         } else {
            return resolve(results);
         }
      });
   });
};
