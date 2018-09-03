angular.module("processModule").service("processService", ["utilityCalls", "settingsService", "pagingService", function(utilityCalls, settingsService, pagingService)
{
    var self = this;

    // Accessable variables
    this.currentPageContents = [];
    this.currentPage = 0;
    this.nextPageStartKey = undefined;
    this.lastPageStartKey = undefined;
    this.atStart = true;
    this.atEnd = true;

    pageNumber = -1;

    // Accessable functions
    this.getNextPage = getNextPage;
    this.getPreviousPage = getPreviousPage;

    // Search the database for the given tags
    function search(pageIndex, reverse, success)
    {
        self.loading = true;
        if(!pageIndex){
            pageNumber = -1;
        }

        settingsService.getConfig(function(settings)
        {
            utilityCalls.getNewImages({startkey: pageIndex, reverse: reverse, itemsPerPage: settings.itemsPerPage + 1},
                function(results)
                {
                    self.loading = false;
                    self.currentPageContents = results.docs;

                    // Check if this is a fresh search
                    if(pageIndex === undefined){
                        // Reset page count params
                        delete self.nextPageStartKey;
                        self.firstItemId = results.docs[0]._id;
                        self.atStart = false;
                        self.atEnd = false;
                    }

                    // Reset the flags
                    self.atStart = false;
                    self.atEnd = false;

                    // Grab the handle for the previouse page
                    self.lastPageStartKey = results.docs[0]._id;

                    // Get the handle for the next page
                    if(results.docs.length === settings.itemsPerPage + 1){
                        self.nextPageStartKey = results.docs.pop()._id;
                    }
                    else{
                        // We are at the end of the results list
                        delete self.nextPageStartKey;
                        self.atEnd = true;
                    }

                    // Check if we are at the start of the results list
                    if(self.lastPageStartKey === self.firstItemId){
                        self.atStart = true;
                    }

                    if(typeof success === "function")
                    {
                        success(results.docs);
                    }
                },
                function(error)
                {
                    self.loading = false;
                    console.log("Error!");
                }
            );
        });
    }

    // Get the next page of search results
    function getNextPage(success)
    {
        search(self.nextPageStartKey, false, success);
    }

    // Get the previous page of search results
    function getPreviousPage(success)
    {
        search(self.lastPageStartKey, true, success);
    }

    function getNewImages(pageMetaData, success, fail){

    }
}]);
