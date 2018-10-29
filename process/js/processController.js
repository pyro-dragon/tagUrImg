angular.module("processModule", []).controller("processController", ["$scope", "$uibModal", "processService", "utilityCalls", "settingsService", "CollectionsService", function($scope, $uibModal, processService, utilityCalls, settingsService, CollectionsService)
{
    $scope.displayImages = processService.currentPageContents;
    $scope.selectedImages = {};
    $scope.selectedCount = 0;
    $scope.addItemToCollection = CollectionsService.addItemToCollection;

    function init(){

        if(!processService.currentPageContents.length){
            $scope.getNextPage();
        }
    }

    $scope.getNextPage = function(){
        processService.getNextPage((images)=>{$scope.displayImages = images; $scope.$apply();});
    };

    $scope.getPreviousPage = function(){
         processService.getPreviousPage((images)=>{$scope.displayImages = images; $scope.$apply();});
    };

    $scope.enableNextPage = function(){
        return !processService.atEnd;
    };

    $scope.enablePreviousPage = function(){
        return !processService.atStart;
    };

    $scope.loading = function(){
        return processService.loading;
    };

    $scope.search = function()
    {
        if($scope.searchParams)
        {
            processService.search($scope.searchParams.split(" "), undefined, false, (images)=>{
                $scope.displayImages = images; $scope.$apply();
            },
            (error)=>{
                $scope.error = error;
            });
        }
    };

    $scope.saveSelected = function(){

        // Check to see if everything has a tag set
        for (var imageID in $scope.selectedImages)
        {
            if ($scope.selectedImages.hasOwnProperty(imageID))
            {
                if($scope.selectedImages[imageID].tags === undefined || $scope.selectedImages[imageID].tags.length === 0)
                {
                    console.log("Not every selected image has tags set.");
                    $scope.error = "Not every selected image has tags set.";
                    return;
                }
            }
        }

        // Ask the user if they are sure they want to save
        var modalInstance = $uibModal.open(
        {
            animation: true,
            templateUrl: 'confirmationDialogue/modal.html',
            controller: 'confirmationDialogueController',
            resolve: {
                options: function () {

                    var optionsObject = {};
                    optionsObject.title = "Save selected";
                    optionsObject.body = "Save the currently selected images?";
                    optionsObject.yesAction = function()
                    {
                        // Extract the data to save
                        var extractedData = [];
                        angular.forEach($scope.selectedImages, function(image)
                        {
                            image.modified = Date.now();
                            image.new = false;
                            extractedData.push(image);
                        });

                        utilityCalls.putImage(extractedData,
                        function()
                        {
                            console.log("success!");

                            angular.forEach($scope.selectedImages, function(selectedImage)
                            {
                                var index = $scope.displayImages.indexOf(selectedImage);
                                $scope.displayImages.splice($scope.displayImages.indexOf(selectedImage), 1);
                            });

                            $scope.selectedImages = {};
                            $scope.selectedCount = 0;
                        },
                        function(err)
                        {
                            console.log("Error: " + err);
                        });
                    };

                    return optionsObject;
                }
            }
        });
    };

    $scope.openTagManager = function (selectedImages)
    {
        var modalInstance = $uibModal.open(
        {
            animation: true,
            templateUrl: 'tagManager/modal.html',
            controller: 'tagManagerController',
            resolve: {
                selectedImages: function () {
                    return selectedImages;
                }
            }
        });

        modalInstance.result.then(function (newTags)
        {
            angular.forEach(selectedImages, function(image)
            {
                image.tags = Array.from(new Set(image.tags.concat(newTags))) ;
            });
        });
    };

    $scope.selectImage = function(image)
    {
        // Add or remove the image from the selection
        if($scope.selectedImages[image._id])
        {
            delete $scope.selectedImages[image._id];
            $scope.selectedCount--;
        }
        else {
            $scope.selectedImages[image._id] = image;
            $scope.selectedCount++;
        }

        delete $scope.error;
    };

    $scope.selectAll = function(){

        $scope.selectedImages = {};

        angular.forEach($scope.displayImages, function(image){
            $scope.selectedImages[image._id] = image;
        });

        $scope.selectedCount = $scope.displayImages.length;
    };

    $scope.selectNone = function(){

        $scope.selectedImages = {};

        $scope.selectedCount = 0;
    };

    $scope.invertSelection = function(){

        angular.forEach($scope.displayImages, function(image){
            $scope.selectImage(image);
        });
    };

    $scope.deleteSelected = function()
    {
        var testArr = Object.values($scope.selectedImages);
        utilityCalls.deleteImages(
            Object.values($scope.selectedImages), function()
            {
                var paths = [];
                angular.forEach($scope.selectedImages, function(image)
                {
                    paths.push (image._id);
                });

                settingsService.banFiles(
                    paths,
                    function()
                    {
                        angular.forEach($scope.selectedImages, function(image)
                        {
                            $scope.displayImages.splice($scope.displayImages.indexOf(image), 1);
                        });

                        $scope.selectedImages = {};

                        // TODO: Load in new files to replace the old ones.

                        $scope.$apply();
                    }
                );
            }
        );
    };

    $scope.deleteImage = function(image)
    {
        utilityCalls.deleteImage(
            image,
            function()
            {
                settingsService.banFile(
                    image._id,
                    function()
                    {
                        $scope.displayImages.splice($scope.displayImages.indexOf(image), 1);
                        $scope.$apply();
                    }
                );

                // TODO: Fetch some replacement images to fill in where the deleted ones where
            }
        );
    };

    init();
}]);
