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
            deleteCollectionAndChildren();
        }
        else
        {
            deleteCollectionOnly();
        }
    };

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
