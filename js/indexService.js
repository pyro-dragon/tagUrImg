angular.module("indexModule").service("scanner", ["settingsService", function(settingsService)
{
    this.scan = function(path, config)
	{
        var self = this;
		this.files = [];
        var fileExtensionExtractor = /(?:\.([^.]+))?$/;

		this.findFiles = function(path)
		{
			fs.readdir(path, (err, dir) => {
                if(!err)
                {
                    for (var i = 0, node; node = dir[i]; i++)
    				{
    					var currentPath = path + "/" + node;
    					if(fs.lstatSync(currentPath).isDirectory()){
    						self.findFiles(currentPath);
    					}
    					else{
    						// do stuff with path
                            if(config.bannedFiles.indexOf(currentPath) === -1 && config.allowedFileTypes.indexOf(fileExtensionExtractor.exec(currentPath)[1]) > -1)
                            {
                                self.files.push(currentPath);
                            }
    					}
    				}
                }
                else
                {
                    console.log("Error scanning directories: " + err);
                }
			});
		};

		this.findFiles(path);

        return this.files;
	};
}]);
