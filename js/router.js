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
	.when("/article/:articleLink", {
		templateUrl: "process/partial.html",
		controller: "articleController",
        css: "article/css/style.css"
	});
});
