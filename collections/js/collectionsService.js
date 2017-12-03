angular.module("CollectionsModule").service("CollectionsService", ["utilityCalls", function(utilityCalls)
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
            utilityCalls.getCollection(collectionId, function(collection)
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
