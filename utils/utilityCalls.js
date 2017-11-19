angular.module("utils").service("utilityCalls", function()
{
    var self = this;

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

    this.getNewDocs = function(success, fail, startKey, endKey)
    {
        var options = {};
        startKey ? options.startkey = startKey : options.limit = 20;
        endKey ? options.endkey = endKey : null;
        newDocsQuery(false, options,
            function (result)
            {
                if(typeof success === "function")
                {
                    success(result.rows);
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

    this.getNewDocCount = function(success, fail)
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

    this.getImagesByTags = function(tags, success, fail)
    {
        db.find(
            {
                selector: {"tags": { "$all": tags}},
                limit: 40
            }
        )
        .then(
            function(result)
            {
                if(typeof success === "function")
                {
                    success(result.docs);
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

    // Basic data fetch function
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
            db.put(data)
            .then(success)
            .catch(fail);
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
