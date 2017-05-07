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
  res.status(200).send(Object.keys(getPasswords()));
});

app.get('/password', (req, res) => {
  const rawID = req.query.id;
  if (rawID == null) {
    missing(res, 'id');
    return;
  }
  const id = JSON.parse(rawID);

  const passwords = getPasswords();
  if (passwords[id] == null) {
    missingID(res, id);
    return;
  }

  res.status(200).send(passwords[id]);
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
  const passwords = getPasswords();
  const result = [];
  for (const id of ids) {
    if (passwords[id] == null) {
      missingID(res, id);
      return;
    }
    result.push(passwords[id]);
  }

  res.status(200).send(result);
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
    id: nextID(),
    url: String(url),
    username: String(username),
    password: String(password),
    notes: String(notes),
  };

  const passwords = getPasswords();
  passwords[newPassword.id] = newPassword;
  setPasswords(passwords);

  res.status(200).send(newPassword);
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
      id: nextID(),
      url: String(url[i]),
      username: String(usernames[i]),
      password: String(password[i]),
      notes: String(notess[i]),
    });
  }

  const passwordList = getPasswords();
  for (const newPassword of newPasswords) {
    passwordList[newPassword.id] = newPassword;
  }
  setPasswords(passwordList);

  res.status(200).send(newPasswords);
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
  const url = JSON.parse(rawUrl);
  const username = JSON.parse(rawUsername);
  const password = JSON.parse(rawPassword);
  const notes = JSON.parse(rawNotes);


  const passwords = getPasswords();
  if (passwords[id] == null) {
    missingID(res, id);
    return;
  }

  passwords[id].url = String(url);
  passwords[id].username = String(username);
  passwords[id].password = String(password);
  passwords[id].notes = String(notes);
  setPasswords(passwords);

  res.status(200).send(passwords[id]);
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

  const results = [];
  const passwordList = getPasswords();
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const url = urls[i];
    const username = usernames[i];
    const password = passwords[i];
    const notes = notess[i];
    if (passwordList[id] == null) {
      missingID(res, id);
      return;
    }
    passwordList[id].url = String(url);
    passwordList[id].username = String(username);
    passwordList[id].password = String(password);
    passwordList[id].notes = String(notes);
    results.push(passwordList[id]);
  }

  setPasswords(passwordList);
  res.status(200).send(results);
});

app.post('/password/delete', (req, res) => {
  const rawID = req.query.id;
  if (rawID == null) {
    missing(res, 'id');
    return;
  }
  const id = JSON.parse(rawID);

  const passwords = getPasswords();
  if (passwords[id] == null) {
    missingID(res, id);
    return;
  }

  delete passwords[id];
  setPasswords(passwords);
  res.status(200).send();
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

  const passwords = getPasswords();
  for (let id of ids) {
    if (passwords[id] == null) {
      missingID(res, id);
      return;
    }
    delete passwords[id];
  }

  setPasswords(passwords);
  res.status(200).send();
});

/**
 * Start listening on port 3000
 */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

///// Some helper functions /////

function unique(arr) {
  const set = new Set(arr);
  return set.size === arr.length;
}

function missing(res, field) {
  res.status(400).send(`Missing required query param: ${field}.`);
}

function missingID(res, id) {
  res.status(404).send('Password not found for ID: ${id}.');
}

function getPasswords() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function setPasswords(passwords) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(passwords, null, 2), 'utf8');
}

let max = null;
function nextID() {
  if (max == null) {
    max = 0;
    Object.keys(getPasswords()).forEach(key => {
      if (/^id_[1-9]\d*$/.test(key)) {
        const idPart = key.split('_')[1];
        max = Math.max(max, Number(idPart));
      } else {
        throw new Error(
          `Invalid id "${key}" found, ids must look like id_<number>`
        );
      }
    });
  }
  return 'id_' + (++max);
}
