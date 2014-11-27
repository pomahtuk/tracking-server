/*jslint browser: true, indent: 2 */
/*global angular, console*/

(function (window, angular) {

  'use strict';

  var experiments = angular.module('laborant/Auth');

  experiments.controller('laborant/Auth/Login', [
    '$scope',
    '$rootScope',
    function ($scope, $rootScope) {
      $rootScope.authPages = true;
      console.log('ololo');
    }
  ]);

}(window, angular));
