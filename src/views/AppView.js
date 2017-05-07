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

import type Immutable from 'immutable';
import type LoadObject from '../load_object/LoadObject';
import type LoadObjectMap from '../load_object/LoadObjectMap';
import type LoadObjectState from '../load_object/LoadObjectState';
import type Password from '../models/Password';

import FakeID from '../utils/FakeID';
import React from 'react';

import classnames from 'classnames';

type AppViewProps = {
    draft: string,
    ids: LoadObjectState<Immutable.List<string>>,
    passwords: LoadObjectMap<string, Password>,

    onDelete: (ids: Array<string>) => void,
    onDraftCreate: (url: string, username: string, password: string, notes: string) => void,
    onDraftSetUrl: (value: string) => void,
    onDraftSetUsername: (value: string) => void,
    onDraftSetPassword: (value: string) => void,
    onDraftSetNotes: (value: string) => void,
    onRetry: (password: Password) => void,
    onUpdatePasswords: (passwords: Array<Password>) => void,
};

function AppView(props: AppViewProps): ?React.Element<*> {
    return (
        <div>
            <Header {...props} />
            <Main {...props} />
            <Footer {...props} />
        </div>
    );
}

type HeaderProps = {
    draft: string,

    onDraftCreate: (url: string, username: string, password: string, notes: string) => void,
    onDraftSetUrl: (value: string) => void,
    onDraftSetUsername: (value: string) => void,
    onDraftSetPassword: (value: string) => void,
    onDraftSetNotes: (value: string) => void,
};

function Header(props: HeaderProps): ?React.Element<*> {
    return (
        <header id="header">
        <h1>passwords</h1>
        <NewPassword {...props} />
        </header>
    );
}

type MainProps = {
    ids: LoadObjectState<Immutable.List<string>>,
    passwords: LoadObjectMap<string, Password>,

    onDelete: (ids: Array<string>) => void,
    onRetry: (password: Password) => void,
    onUpdatePasswords: (passwords: Array<Password>) => void,
};

function Main(props: MainProps): ?React.Element<*> {
    const {
        ids,
        passwords,
        onDelete,
        onRetry,
        onUpdatePasswords,
    } = props;

    if (!ids.getLoadObject().hasValue()) {
        return null;
    }

    const list = ids.getLoadObject().getValueEnforcing();
    if (list.size === 0) {
        return null;
    }

    const listItems = [];
    list.forEach((id, i) => {
        listItems.push(
            <PasswordItem
            key={id}
            passwordLo={passwords.get(id)}
            onDelete={onDelete}
            onRetry={onRetry}
            onUpdatePasswords={onUpdatePasswords}
            />
        );
    });

    return (
        <section id="main">
        <ul id="password-list">
        {listItems.reverse()}
        </ul>
        </section>
    );
}

type FooterProps = {
    passwords: LoadObjectMap<string, Password>,

    onDelete: (ids: Array<string>) => void,
};

function Footer(props: FooterProps): ?React.Element<*> {
    const passwords = props.passwords
    .filter(lo => lo.hasValue())
    .getValues()
    .map(lo => lo.getValueEnforcing());

    if (passwords.length === 0) {
        return null;
    }

    return (
        <footer id="footer">
        </footer>
    );
}

type NewPasswordProps = {
    draft: string,

    onDraftCreate: (value: string) => void,
    onDraftSetUrl: (value: string) => void,
    onDraftSetUsername: (value: string) => void,
    onDraftSetPassword: (value: string) => void,
    onDraftSetNotes: (value: string) => void,
};

const ENTER_KEY_CODE = 13;
function NewPassword(props: NewPasswordProps): ?React.Element<*> {
    const create = () => props.onDraftCreate(props.draft);
    const onChangeUrl = (event) => props.onDraftSetUrl(event.target.value);
    const onChangeUsername = (event) => props.onDraftSetUsername(event.target.value);
    const onChangePassword = (event) => props.onDraftSetPassword(event.target.value);
    const onChangeNotes = (event) => props.onDraftSetNotes(event.target.value);
    const onKeyDown = (event) => {
        if (event.keyCode === ENTER_KEY_CODE) {
            create();
        }
    };
    return (
        <section>
            <input
                id="new-password-url"
                placeholder="url"
                value={props.draft.url}
                onChange={onChangeUrl}
                onKeyDown={onKeyDown}
            />
            <input
                id="new-password-username"
                placeholder="username"
                value={props.draft.username}
                onChange={onChangeUsername}
                onKeyDown={onKeyDown}
            />
            <input
                id="new-password-password"
                placeholder="password"
                value={props.draft.password}
                onChange={onChangePassword}
                onKeyDown={onKeyDown}
            />
            <input
                id="new-password-notes"
                placeholder="notes"
                value={props.draft.notes}
                onChange={onChangeNotes}
                onKeyDown={onKeyDown}
            />
        </section>
    );
}

type PasswordItemProps = {
    passwordLo: LoadObject<Password>,

    onDelete: (ids: Array<string>) => void,
    onRetry: (password: Password) => void,
    onUpdatePasswords: (passwords: Array<Password>) => void,
};

function PasswordItem(props: PasswordItemProps): ?React.Element<*> {
    const {
        passwordLo,
        onDelete,
        onRetry,
        onUpdatePasswords,
    } = props;

    if (!passwordLo.hasValue()) {
        return (
            <li className={classnames({
                hasError: passwordLo.hasError(),
                shimmer: passwordLo.hasOperation(),
            })}>
                <div className="view">
                    <label>Loading...</label>
                </div>
            </li>
        );
    }

    const password = passwordLo.getValueEnforcing();

    let buttons = null;
    if (passwordLo.isDone()) {
        buttons = (
            <div className="password-buttons">
                <button className="retry" onClick={() => onRetry(password)} />
                <button className="destroy" onClick={() => onDelete([password.id])} />
            </div>
        );
    }

    return (
        <li className={classnames({
            hasError: passwordLo.hasError(),
            shimmer: passwordLo.hasOperation(),
        })}>
            <div className="view"
                title={password.notes}>
                <input type="text" readOnly value={password.url} />
                <input type="text" readOnly value={password.username} />
                <input type="text" readOnly value={password.password} />
                {buttons}
            </div>
        </li>
    );
}

export default AppView;
