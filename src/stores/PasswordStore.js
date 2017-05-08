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
import LoadObjectMap from '../load_object/LoadObjectMap';
import {ReduceStore} from 'flux/utils';
import PasswordDataManager from '../data_managers/PasswordDataManager';
import PasswordDispatcher from '../PasswordDispatcher';
import Password from '../models/Password';

type State = LoadObjectMap<string, Password>;

class PasswordStore extends ReduceStore<Action, State> {
  constructor() {
    super(PasswordDispatcher);
  }

  getInitialState(): State {
    return new LoadObjectMap(keys => PasswordDispatcher.dispatch({
      type: 'passwords/start-load',
      ids: Array.from(keys),
    }));
  }

  reduce(state: State, action: Action): State {
    switch (action.type) {

      ///// Creating /////

      case 'password/start-create':
        PasswordDataManager.create(action.url, action.username, action.password, action.notes, action.fakeID);
        // Optimistically create the password with the fakeID.
        return state.set(
          action.fakeID,
          LoadObject.creating().setValue(new Password({
            _id: action.fakeID,
            url: action.url,
            username: action.username,
            password: action.password,
            notes: action.notes,
          })),
        );

      case 'password/created':
        // Replace the optimistic password with the real data.
        return state
          .delete(action.fakeID)
          .set(action.password._id, LoadObject.withValue(action.password));

      case 'password/create-error':
        // Clear the operation and save the error when there is one.
        return state.update(
          action.fakeID,
          lo => lo.setError(action.error).done(),
        );

      ///// Loading /////

      case 'passwords/start-load':
        PasswordDataManager.loadPasswords(action.ids);
        return state.merge(action.ids.map(id => [id, LoadObject.loading()]));

      case 'passwords/loaded':
        return state.merge(action.passwords.map(password => [
          password._id,
          LoadObject.withValue(password),
        ]));

      case 'passwords/load-error':
        return state.merge(action.ids.map(id => [
          id,
          LoadObject.withError(action.error),
        ]));

      ///// Updating /////

      case 'passwords/start-update': {
        let nextState = state;
        // We need to save the original passwords so we know what to revert to
        // in case of a failure.
        const originalPasswords = [];
        action.ids.forEach((id, i) => {
          const passwordLo = state.get(id);
          if (!passwordLo.hasValue()) {
            return;
          }
          originalPasswords.push(passwordLo.getValueEnforcing());
          nextState = nextState.update(id, lo => lo.updating().map(password => {
            return password
              .set('url', action.urls[i])
              .set('username', action.username[i])
              .set('password', action.password[i])
              .set('notes', action.notes[i]);
          }));
        });
        PasswordDataManager.updatePasswords(
          action.ids,
          action.url,
          action.username,
          action.password,
          action.notes,
          originalPasswords,
        );
        return nextState;
      }

      case 'passwords/updated':
        return state.merge(action.passwords.map(password => [
          password._id,
          LoadObject.withValue(password),
        ]));

      case 'passwords/update-error':
        return state.merge(action.originalPasswords.map(password => [
          password._id,
          LoadObject.withValue(password).setError(action.error),
        ]));

      ///// Deleting /////

      case 'passwords/start-delete': {
        let nextState = state;
        const realIDs = [];
        action.ids.forEach(id => {
          if (FakeID.isFake(id)) {
            nextState = nextState.delete(id);
          } else {
            realIDs.push(id);
            nextState = nextState.update(id, lo => lo.deleting());
          }
        });
        PasswordDataManager.deletePasswords(realIDs);
        return nextState;
      }

      case 'passwords/deleted':
        const idSet = new Set(action.ids);
        return state.filter((_, id) => !idSet.has(id));

      case 'passwords/delete-error': {
        let nextState = state;
        action.ids.forEach(id => {
          nextState = nextState.update(
            id,
            lo => lo.setError(action.error).done(),
          );
        });
        return nextState;
      }

      default:
        return state;
    }
  }
}

export default new PasswordStore();
