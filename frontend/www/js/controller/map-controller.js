/**
 * Created by malcolmplayer on 3/27/15.
 */
angular.module('hootieHoo').controller('MapCtrl', ['$scope','$log','$ionicLoading','$compile','$http', function($scope,$log,$ionicLoading,$compile,$http) {

    var map=null,
        geocoder = new google.maps.Geocoder();
    $scope.init = function () {
        $log.info("map");
        var myLatlng = new google.maps.LatLng(41.850033, -87.6500523);

        var mapOptions = {
            center: myLatlng,
            zoom: 3,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
         map = new google.maps.Map(document.getElementById("map"),
            mapOptions);

        $scope.map = map;
        getSiteData();

    };



    function getSiteData () {
        var url='http://hootiehoo.aws.af.cm/rest/hootiehoo';
        $http.get(url, {}).success(function (data) {
            var datalen = data.length;
            for(var i=0;i<datalen;i++)
            {
                var imgUrl = data[i].evidence;
                var description = data[i].whatHappened;
                var contentString = "<div>Who DaT <img src='"+imgUrl+"' width='300px' height='300px'></br><p>"+ description+ "</p></div>";
                var compiled = $compile(contentString)($scope);
                var lat =data[i].where.latitude;
                var long =data[i].where.longitude;


                if((lat === null || lat === undefined) || long === null || long === undefined)
                {
                    var address = data[i].where.cityAddress +"," + data[i].where.stateAddress;
                    geocoder.geocode( { 'address': address}, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            lat = results[0].geometry.location.lat;
                            long = results[0].geometry.location.lng;
                        } else {
                            alert('Geocode was not successful for the following reason: ' + status);
                        }
                    });

                }

                var myLatlng = new google.maps.LatLng(lat,long);

                var infowindow = new google.maps.InfoWindow({
                    content: compiled[0]
                });

                var marker = new google.maps.Marker({
                    position: myLatlng,
                    map: map,
                    title: 'Incident'
                });

                google.maps.event.addListener(marker, 'click', function() {
                    infowindow.open(map,marker);
                });
            }
        }).error(function (data, status, headers, config) {
            log.error(data);
        });
    };


    $scope.init();




}]);
