angular.module("settingsModule").controller("settingsController", ["$scope", "settingsService", function($scope, settingsService)
{
	$scope.addDir = function()
	{
		if(!$scope.config.directories)
		{
			$scope.config.directories = [];
		}

		$scope.config.directories.push("");
	};

	$scope.canAddDir = function()
	{
		if(!$scope.config.directories)
		{
			return true;
		}

		if($scope.config.directories[$scope.config.directories.length - 1] != "")
		{
			return true;
		}

		return false;
	};

    $scope.removePath = function(index)
    {
        if($scope.config.directories.length === 1)
        {
            $scope.config.directories = [""];
        }
        else
        {
            $scope.config.directories.splice(index, 1);
        }

        $scope.formChanged();
    };

    $scope.save = function()
    {
        $scope.status = "submitted";
        settingsService.saveConfig(function()
            {
                $scope.status = "success";
            },
            function(error)
            {
                $scope.status = "error";
                $scope.error = error;
            }
        );
    };

    $scope.revert = function()
    {
        init();
    };

    $scope.formChanged = function()
    {
        $scope.modified = true;
    };

    $scope.unbanFiles = function()
    {
        if($scope.selectedBannedFiles)
        {
            angular.forEach($scope.selectedBannedFiles, function(file)
            {
                $scope.config.bannedFiles.splice($scope.config.bannedFiles.indexOf(file), 1)
            });

            $scope.modified = true;

            delete $scope.selectedBannedFiles;
        }
    };

    $scope.addBannedPath = function()
    {
        if($scope.newBannedPath && $scope.newBannedPath !=="")
        {
            $scope.config.bannedFiles.push($scope.newBannedPath);

            $scope.modified = true;

            delete $scope.newBannedPath;
        }
    };

	function init()
	{
    	$scope.config = {
            directories: [""]
        };

        $scope.status = "";
        $scope.modified = false;
        delete $scope.error;

        settingsService.getConfig(function(config)
            {
                $scope.config = config;

                // Set the directories list to having an empty string if there is nothing there
                if($scope.config.directories && $scope.config.directories.length < 1){
                    $scope.config.directories = [""];
                }
            }
        );
	}

	init();
}]);
