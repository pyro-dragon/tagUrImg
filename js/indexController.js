angular.module("indexModule").controller("indexController", ["$scope", "scanner", "settingsService", "utilityCalls", function($scope, scanner, settingsService, utilityCalls)
{
	$scope.files = [];

    // Controller initialisation function
    function init()
    {
        // Scan the file system
    	utilityCalls.getConfig(function(config)
    	{
    		if(config.directories)
    		{
    			angular.forEach(config.directories, function(dir)
    			{
                    var recoveredFiles = scanner.scan(dir, config);
    				var joinedFiles = $scope.files.concat(recoveredFiles);
                    $scope.files = joinedFiles;
    			});
    		}

            // Insert the files into the DB
        	angular.forEach($scope.files, function(file)
        	{
        		db.get(file, function (error, response) {
                    if(error && error.status == 404){
                        utilityCalls.putImage({_id: file, tags: [], dateAdded: Date.now(), new: true}, function(){console.log("Document created")}, function(error){console.log("Document Error: " + error)});
                    }
        		});
        	});
    	});
    }

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

    init();
}]);
