/*jslint browser: true */
/*global angular*/

(function (window, angular) {
  'use strict';

  var laborantAdmin = angular.module('laborantAdmin', [
    'ngRoute'
  ]);

  laborantAdmin.config(['$routeProvider', '$locationProvider', '$httpProvider',
    function ($routeProvider, $locationProvider, $httpProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'templates/experimentsList/list.html'//,
//          controller: 'ExperimentsListController'
        })
        .otherwise({
          redirectTo: '/'
        });
      $locationProvider.html5Mode(true);
    }]);
}(window, angular));
