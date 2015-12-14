var pathToRegexp = require('path-to-regexp');
var _ = require('lodash');
var Require = require('./_require');
var Promise = require("promise");
var logger = require("log4js").getLogger("domain");
var Promise = require("promise");
var Convinience = require("./_convenience");
var moment = require("moment")
var RestFul = [];

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
   var required = function() {
      var err;
      _.each(arguments, function(item) {
         if (_.isString(item)) {
            if (!this[item]) {
               return {
                  status: 400,
                  message: item + " is required"
               };
            }
         }
         // If it's a dictionary with options
         if (_.isPlainObject(item)) {
            _.each(item, function(funcValidate, k) {
               // Assume k - is query's argument
               // v should be a function
               if (_.isFunction(funcValidate) && _.isString(k)) {
                  this[k] = funcValidate(this[k]);
               }
            }, this);
         }
      }, this);

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
      if (xpathSplit.length > 1) {
         value = this[xpathSplit[0]];
         console.log(value)
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
         throw {
            status: 400,
            message: params.required.attrs[0] || (name + " is required")
         };
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
            throw {
               status: 400,
               message: eMessage
            };
         }
      }

      if (params.max) {
         var maxSymbols = (params.max.attrs[0] * 1 || 255);
         if (value === undefined || value.toString().length > maxSymbols) {
            var eMessage = params.max.attrs[1] || "Expected to have not more than " + maxSymbols + " in " + name;
            throw {
               status: 400,
               message: eMessage
            };
         }
      }
      // momentjs
      if (params.moment) {
         var format = (params.moment.attrs[0] || "MM-DD-YYYY");
         if (value !== undefined) {

            try {
               return moment(value, format);
            } catch (e) {
               throw {
                  status: 400,
                  message: "Invalid moment format. Expected (" + format + ")"
               };
            }
         } else {
            throw {
               status: 400,
               message: "Invalid moment format. Expected (" + format + ")"
            };
         }
      }

      // Integer validation
      if (params.int) {
         if (value !== undefined) {
            value = value.toString();
            if (!value.match(/^\d+$/)) {
               throw {
                  status: 400,
                  message: name + " is in wrong format (int required)"
               };
            }
            value = value * 1;
         }
      }
      if (_.isFunction(defaultValue)) {
         return defaultValue(value)
      }
      return value || defaultValue;
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
      if (_.isObject(e)) {
         err.status = e.status || 500;
         err.message = e.message || "Error";
         if (e.details) {
            err.details = e.details;
         }
      }
      res.status(err.status).send(err);
      logger.fatal(e.stack || e);
   });
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
