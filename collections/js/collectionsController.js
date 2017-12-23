angular.module("CollectionsModule").controller("CollectionsController", ["$scope", "CollectionsService", function($scope, CollectionsService)
{
    $scope.collectionPath = "";
    $scope.getCollectionPath = CollectionsService.getCollectionPath;

    function init()
    {

    }

    $scope.openDialogue = function()
    {
        CollectionsService.openCollectionExplorer().then(function (collectionId)
        {
            console.log(collectionId);
        });
    };

    $scope.getCurrentCollection = CollectionsService.getCurrentCollection;

    $scope.openCollection = function(collectionId)
    {
        CollectionsService.getCollection(collectionId,
            function(collection)
            {
                $scope.currentCollection = collection;
                $scope.collectionPath += "/" + collection.name;

            },
            function(error)
            {
                $scope.error = error;
            }
        );
    };

    $scope.newCollection = function()
    {
        CollectionsService.newCollection($scope.newCollectionName, null, function(error){console.error(error);});

        delete $scope.newCollectionName;
    };

    $scope.stepUp = function()
    {
        CollectionsService.getCollection(collection._id,
            function(collection)
            {
                $scope.currentCollection = collection;
                $scope.collectionPath = $scope.collectionPath.split('/').splice(-1).join('/');

            },
            function(error)
            {
                $scope.error = error;
            }
        );
    };

    $scope.openImage = function(path)
    {
        shell.openItem(path);
    };

    $scope.delete = function(collectionId, deleteChilderen){
        CollectionsService.deleteCollection(collectionId, deleteChilderen);
    };

    init();
}]);
