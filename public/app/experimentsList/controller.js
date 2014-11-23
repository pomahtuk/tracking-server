/*jslint browser: true */
/*global angular, console*/

(function (window, angular) {

  'use strict';

  var experimentsList = angular.module('ExperimentsList', []);

  experimentsList.controller('ExperimentsListController', [
    '$scope',
    function ($scope) {
      console.log('ololo');
    }
  ]);

}(window, angular));
