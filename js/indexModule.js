angular.module("indexModule", [
    "ngRoute",
    "angularCSS",
    "ngSanitize",
    "ui.bootstrap",
    "ui.select",
    "utils",
    "confirmationDialogueModule",
    "tagManagerModule",
	"settingsModule",
    "browseModule",
    "processModule"]);

angular.module("indexModule").config(['$locationProvider', function($locationProvider)
{
    $locationProvider.hashPrefix('');
}]);
