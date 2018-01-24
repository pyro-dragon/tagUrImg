angular.module("utils").service("utilityCalls", function()
{
    var self = this;

    //-------------------------------------------------------------------------
    // Image functions
    //-------------------------------------------------------------------------
	this.putImage = function(image, success, fail)
    {
        insertData(image, db,
            function (result)
            {
                if(typeof success === "function")
                {
                    success(result);
                }
            },
            function (err)
            {
                if(typeof fail === "function")
                {
                    fail(err);
                }
            }
        );
    };

    this.deleteImage = function(image, success, fail)
    {
        image.doc._deleted = true;
        self.putImage(image.doc, success, fail);
    };

    this.getImagesByTags = function(tags, options, success, fail)
    {
		db.find(
			{
				selector: {"tags": { "$all": tags}},
				limit: options? options.itemsPerPage:undefined,
				startkey: options? options.startKey: undefined,
                descending: options? options.reverse: undefined
			}
		)
		.then(
			function(result)
			{
				if(typeof success === "function")
				{
					success(result.rows, result.total_rows);
				}
			}
		)
		.catch(
			function(error)
			{
				if(typeof fail === "function")
				{
					fail(error);
				}
			}
		);
    };

    //-------------------------------------------------------------------------
    // New Document functions
    //-------------------------------------------------------------------------
    this.getNewDocCount = function(options, success, fail)
    {
        newDocsQuery(true, {},
            function (result)
            {
                if(typeof success === "function")
                {
                    if (result.rows[0])
                    {
                        success(result.rows[0].value);
                    }
                    else {
                        success(0);
                    }
                }
            },
            function (err)
            {
                if(typeof fail === "function")
                {
                    fail(err);
                }
            }
        );
    };

	// Return the list of new docs
    this.getNewDocs = function(options, success, fail)
    {
		newDocsQuery(
			false,
			{
				limit: options? options.itemsPerPage:undefined,
				startkey: options? options.startKey:undefined,
                descending: options? options.reverse: undefined
			},
            function (result)
            {
                if(typeof success === "function")
                {
                    success(result.rows, result.total_rows);
                }
            },
            function (err)
            {
                if(typeof fail === "function")
                {
                    fail(err);
                }
            }
        );
    };

    //-------------------------------------------------------------------------
    // Tag functions
    //-------------------------------------------------------------------------
    this.addTag = function(tag, success, fail)
    {
        if(tag._rev){

            console.log("Can't add Tag with a _rev value. Use changeTag().");

            if(typeof fail === "function")
            {
                fail("Can't add Tag with a _rev value. Use changeTag().");
            }

            return;
        }

        tag.name = tag.name.toLowerCase();
        tag.name = tag.name.replace(" ", "-");

        insertData(tag, tagDB,
            function (result)
            {
                if(typeof success === "function")
                {
                    success(result);
                }
            },
            function (err)
            {
                if(typeof fail === "function")
                {
                    fail(err);
                }
            }
        );
    };

    this.editTag = function(tag, oldTagName, success, fail)
    {
        // Check to see if the tag name (_id) has changed
        getData(tag.name, tagDB,
            function(response)
            {
                if(response.name !== tag.name)
                {
                    fail("There is an inconsistency between the tag name and key name.");
                }
                else
                {
                    // No changes to the name, lets just update the tag properties
                    insertData(tag, tagDB,
                        function (result)
                        {
                            if(typeof success === "function")
                            {
                                success(result);
                            }
                        },
                        function (err)
                        {
                            if(typeof fail === "function")
                            {
                                fail(err);
                            }
                        }
                    );
                }
            },
            function(error)
            {
                if(error && error.status == 404)
                {
                    // Name not found, we are changing the name. This means we need to change where it appears in all images.

                    // Grab all images where this tag occurs
                    self.getImagesByTags([oldTagName],
                        function(images)
                        {
                            // Right, time to cycle through all the images and make a change to the tag
                            bulkUpdateData(images, function(image)
                            {
                                image.tags[image.tags.indexOf(oldTagName)] = tag.name;
                            });

                            // Lets post off this data now
                            insertData(images, db,
                                function()
                                {
                                    // Everything went ok, update the tag name now
                                    insertData(tag, tagDB,
                                        function (result)
                                        {
                                            if(typeof success === "function")
                                            {
                                                success(result);
                                            }
                                        },
                                        function (err)
                                        {
                                            if(typeof fail === "function")
                                            {
                                                fail(err);
                                            }
                                        }
                                    );
                                },
                                fail
                            );
                        },
                        function(error)
                        {
                            console.log("Woops, we had an issue getting all images that match the tag.");
                        }
                    );
                }
            }
        );
    };

    this.getAllTags = function(success, fail, wholeDoc)
    {
        tagDB.allDocs({include_docs:wholeDoc === true})
        .then(
            function(result)
            {
                if(typeof success === "function")
                {
                    var tags = [];
                    angular.forEach(result.rows, function(row)
                    {
                        if(wholeDoc)
                        {
                            tags.push(row.doc);
                        }
                        else {
                            tags.push(row.key);
                        }
                    });

                    success(tags);
                }
            }
        )
        .catch(
            function(error)
            {
                if(typeof fail === "function")
                {
                    fail(error);
                }
            }
        );
    };

    //-------------------------------------------------------------------------
    // Config functions
    //-------------------------------------------------------------------------

    // Save system configuration document
    this.saveConfig = function(config, success, fail)
    {
        insertData(config, db,
            function(response)
            {
                if(typeof success === 'function')
                {
                    success(response);
                }
            },
            function(error)
            {
                if(typeof fail === 'function')
                {
                    fail(error);
                }
            }
        );
    };

	// Get the database config
	this.getConfig = function(success, fail)
	{
		db.get("config", function (error, response)
		{
			if(error)
			{
				console.log("Error getting config: " + error);

				if(typeof fail === "function")
				{
					fail(error);
				}
			}
			else {
				if(typeof success === "function")
				{
					success(response);
				}
			}
		});
	};

    //-------------------------------------------------------------------------
    // Collection functions
    //-------------------------------------------------------------------------
    this.getCollection = function(collectionID, success, fail)
    {
        getData(collectionID, collectionDb,
            function(response)
            {
                if(typeof success === 'function')
                {
                    success(response);
                }
            },
            function(error)
            {
                if(typeof fail === 'function')
                {
                    fail(error);
                }
            }
        );
    };

    this.putCollection = function(collection, success, fail)
    {
        insertData(collection, collectionDb,
            function(response)
            {
                if(typeof success === 'function')
                {
                    success(response);
                }
            },
            function(error)
            {
                if(typeof fail === 'function')
                {
                    fail(error);
                }
            }
        );
    };

    this.getChildCollectionsOf = function(id, success, fail)
    {
        getCollectionChildrenQuery(id, success, fail);
    };

    this.getAllCollectionChildren = function(success, fail)
    {
        collectionDb.query("main/getChildren", {
            include_docs:true
        })
        .then(success)
        .catch(fail);
    };

    this.deleteCollection = function(id, success, fail)
    {
        deleteData(id, collectionDb,
        function(response){
            console.log("successfully deleted: " + response);

            if(typeof success === "function"){
                success(response);
            }
        },
        function(error){
            console.log("Error deleting collections: " + error);

            if(typeof fail === "function"){
                fail(error);
            }
        });
    };

    //-------------------------------------------------------------------------
    // Query functions
    //-------------------------------------------------------------------------

    // Return all the image tags in the database
    var imageTagsQuery = function(options, success, fail)
    {
        db.query("main/getTags", options)
        .then(success)
        .catch(fail);
    };

    // Return all docs labeled as new
    var newDocsQuery = function(reduce, options, success, fail)
    {
        options.reduce = reduce? true:false;
        options.include_docs = reduce? false:true;
        db.query("main/getNew", options)
        .then(success)
        .catch(fail);
    };

    // Return all collections with the supplied parent ID
    var getCollectionChildrenQuery = function(id, success, fail)
    {
        collectionDb.query("main/getParent", {
            reduce: false,
            key: id,
            include_docs:true
        })
        .then(success)
        .catch(fail);
    };

    //-------------------------------------------------------------------------
    // Basic data fetch function
    //-------------------------------------------------------------------------
    var getData = function(keys, db, success, fail)
    {
        if(Array.isArray(keys))
        {
            db.allDocs({keys: keys})
            .then(success)
            .catch(fail);
        }
        else{
            db.get(keys)
            .then(success)
            .catch(fail);
        }
    };

    // Basic data insert function
    var insertData = function(data, db, success, fail)
    {
        if(Array.isArray(data))
        {
            db.bulkDocs(data)
            .then(success)
            .catch(fail);
        }
        else
        {
            if(data._id)
            {
                db.put(data)
                .then(success)
                .catch(fail);
            }
            else
            {
                db.post(data)
                .then(success)
                .catch(fail);
            }
        }
    };

    var deleteData = function(data, db, success, fail)
    {
        if(Array.isArray(data))
        {
            // Mark all docs for deletion
            angular.forEach(data, function(doc){
                doc._deleted = true;
            });

            db.bulkDocs(data)
            .then(success)
            .catch(fail);
        }
        else
        {
            db.remove(data)
            .then(success)
            .catch(fail);
        }
    };

    // Bulk update data- accepts either an object to merge in or a function to process
    var bulkUpdateData = function(docs, change)
    {
        if(Array.isArray(docs))
        {
            if(typeof change === "object")
            {
                angular.forEach(docs, function(doc)
                {
                    Object.assign(doc, change);
                });
            }
            else if(typeof change === "function")
            {
                angular.forEach(docs, function(doc)
                {
                    doc = change(doc);
                });
            }

            return docs;
        }
    };
});
