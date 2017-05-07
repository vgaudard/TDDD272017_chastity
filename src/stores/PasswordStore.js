import {ReduceStore} from 'flux/utils';
import ChastityDispatcher from '../ChastityDispatcher';

class PasswordStore extends ReduceStore {
  constructor() {
    super(ChastityDispatcher);
  }

  getInitialState() {
      return null;
  }

  reduce(state, action) {
    switch (action.type) {
        default:
            return null;
    }
  }
}

export default new PasswordStore();
