'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('AppCtrl', function ($scope, $http) {

    $http({
      method: 'GET',
      url: '/api/name'
    }).
    success(function (data, status, headers, config) {
      $scope.name = data.name;
    }).
    error(function (data, status, headers, config) {
      $scope.name = 'Error!';
    });

  }).
  controller('MyCtrl1', function ($scope) {
    // write Ctrl here
    //alert("Hack Temple!!!!!!");
    
    // Init Skrollr
    var s = skrollr.init({
        render: function(data) {
            //Debugging - Log the current scroll position.
            //console.log(data.curTop);
        }
    });
    
    var clock = $('#count-down-clock').FlipClock(3600 * 24 * 3, {
		clockFace: 'DailyCounter',
		countdown: true
    });

  }).
  controller('MyCtrl2', function ($scope) {
    // write Ctrl here

  });
