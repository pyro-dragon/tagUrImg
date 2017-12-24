angular.module("CollectionsModule", ["ui.tree"])
.controller("collectionExplorerController", ["$scope", "CollectionsService", "$uibModalInstance", function($scope, CollectionsService, $uibModalInstance)
{
    $scope.list = [];

    $scope.cancel = function()
    {
        $uibModalInstance.dismiss();
    };

    $scope.select = function(node){
        $uibModalInstance.close(node.id);
    };

    function init()
    {
        CollectionsService.getCollectionsMap(function(map){
                $scope.list = map;
                $scope.newJSON = JSON.stringify(map);
                $scope.oldJSON = JSON.stringify($scope.list);
            },
            function(error){
                console.log("Error: " + error);
            }
        );
    }

    init();
}]);
