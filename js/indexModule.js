angular.module("indexModule", [
    "ngRoute",
    "angularCSS",
    "ngSanitize",
    "ui.bootstrap",
    "ui.select",
    "utils",
    "galleryModule",
    "scannerModule",
    "confirmationDialogueModule",
    "tagManagerModule",
	"settingsModule",
    "browseModule",
    "processModule",
    "tagBrowserModule",
    "CollectionsModule"
]);

angular.module("indexModule").config(['$locationProvider', function($locationProvider)
{
    $locationProvider.hashPrefix('');
}]);
