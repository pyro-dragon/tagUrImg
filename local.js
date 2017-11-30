const fs = require("fs");
const shell = require('electron').shell;
const path = require('path');
const PouchDB = require('pouchdb-browser');
PouchDB.plugin(require('pouchdb-find'));

// As an indexed DB
var db = new PouchDB('mydb');
var tagDB = new PouchDB('tagDB');
var collectionDb = new PouchDB('collectionDb');

// As a WebSQL DB
//var db = new PouchDB('mydb', {adapter: 'websql'});
db.get('_design/main').then(function (doc) {
    console.log("main db dd rev:" + doc._rev);
});

var override = false;
var overrideConfig = false;
var overrideCollection = false;
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
    }
);

PouchDB.debug.enable('pouchdb:find');

// Init the program options
db.get("config", function (error, response) {
    //var overrideConfig = true;
    if(overrideConfig || (error && error.status === 404))
    {
        var doc = {
            _id: 'config',
            //_rev: "40-802d6d9dc65b4d8cb7003ba9986e61ce",
            directories: [],
            bannedFiles: [],
			firstTime: true,
			showHints: true,
			itemsPerPage: 40,
            allowedFileTypes: ["jpeg", "jpg", "webp", "png", "apng", "tiff", "pdf", "bmp", "ico"]
        };

        db.put(doc).then(function(){
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

// Get the rev of the settings
db.get('config').then(function (doc) {
    console.log("config rev:" + doc._rev);
    console.log(doc);
});

// Init the root collection
collectionDb.get("root", function (error, response) {
    //var overrideConfig = true;
    if(overrideCollection || (error && error.status === 404))
    {
        var doc = {
            _id: 'root',
            //_rev: "40-802d6d9dc65b4d8cb7003ba9986e61ce",
            name:"",
            items:[]
        };

        collectionDb.put(doc).then(function(){
            console.log("Created the root collection doc");
        }).catch(function(error){
            console.log("An error occured creating the root collection doc: " + error);
        });
    }
    else
    {
        console.log("Root document exists.");
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
