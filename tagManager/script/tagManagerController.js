angular.module("tagManagerModule", []).controller("tagManagerController", ["$scope", "$uibModalInstance", "utilityCalls", "selectedImages", function($scope, $uibModalInstance, utilityCalls, selectedImages)
{
    // Wrap in an object to make it easier to pass around
    $scope.data = {
        selectedTags: [],
        availableTags: []
    };

    $scope.ok = function()
    {
        // Process tags
        angular.forEach($scope.data.selectedTags, function(tag){
            utilityCalls.addTag({_id: tag, name: tag},
                function(){
                    $scope.data.availableTags.push(tag);
                },
                function(error){
                    if(error.status === 409 && error.name === "conflict"){
                        console.log("Tag '" + tag + "' already exists.");
                    }
                    else{
                        console.log("Error occured adding tag: " + error);
                    }
                }
            );
        });

        $uibModalInstance.close($scope.data.selectedTags);
    };

    $scope.cancel = function()
    {
        $uibModalInstance.dismiss('cancel');
    };

    function init()
    {
        // Load all available tags
        utilityCalls.getAllTags(
            function(tags)
            {
                $scope.data.availableTags = tags;
            },
            function(error)
            {
                console.log("Error getting all tags: " + error);
            }
        );

        // Create a new set using the first lot of tags
        var setOfTags = new Set(selectedImages[Object.keys(selectedImages)[0]].tags);

        // Create an intersection of all the tags so that we only have tags common to all.
        angular.forEach(selectedImages, function(image)
        {
            var tmpSet = new Set(image.tags);
            setOfTags = new Set([...setOfTags].filter(x => tmpSet.has(x)));
        });

        // Move back to an array
        $scope.data.selectedTags = Array.from(setOfTags);
    }

    init();
}]);
