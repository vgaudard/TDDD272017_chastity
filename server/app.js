/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const MongoClient = require('mongodb');

const mongoUrl = 'mongodb://localhost:27017/chastity';

// The port is hard coded in the client too. If you change it make sure to
// update it there as well.
const PORT = 3000;

// We will just save everything in a simple json file. Not very efficient, but
// this is just an example :)
const DATA_FILE = path.join(__dirname, 'data.json');

const app = express();

app.use('/home', express.static('.'));

app.get('/', (req, res) => {
    res.redirect('/home');
});

/**
 * Set up some help when you navigate to locahost:3000.
 */
app.get('/help', (req, res) => {
  res.send(`<pre>

To view the password app go to http://localhost:${PORT}/home.

==========

GET /ids
  Description:
    Gets a list of all known password ids.

  Query Params:
    None

  Response:
    (list<string>): ids of all passwords

GET /password
  Description:
    This is a way to request data for a single password.

  Query Params:
    id (string): the id to get data for

  Response:
    (Password): password for given id

GET /passwords
  Description:
    This is a way to request data for multiple passwords.

  Query Params:
    ids (list<string>): the ids to get data for

  Response:
    (list<Password>): passwords for given ids

POST /password/create
  Description:
    Creates a new password. The ID will be created on the server. Text is the only
    input.

  Query Params:
    text (string): text content for the new password

  Response:
    (Password): the created password

POST /passwords/create
  Description:
    Creates many new passwords. The IDs will be created on the server. Text is the
    only input.

  Query Params:
    urls (list<string>): urls for the new passwords
    usernames (list<string>): usernames for the new passwords
    passwords (list<string>): passwords for the new passwords
    notes (list<string>): notes for the new passwords

  Response:
    (list<Password>): the created passwords

POST /password/update
  Description:
    Updates a single password. The password must already exist.

  Query Params:
    id (string): the id to update
    url (string): the new url
    username (string): the new username
    password (string): the new password
    notes (string): the new notes

  Response:
    (Password): the updated password

POST /passwords/update
  Description:
    Updates multiple passwords. The passwords must already exist. All of the following
    lists must be the same size and in the same order.

  Query Params:
    ids (list<string>): the ids to update
    urls (list<string>): the new urls
    usernames (list<string>): the new usernames
    passwords (list<string>): the new passwords
    notes (list<string>): the new notes

  Response:
    (list<Password>): the updated passwords

POST /password/delete
  Description:
    Deletes a single password. The password must already exist.

  Query Params:
    id (string): the id to delete

  Response:
    (none): no response, just check the status code

POST /passwords/delete
  Description:
    Deletes multiple passwords. The passwords must already exist.

  Query Params:
    ids (list<string>): the ids to delete

  Response:
    (none): no response, just check the status code

</pre>`);
});

app.get('/ids', (req, res) => {
    MongoClient.connect(mongoUrl, function (err, db) {
        var collection = db.collection('passwords');
        collection.find({}).toArray(function (err, docs) {
            res.status(200).send(docs.map(password => password._id));

            db.close();
        });
    });
});

app.get('/password', (req, res) => {
    const rawID = req.query.id;
    if (rawID == null) {
        missing(res, 'id');
        return;
    }
    const id = JSON.parse(rawID);

    MongoClient.connect(mongoUrl, function (err, db) {
        var collection = db.collection('passwords');
        collection.find({_id: id}).toArray(function (err, docs) {
            res.status(200).send(docs[0]);

            db.close();
        });
    });
});

app.get('/passwords', (req, res) => {
    const rawIDs = req.query.ids;
    if (rawIDs == null) {
        missing(res, 'ids');
        return;
    }

    const ids = JSON.parse(rawIDs);
    if (!unique(ids)) {
        res.status(400).send('ids contains duplicates');
        return;
    }

    var idsAsObjectIds = ids.map(id => MongoClient.ObjectId(id));
    MongoClient.connect(mongoUrl, function (err, db) {
        var collection = db.collection('passwords');
        collection.find({_id: { $in: idsAsObjectIds }}).toArray(function (err, docs) {
            res.status(200).send(docs);

            db.close();
        });
    });
});

app.post('/password/create', (req, res) => {
    const rawUrl = req.query.url;
    const rawUsername = req.query.username;
    const rawPassword = req.query.password;
    const rawNotes = req.query.notes;
    if (rawUrl == null) {
        missing(res, 'url');
        return;
    }
    if (rawUsername == null) {
        missing(res, 'username');
        return;
    }
    if (rawPassword == null) {
        missing(res, 'password');
        return;
    }
    if (rawNotes == null) {
        missing(res, 'notes');
        return;
    }
    const url = JSON.parse(rawUrl);
    const username = JSON.parse(rawUsername);
    const password = JSON.parse(rawPassword);
    const notes = JSON.parse(rawNotes);

    const newPassword = {
        url: String(url),
        username: String(username),
        password: String(password),
        notes: String(notes),
    };
    MongoClient.connect(mongoUrl, function (err, db) {
        var collection = db.collection('passwords');
        collection.insert(newPassword, function (err, result) {
            res.status(200).send(newPassword);

            db.close();
        });
    });
});

app.post('/passwords/create', (req, res) => {
    const rawUrls = req.query.urls;
    const rawUsernames = req.query.usernames;
    const rawPasswords = req.query.passwords;
    const rawNotess = req.query.notes;
    if (rawUrls == null) {
        missing(res, 'urls');
        return;
    }
    if (rawUsernames == null) {
        missing(res, 'usernames');
        return;
    }
    if (rawPasswords == null) {
        missing(res, 'passwords');
        return;
    }
    if (rawNotess == null) {
        missing(res, 'notess');
        return;
    }
    const urls = JSON.parse(rawUrls);
    const usernames = JSON.parse(rawUsernames);
    const passwords = JSON.parse(rawPasswords);
    const notess = JSON.parse(rawNotess);

    const newPasswords = [];
    for (var i = 0; i < urls.size; i++) {
        newPasswords.push({
            url: String(url[i]),
            username: String(usernames[i]),
            password: String(password[i]),
            notes: String(notess[i]),
        });
    }
    MongoClient.connect(mongoUrl, function (err, db) {
        var collection = db.collection('passwords');
        collection.insertMany(newPasswords, function (err, docs) {
            res.status(200).send(newPasswords);

            db.close();
        });
    });
});

app.post('/password/update', (req, res) => {
    const rawID = req.query.id;
    if (rawID == null) {
        missing(res, 'id');
        return;
    }
    const id = JSON.parse(rawID);
    const rawUrl = req.query.url;
    const rawUsername = req.query.username;
    const rawPassword = req.query.password;
    const rawNotes = req.query.notes;
    if (rawUrl == null) {
        missing(res, 'url');
        return;
    }
    if (rawUsername == null) {
        missing(res, 'username');
        return;
    }
    if (rawPassword == null) {
        missing(res, 'password');
        return;
    }
    if (notes == null) {
        missing(res, 'notes');
        return;
    }
    const url = String(JSON.parse(rawUrl));
    const username = String(JSON.parse(rawUsername));
    const password = String(JSON.parse(rawPassword));
    const notes = String(JSON.parse(rawNotes));

    MongoClient.connect(mongoUrl, function (err, db) {
        var collection = db.collection('passwords');
        collection.updateOne({_id: id},
            { $set: {
                url: url,
                username: username,
                password: password,
                notes: notes
            }}
            , function (err, result) {
                res.status(200).send({
                    url: url,
                    username: username,
                    password: password,
                    notes: notes,
                });

                db.close();
            });
    });
});

app.post('/passwords/update', (req, res) => {
    const rawUrls = req.query.urls;
    const rawUsername = req.query.usernames;
    const rawPasswords = req.query.passwords;
    const rawNotes = req.query.notes;
    if (rawUrl == null) {
        missing(res, 'urls');
        return;
    }
    if (rawUsername == null) {
        missing(res, 'usernames');
        return;
    }
    if (rawPassword == null) {
        missing(res, 'passwords');
        return;
    }
    if (notes == null) {
        missing(res, 'notes');
        return;
    }
    const urls = JSON.parse(rawUrls);
    const usernames = JSON.parse(rawUsernames);
    const passwords = JSON.parse(rawPasswords);
    const notess = JSON.parse(rawNotes);


    const rawIDs = req.query.ids;
    if (rawIDs == null) {
        missing(res, 'ids');
        return;
    }
    const ids = JSON.parse(rawIDs);
    if (!unique(ids)) {
        res.status(400).send('ids contains duplicates');
        return;
    }

    throw new Error();
    /*
    MongoClient.connect(mongoUrl, function (err, db) {
        var collection = db.collection('passwords');
        collection.UpdateMany(
            {_id: {$in: ids}},
            {$set: {
                url: urls[i],
                username: username[i],
                password: passwords[i],
                notes: notes[i],
            }}
        ).toArray(function (err, result) {
            res.status(200).send(result);

            db.close();
        });
    });*/
});

app.post('/password/delete', (req, res) => {
    const rawID = req.query.id;
    if (rawID == null) {
        missing(res, 'id');
        return;
    }
    const id = JSON.parse(rawID);

    MongoClient.connect(mongoUrl, function (err, db) {
        var collection = db.collection('passwords');
        collection.deleteOne({_id: id}, function (err, result) {
            res.status(200).send();

            db.close();
        });
    });
});

app.post('/passwords/delete', (req, res) => {
    const rawIDs = req.query.ids;
    if (rawIDs == null) {
        missing(res, 'ids');
        return;
    }

    const ids = JSON.parse(rawIDs);
    if (!unique(ids)) {
        res.status(400).send('ids contains duplicates');
        return;
    }

    MongoClient.connect(mongoUrl, function (err, db) {
        var collection = db.collection('passwords');
        collection.deleteMany({_id: {$in: ids}}, function (err, result) {
            res.status(200).send();

            db.close();
        });
    });
});

/**
 * Start listening on port 3000
 */
app.listen(PORT, () => {
  console.log(`Chastity listening on port ${PORT}!`);
});

///// Some helper functions /////

function unique(arr) {
    const set = new Set(arr);
    return set.size === arr.length;
}

function missing(res, field) {
    res.status(400).send(`Missing required query param: ${field}.`);
}
