var logger = require("log4js").getLogger("domain");
var _ = require("lodash");
var Promise = require('promise');
var Class = require('wires-class');
var Promise = require("promise");
var domainEach = require("./_each.js");
var isPromise = function(v) {
   return _.isFunction(v.then) && _.isFunction(v.catch);
};

//Extract parameter names from a function
var getParamNames = function(func) {
   var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
   var ARGUMENT_NAMES = /([^\s,]+)/g;
   var fnStr = func.toString().replace(STRIP_COMMENTS, '');
   var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
   if (result === null)
      result = [];
   return result;
};

// Extracts arguments and defined target for the require function
var getInputArguments = function(args) {
   var out = {};
   out.localServices = {};
   if (args.length > 0) {
      out.source = args[0];
      out.target = args[0];
      if (_.isPlainObject(args[0])) {
         var opts = args[0];
         out.target = opts.target;
         out.source = opts.source;
         out.instance = opts.instance;
      }

      // call(func, callback)
      if (args.length > 1) {
         var argsDefined = _.isString(args[0]) || _.isArray(args[0]);
         if (argsDefined) {
            if (_.isArray(args[0])) {
               out.source = args[0];
            } else {
               out.source = _.isString(args[0]) ? [args[0]] : args[0];
            }
            if (_.isFunction(args[1])) {
               out.target = args[1];
            }
            if (_.isFunction(args[2])) {
               out.target = args[2];
            }
         } else {

            if (_.isFunction(args[1])) {
               out.callReady = args[1];
            }
            if (_.isPlainObject(args[1])) {
               out.localServices = args[1];
            }
         }
      }
      if (args.length === 3) {
         if (_.isPlainObject(args[1])) {
            out.localServices = args[1];
         }
         if (_.isFunction(args[2])) {
            out.callReady = args[2];
         }
      }
   }
   out.target = out.target || function() {};
   out.source = out.source ? out.source : out.target;
   out.callReady = out.callReady || function() {};
   return out;
};

// Register local services
// Will be available only on rest service construct

var Require = {
   // Factory constructor
   // Class is used for creating an instance with following resolution
   Factory: Class.extend({
      init: function() {},
   }, {
      __domain_factory__: true
   }),

   service: function() {
      this.register.apply(this, arguments);
   },
   register: function(name, arg1, arg2) {
      var localArgs = null;
      var target = arg1;
      if (_.isArray(arg1)) {
         localArgs = arg1;
         target = arg2;
      }
      global.__wires_services__ = global.__wires_services__ || {};
      global.__wires_services__[name] = {
         target: target,
         args: localArgs
      };
   },
   isServiceRegistered: function(name) {
      return global.__wires_services__ && global.__wires_services__[name] !== undefined;
   },
   requirePackage: function(name) {
      var _packageServices = {}
      var self = this;
      return domainEach(global.__wires_services__, function(service, serviceName) {
         var _package = serviceName.split(".")[0];

         if (_package === name) {
            return self.require([serviceName], function(serviceInstance) {
               _packageServices[serviceName] = serviceInstance
            })
         }
      }).then(function() {
         return _packageServices;
      });
   },
   promise: function(cb) {
      return new Promise(cb);
   },
   require: function() {
      var data = getInputArguments(arguments);

      var self = this;
      var localServices = data.localServices;
      var variables = _.isArray(data.source) ? data.source : getParamNames(data.source);

      var target = data.target;
      var callReady = data.callReady;
      var instance = data.instance;
      var globalServices = global.__wires_services__;

      var resultPromise = new Promise(function(resolve, reject) {
         var args = [];
         var avialableServices = _.merge(localServices, globalServices);

         for (var i in variables) {
            var v = variables[i];
            var variableName = variables[i];
            if (!avialableServices[variableName]) {
               logger.fatal("Error while injecting variable '" + variableName + "' into function \n" +
                  data.source.toString());
               return reject({
                  status: 500,
                  message: "Service with name '" + variableName + "' was not found "
               });
            }
            args.push(avialableServices[variableName]);
         }

         var results = [];
         return domainEach(args, function(item) {
            var argService = item.target;
            var requiredArgs = item.args;

            if (_.isFunction(argService)) {
               var promised;
               var currentArgs = [];
               if (requiredArgs) {
                  currentArgs = [requiredArgs, localServices, argService];
               } else {
                  currentArgs = [argService, localServices];
               }
               return self.require.apply(self, currentArgs).then(function(dest) {
                  if (dest && dest.__domain_factory__) {
                     var inst = new dest();
                     return self.require({
                        source: dest.prototype.init,
                        target: inst.init,
                        instance: inst
                     }, avialableServices).then(function() {
                        return inst;
                     });
                  }
                  return dest;
               });
            } else {
               return argService || item;
            }
         }).then(function(results) {
            return target.apply(instance || results, results);
         }).then(resolve).catch(reject);
      });
      return resultPromise;
   }
};

module.exports = Require;
