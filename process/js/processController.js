angular.module("processModule", []).controller("processController", ["$scope", "$uibModal", "processService", "utilityCalls", "settingsService", "CollectionsService", function($scope, $uibModal, processService, utilityCalls, settingsService, CollectionsService)
{
    $scope.currentImages = processService.currentPageContents;
    $scope.selectedImages = {};
    $scope.selectedCount = 0;
    $scope.loading = processService.loading;
    $scope.pageCount = processService.pageCount;
    $scope.currentPage = processService.currentPage;

    $scope.addItemToCollection = CollectionsService.addItemToCollection;
    $scope.hasNext = !!processService.nextPageStartKey;
    $scope.getNext = function(){
        processService.getNextPage(updateVariables);
    };
    $scope.hasPrevious = !!processService.lastPageStartKey;
    $scope.getPreviouse = function(){
        processService.getPrevPage(updateVariables);
    };

    $scope.pageArray = [];

    $scope.saveSelected = function(){

        // Check to see if everything has a tag set
        for (var imageID in $scope.selectedImages)
        {
            if ($scope.selectedImages.hasOwnProperty(imageID))
            {
                if($scope.selectedImages[imageID].doc.tags === undefined || $scope.selectedImages[imageID].doc.tags.length === 0)
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
                            image.doc.modified = Date.now();
                            image.doc.new = false;
                            extractedData.push(image.doc);
                        });

                        utilityCalls.putImage(extractedData,
                        function()
                        {
                            console.log("success!");

                            angular.forEach($scope.selectedImages, function(selectedImage)
                            {
                                var index = $scope.currentImages.indexOf(selectedImage);
                                $scope.currentImages.splice($scope.currentImages.indexOf(selectedImage), 1);
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
                image.doc.tags = Array.from(new Set(image.doc.tags.concat(newTags))) ;
            });
        });
    };

    $scope.selectImage = function(image)
    {
        // Add or remove the image from the selection
        if($scope.selectedImages[image.id])
        {
            delete $scope.selectedImages[image.id];
            $scope.selectedCount--;
        }
        else {
            $scope.selectedImages[image.id] = image;
            $scope.selectedCount++;
        }

        delete $scope.error;
    };

    $scope.selectAll = function(){

        $scope.selectedImages = {};

        angular.forEach($scope.currentImages, function(image){
            $scope.selectedImages[image.id] = image;
        });

        $scope.selectedCount = $scope.currentImages.length;
    };

    $scope.selectNone = function(){

        $scope.selectedImages = {};

        $scope.selectedCount = 0;
    };

    $scope.invertSelection = function(){

        angular.forEach($scope.currentImages, function(image){
            $scope.selectImage(image);
        });
    };

    $scope.deleteImage = function(image)
    {
        utilityCalls.deleteImage(
            image,
            function()
            {
                settingsService.banFile(
                    image.id,
                    function()
                    {
                        $scope.currentImages.splice($scope.currentImages.indexOf(image), 1);
                    }
                );
            }
        );
    };

    // Create an array so that ng-repeatcan be used to create page markers
    function makePageArray(){
        for(var i = 0; i < processService.pageCount; i++){
            $scope.pageArray[i] = i+1;
        }
    }

    // Update all the required variables after getting a pager
    function updateVariables(){
        $scope.currentImages = processService.currentPageContents;
        $scope.loading = processService.loading;
        $scope.hasNext = !!processService.nextPageStartKey;
        $scope.hasPrevious = !!processService.lastPageStartKey;
        $scope.currentPage = processService.currentPage;
    }

    function init()
    {
        updateVariables();
        makePageArray();

        processService.getFirstPage(function(images){
            makePageArray();

            updateVariables();
        });
    }

    init();
}]);
