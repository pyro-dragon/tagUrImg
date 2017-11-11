angular.module("processModule", []).controller("processController", ["$scope", "$uibModal", "utilityCalls", function($scope, $uibModal, utilityCalls)
{
    $scope.currentImages = [];
    $scope.selectedImages = {};
    $scope.selectedCount = 0;
    $scope.loading = false;

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

    // Get the new items
    function getOutstandingItems()
    {
        $scope.loading = true;
        utilityCalls.getNewDocs(
            function(result)
            {
                $scope.loading = false;
                $scope.currentImages = result;
            },
            function(error)
            {
                $scope.loading = false;
                console.log("Error getting outstanding items: " + error);
            }
        );
    }

    function init()
    {
        getOutstandingItems();
    }

    init();
}]);
