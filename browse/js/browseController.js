angular.module("browseModule").controller("browseController", ["$scope", "utilityCalls", "CollectionsService", function($scope, utilityCalls, CollectionsService)
{
    $scope.displayImages = [];
    $scope.addItemToCollection = CollectionsService.addItemToCollection;

    // Do an initial search
    function search(params){

        if(Array.isArray(params))
        {
            utilityCalls.getImagesByTags(params,
                function(results)
                {
                    console.log("success!");
                    $scope.displayImages = results;
                },
                function(error)
                {
                    console.log("Error!");
                }
            );
        }
    }


    $scope.search = function()
    {
        if($scope.searchParams)
        {
            var termsArray = $scope.searchParams.split(" ");

            search(termsArray);
        }
    };

    $scope.openImage = function(path)
    {
        shell.openItem(path);
    };
}]);
