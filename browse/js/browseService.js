angular.module("browseModule").service("browseService", ["utilityCalls", "settingsService", function(utilityCalls, settingsService)
{
    var self = this;

    // Accessable variables
    this.currentPageContents = [];
    this.currentSearch = [];
    this.currentPage = 0;
    this.nextPageStartKey = undefined;
    this.lastPageStartKey = undefined;
    this.loading = false;
    this.atStart = true;
    this.atEnd = false;

    // Accessable functions
    this.search = search;
    this.getNextPage = getNextPage;
    this.getPreviousPage = getPreviousPage;

    function init(){

    }

    // Search the database for the given tags
    function search(tags, pageIndex, reverse, success)
    {
        self.loading = true;

        if(Array.isArray(tags))
        {
            settingsService.getConfig(function(settings)
            {
                utilityCalls.getImagesByTags(tags, {startkey: pageIndex, reverse: reverse, itemsPerPage: settings.itemsPerPage + 1},
                    function(results)
                    {
                        self.currentSearch = tags;
                        self.loading = false;
                        self.currentPageContents = results.docs;

                        // Check if we have reached the end of the results
                        if(results.docs.length < settings.itemsPerPage)
                        {
                            if(pageIndex){
                                if(reverse){
                                    self.atEnd = true;
                                }
                                else {
                                    self.atStart = true;
                                }
                            }
                            else {
                                self.atStart = true;
                                self.atEnd = true;
                            }
                        }
                        else {
                            self.atStart = false;
                            self.atEnd = false;

                            // Grab the page marker
                            if(results.docs.length > 0)
                            {
                                //self.nextPageStartKey = self.currentPageContents[0]._id; self.currentPageContents.pop();
                                self.nextPageStartKey = self.currentPageContents.pop()._id;
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
        search(self.currentSearch, self.nextPageStartKey, true, success);
    }
}]);
