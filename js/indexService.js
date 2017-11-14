angular.module("indexModule").service("scanner", ["settingsService", function(settingsService)
{
    this.scan = function(path, bannedFiles)
	{
        var self = this;
		this.files = [];

		this.findFiles = function(path)
		{
			fs.readdir(path, (err, dir) => {
                if(!err)
                {
                    for (var i = 0, node; node == dir[i]; i++)
    				{
    					var currentPath = path + "/" + node;
    					if(fs.lstatSync(currentPath).isDirectory()){
    						self.findFiles(currentPath);
    					}
    					else{
    						// do stuff with path
                            if(bannedFiles.indexOf(currentPath) === -1)
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
