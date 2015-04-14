/*jslint node: true, nomen: true, indent: 2, vars: true, regexp: true */
var fs        = require('fs');
var UglifyJS  = require('uglify-js');

module.exports = {
  generateScript: function (apiKey, filePath, templatePath, callback) {
    var processedData = '';
    fs.readFile(templatePath, {encoding: 'utf-8'}, function (err, data) {
      if (err) {
        return callback(err, null);
      }
      // generate dev version with hardcoded project apiKey
      processedData = String(data).replace(/%%apiKey%%/g, apiKey);
      // uglify/minify
      // BOTTLENECK!
      processedData = UglifyJS.minify(processedData, {fromString: true});
      processedData = processedData.code;
      // if folder allready exists we are fine, but error will be thrown
      try {
        // BOTTLENECK!
        fs.mkdirSync(__dirname + '/../public/' + apiKey);
      } catch (fileErr) {
        if (fileErr.code !== 'EEXIST') {
          return callback(fileErr, null);
        }
      }
      // save && serve
      fs.writeFile(filePath, processedData, function (err) {
        if (err) {
          return callback(err, null);
        }

        return callback(null, filePath);
      });
    });
  },

  checkModification: function (apiKey, filePath, templatePath, callback) {
    var templateModTime, scriptModTime;
    var context = this;

    fs.stat(filePath, function (err, targetFileStat) {
      if (err) {
        // return reply(Boom.badImplementation(err));
        return callback(err, null);
      }
      fs.stat(templatePath, function (err, templateStat) {
        if (err) {
          // return reply(Boom.badImplementation(err));
          return callback(err, null);
        }

        templateModTime = templateStat.ctime.getTime();
        scriptModTime = targetFileStat.ctime.getTime();
        // compare date created with modification date of template
        // check this on real server!
        if (templateModTime > scriptModTime) {
          console.log('template newer! regenerate!');
          // if template is newer - regenerate!
          context.generateScript(apiKey, filePath, templatePath, function (err, newFilePath) {
            if (err) {
              return callback(err, null);
            }

            return callback(null, newFilePath);
          });
        }
        console.log('template older! go on!');

        return callback(null, filePath);

      });
    });
  }
};
