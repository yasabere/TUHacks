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
    
    $scope.scrollToSlide = function(slideId){
      
        var htmlbody = $('html,body');
	    var duration = 500;
     
        // Custom slide content offset
        var customSlideOffset = $("#slide-"+slideId).attr('data-content-offset');
         
        // Scroll to the top of a container if it doesn't have custom offset defined
        if(typeof customSlideOffset === "undefined"){
     
            htmlbody.animate({scrollTop: ($("#slide-"+slideId).offset().top) + "px"},"slow");
      
        } 
        else {
     
            // Convert percentage 'eg. 25p' into pixels
            if(customSlideOffset.indexOf("p")!=-1) {
                
                var customSlideOffset = parseInt(customSlideOffset.split("p")[0]);
                var slideHeight = $slide.height();
                
                customSlideOffset = Math.ceil((slideHeight/100) * customSlideOffset);
                
                htmlbody.animate({scrollTop: ($("#slide-"+slideId).offset().top + customSlideOffset) + "px"},"slow");
                 
            } else {
                
               var customSlideOffset = parseInt(customSlideOffset);
                
               htmlbody.animate({scrollTop: ($("#slide-"+slideId).offset().top + customSlideOffset) + "px"},"slow");
                 
            }
        }
    }

  }).
  controller('MyCtrl2', function ($scope) {
    // write Ctrl here

  });
