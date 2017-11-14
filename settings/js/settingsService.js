angular.module("settingsModule").service("settingsService", ["utilityCalls", function(utilityCalls)
{
    var self = this;

    var settingsReady = false;

    var settings = {};

    var queuedSuccessFunctions = [];
    var queuedFailFunctions = [];

    function init()
    {
        // Load in the config data right at the start.
        utilityCalls.getConfig(function(config)
    		{
                // Get the settings remotely
    			settings = config;

                // Execure all enqued success functions
                angular.forEach(queuedSuccessFunctions, function(func)
                    {
                        if(typeof func === "function")
                        {
                            func(settings);
                        }
                    }
                );

                settingsReady = true;
    		},
            function(error)
            {
                // Execute all queues failure functions
                angular.forEach(queuedFailFunctions, function(func)
                    {
                        if(typeof func === "function")
                        {
                            func(error);
                        }
                    }
                );

                settingsReady = true;
            }
        );
    }

    // Get the config.
    // Its possible that the database call to load in config
    // data is still running so we have to allow the system to get the data
    // asynchonously.
    this.getConfig = function(success, fail)
    {
        if(!settingsReady)
        {
            queuedSuccessFunctions.push(success);
            queuedFailFunctions.push(fail);
        }
        else
        {
            if(typeof success === "function")
            {
                success(settings);
            }
        }
    };

    this.saveConfig = function(success, fail)
    {
        utilityCalls.saveConfig(settings, success, fail);
    };

    this.banFile = function(path, success, fail)
    {
        function addBannedPath(path)
        {
            if(!settings.bannedFiles)
            {
                settings.bannedFiles = [];
            }

            settings.bannedFiles.push(path);

            self.saveConfig(success, fail);
        }

        if(settingsReady)
        {
            addBannedPath(path, success, fail);
        }
        else
        {
            self.getConfig(success, fail);
        }
    };

    init();
}]);
