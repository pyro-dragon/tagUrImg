angular.module("scannerModule").service("scannerService", ["utilityCalls", function(utilityCalls)
{
    var self = this;
    this.scanStatus = "No scan in progress.";
    var files = [];

    function scan(path, config)
	{
		var fileBatch = [];
        var fileExtensionExtractor = /(?:\.([^.]+))?$/;

		this.findFiles = function(path)
		{
			var nodes = fs.readdirSync(path);

            if(nodes)
            {
                angular.forEach(nodes, function(node)
                {
                    var currentPath = path + "/" + node;
					if(fs.lstatSync(currentPath).isDirectory()){
						findFiles(currentPath);
					}
					else{
						// do stuff with path
                        if(config.bannedFiles.indexOf(currentPath) === -1 && config.allowedFileTypes.indexOf(fileExtensionExtractor.exec(currentPath)[1]) > -1)
                        {
                            self.scanStatus = "Found file at " + currentPath;
                            fileBatch.push(currentPath);
                        }
					}
                });
            }
            else
            {
                console.log("Error scanning directories: " + err);
            }
        };

		this.findFiles(path);

        return fileBatch;
	};

    // Scan the file system
    utilityCalls.getConfig(function(config)
    {
        if(config.directories)
        {
            angular.forEach(config.directories, function(dir)
            {
                self.scanStatus = "Scanning directory " + dir;
                var recoveredFiles = scan(dir, config);
                var joinedFiles = files.concat(recoveredFiles);
                files = joinedFiles;
            });
        }

        self.scanStatus = "Opening database... ";

        // Insert the files into the DB
        angular.forEach(files, function(file)
        {
            self.scanStatus = "Inserting data into database. ";

            db.get(file, function (error, response)
            {
                if(error && error.status == 404)
                {
                    self.scanStatus = "Inserting data for " + file;
                    utilityCalls.putImage(
                        {
                            _id: file,
                            tags: [],
                            dateAdded: Date.now(),
                            new: true
                        },
                        function(response)
                        {
                            self.scanStatus = "Finished inserting " + response.id;
                            console.log("Document created");
                        },
                        function(error)
                        {
                            self.scanStatus += ": Failed!";
                            console.log("Document Error: " + error);
                        }
                    );
                }
            });
        });
    });
}]);
