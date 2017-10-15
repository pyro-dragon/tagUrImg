angular.module("confirmationDialogueModule", [])
.controller("confirmationDialogueController", ["$scope", "$uibModalInstance", "options", function($scope, $uibModalInstance, options)
{
    // Wrap in an object to make it easier to pass around
    $scope.data = {
    };

    $scope.yes = function()
    {
        $scope.yesAction();
        $uibModalInstance.close();
    };

    $scope.no = function()
    {
        $scope.noAction();
        $uibModalInstance.dismiss();
    };

    function init()
    {
        $scope.title = options.title? options.title : "Confirm action";
        $scope.body = options.body? options.body : "Are you sure you want to perform this action?";
        $scope.yesAction = options.yesAction? options.yesAction : function(){};
        $scope.noAction = options.noAction? options.noAction : function(){};
        $scope.yesLabel = options.yesLabel? options.yesLabel : "Yes";
        $scope.noLable = options.noLable? options.noLable : "No";
    }

    init();
}]);
