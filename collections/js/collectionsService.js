angular.module("CollectionsModule").service("CollectionsService", ["utilityCalls", function(utilityCalls)
{
    var self = this;

    var currentCollection = {};

    var collectionPath = [];

    this.getCurrentCollection = function()
    {
        return currentCollection;
    };

    this.getCollectionPath= function()
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

                    // Check to see if the collection exists in the current path
                    if(collectionPath.indexOf(collection) > 0){
                        collectionPath = collectionPath.splice(collectionPath.indexOf(collection), 1);
                    }
                    else{
                        collectionPath.push(collection);
                    }

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

    function getRootCollection(success, fail)
    {
        utilityCalls.getCollection("root",
            function(collection)
            {
                currentCollection = collection;

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
