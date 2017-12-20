angular.module("utils").service("utilityFunctions", function()
{
    var self = this;

    this.findIn = function(searchArray, searchFunction){
        if(Array.isArray(searchArray)){
            for(var x = 0; x < searchArray.length; x++){
                if(searchFunction(searchArray[x], x)){
                    break;
                }
            }
        }
    };
});
