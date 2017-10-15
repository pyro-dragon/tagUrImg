angular.module("settingsModule").controller("settingsController", ["$scope", "utilityCalls", function($scope, utilityCalls)
{
	$scope.config = {};

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

	function init()
	{
		utilityCalls.getConfig(function(config)
		{
			$scope.config = config;
		});
	}

	init();
}]);
