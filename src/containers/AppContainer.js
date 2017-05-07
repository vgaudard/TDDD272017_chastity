/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

'use strict';

import AppView from '../views/AppView';
import {Container} from 'flux/utils';
import FakeID from '../utils/FakeID';
import Password from '../models/Password';
import PasswordDispatcher from '../PasswordDispatcher';
import PasswordDraftStore from '../stores/PasswordDraftStore';
import PasswordListStore from '../stores/PasswordListStore';
import PasswordStore from '../stores/PasswordStore';

type PasswordObject = {
    url: string,
    username: string,
    password: string,
    notes: string,
};


function getStores() {
    return [
        PasswordDraftStore,
        PasswordListStore,
        PasswordStore,
    ];
}

function getState() {
    const passwords = PasswordStore.getState();
    const ids = PasswordListStore.getState();

    // Figure out which ids are being deleted.
    const deletedIDs = new Set();
    passwords.forEach((lo, id) => {
        if (lo.isDeleting()) {
            deletedIDs.add(id);
        }
    });

    return {
        draft: PasswordDraftStore.getState(),

        // Then optimistically remove passwords that are being deleted.
        ids: ids.map(list => list.filter(id => !deletedIDs.has(id))),
        passwords: passwords.filter((_, id) => !deletedIDs.has(id)),

        onDelete,
        onDraftCreate,
        onDraftSetUrl,
        onDraftSetUsername,
        onDraftSetPassword,
        onDraftSetNotes,
        onRetry,
        onUpdatePasswords,
    };
}

function onDelete(ids: Array<string>) {
    PasswordDispatcher.dispatch({
        type: 'passwords/start-delete',
        ids,
    });
}

function onDraftCreate(value: PasswordObject) {
    console.log(value);
    if (value) {
        PasswordDispatcher.dispatch({
            type: 'password/start-create',
            fakeID: FakeID.next(),
            url: value.url,
            username: value.username,
            password: value.password,
            notes: value.notes,
        });
    }
}

function onDraftSetUrl(value: string) {
    PasswordDispatcher.dispatch({
        type: 'draft/set-url',
        value,
    });
}

function onDraftSetUsername(value: string) {
    PasswordDispatcher.dispatch({
        type: 'draft/set-username',
        value,
    });
}

function onDraftSetPassword(value: string) {
    PasswordDispatcher.dispatch({
        type: 'draft/set-password',
        value,
    });
}

function onDraftSetNotes(value: string) {
    PasswordDispatcher.dispatch({
        type: 'draft/set-notes',
        value,
    });
}

function onRetry(password: Password) {
    if (FakeID.isFake(password.id)) {
        // If it's a fakeID we had an error creating it, try again.
        PasswordDispatcher.dispatch({
            type: 'password/start-create',
            url: password.url,
            username: password.username,
            password: password.password,
            notes: password.notes,
            fakeID: password.id,
        });
    } else {
        // It it's a real ID we had an error loading it, try again.
        PasswordDispatcher.dispatch({
            type: 'passwords/start-load',
            ids: [password.id],
        });
    }
}

function onUpdatePasswords(passwords: Array<Password>) {
    PasswordDispatcher.dispatch({
        type: 'passwords/start-update',
        ids: passwords.map(password => password.id),
        urls: passwords.map(password => password.url),
        usernames: passwords.map(password => password.username),
        passwords: passwords.map(password => password.password),
        notes: passwords.map(password => password.note),
    });
}

export default Container.createFunctional(AppView, getStores, getState);
