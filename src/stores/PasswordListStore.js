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

import FakeID from '../utils/FakeID';
import Immutable from 'immutable';
import LoadObject from '../load_object/LoadObject';
import LoadObjectState from '../load_object/LoadObjectState';
import {ReduceStore} from 'flux/utils';
import PasswordDataManager from '../data_managers/PasswordDataManager';
import PasswordDispatcher from '../PasswordDispatcher';

type State = LoadObjectState<Immutable.List<string>>;

class PasswordListStore extends ReduceStore<Action, State> {
    constructor() {
        super(PasswordDispatcher);
    }

    getInitialState(): State {
        return new LoadObjectState(() => PasswordDispatcher.dispatch({
            type: 'ids/start-load',
        }));
    }

    reduce(state: State, action: Action): State {
        switch (action.type) {

                ///// Loading /////

            case 'ids/start-load':
                PasswordDataManager.loadIDs();
                return state.setLoadObject(LoadObject.loading());

            case 'ids/loaded':
                return state.setLoadObject(LoadObject.withValue(
                    Immutable.List(action.ids)
                ));

            case 'ids/load-error':
                return state.setLoadObject(LoadObject.withError(action.error));

                ///// Creating /////

            case 'password/start-create':
                return state.map(
                    list => list.contains(action.fakeID) ? list : list.push(action.fakeID)
                );

            case 'password/created':
                // This replaces the fake ID we added optimistically with the real id.
                return state.map(list => list.map(
                    id => id === action.fakeID ? action.password._id : id
                ));

            case 'password/create-error':
                // We don't need to remove the id on an error. It will be updated to
                // have an error and the user can explicitly remove it.
                return state;

                ///// Deleting /////

            case 'passwords/start-delete':
                // Optimistically remove any fake ids.
                const fakeIDs = action.ids.filter(id => FakeID.isFake(id));
                const fakeIDSet = new Set(fakeIDs);
                return state.map(list => list.filter(id => !fakeIDSet.has(id)));

            case 'passwords/deleted':
                const idSet = new Set(action.ids);
                return state.map(list => list.filter(id => !idSet.has(id)));

            case 'password/delete-error':
                // No need to remove any ids when the delete fails, user will have to
                // retry in order to delete the items.
                return state;

            default:
                return state;
        }
    }
}

export default new PasswordListStore();
