/*jslint node: true, es5: true, indent: 2, nomen: true*/

'use strict';

module.exports = function (config) {
  config.set({

    basePath : '../',

    files : [
      'bower_components/jquery/jquery.js',
      'bower_components/modernizr/modernizr.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-aria/angular-aria.js',
      'bower_components/hammerjs/hammer.js',
      'bower_components/angular-material/angular-material.js',
      'bower_components/angular-route/angular-route.js',
      'app/experiments/*.js',
      'app/experiments/**/*.js',
      'app/app.js',
      'test/unit/**/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-jasmine'
    ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
