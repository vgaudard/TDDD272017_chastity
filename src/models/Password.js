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

import Immutable from 'immutable';

declare class Password {
  id: string;
  url: string;
  username: string;
  password: string;
  notes: string;

  constructor(data: {
    id: string;
    url: string;
    username: string;
    password: string;
    notes: string;
  }): void;

  set(key: 'id', value: string): Password;
  set(key: 'url', value: string): Password;
  set(key: 'username', value: string): Password;
  set(key: 'password', value: string): Password;
  set(key: 'notes', value: string): Password;
}

// $FlowExpectedError: Intentional rebinding for flow.
const Password = Immutable.Record({
  id: '',
  url: '',
  username: '',
  password: '',
  notes: '',
});

export default Password;
