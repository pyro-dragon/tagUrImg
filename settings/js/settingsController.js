angular.module("settingsModule").controller("settingsController", ["$scope", "utilityCalls", function($scope, utilityCalls)
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
    }

    $scope.save = function()
    {
        $scope.status = "submitted";
        utilityCalls.saveConfig($scope.config,
            function()
            {
                $scope.status = "success";
            },
            function(error)
            {
                $scope.status = "error";
                $scope.error = error;
            }
        );
    }

    $scope.revert = function()
    {
        init();
    }

    $scope.formChanged = function()
    {
        $scope.modified = true;
    }

	function init()
	{
    	$scope.config = {
            directories: [""]
        };

        $scope.status = "";
        $scope.modified = false;
        delete $scope.error;

		utilityCalls.getConfig(function(config)
		{
            // Get the settings remotely
			$scope.config = config;

            // Set the directories list to having an empty string if there is nothing there
            if($scope.config.directories && $scope.config.directories.length < 1){
                $scope.config.directories = [""];
            }
		});
	}

	init();
}]);
