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

import xhr from 'xhr';

// The port is hard coded in the server too. If you change it make sure to
// update it there as well.

const PORT = 3000;
const PREFIX = 'http://localhost:' + PORT;

type PasswordObject = {
  _id: string,
  url: string,
  username: string,
  password: string,
  notes: string,
};

// Using some flow trickery we can strongly type our requests! We don't verify
// this at runtime though, so it's not actually sound. But we're all good if
// we trust the API implementation :)
declare class PasswordAPI {
  static get(uri: '/ids'): Promise<Array<string>>;

  static get(uri: '/password', data: {_id: string}): Promise<PasswordObject>;

  static get(
    uri: '/passwords',
    data: {ids: Array<string>},
  ): Promise<Array<PasswordObject>>;

  static post(uri: '/password/create', data: {url: string, username: string, password: string, notes: string}): Promise<PasswordObject>;

  static post(
    uri: '/passwords/create',
    data: {urls: Array<string>, usernames: Array<string>, passwords: Array<string>, notes: Array<string>},
  ): Promise<Array<PasswordObject>>;

  static post(
    uri: '/password/update',
    data: {_id: string, url: string, username: string, password: string, notes: string},
  ): Promise<PasswordObject>;

  static post(
    uri: '/passwords/update',
    data: {ids: Array<string>, url: Array<string>, usernames: Array<string>, passwords: Array<string>, notes: Array<string>},
  ): Promise<Array<PasswordObject>>;

  static post(uri: '/password/delete', data: {_id: string}): Promise<void>;

  static post(uri: '/passwords/delete', data: {ids: Array<string>}): Promise<void>;
}

// $FlowExpectedError: Intentional rebinding of variable.
const PasswordAPI = {
  get(uri, data) {
    return promiseXHR('get', uri, data);
  },

  post(uri, data) {
    return promiseXHR('post', uri, data);
  },
};

/**
 * This is a simple wrapper around XHR that let's us use promises. Not very
 * advanced but works with our server's API.
 */
function promiseXHR(method: 'get' | 'post', uri, data) {
  const query = [];
  if (data) {
    Object.keys(data).forEach(key => {
      query.push(key + '=' + JSON.stringify(data[key]));
    });
  }
  const suffix = query.length > 0
    ? '?' + query.join('&')
    : '';
  return new Promise((resolve, reject) => {
    xhr[method](
      PREFIX + uri + suffix,
      (err, res, body) => {
        if (err) {
          reject(err);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(
            '[status: ' + res.statusCode + '] ' + res.body,
          ));
          return;
        }

        // It's fine if the body is empty.
        if (body == null) {
          resolve(undefined);
        }

        // Not okay if the body isn't a string though.
        if (typeof body !== 'string') {
          reject(new Error('Responses from server must be JSON strings.'));
        }

        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Responses from server must be JSON strings.'));
        }
      },
    );
  });
}

export default PasswordAPI;
