/*jslint browser: true, indent: 2 */
/*global angular*/

(function (window, angular) {
  'use strict';

  var laborantAdmin = angular.module('laborantAdmin', [
    'ngRoute',
    'laborant/Common',
    'laborant/Experiments',
    'laborant/Auth'
  ]);

  laborantAdmin.config([
    '$routeProvider',
    '$locationProvider',
    '$httpProvider',
    function ($routeProvider, $locationProvider, $httpProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'templates/experiments/list.html',
          controller: 'laborant/Experiments/List'
        })
        .when('/auth', {
          templateUrl: 'templates/auth/login.html',
          controller: 'laborant/Auth/Login'
        })
        .otherwise({
          redirectTo: '/'
        });
      $locationProvider.html5Mode(true);
    }]);
}(window, angular));
