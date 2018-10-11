angular.module("thumbnailModule").directive("thumbnail", function(){
    return {
        restrict: "E",
        templateUrl: "imagingModule/thumbnail/template.html",
        scope: {
            src: "="
        },
        controller : "thumbnailController"
    };
});
