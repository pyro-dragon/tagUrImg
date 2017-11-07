angular.module("utils").service("utilityCalls", function()
{
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

    this.getNewDocs = function(success, fail, startKey, endKey)
    {
        var options = {include_docs: true};
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
                    success(result.rows[0].value);
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

    this.getAllTags = function(success, fail)
    {
        tagDB.allDocs({include_docs:true})
        .then(
            function(result)
            {
                if(typeof success === "function")
                {
                    var tags = [];
                    angular.forEach(result.rows, function(row)
                    {
                        tags.push(row.doc.name);
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

    this.getMatchingTags = function(tags)
    {

    }

    // Save system configuration document
    this.saveConfig = function(config, success, fail)
    {
        insertData(config, db,
            function()
            {
                if(typeof success === 'function')
                {
                    success();
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
    }

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
    }

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
            db.get(key)
            .then(success)
            .catch(fail);
        }
    }

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
});
