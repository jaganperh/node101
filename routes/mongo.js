
var mongo = require("mongoskin"),

    url = require("url")
var db = mongo.db('localhost:27017/tenant2?auto_reconnect', {safe:true});
var entities = db.collection("entities")

function entityMetadata(name)
{ 
    this._id = name
    this.fields = []

}

function fieldMetadata(name, type)
{
    this._id = name
    this.type = type
}

function dataRequest()
{
    this.requestType = ""
    this.tableName = ""
    this.filterById = ""
    this.body = "testbody"
    
}

function getFieldMetadata(instance)
{ 
    fields = []

     for (var field in instance)
     { 
         var fMetadata = new fieldMetadata(field, typeof instance[field])

         fields.push(fMetadata)
     }

     return fields
}

function addMetadata(dataRequest)
{ 
     var metadataAllEntitiesCollection = "entities"

     // add tableName to list of entities

     console.log("adding ",dataRequest.tableName," to ", metadataAllEntitiesCollection)

     var entry = new entityMetadata(dataRequest.tableName)

     var fields = getFieldMetadata(dataRequest.body)

     entry.fields = fields

     entities.update(
        { _id: dataRequest.tableName },
        { $addToSet: { fields: {$each: entry.fields} }  },
        {upsert: true},
        onSaveComplete
     )

}

function addItem(dataRequest)
{ 

    // add the item and its metadata.

    if (dataRequest.tableName == "metadata")
    {
        return;
    }

    // add the tablename to metaddata list.

    addMetadata(dataRequest)

    // add the item to the collection
    //TODO: create the collection on-demand if it doesnt exist.


    var collection = db.collection(dataRequest.tableName)

    console.log("updating: ",dataRequest.tableName)

    //todo: Need to think thru' updates of subdocuments (especially array types - the current approach just replaces such arrys
    // where as what we will need is addToSet equivalent for subdocuments that are array types...

    // delete the _id field in the body since it is being specified in the update query criteria.
    delete dataRequest.body._id

    collection.update(
        { _id: dataRequest.filterById },
        { $set: dataRequest.body },
        { upsert: true },
        onSaveComplete)
    
}

function onSaveComplete(err, value)
{
    if (err)
    { 
         console.log("onsavecomplete: ", err)
    }
    console.log("onsavecomplete: ", value)


}

function executeRequest(dataRequest, res)
{
    switch (dataRequest.requestType)
    {
        case "post":
              addItem(dataRequest)

            break;

        case "get":

            if (dataRequest.tableName == "metadata")
            { 
                 getMetadata(dataRequest,res)

            }

            else if (dataRequest.filterById != "") {

                getItem(dataRequest, res)

            }
            else {
                getItems(dataRequest, res)

            }

            break;
    }
}

function getMetadata(dataRequest, res)
{
    if (dataRequest.filterById != "") 
    {
        getMetadataForEntity(dataRequest.filterById, res) //TODO: clean this up - dataRequest should always have a clean entityName property irrespective of whether it is a data req or metadata req.
    }
    else
    { 
        getMetadataAllEntities(dataRequest, res)
    }
}

function getMetadataAllEntities(dataRequest, res)
{
    
     var metadataAllEntitiesCollection = "entities"

     console.log("Calling entities.find")

     db.collection('entities').find().toArray(
               function (err, value)
                { 
                console.log(value)
                res.send(value)
                }
     )
}

function getMetadataForEntity(entityName, res)
{
       db.collection('entities').find(
          {_id:entityName},
          {}).toArray(
                  function (err, value)
                  { 
                    console.log(value)
                    res.send(value)
                  }
          )
}

function getItem(dataRequest, res)
{ 

    var collection = db.collection(dataRequest.tableName)

    collection.findOne(
          {_id:dataRequest.filterById},
          {},
          function (err, value)
          { 
            console.log(value)
            res.send(value)
          }
     )
}

function getItems(dataRequest, res)
{ 
    var collection = db.collection(dataRequest.tableName)

    collection.find(
          {},
          {}).toArray(
                  function (err, value)
                  { 
                    console.log(value)
                    res.send(value)
                  }
     )
}

// valid urls:
// /collections/contacts -- return all contacts
// /collections/contacts/foo - return contact foo
// /collections or /collections/metadata - return all entities
// /collections/metaddata/contacts - return metadata for contacts entity

function parseUri(req)
{
    var r = new dataRequest()

    r.requestType = req.method.toLowerCase()

    if (r.requestType == "post")
    { 
        console.log("reqbody ", req.body)

        r.body = req.body
    
    }

    var parts = url.parse(req.url)

    var pathname = parts.pathname

    var pathParts = pathname.split('/')

    console.log("path parts = ",pathParts)

    if (pathParts.length == 2 || pathParts[2] == "") // ie /collections or /collections/
    { 
          r.tableName = "metadata"

          return r
    }

    r.tableName = pathParts[2] // tableName == "metadata" for metdata requests - clean this up.

    if (pathParts.length == 4)
    { 
        r.filterById = pathParts[3].toLowerCase() //filterById == entityname (contacts) for metadata requests - clean this up.
    
    }

    return r
}

exports.mongoDatasvc = function (req, res) {

    var request = parseUri(req)

    console.log("parsed request: ", request)

    executeRequest(request, res)

}