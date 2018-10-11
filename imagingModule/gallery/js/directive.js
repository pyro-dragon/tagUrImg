angular.module("galleryModule").directive("gallery", function(){
    return {
        restrict: "E",
        templateUrl: "imagingModule/gallery/template.html",
        scope: {
            images: "=",
            editMode: "=?",
            lockMode: "=?"
        },
        controller : "galleryController"
    };
});
