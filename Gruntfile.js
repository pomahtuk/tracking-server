/*jslint node: true, es5: true, nomen: true, indent: 2*/

'use strict';

var path = require('path'),
  ext = function (file) {
    return path.extname(file).slice(1);
  };

console.log(__dirname);

module.exports = function (grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      sass: {
        files: [
          'public/app/**/*.{sass,scss}',
          'public/common/**/*.{sass,scss}'
        ],
        tasks: ['newer:sass:dist', 'newer:injector:css']
      },
      styles: {
        files: [
          'public/app/**/*.css',
          'public/common/**/*.css'
        ],
        tasks: ['newer:injector:css']
      },
      server: {
        files: ['.rebooted'],
        options: {
          livereload: true
        }
      },
      livereload: {
        options: {
          livereload: true
        },
        files: [
          'views/{,*/}*.jade',
          'public/app/**/*.jade',
          'public/app/**/*.css',
          'public/common/**/*.css',
          'public/app/**/*.js',
          'public/common/**/*.js',
          '.tmp/styles/{,*/}*.css',
          'public/app/**/*.{png, jpg, jpeg, svg, gif}',
          'public/common/**/*.{png, jpg, jpeg, svg, gif}'
        ]
      }
    },

    sass: {
      options: {
        sourceMap: true,
        includePaths: ['bower_components']
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'public',
          src: ['**/*.{scss,sass}'],
          dest: '.tmp/styles',
          ext: '.css'
        }]
      },
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
      js: {
        options: {
          starttag: '// injector:{{ext}}',
          endtag: '// endinjector',
          transform: function (filepath) {
            return 'script(src="' + filepath + '")';
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
            'public/common/**/*.js'
          ]
        }
      },
      css: {
        options: {
          transform: function (filepath) {
            return 'link(rel="stylesheet" href="' + filepath + '")';
          },
        },
        files: {
          'views/index.jade': [
            'public/app/**/*.css',
            'public/common/**/*.css'
          ]
        }
      },
      livereload: {
        options: {
          starttag: '// injector:livereload',
          endtag: '// endinjector',
          transform: function (filepath) {
            return 'script(src="' + filepath + '")';
          }
        },
        files: {
          'views/index.jade': [
            'public/livereload.js'
          ]
        }
      }
    },

    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          ignore: [
            'node_modules/**',
            'public/**'
          ],
          callback: function (nodemon) {
            // refreshes browser when server reboots
            nodemon.on('restart', function () {
              // Delay before server listens on port
              setTimeout(function () {
                require('fs').writeFileSync('.rebooted', 'rebooted');
              }, 1000);
            });
          },
        }
      },
      exec: {
        options: {
          exec: 'less'
        }
      }
    },

    concurrent: {
      server: {
        tasks: ['nodemon', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    }

  });

  grunt.registerTask('default', [
    'wiredep',
    'injector'
  ]);

  grunt.registerTask('serve', [
    'wiredep',
    'injector',
    'concurrent:server'
  ]);

};
