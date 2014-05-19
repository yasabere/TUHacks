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
	
	var mapDiv = $('#map-canvas'),
		boxDone = false,
		map,
        latlng, 
		marker,
		styledMapType;
    
    // Init Skrollr
	initialize();
    var s = skrollr.init({
        render: function(data) {
            if ( mapDiv.hasClass('skrollable-after') ) {
				if ( ! boxDone ) {
					boxDone = true;
				    updateMap();
				}
			} else {
				boxDone = false;
				resetMap();
			}
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
    };
	
	//load google maps
	function initialize() {
    
        latlng = new google.maps.LatLng(39.982094, -75.154656);
	
		var stylez = [
		  {
			featureType: "all",
			stylers: [
			  { hue: "#0000ff" },
			  { saturation: -75 }
			]
		  },
		  {
			featureType: "poi",
			elementType: "label",
			stylers: [
			  { visibility: "off" }
			]
		  }
		];
	
		var mapOptions = {
			center: latlng,
			zoom: 17,
			scrollwheel: false,
			navigationControl: false,
			mapTypeControl: false,
			scaleControl: false,
			disableDefaultUI: true,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		
		map = new google.maps.Map(document.getElementById("map-canvas"),mapOptions);
		
		styledMapType = new google.maps.StyledMapType(stylez, {name: "Edited"});
		
	}
	
	function updateMap(){
		
		map.setZoom(17);
        marker = new google.maps.Marker({
            position: latlng, 
            map: map, 
            animation: google.maps.Animation.DROP,
            title:"Temple University"
        });
	}
	
	function resetMap(){
		
		if (marker)
            marker.setMap(null);
		map.setZoom(16);
	}
    
    //form text
    $scope.form_title = "Register for TUHacks!";
    
    function validateForm(){
        $scope.form_title = "Thank You for Registering"
    }
		
  }).
  controller('MyCtrl2', function ($scope) {
    // write Ctrl here

  });
