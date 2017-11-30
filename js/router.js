angular.module("indexModule").config(function($routeProvider)
{
    $routeProvider
    .when("/", {
        templateUrl: "browse/partial.html",
        controller: "browseController",
        css: "browse/css/style.css"
    })
    .when("/browse", {
        templateUrl: "browse/partial.html",
        controller: "browseController",
        css: "browse/css/style.css"
    })
    .when("/process", {
        templateUrl: "process/partial.html",
        controller: "processController",
        css: "process/css/style.css"
    })
	.when("/settings", {
		templateUrl: "settings/partial.html",
		controller: "settingsController",
        css: "settings/css/style.css"
	})
    .when("/tagBrowser", {
        templateUrl: "tagBrowser/partial.html",
        controller: "tagBrowserController",
        css: "tagBrowser/css/style.css"
    })
    .when("/collections", {
        templateUrl: "collections/partial.html",
        controller: "CollectionsController",
        css: "collections/css/style.css"
    })
	.when("/image/:imageLink", {
		templateUrl: "image/partial.html",
		controller: "imageController"
	});
});
