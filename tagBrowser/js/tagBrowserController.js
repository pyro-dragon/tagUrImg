angular.module("tagBrowserModule").controller("tagBrowserController", ["$scope", "utilityCalls", function($scope, utilityCalls)
{
    $scope.tags = [];
    var oldTagName;

    $scope.setActiveTag = function(tag)
    {
        $scope.activeTag = tag;
        oldTagName = tag.name;
    };

    $scope.saveChanges = function()
    {
        utilityCalls.editTag($scope.activeTag, oldTagName,
            function(update)
            {
                $scope.activeTag._rev = update.rev;
                console.log("Successfully updated a tag!");
            },
            function(error)
            {
                console.log("Error updating tag: " + error);
            }
        );
    };

    $scope.deleteTag = function(tag)
    {
        tag._deleted = true;

        utilityCalls.editTag(tag, oldTagName,
            function(update)
            {
                console.log("Successfully deleted a tag!");
                $scope.tags.splice($scope.tags.indexOf(tag), 1);
            },
            function(error)
            {
                console.log("Error deleting tag: " + error);
            }
        );
    };

    function init()
    {
        // Grab all the tags
        utilityCalls.getAllTags(function(tags)
        {
            $scope.tags = tags;
        },
        function(error)
        {
            console.log("Error loading the tags: " + error);
        }, true);
    }

    init();
}]);
