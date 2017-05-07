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

import type {Action} from '../PasswordActions';

import {ReduceStore} from 'flux/utils';
import PasswordDispatcher from '../PasswordDispatcher';

const DEBUG = true;

function log(action: Action): void {
  if (DEBUG) {
    console.info(action);
  }
}

class PasswordLoggerStore extends ReduceStore<Action, null> {
  constructor() {
    super(PasswordDispatcher);
  }

  getInitialState(): null {
    return null;
  }

  reduce(state: null, action: Action): null {
    log(action);
    return state;
  }
}

export default new PasswordLoggerStore();
