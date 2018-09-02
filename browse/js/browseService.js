angular.module("browseModule").service("browseService", ["utilityCalls", "settingsService", function(utilityCalls, settingsService)
{
    var self = this;

    // Accessable variables
    this.currentPageContents = [];
    this.currentSearch = [];
    this.currentPage = 0;
    this.nextPageStartKey = undefined;
    this.lastPageStartKey = undefined;
    this.atStart = true;
    this.atEnd = true;

    pageNumber = -1;

    // Accessable functions
    this.search = search;
    this.getNextPage = getNextPage;
    this.getPreviousPage = getPreviousPage;

    function init(){}

    // Search the database for the given tags
    function search(tags, pageIndex, reverse, success)
    {
        self.loading = true;
        if(!pageIndex){
            pageNumber = -1;
        }

        if(Array.isArray(tags))
        {
            settingsService.getConfig(function(settings)
            {
                utilityCalls.getImagesByTags(tags, {startkey: pageIndex, reverse: reverse, itemsPerPage: settings.itemsPerPage + 1},
                    function(results)
                    {
                        if(results.docs.length){

                            self.currentSearch = tags;
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

                        if(typeof fail === "function")
                        {
                            fail(error);
                        }
                    }
                );
            });
        }
    }

    // Get the next page of search results
    function getNextPage(success)
    {
        search(self.currentSearch, self.nextPageStartKey, false, success);
    }

    // Get the previous page of search results
    function getPreviousPage(success)
    {
        search(self.currentSearch, self.lastPageStartKey, true, success);
    }
}]);
