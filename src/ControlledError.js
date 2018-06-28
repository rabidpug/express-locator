// @flow

/**
 * @description a simple class extending the Error constructor to include an isControlled = true property
 * @class ControlledError
 * @extends {Error}
 */

export default class ControlledError extends Error {
  isControlled: boolean;

  constructor ( ...params: Array<mixed> ) {
    super( ...params );

    if ( Error.captureStackTrace ) Error.captureStackTrace( this, ControlledError );

    this.isControlled = true;
  }
}
