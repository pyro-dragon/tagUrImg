angular.module("processModule").service("processService", ["utilityCalls", "settingsService", function(utilityCalls, settingsService)
{
    var self = this;

    this.currentPageContents = [];
    this.currentPage = 0;
    this.nextPageStartKey = undefined;
    this.lastPageStartKey = undefined;
    this.loading = false;
    this.pageCount = 0;

    function init(){

    }

    this.getFirstPage = function(success, fail){
        settingsService.getConfig(function(settings){

            loading = true;
            utilityCalls.getNewDocs(
                {
                    itemsPerPage: settings.itemsPerPage +1, // We want to get a handle on the next page start position.
                },
                function(result, totalResults)
                {
                    self.loading = false;
                    self.nextPageStartKey = result.pop().id;
                    self.currentPage = 1;
                    self.currentPageContents = result;
                    self.pageCount = Math.ceil(totalResults / settings.itemsPerPage);

                    if(typeof success === "function"){
                        success(result, totalResults);
                    }
                },
                function(error)
                {
                    loading = false;
                    console.error("Error on getting the first page: " + error);

                    if(typeof fail === "function"){
                        fail(error);
                    }
                }
            );
        });
    };

    this.getNextPage = function(success, fail){
        if(self.nextPageStartKey){
            settingsService.getConfig(function(settings){
                loading = true;

                    utilityCalls.getNewDocs(
                    {
                        itemsPerPage: settings.itemsPerPage +1, // We want to get a handle on the next page start position.
                        startKey: self.nextPageStartKey
                    },
                    function(result)
                    {
                        self.loading = false;
                        self.lastPageStartKey = self.nextPageStartKey;
                        self.nextPageStartKey = result.length >= settings.itemsPerPage?  result.pop().id : undefined;
                        self.currentPage++;
                        self.currentPageContents = result;

                        if(typeof success === "function"){
                            success(result);
                        }
                    },
                    function(error)
                    {
                        self.loading = false;
                        console.error("Error on getting next page: " + error);

                        if(typeof fail === "function"){
                            fail(error);
                        }
                    }
                );
            });
        }
    };

    this.getPrevPage = function(success, fail){
        if(self.lastPageStartKey){
            settingsService.getConfig(function(settings){
                loading = true;

                utilityCalls.getNewDocs(
                    {
                        itemsPerPage: settings.itemsPerPage +1, // We want to get a handle on the next page start position.
                        startKey: self.lastPageStartKey,
                        reverse: true
                    },
                    function(result)
                    {
                        self.loading = false;
                        result.reverse();    // Its comming back in reverse order, lets fix that
                        self.nextPageStartKey = self.lastPageStartKey;
                        self.lastPageStartKey = result.pop().id;
                        self.currentPage--;
                        self.currentPageContents = result;

                        if(typeof success === "function"){
                            success(result);
                        }
                    },
                    function(error)
                    {
                        self.loading = false;
                        console.error("Error on getting previous page: " + error);

                        if(typeof fail === "function"){
                            fail(error);
                        }
                    }
                );
            });
        }
    };

    this.jumpToPage = function(pageNumber){

    };

    init();
}]);
