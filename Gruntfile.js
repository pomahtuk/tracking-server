/*jslint node: true, es5: true, nomen: true, indent: 2*/

'use strict';

var path = require('path'),
  ext = function (file) {
    return path.extname(file).slice(1);
  };

console.log(__dirname);

module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-wiredep');
  grunt.loadNpmTasks('grunt-injector');
  grunt.loadNpmTasks('grunt-debug-task');

  grunt.initConfig({

    // Project settings
    laborant: {
      // configurable paths
      client: __dirname
    },

    wiredep: {
      options: {
        cwd: './',
        ignorePath: '..'
      },
      app: {
        src: './views/index.jade'
      }
    },

    injector: {
      options: {},
      app: {
        options: {
          starttag: '// injector:{{ext}}',
          endtag: '// endinjector',
          transform: function (filepath) {
            var e = ext(filepath);
            if (e === 'css') {
              return 'link(rel="stylesheet" href="' + filepath + '")';
            } else if (e === 'js') {
              return 'script(src="' + filepath + '")';
            } else if (e === 'html') {
              return 'link(rel="import" href="' + filepath + '")';
            }
          },
          sort: function (a, b) {
            if (a === '/public/app/app.js') {
              return 10000;
            } else if (b === '/public/app/app.js') {
              return -10000;
            } else {
              return a.length - b.length;
            }
          }
        },
        files: {
          'views/index.jade': [
            'public/app/**/*.js',
            'public/common/**/*.js',
            'public/app/**/*.css',
            'public/common/**/*.css'
          ]
        }
      }
    }
  });

  grunt.registerTask('default', [
    'wiredep',
    'injector'
  ]);

};
