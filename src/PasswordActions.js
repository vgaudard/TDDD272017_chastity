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

import type Password from './models/Password';

export type Action =

  // UI Actions for updating the draft.
  | {
    type: 'draft/set-url',
    value: string,
  }
  | {
    type: 'draft/set-username',
    value: string,
  }
  | {
    type: 'draft/set-password',
    value: string,
  }
  | {
    type: 'draft/set-notes',
    value: string,
  }

  // Dealing with password ids.
  | {
    type: 'ids/start-load',
  }
  | {
    type: 'ids/loaded',
    ids: Array<string>,
  }
  | {
    type: 'ids/load-error',
    error: Error,
  }

  // Creating passwords.
  | {
    type: 'password/start-create',
    url: string,
    username: string,
    password: string,
    notes: string,
    fakeID: string,
  }
  | {
    type: 'password/created',
    password: Password,
    fakeID: string,
  }
  | {
    type: 'password/create-error',
    error: Error,
    fakeID: string,
  }

  // Deleting passwords.
  | {
    type: 'passwords/start-delete',
    ids: Array<string>,
  }
  | {
    type: 'passwords/deleted',
    ids: Array<string>,
  }
  | {
    type: 'passwords/delete-error',
    error: Error,
    ids: Array<string>,
  }

  // Reading passwords.
  | {
    type: 'passwords/start-load',
    ids: Array<string>,
  }
  | {
    type: 'passwords/loaded',
    passwords: Array<Password>,
  }
  | {
    type: 'passwords/load-error',
    ids: Array<string>,
    error: Error,
  }

  // Updating passwords.
  | {
    type: 'passwords/start-update',
    ids: Array<string>,
    urls: Array<string>,
    usernames: Array<string>,
    passwords: Array<string>,
    notes: Array<string>,
  }
  | {
    type: 'passwords/updated',
    passwords: Array<Password>,
  }
  | {
    type: 'passwords/update-error',
    originalPasswords: Array<Password>,
    error: Error,
  }

  // This is a semi-colon, all hail the mighty semi-colon.
  ;
