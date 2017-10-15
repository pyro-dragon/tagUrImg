angular.module("indexModule").controller("indexController", ["$scope", "scanner", "utilityCalls", function($scope, scanner, utilityCalls)
{
    // Scan the file system
	$scope.files = scanner.scan("/home/bob/Dropbox/Pictures/Comissions");

	// Insert the files into the DB
	angular.forEach($scope.files, function(file)
	{
		db.get(file, function (error, response) {
            if(error && error.status == 404){
                db.put({_id: file, tags: [], dateAdded: Date.now(), new: true});
    			console.log("Document created");
            }
		});
	});

    // Wrap in an object so that we can pass by reference
    var currentNewCount = {
        value: 0
    };
    $scope.getNewCount = function()
    {
        utilityCalls.getNewDocCount(
            function(newCount)
            {
                currentNewCount.value = newCount;
                $scope.$apply();
            },
            function(error)
            {
                console.log("Error updating the new count: " + error);
            }
        );

        return currentNewCount;
    };
}]);
