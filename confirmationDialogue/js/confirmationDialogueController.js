angular.module("confirmationDialogueModule", [])
.controller("confirmationDialogueController", ["$scope", "$uibModalInstance", "options", function($scope, $uibModalInstance, options)
{
    var yesAction = function(){};
    var noAction = function(){};

    // Wrap in an object to make it easier to pass around
    $scope.data = {
    };

    $scope.yes = function()
    {
        yesAction();
        $uibModalInstance.close();
    };

    $scope.no = function()
    {
        noAction();
        $uibModalInstance.dismiss();
    };

    function init()
    {
        $scope.title = options.title || "Confirm action";
        $scope.body = options.body || "Are you sure you want to perform this action?";
        yesAction = options.yesAction || function(){};
        noAction = options.noAction || function(){};
        $scope.yesLabel = options.yesLabel || "Yes";
        $scope.noLable = options.noLable || "No";
    }

    init();
}]);
