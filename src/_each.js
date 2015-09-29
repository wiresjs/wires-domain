var Promise = require("promise");
var _ = require('lodash');

var isPromise = function(v) {
   return v && _.isFunction(v.then) && _.isFunction(v.catch);
};

// Smart Each iterator
// Understands returned promises
module.exports = function(argv, cb) {

   return new Promise(function(resolve, reject) {
      var callbacks = [];
      var results = [];
      var isObject = _.isPlainObject(argv);
      var index = -1;
      var iterate = function() {
         index++;
         if (index < _.size(argv)) {
            var key;
            var value;
            if (isObject) {
               key = _.keys(argv)[index];
               value = argv[key];
            } else {
               key = index;
               value = argv[index];
            }
            if (isPromise(value)) {
               value.then(function(data) {
                  results.push(data);
                  iterate();
               }).catch(reject);
            } else {
               var res = cb.call(cb, value, key);
               if (isPromise(res)) {
                  res.then(function(a) {
                     results.push(a);
                     iterate();
                  }).catch(reject);
               } else {
                  results.push(res);
                  iterate();
               }
            }
         } else {
            return resolve(results);
         }
      };
      iterate();
   });
};
