angular.module("indexModule").controller("indexController", ["$scope", "scannerService", "settingsService", "utilityCalls", function($scope, scannerService, settingsService, utilityCalls)
{
	$scope.files = [];

    $scope.scanStatus = function(){
        return scannerService.scanStatus;
    };

    // Controller initialisation function
    function init()
    {

    }

    // Wrap in an object so that we can pass by reference
    var currentNewCount = {
        value: 0
    };

    $scope.getNewCount = function()
    {
        utilityCalls.getNewDocCount(
            function(newCount)
            {
                currentNewCount.value = newCount;
                $scope.$apply();
            },
            function(error)
            {
                console.log("Error updating the new count: " + error);
            }
        );

        return currentNewCount;
    };

    init();
}]);
