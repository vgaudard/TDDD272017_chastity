import AppView from '../views/AppView';
import {Container} from 'flux/utils';
import PasswordStore from '../stores/PasswordStore';
import ChastityActions from '../data/ChastityActions';

function getStores() {
    return [
        PasswordStore
    ];
}

function getState () {
    return {
        todos: PasswordStore.getState(),
    };
}

export default Container.createFunctional(AppView, getStores, getState);
