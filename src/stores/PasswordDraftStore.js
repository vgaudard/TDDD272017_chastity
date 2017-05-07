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
import PasswordDataManager from '../data_managers/PasswordDataManager';
import PasswordDispatcher from '../PasswordDispatcher';

type State = {
  id: string,
  url: string,
  username: string,
  password: string,
  notes: string,
};

class PasswordDraftStore extends ReduceStore<Action, State> {
    constructor() {
        super(PasswordDispatcher);
    }

    getInitialState(): State {
        return {
            url: '',
            username: '',
            password: '',
            notes: '',
        };
    }

    reduce(state: State, action: Action): State {
        switch (action.type) {
            case 'password/start-create':
                return {
                    url: '',
                    username: '',
                    password: '',
                    notes: '',
                };

            case 'draft/set-url':
                return {
                    url: action.value,
                    username: state.username,
                    password: state.password,
                    notes: state.notes,
                };

            case 'draft/set-username':
                return {
                    url: state.url,
                    username: action.value,
                    password: state.password,
                    notes: state.notes,
                };

            case 'draft/set-password':
                return {
                    url: state.url,
                    username: state.username,
                    password: action.value,
                    notes: state.notes,
                };

            case 'draft/set-notes':
                return {
                    url: state.url,
                    username: state.username,
                    password: state.password,
                    notes: action.value,
                };

            default:
                return state;
        }
    }
}

export default new PasswordDraftStore();
