/**
 * Created by malcolmplayer on 3/27/15.
 */
angular.module('hootieHoo').controller('HomeCtrl', ['$scope','$log', function($scope,$log) {

    $scope.init = function () {
        $log.info("home");
    };

    $scope.init();

}]);
