angular.module("galleryModule").directive("pager", function(){
    return {
        restrict: "E",
        templateUrl: "utils/gallery/partial.html",
        scope: {
            query: "="
        },
        controller : "galleryController",
        transclude: true
    };
});
