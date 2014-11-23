/*jslint browser: true */
/*global angular, console*/

(function (window, angular) {

  'use strict';

  var experiments = angular.module('laborant/Experiments');

  experiments.controller('laborant/Experiments/List', [
    '$scope',
    function ($scope) {
      console.log('ololo');
    }
  ]);

}(window, angular));
