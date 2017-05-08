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
            editing={props.editing}
            onStartEditingPassword={props.onStartEditingPassword}
            onEditSetUrl={props.onEditSetUrl}
            onEditSetUsername={props.onEditSetUsername}
            onEditSetPassword={props.onEditSetPassword}
            onEditSetNotes={props.onEditSetNotes}
            onStopEditing={props.onStopEditing}
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
        editing,
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

    const passwordId = password._id;
    const isEditing = editing === passwordId;
    const onStartEditingPassword = () => props.onStartEditingPassword(passwordId);

    let inputs = null;
    if (isEditing) {
        const onEditSetUrl = (event) => props.onEditSetUrl(passwordId, event.target.value);
        const onEditSetUsername = (event) => props.onEditSetUsername(passwordId, event.target.value);
        const onEditSetPassword = (event) => props.onEditSetPassword(passwordId, event.target.value);
        const onEditSetNotes = (event) => props.onEditSetNotes(passwordId, event.target.value);
        const onStopEditing = () => { props.onStopEditing(password._id, password.url, password.username, password.password, password.notes) };
        const onKeyDown = (event) => {
            if (event.keyCode === 13) {
                onStopEditing();
            }
        };
        inputs = (
            <div>
                <input type="text" onKeyDown={onKeyDown} onChange={onEditSetUrl} value={password.url} />
                <input type="text" onKeyDown={onKeyDown} onChange={onEditSetUsername} value={password.username} />
                <input type="text" onKeyDown={onKeyDown} onChange={onEditSetPassword} value={password.password} />
                <input type="text" onKeyDown={onKeyDown} onChange={onEditSetNotes} value={password.notes} />
            </div>
        );
    }

    let buttons = null;
    if (passwordLo.isDone()) {
        buttons = (
            <div className="password-buttons">
                <button className="retry" onClick={() => onRetry(password)} />
                <button className="destroy" onClick={() => onDelete([password._id])} />
            </div>
        );
    }

    return (
        <li className={classnames({
            editing: isEditing,
            hasError: passwordLo.hasError(),
            shimmer: passwordLo.hasOperation(),
        })}>
            <div className="view"
                onDoubleClick={onStartEditingPassword}
                title={password.notes}>
                <input type="text" readOnly value={password.url} />
                <input type="text" readOnly value={password.username} />
                <input type="text" readOnly value={password.password} />
                {buttons}
            </div>
            {inputs}
        </li>
    );
}

export default AppView;
