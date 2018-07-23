angular.module("processModule").service("processService", ["utilityCalls", "settingsService", "pagingService", function(utilityCalls, settingsService, pagingService)
{
    var self = this;

    this.currentPageContents = [];
    this.currentPage = 0;
    this.nextPageStartKey = undefined;
    this.lastPageStartKey = undefined;
    this.serviceInitialised = false;
    this.getCurrentPage = getCurrentPage;

    // Accessable functions
    this.getNextPage = getNextPage;
    this.getPreviousPage = getPreviousPage;

    var postInitFunction = function(){};    // A function to run after init.

    var pageSearch = {"tags": { "$size": 0}};

    var pageMetaData = new PageMetaData();

    function init()
    {
        // Do the initial search for the data
        settingsService.getConfig(function(settings){

            self.loading = true;

            // Save the items-per-page count
            pageMetaData = new PageMetaData(settings.itemsPerPage);

            getPage(false, function(content){
                self.serviceInitialised = true;
                self.loading = false;
                postInitFunction(content);
            });
        });
    }

    function getPage(reverse, success, fail)
    {
        pagingService.getPage(pageSearch, pageMetaData, reverse, function(page)
        {
            self.loading = false;
            self.currentPageContents = page.content;
            this.lastPageStartKey = page.metaData.startIndex;
            this.nextPageStartKey = page.metaData.endIndex;

            if(typeof success === "function"){
                success(page.content);
            }
        },
        function(error)
        {
            self.loading = false;
            console.error("Error on getting the first page: " + error);

            if(typeof fail === "function"){
                fail(error);
            }
        });
    }

    // Get the current page set. This is asynchonus as the service could still
    // be initialising when the request comes in.
    function getCurrentPage(success)
    {
        if(!self.serviceInitialised)
        {
            postInitFunction = success;
        }
        else if(typeof success === "function")
        {
            success(self.currentPageContents);
        }
    }

    // Get the next page of search results
    function getNextPage(success)
    {
        getPage(false, success);
    }

    // Get the previous page of search results
    function getPreviousPage(success)
    {
        getPage(true, success);
    }

    init();
}]);
