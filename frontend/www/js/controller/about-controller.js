/**
 * Created by malcolmplayer on 3/27/15.
 */
angular.module('hootieHoo').controller('AboutCtrl', ['$scope','$log', function($scope,$log) {

    $scope.init = function () {
        $log.info("about");
    };

    $scope.init();

}]);