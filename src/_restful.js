var pathToRegexp = require('path-to-regexp');
var _ = require('lodash');
var Require = require('./_require');
var Promise = require("promise");
var logger = require("log4js").getLogger("domain");
var Promise = require("promise");
var Convinience = require("./_convenience");
var shortid = require('shortid');
var moment = require("moment")
var RestFul = [];

// ETAG
//
//
//

global.__wires_etags__ = global.__wires_etags__ || {};

var ETagMemoryStorage = {
   generate: function() {
      return shortid.generate();
   },
   update: function(key, tag) {
      return new Promise(function(resolve, reject) {
         global.__wires_etags__[key] = tag;
         return resolve({
            key: tag
         });
      });
   },
   status: function(key, tag) {
      return new Promise(function(resolve, reject) {
         return resolve({
            modified: global.__wires_etags__[key] === undefined ? true : global.__wires_etags__[key] !== tag,
            current: global.__wires_etags__[key]
         });
      })
   }
}
var getETagStorageProvider = function() {
   return new Promise(function(resolve, reject) {
      if (Require.isServiceRegistered('ETagCustomStorage')) {
         return Require.require(function(ETagCustomStorage) {
            return resolve(_.assignIn(ETagCustomStorage, ETagMemoryStorage));
         });
      }
      return resolve(ETagMemoryStorage);
   });
}

var eTagProvider = {
   generate: function(key) {
      return getETagStorageProvider().then(function(provider) {
         var tag = provider.generate();
         return provider.update(key, tag);
      });
   },
   status: function(key, tag) {
      var provider;
      return getETagStorageProvider().then(function(_provider) {
         provider = _provider;
         return provider.status(key, tag);
      });
   }
}

Require.service('$eTag', function() {
   return eTagProvider;
});

var getResourceCandidate = function(resources, startIndex, url) {

   for (var i = startIndex; i < resources.length; i++) {
      var item = resources[i];
      var keys = [];
      var re = pathToRegexp(item.path, keys);
      params = re.exec(url);
      if (params) {
         return {
            params: params,
            keys: keys,
            handler: item.handler,
            nextIndex: i + 1
         };
      }
   }
};

// Register local services
// Will be available only on rest service construct
var restLocalServices = function(info, params, req, res) {
   var services = {
      $req: req,
      $res: res,
      $params: params,
      // Next function tries to get next
      $next: function() {
         var resources = RestFul;
         var data = getResourceCandidate(resources, info.nextIndex, req.path);
         if (data) {
            return callCurrentResource(data, req, res);
         }
      }
   };
   // Helper to validate required arguments
   // Helper to validate required arguments
   var required = function() {
      var err;
      var self = this;
      _.each(arguments, function(item) {
         if (_.isString(item)) {
            if (!self[item]) {
               err = {
                  status: 400,
                  message: item + " is required"
               };
               return false;
            }
         }
         // If it's a dictionary with options
         if (_.isPlainObject(item)) {
            _.each(item, function(funcValidate, k) {
               // Assume k - is query's argument
               // v should be a function
               if (_.isFunction(funcValidate) && _.isString(k)) {
                  self[k] = funcValidate(self[k]);
               }
            });
         }
      });
      if (err) {
         throw err;
      }
   };
   var __get = function(opt, defaultValue) {
      var s = opt.split("@");
      var name = s[0];
      var p = s[1];

      var isRequired = false;
      var intRequested = false;

      var xpathSplit = name.split('.');
      var value;

      var spitError = function(code, message) {
         throw {
            status: code || 400,
            message: message,
            validation: true
         };
      }

      if (xpathSplit.length > 1) {
         value = this[xpathSplit[0]];

         if (_.isPlainObject(value)) {
            var valueValid = true;
            for (var i = 1; i < xpathSplit.length; i++) {
               if (valueValid === true) {
                  var x = xpathSplit[i];
                  if (value !== undefined) {
                     value = value[x];
                  } else {
                     valueValid = false
                  }
               }
            }
         } else {
            value = undefined;
         }

      } else {
         value = this[name];
      }

      var params = {};
      if (p !== undefined) {
         params = Convinience.parse(p, {
            cache: true,
            dict: true
         });
      };

      if (params.required && (value === undefined || value === "")) {
         spitError(400, params.required.attrs[0] || (name + " is required"))
      }

      if (params.bool) {

         if (value === undefined) {
            return false;
         }
         value = value.toString();

         if (value === "1" || value === "true") {
            return true;
         }
         return false;
      }
      if (params.min) {
         var minSymols = (params.min.attrs[0] * 1 || 0);

         if (value === undefined || value.toString().length < minSymols) {
            var eMessage = params.min.attrs[1] || "Expected to have at least " + minSymols + " in " + name;
            spitError(400, eMessage)
         }
      }

      if (params.max) {
         var maxSymbols = (params.max.attrs[0] * 1 || 255);
         if (value === undefined || value.toString().length > maxSymbols) {
            var eMessage = params.max.attrs[1] || "Expected to have not more than " + maxSymbols + " in " + name;
            spitError(400, eMessage);
         }
      }
      // momentjs
      if (params.moment) {
         var format = params.moment.attrs[0];
         var eMessage = params.moment.attrs[1] || "Invalid moment format.";
         if (value !== undefined) {

            try {
               return moment(value, format);
            } catch (e) {
               spitError(400, eMessage);
            }
         } else {
            spitError(400, eMessage);
         }
      }

      if (params.email) {
         if (value !== undefined) {
            var eMessage = params.email.attrs[0] || "Email is in wrong format";
            var re =
               /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(value)) {
               spitError(400, eMessage);
            }
         }
      }

      if (params.phone) {
         var validateTelephoneRegEx =
            /(00|\+)(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{3,14}$/;
         if (!validateTelephoneRegEx.test(value)) {
            var eMessage = params.phone.attrs[0] || "Phone is in wrong format";
            spitError(400, eMessage);
         }
      }

      // Integer validation
      if (params.int) {
         if (value !== undefined) {
            var eMessage = params.int.attrs[0] || (name + " is in wrong format (int required)");
            value = value.toString();
            if (!value.match(/^\d+$/)) {
               spitError(400, eMessage);
            }
            value = value * 1;
         }
      }

      if (params.date) {
         if (value !== undefined) {
            var eMessage = params.date.attrs[0] || (name + " is in wrong format");
            value = value.toString();
            try {
               value = new Date(value)
            } catch (e) {
               spitError(400, eMessage);
            }
         }
      }

      if (_.isFunction(defaultValue)) {
         return defaultValue(value)
      }
      return value !== undefined ? value : defaultValue;
   }
   services.$jsonp = function(cbname) {
      req.__jsonp_callback__ = cbname || "callback";
   };

   // Body
   services.$body = {
      require: required.bind(req.body),
      attrs: req.body,
      get: __get.bind(req.body),
      getAttributes: function() {
         return req.body;
      }
   };

   services.$cors = function(domains) {
      res.header("Access-Control-Allow-Origin", domains || "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   };

   // Query
   services.$query = {
      require: required.bind(req.query),
      attrs: req.query,
      get: __get.bind(req.query),
      getAttributes: function() {
         return req.query;
      }
   };
   // Assertion codes
   services.$assert = {
      bad_request: function(message) {
         throw {
            status: 400,
            message: message || "Bad request"
         };
      },
      handle: function(message, code) {
         throw {
            status: code || 400,
            handler: message || "errr.bad_request"
         };
      },
      validation: function(message) {
         throw {
            status: code || 400,
            validation: true,
            message: message || "errr.bad_request"
         };
      },
      unauthorized: function(message) {
         throw {
            status: 401,
            message: message || "Unauthorized"
         };
      },
      not_found: function(message) {
         throw {
            status: 404,
            message: message || "Not Found"
         };
      }
   };
   return services;
};

var getAssertHandler = function(_locals) {
   return new Promise(function(resolve, reject) {
      if (Require.isServiceRegistered("WiresAssertHandler")) {
         return Require.require('WiresAssertHandler', _locals, function(WiresAssertHandler) {
            return resolve(WiresAssertHandler);
         });
      }
      return resolve();
   })
}
var callCurrentResource = function(info, req, res) {

   // Extract params
   var mergedParams = {};
   var params = info.params;
   var handler = info.handler;

   _.each(info.keys, function(data, index) {
      var i = index + 1;
      if (params[i] !== null && params[i] !== undefined) {
         var parameterValue = params[i];
         if (parameterValue.match(/^\d{1,4}$/)) {
            parameterValue = parseInt(parameterValue);
         }
         mergedParams[data.name] = parameterValue;
      }
   });

   // Define method name
   var method = req.method.toLowerCase();

   // check for cors option request
   if (method === "options" && handler.cors === true) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      return res.send({});
   }
   // setting cors headers for any other method
   if (handler.cors) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   }

   // Allow to define free style method for access
   if (mergedParams.action) {
      method = mergedParams.action;
   }

   // Define parse options
   var parseOptions;

   if (_.isPlainObject(handler)) {
      if (handler[method]) {
         parseOptions = {
            source: handler[method],
            target: handler[method],
            instance: handler
         };
      }
   }

   if (_.isFunction(handler)) {
      parseOptions = handler;
   }

   // If there is nothing to execute
   if (!parseOptions) {
      return res.status(501).send({
         error: 501,
         message: "Not implemented"
      });
   }

   var requireAndCallDestination = function() {
      Require.require(parseOptions, restLocalServices(info, mergedParams, req, res)).then(function(result) {
         if (result !== undefined) {
            if (req.__jsonp_callback__) {
               var jsname;
               if ((jsname = req.query[req.__jsonp_callback__])) {

                  if (jsname.match(/^[a-z]+/gmi)) {
                     if (_.isPlainObject(result) || _.isArray(result)) {
                        res.setHeader('content-type', 'application/javascript');
                        var str = jsname + "(" + JSON.stringify(result) + ")";
                        return res.send(str);
                     }
                  }
               }
            }
            return res.send(result);
         }
      }).catch(function(e) {
         var err = {
            status: 500,
            message: "Error"
         };

         logger.fatal(e.stack || e);
         // If we have a direct error
         if (e.stack) {
            return res.status(500).send({
               status: 500,
               message: "Server Error"
            });
         }

         if (_.isObject(e)) {
            var status = e.status || 500;
            e.message = e.message || "Server Error";
            return getAssertHandler(restLocalServices(info, mergedParams, req, res)).then(function(
               assertHandler) {
               if (assertHandler) {
                  return assertHandler(e);
               }
               return e;
            }).then(function(result) {
               return res.status(status).send(result !== undefined ? result : err);
            }).catch(function(e) {
               logger.fatal(e.stack || e);
               return res.status(500).send({
                  status: 500,
                  message: "Server Error"
               });
            });
         }
         res.status(err.status).send(err);
      });
   };

   if (handler.eTag && method === 'get') {
      var tagName = handler.eTag;
      var tag = req.headers['if-none-match'];
      var ps = _.merge(req.query, mergedParams);
      for (var k in ps) {
         var v = ps[k];
         if (v !== undefined) {
            tagName = tagName.split('$' + k).join(v);
         }
      }
      return eTagProvider.status(tagName, tag).then(function(status) {

         if (status.modified === true) {
            if (status.current) {
               res.setHeader('ETag', status.current);
            }
            return requireAndCallDestination();
         } else {

            if (status.current) {
               res.setHeader('ETag', status.current);
            }
            return res.status(304).send('');
         }
      });
   } else {
      return requireAndCallDestination();
   }
};
var express = function(req, res, next) {

   var resources = RestFul;
   var data = getResourceCandidate(resources, 0, req.path);
   if (!data) {
      return next();
   }

   return callCurrentResource(data, req, res);
};

var Path = function() {
   var handlers = [];
   var path;
   _.each(arguments, function(item) {
      if (!path) {
         path = item;
      } else {
         handlers.push(item);
      }
   });
   _.each(handlers, function(handler) {
      RestFul.push({
         path: path,
         handler: handler
      });
   });
};

module.exports = {
   express: function() {
      return express;
   },
   path: Path
};
