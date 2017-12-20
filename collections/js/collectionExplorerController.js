angular.module("CollectionsModule", ["ui.tree"])
.controller("collectionExplorerController", ["$scope", "CollectionsService", function($scope, CollectionsService)
{
    $scope.list = [
        {
            id:1,
            title: "a",
            items: [
                {
                    id:2,
                    title: "b"
                },
                {
                    id:3,
                    title: "c",
                    items: [
                        {
                            id: "4",
                            title: "d"
                        }
                    ]
                }
            ]
        }
    ];

    CollectionsService.getCollectionsMap(function(map){
            $scope.list = map;
            $scope.newJSON = JSON.stringify(map);
            $scope.oldJSON = JSON.stringify($scope.list);
        },
        function(error){
            console.log("Error: " + error);
        }
    );

    $scope.yes = function()
    {
        $scope.yesAction();
        $uibModalInstance.close();
    };

    $scope.no = function()
    {
        $scope.noAction();
        $uibModalInstance.dismiss();
    };

    function init()
    {

    }

    init();
}]);

var x = [
    {
        "id":1,
        "title":"a",
        "items":
        [
            {
                "id":2,
                "title":"b"
            },
            {
                "id":3,
                "title":"c"
            }
        ]
    }
];

var y = [
    {
        "id":"root",
        "title":"/",
        "items":[
            {
                "type":
                "collection",
                "name":"OCs",
                "id":"99a8e2d5-c671-4269-a809-74071c2ac72f",
                "title":"OCs",
                "items":[
                    {
                        "type":"collection",
                        "name":"v",
                        "_id":"e2e6fdca-c361-45d7-bee1-49a2cd954646",
                        "$$hashKey":"object:15",
                        "id":"e2e6fdca-c361-45d7-bee1-49a2cd954646",
                        "title":"b",
                        "items":null
                    },
                    {
                        "type":"collection",
                        "name":"d",
                        "_id":"7d624945-4aad-476e-891e-3a403b30694a",
                        "$$hashKey":"object:16",
                        "id":"7d624945-4aad-476e-891e-3a403b30694a",
                        "title":"b",
                        "items":null
                    },
                    {
                        "type":"collection",
                        "name":"ww",
                        "_id":"5c6af903-5e34-41e4-93ab-c84834ef2a1f",
                        "id":"5c6af903-5e34-41e4-93ab-c84834ef2a1f",
                        "title":"Summer",
                        "items":[]
                    }
                ]
            }
        ],"name":""
    }
];
