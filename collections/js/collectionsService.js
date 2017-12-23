angular.module("CollectionsModule").service("CollectionsService", ["utilityCalls", "utilityFunctions", "$uibModal",function(utilityCalls, utilityFunctions, $uibModal)
{
    var self = this;
    var currentCollection = {};
    var collectionPath = [];

    this.getCurrentCollection = function()
    {
        return currentCollection;
    };

    this.getCollectionPath = function()
    {
        return collectionPath;
    };

    this.getCollection = function(collectionId, success, fail)
    {
        if(currentCollection)
        {
            utilityCalls.getCollection(collectionId,
                function(collection)
                {
                    currentCollection = collection;

                    if(collection._id === "root")
                    {
                        collectionPath = [collection];
                    }
                    else
                    {
                        // Check to see if the collection exists in the current path
                        for(var i = 0; i < collectionPath.length; i++){
                            if(collection.parent === collectionPath[i]._id || collectionPath[i].id){
                                collectionPath = collectionPath.slice(0, i + 1);
                                break;
                            }
                        }
                    }

                    // It isn't so lets just add it
                    collectionPath.push(collection);

                    if(typeof success === "function")
                    {
                        success(collection);
                    }
                }, fail);
        }

        else
        {
            getRootCollection(
                function()
                {
                    utilityCalls.getCollection(collectionId, function(collection)
                        {
                            currentCollection = collection;
                            collectionPath = [collection];

                            if(typeof success === "function")
                            {
                                success(collection);
                            }
                        }, fail);
                }, fail
            );
        }
    };

    this.getCollectionsMap = function(success, fail){
        var map = [];
        utilityCalls.getAllCollectionChildren(
            function(response){
                // First find the root node
                utilityFunctions.findIn(response.rows, function(row, index){
                    if(row.id === "root"){
                        map.push({
                            id: row.id,
                            title: "/",
                            items: row.value,
                            name: row.doc.name
                        });                  // Set the root node
                        response.rows.splice(index, 1); // Remove this from the list
                        return true;                    // Exit the loop
                    }
                });

                function nodeAdder(children){
                    for(var i = children.length - 1; i >= 0; i--){
                        var child = children[i];

                        if(child.type !== "image"){
                            // Look for matching child elements
                            utilityFunctions.findIn(response.rows, function(row, index){
                                if(row.id === (child.id || child._id)){

                                    child.parent = row.doc.parent;
                                    child.id = row.id;   // Ensure 'id' is set
                                    child.title = row.doc.name;         // Set the display name
                                    child.items = row.value;            // Replace the child ID with the child object

                                    response.rows.splice(index, 1);     // Remove this from the list
                                    return true;                        // Exit the loop
                                }
                            });

                            // Call the function on child elements
                            if(child.items && child.items.length > 0){
                                nodeAdder(child.items);
                            }
                        }
                        else {
                            children.splice(i, 1);
                        }
                    }
                }

                // Now loop through all the nodes to add them to the tree
                nodeAdder(map[0].items);

                if(typeof success === "function"){
                    success(map);
                }
            }, fail
        );
    };

    this.updateCollection = function(collection, success, fail)
    {
        utilityCalls.putCollection(collection, function(response)
        {
            collection._rev = response.rev;

            if(typeof success === "function")
            {
                success(response);
            }
        }, fail);
    };

    this.newCollection = function(name, success, fail)
    {
        utilityCalls.putCollection({
            type: "collection",
            name: name,
            parent: currentCollection._id
        },
        function(newCollectionResponse)
        {
            if(!currentCollection.items)
            {
                currentCollection.items = [];
            }

            currentCollection.items.push({
                type: "collection",
                name: name,
                _id: newCollectionResponse.id
            });

            self.updateCollection(currentCollection, function(updateResponse)
                {
                    currentCollection._rev = updateResponse.rev;

                    if(typeof success === "function")
                    {
                        success(updateResponse);
                    }
                }, fail);
        }, fail);
    };

    // The exposed delete function
    this.deleteCollection = function(collectionId, deleteChilderen)
    {
        if(deleteChilderen)
        {
            deleteCollectionAndChildren(collectionId);
        }
        else
        {
            deleteCollectionOnly(collectionId);
        }
    };

    // Open the Collection Explorer dialogue
    this.openCollectionExplorer = function()
    {
        return $uibModal.open(
        {
            animation: true,
            templateUrl: 'collections/collectionExplorer.html',
            controller: 'collectionExplorerController',
            resolve: {
            }
        }).result;
    };

    this.addItemToCollection = function(itemId)
    {
        self.openCollectionExplorer().then(function(id){
            self.getCollection(id, function(collection){
                if(!collection.items){
                    collection.items = [];
                }
                collection.items.push({
                    id: itemId,
                    type: "image"
                });

                self.updateCollection(collection, function(response){
                    console.log(response);
                },
                function(error){
                    console.log(error);
                });
            },
            function(error){
                console.log(error);
            });
        });
    };

    // Delete the chosen collection and child items
    function deleteCollectionAndChildren(collectionId)
    {
        function iterativeDelete(collectioId){
            utilityCalls.getChildCollectionsOf(collectionId, function(collections)
            {
                angular.forEach(collections.rows, function(collection){

                    // Check if there are any child items and get them
                    if(collection.doc.type === "collection" && collection.doc.items.length > 0){
                        iterativeDelete(collection._id);
                    }
                });

                colsole.log("deleting " + collectionId);
                utilityCalls.deleteCollection(collectionId);
            });
        }

        // Delete the item from the parent
        for(var i = 0; i < currentCollection.items.length; i++){
            if((currentCollection.items[i]._id||currentCollection.items[i].id) === collectionId){
                currentCollection.items.splice(i, 1);
                break;
            }
        }

        utilityCalls.putCollection(currentCollection, function(){
            console.log("Finished all delete functions");
        });
    }

    // Delete the chosen collection and move the child items to the parent.
    function deleteCollectionOnly(collectionId)
    {
        // Grab the child items
        utilityCalls.getChildCollectionsOf(collectionId, function(collections)
        {
            // We have the child items

            // Cycle through all the child items
            var children = [];
            angular.forEach(collections.rows, function(collection)
            {
                // Set the parents of all the children to the currently selected collection
                collection.doc.parent = currentCollection.id || currentCollection._id;

                // Add the child to our list to upload
                children.push(collection.doc);

                // Add the item to the current collections children
                currentCollection.items.push({
                    type: collection.doc.type,
                    name: collection.doc.name,
                    _id: collection._id|| collection.id
                });
            });

            // Save the changes
            utilityCalls.putCollection(children, function(){

                // If we successfully saved, delete the requested collection
                utilityCalls.deleteCollection(collectionId, function(collection){
                    // Remove the collection from the current collection
                    for(var i = 0; i < currentCollection.items.length; i++){
                        if((currentCollection.items[i]._id||currentCollection.items[i].id) === collectionId){
                            currentCollection.items.splice(i, 1);
                            break;
                        }
                    }

                    utilityCalls.putCollection(currentCollection, function(){
                        console.log("Finished all delete functions");
                    });
                }, function(collection){    // TODO: Temp to remove broken links
                    // Remove the collection from the current collection
                    for(var i = 0; i < currentCollection.items.length; i++){
                        if((currentCollection.items[i]._id||currentCollection.items[i].id) === collectionId){
                            currentCollection.items.splice(i, 1);
                            break;
                        }
                    }

                    utilityCalls.putCollection(currentCollection, function(){
                        console.log("Finished all delete functions");
                    });
                });
            });
        },
        function(error)
        {
            console.log(error);
        });
    }

    function getRootCollection(success, fail)
    {
        utilityCalls.getCollection("root",
            function(collection)
            {
                currentCollection = collection;
                collectionPath = [collection];

                if(typeof success === "function")
                {
                    success(collection);
                }
            }, fail
        );
    }

    (function()
    {
        getRootCollection(null, function(error)
        {
            console.error(error);
        });
    })();
}]);
