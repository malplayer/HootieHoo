/**
 * Created by malcolmplayer on 3/27/15.
 */
angular.module('hootieHoo').controller('IncidentCtrl', ['$scope','$log','$http','$cordovaCamera','$cordovaGeolocation','$ionicLoading','$state',
    function($scope,$log,$http,$cordovaCamera,$cordovaGeolocation,$ionicLoading,$state) {
        var lat,long,imgUrl;
    $scope.data={
        zipecode:'',
        address:'',
        state:'',
        city:'',
        zipcode:'',
        type:'',
        other:'',
        image:'',
        description:'',
        tags:'',
        date:'',
        time:''

    };
        $scope.isGeo=true;


    $scope.init = function () {
        $log.info("incident");
    };

    $scope.getPhoto = function() {
        var options = {
            quality : 75,
            destinationType : Camera.DestinationType.DATA_URL,
            sourceType : Camera.PictureSourceType.CAMERA,
            allowEdit : true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function(imageData) {
            $scope.imgURI = "data:image/jpeg;base64," + imageData;
            var name =$scope.imgURI.substr(  $scope.imgURI.lastIndexOf('/') + 1);
            upload($scope.imgURI,name);


        }, function(err) {
            // An error occured. Show a message to the user
        });

    };

        $scope.$watch('isGeo', function (newVal, oldVal) {
            if($scope.isGeo)
            {
               getGeo();
            }
        });


        function getGeo()  {

            $scope.loading = $ionicLoading.show({
                content: 'Getting current location...',
                showBackdrop: false
            });
            var posOptions = {timeout: 10000, enableHighAccuracy: false};

            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function (position) {
                    lat  = position.coords.latitude;
                    long = position.coords.longitude;
                    $ionicLoading.hide();
                }, function(err) {
                    // error
                });

        /*    navigator.geolocation.getCurrentPosition(function(pos) {
                $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
                $scope.loading.hide();
            }, function(error) {
                alert('Unable to get location: ' + error.message);
            });*/
        };
        function upload(imageURI, fileName) {

            var deferred = $.Deferred(),
                ft = new FileTransfer(),
                bucket = "hootie-hoo",
                awsKey = "AKIAJTTDDLDJVCO27SQQ",
                secret = "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";
            options = new FileUploadOptions();


            AWS.config.update({accessKeyId: awsKey, secretAccessKey: secret});
            AWS.config.region = 'us-east-1';
            var bucket = new AWS.S3({params: {Bucket: bucket}});
            var uniqueFileName = $scope.uniqueString() + '-' + fileName;
            bucket.putObject(params, function (err, data) {
                if (err) {
                    // toastr.error(err.message,err.code);
                    return false;
                }
                else {
                    // Upload Successfully Finished
                    // toastr.success('File Uploaded Successfully', 'Done');
                    imgUrl = data.ETag;
                    // Reset The Progress Bar
                    setTimeout(function () {
                    }, 4000);
                }
            });
        };



        $scope.sendInfo=function()
        {
        sendData();
         };

        function sendData() {
            var url='http://hootiehoo.aws.af.cm/rest/hootiehoo';
            var tempObj = {};
            var tempObj2 = {};
            tempObj2.longitude = lat;
            tempObj2.latitude = long;
            tempObj2.streetAddress = $scope.data.address;
            tempObj2.cityAddress = $scope.data.city;
            tempObj2.stateAddress = $scope.data.state;
            tempObj2.zipAddress = $scope.data.zipcode;
            tempObj.whatHappened = $scope.data.description;
            tempObj.tags = [$scope.data.type];
            tempObj.incidentTime = $scope.data.time;
            tempObj.evidence = imgUrl;
            tempObj.where = tempObj2;
            $http.post(url, tempObj).success(function (data) {

               $state.go('tab.map');


            });
        }



        $scope.sizeLimit      = 10585760; // 10MB in Bytes
        $scope.uploadProgress = 0;
        $scope.creds          = {};

        $scope.upload = function() {
            AWS.config.update({ accessKeyId: $scope.creds.access_key, secretAccessKey: $scope.creds.secret_key });
            AWS.config.region = 'us-east-1';
            var bucket = new AWS.S3({ params: { Bucket: $scope.creds.bucket } });

            if($scope.file) {
                // Perform File Size Check First
                var fileSize = Math.round(parseInt($scope.file.size));
                if (fileSize > $scope.sizeLimit) {
                    toastr.error('Sorry, your attachment is too big. <br/> Maximum '  + $scope.fileSizeLabel() + ' file attachment allowed','File Too Large');
                    return false;
                }
                // Prepend Unique String To Prevent Overwrites
                var uniqueFileName = $scope.uniqueString() + '-' + $scope.file.name;

                var params = { Key: uniqueFileName, ContentType: $scope.file.type, Body: $scope.file, ServerSideEncryption: 'AES256' };

                bucket.putObject(params, function(err, data) {
                    if(err) {
                        toastr.error(err.message,err.code);
                        return false;
                    }
                    else {
                        // Upload Successfully Finished
                        toastr.success('File Uploaded Successfully', 'Done');

                        // Reset The Progress Bar
                        setTimeout(function() {
                            $scope.uploadProgress = 0;
                            $scope.$digest();
                        }, 4000);
                    }
                });
            }
            else {
                // No File Selected
                toastr.error('Please select a file to upload');
            }
        }

        $scope.fileSizeLabel = function() {
            // Convert Bytes To MB
            return Math.round($scope.sizeLimit / 1024 / 1024) + 'MB';
        };

        $scope.uniqueString = function() {
            var text     = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for( var i=0; i < 8; i++ ) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        };









        $scope.init();

}]);