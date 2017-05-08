'use strict';

import type {Action} from '../PasswordActions';

import LoadObject from '../load_object/LoadObject';
import LoadObjectMap from '../load_object/LoadObjectMap';
import {ReduceStore} from 'flux/utils';
import PasswordDispatcher from '../PasswordDispatcher';
import Password from '../models/Password';

type State = string;

class PasswordEditStore extends ReduceStore<Action, State> {
    constructor() {
        super(PasswordDispatcher);
    }

    getInitialState(): State {
        return '';
    }

    reduce(state: State, action: Action): State {
        switch (action.type) {

            case 'edit/begin':
                return action.id;

            case 'edit/finish-error':
                PasswordDispatcher.dispatch({
                    type: 'passwords/start-load',
                    ids: [state],
                });
                console.warn("Editing of password "+ state +"failed");
                return '';

            case 'edit/finished':
                return '';

            default:
                return state;
        }
    }
}

export default new PasswordEditStore();
