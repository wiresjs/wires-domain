var _ = require('lodash');

module.exports = {
   importify: function() {
      var self = this;
      return es.map(function(file, cb) {
         var fileContent = file.contents.toString()
         var content = self.srt(fileContent);
         file.contents = new Buffer(content);
         cb(null, file);
      });
   },
   header: function() {
      return '(function(isNode, domain) {\n';
   },
   footer: function() {
      return "\n})(typeof exports !== 'undefined', typeof exports !== 'undefined' ? require('wires-domain') : window.domain)";
   },
   str: function(input) {
      var fileContent = input;
      var moduleName;
      var injections = [];
      var lines = fileContent.split("\n");
      var newLines = [];
      for (var i in lines) {
         var line = lines[i];
         var imports = line.match(/^import\s?(.*)/ig);
         var moduleNameMatched = line.match(/module\s?([a-z0-9.]+)/i);
         if (moduleNameMatched) {
            moduleName = moduleNameMatched[1]
         }
         var _exports = line.match(/^(export\s*)(.*)/);
         if (_exports && moduleName) {
            line = line.replace(_exports[1], "return ");
         }
         if (imports) {

            for (var i in imports) {
               var impData = imports[i];

               // match "from" ******
               var fromMatch = impData.match(/import\s?(.+?(?=\sfrom))\s+from\s+([a-z0-9.]+)/i);
               if (fromMatch) {
                  //console.log(fromMatch)
                  var packageName = fromMatch[2];
                  var moduleRegexp = /([a-z0-9.]+)/img
                  var modules = _.map(_.filter(fromMatch[1].split(moduleRegexp), function(item) {
                     return item.match(moduleRegexp)
                  }), function(item) {
                     injections.push({
                        path: packageName + "." + item,
                        name: item
                     });
                  });
               } else {
                  var s = impData.match(/(\w+)/g);
                  if (s.length > 0) {
                     for (var i = 1; i < s.length; i++) {
                        injections.push({
                           path: s[i],
                           name: s[i]
                        })
                     }
                  }
               }
            }
         }
         if (!moduleNameMatched && !imports && line.length > 0) {
            newLines.push("\t\t" + line);
         }
      }
      if (moduleName) {
         var fn = ["\tdomain.module(" + '"' + moduleName + '",[']
         var annotations = _.map(injections, function(item) {
            return '"' + item.path + '"';
         });

         var moduleNames = _.map(injections, function(item) {
            return item.name;
         });
         fn.push(annotations.join(", "));
         fn.push("], function(");
         fn.push(moduleNames.join(", "))
         fn.push("){");
         newLines.splice(0, 0, fn.join(''))
         newLines.push("\t});")
      }
      return newLines.join('\n');
   }

}
