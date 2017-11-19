const fs = require("fs");
const shell = require('electron').shell;
const path = require('path');
const PouchDB = require('pouchdb-browser');
PouchDB.plugin(require('pouchdb-find'));

// As an indexed DB
var db = new PouchDB('mydb');
var tagDB = new PouchDB('tagDB');

// As a WebSQL DB
//var db = new PouchDB('mydb', {adapter: 'websql'});
db.get('_design/main').then(function (doc) {
  console.log("main db dd rev:" + doc._rev);
});

var override = false;
var destroy = false;

// Init the database
db.get("_design/main", function (error, response) {
    if(error || override){
        if(override || error.status === 404)
        {
            var ddoc = {
                _id: '_design/main',
                //_rev: "2-e66450fd50c042c3b2cfab9587c84863",
                views: {
                    getNew: {
                        map: function(doc){
                            if(doc.new === true)
                            {
                                emit(doc._id);
                            }
                        }.toString(),
                        reduce: '_count'
                    },
                    getDocTags: {
                        map: function(doc) {
                            if(doc.tags && doc.tags.length > 0) {
                                for(var idx in doc.tags) {
                                    emit(doc.tags[idx]);
                                }
                            }
                        }.toString()
                    }
                }
            };

            db.put(ddoc).then(function(){
                console.log("Created the main design doc");
            }).catch(function(error){
                console.log("An error occured creating the design doc: " + error);
            });
        }
        else {
            console.log("An error occured getting the main design doc: " + error);
        }
    }
    else {
        console.log("Main design document exists.");
    }
});

// Create tagging index
db.createIndex(
    {
        //fields: [{"name": "tags.[]", "type": "string"}],
        fields: [
            {
                name: "tags.[]",
                type: "string"
            }
        ],
        name: "tag_index"
    });
// ).then(function(){
//     db.find(
//         {
//             selector: {"tags": { "$all": ["magic user", "female"]}}
//             //ddoc: "my-index-design-doc"
//         }
//     )
//     .then(
//         function(result)
//         {
//             console.log("Results success: " );
//             console.log(result);
//         }
//     )
//     .catch(
//         function(error)
//         {
//             console.log("Results fail: " + error);
//         }
//     );
// });

PouchDB.debug.enable('pouchdb:find');

// Init the program options
db.get("config", function (error, response) {
    if(error && error.status === 404)
    {
        var ddoc = {
            _id: 'config',
            //_rev: "",
            directories: [],
			firstTime: true,
			showHints: true,
			itemsPerPage: 40
        };

        db.put(ddoc).then(function(){
            console.log("Created the config doc");
        }).catch(function(error){
            console.log("An error occured creating the config doc: " + error);
        });
    }
    else
    {
        console.log("Config document exists.");
    }
});

// Don't need a design doc for tagDB yet

if(destroy)
{
    db.destroy().then(function ()
    {
        console.log("DB destroyed");
    }).catch(function (err) {
        console.log("Error occured destroying the DB: " + err);
    });
}
