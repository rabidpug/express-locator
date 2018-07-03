// @flow
type deps = {} | Function | Class<any>
type locatorType = { get: string => deps }
/**
 * @description A class to automatically assign dependencies, relevant config and locator to this of the child class
 * @export
 * @class Instance
 */

export default class Instance {
  expressLocator: locatorType

  config: {}

  ControlledError: deps

  /**
   *Creates an instance of Instance, assigning passed properties (locator, Error and config) as well as any dependencies, to this.
   * @param {locatorType} expressLocator
   * @param {{}} configs
   * @param {deps} ControlledError
   * @param {Array<string>} dependencies
   * @memberof Instance
   */
  constructor (
    expressLocator: locatorType, config: {}, ControlledError: deps, dependencies: Array<string>
  ) {
    if ( !expressLocator || !config || !ControlledError ) throw new Error( 'Missing paramaters in Instance class constructor' )

    this.expressLocator = expressLocator

    this.config = config

    this.ControlledError = ControlledError

    if ( Array.isArray( dependencies ) ) {
      dependencies.forEach( dependency => {
        ;(this: deps)[dependency] = this.expressLocator.get(dependency) //eslint-disable-line
      } )
    }
  }
}
