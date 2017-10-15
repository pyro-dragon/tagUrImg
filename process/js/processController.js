angular.module("processModule", []).controller("processController", ["$scope", "$uibModal", "utilityCalls", function($scope, $uibModal, utilityCalls)
{
    $scope.currentImages = [];
    $scope.selectedImages = {};
    $scope.selectedCount = 0;

    $scope.saveSelected = function(){

        // Check to see if everything has a tag set
        for (var imageID in $scope.selectedImages)
        {
            if ($scope.selectedImages.hasOwnProperty(imageID))
            {
                if($scope.selectedImages[imageID].doc.tags === undefined || $scope.selectedImages[imageID].doc.tags.length === 0)
                {
                    console.log("Not every selected image has tags set.");
                    alert("Not every selected image has tags set.");
                    return;
                }
                else {
                    // Extract the doc data for sending
                    $scope.selectedImages[imageID] = $scope.selectedImages[imageID].doc;
                    $scope.selectedImages[imageID].new = false;
                    $scope.modified = Date.now();
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
                        utilityCalls.putImage($scope.selectedImages,
                        function()
                        {
                            console.log("success!");
                            $scope.selectedImages = {};
                        },
                        function(err)
                        {
                            console.log("Error: " + err)
                        });
                    };

                    return optionsObject;
                }
            }
        });
        // modalInstance.result
        //     .then(function ()
        //     {
        //
        //     })
        //     .catch(function()
        //     {
        //
        //     });
    }

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
            })
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
    }

    // Get the new items
    function getOutstandingItems()
    {
        utilityCalls.getNewDocs(function(result){
            $scope.currentImages = result;
        });
    }

    function init()
    {
        getOutstandingItems();
    }

    init();
}]);
