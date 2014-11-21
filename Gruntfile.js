/*jslint node: true, es5: true, nomen: true, indent: 2*/

'use strict';

module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-wiredep');

  grunt.initConfig({
    wiredep: {
      task: {
        src: './views/hello.jade'
      }
    }
  });

  grunt.registerTask('default', [
    'wiredep'
  ]);

};
