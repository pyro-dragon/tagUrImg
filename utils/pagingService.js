angular.module("utils").service("pagingService", ["utilityCalls", function(utilityCalls)
{
    this.getNextPage = getNextPage;
    this.getPreviousPage = getPreviousPage;
    this.getPage = getPage;

    function getNextPage(search, pageMetaData, success, fail)
    {
        getPage(search, pageMetaData, false, success, fail);
    }

    function getPreviousPage(search, pageMetaData, success, fail)
    {
        getPage(search, pageMetaData, true, success, fail);
    }

    function getPage(search, pageMetaData, reverse, success, fail)
    {
        utilityCalls.mangoSearch(search, {startkey: pageMetaData.endPageIndex, reverse: reverse, itemsPerPage: pageMetaData.itemsPerPage + 1},
            function(results)
            {
                page = new Page(results, pageMetaData);

                if(!page.metaData.startPageIndex){
                    page.metaData.startPageIndex = results[0]._id;
                }

                // Get the handle for the next page
                if(results.length === pageMetaData.itemsPerPage + 1){
                    page.metaData.endPageIndex = results.pop()._id;
                }
                else{
                    // We are at the end of the results list
                    delete page.metaData.endIndex;
                }

                if(typeof success === "function")
                {
                    success(page);
                }
            },
            function(error)
            {
                if(typeof fail === "function")
                {
                    fail(error);
                }
            }
        );
    }
}]);
