/*jslint browser: true, indent: 2 */
/*global angular, console*/

(function (window, angular) {

  'use strict';

  var common = angular.module('laborant/Common');

  common.controller('commonController', [
    '$scope',
    function ($scope) {
      $scope.actions = [
        {
          title: 'Home',
          link: '/'
        },
        {
          title: 'Experiments',
          link: '/experiments'
        }
      ];
    }
  ]);

}(window, angular));
