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

import Password from '../models/Password';
import PasswordAPI from './PasswordAPI';
import PasswordDispatcher from '../PasswordDispatcher';

const PasswordDataManager = {
  create(url: string, username: string, password: string, notes: string, fakeID: string) {
    PasswordAPI
      .post('/password/create', {url, username, password, notes})
      .then(rawPassword => {
        PasswordDispatcher.dispatch({
          type: 'password/created',
          password: new Password(rawPassword),
          fakeID,
        });
      })
      .catch(error => {
        PasswordDispatcher.dispatch({
          type: 'password/create-error',
          error,
          fakeID,
        });
      });
  },

  deletePasswords(ids: Array<string>) {
    PasswordAPI
      .post('/passwords/delete', {ids})
      .then(() => {
        PasswordDispatcher.dispatch({
          type: 'passwords/deleted',
          ids,
        });
      })
      .catch(error => {
        PasswordDispatcher.dispatch({
          type: 'passwords/delete-error',
          error,
          ids,
        });
      });
  },

  updatePasswords(
    ids: Array<string>,
    urls: Array<string>,
    usernames: Array<string>,
    passwords: Array<string>,
    notes: Array<string>,
    originalPasswords: Array<Password>,
  ) {
    PasswordAPI
      .post('/passwords/update', {ids, urls, usernames, passwords, notes})
      .then(rawPasswords => {
        PasswordDispatcher.dispatch({
          type: 'passwords/updated',
          passwords: rawPasswords.map(rawPassword => new Password(rawPassword)),
        });
      })
      .catch(error => {
        PasswordDispatcher.dispatch({
          type: 'passwords/update-error',
          originalPasswords,
          error,
        });
      });
  },

  loadIDs() {
    PasswordAPI
      .get('/ids')
      .then(ids => {
        PasswordDispatcher.dispatch({
          type: 'ids/loaded',
          ids,
        });
      })
      .catch(error => {
        PasswordDispatcher.dispatch({
          type: 'ids/load-error',
          error,
        });
      });
  },

  loadPasswords(ids: Array<string>) {
    PasswordAPI
      .get('/passwords', {ids})
      .then(rawPasswords => {
        PasswordDispatcher.dispatch({
          type: 'passwords/loaded',
          passwords: rawPasswords.map(rawPassword => new Password(rawPassword)),
        });
      })
      .catch(error => {
        PasswordDispatcher.dispatch({
          type: 'passwords/load-error',
          ids,
          error,
        });
      });
  },
};


export default PasswordDataManager;
