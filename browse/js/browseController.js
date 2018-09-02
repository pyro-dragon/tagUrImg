angular.module("browseModule").controller("browseController", ["$scope", "utilityCalls", "CollectionsService", "browseService", function($scope, utilityCalls, CollectionsService, browseService)
{
    $scope.displayImages = browseService.currentPageContents;
    $scope.addItemToCollection = CollectionsService.addItemToCollection;

    $scope.getNextPage = function(){
        browseService.getNextPage((images)=>{
            $scope.displayImages = images; $scope.$apply();
        });
    };

    $scope.getPreviousPage = function(){
         browseService.getPreviousPage((images)=>{
             $scope.displayImages = images; $scope.$apply();
         });
    };

    $scope.enableNextPage = function(){
        return !browseService.atEnd;
    };

    $scope.enablePreviousPage = function(){
        return !browseService.atStart;
    };

    $scope.loading = function(){
        return browseService.loading;
    };

    $scope.search = function()
    {
        $scope.noResultsFound = false;

        if($scope.searchParams)
        {
            browseService.search($scope.searchParams.split(" "), undefined, false, (images)=>{
                if(images.length){
                    $scope.displayImages = images;
                }
                else{
                    $scope.noResultsFound = true;
                }

                $scope.$apply();
            });
        }
    };

    $scope.openImage = function(path)
    {
        shell.openItem(path);
    };
}]);
