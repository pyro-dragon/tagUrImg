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
    "processModule",
    "tagBrowserModule"]);

angular.module("indexModule").config(['$locationProvider', function($locationProvider)
{
    $locationProvider.hashPrefix('');
}]);

// TODO: Remove for release

// Get the design doc
// db.get()
// POUCH_DESIGN_DOCS.forEach(
//     function (designDoc)
//     {
//         db.get(designDoc._id).then(
//             function (originalDoc)
//             {
//                 console.log('found design document with given id ' + designDoc._id);
//                 return db.put(designDoc, designDoc._id, originalDoc._rev); // throws error
//             }
//         ).catch(
//             function (err)
//             {
//                 console.log('Adding new design document with id ' + designDoc._id);
//                 if (err.status === 404)
//                 {
//                     return db.put(designDoc);
//                 }
//                 else
//                 {
//                     console.error('Error while updating design document: ', err);
//                 }
//             }
//         );
//     }
// );
