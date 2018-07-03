// @flow
type deps = {} | Function | Class<any>

/**
 * @description A class to automatically assign dependencies, relevant config and locator to this of the child class
 * @export
 * @class Instance
 */

export default class Instance {
  expressLocator: { get: string => deps }

  /**
   *Creates an instance of Instance, assigning passed properties (locator, Error and config) as well as any dependencies, to this.
   * @param {{ [key: string]: deps }} properties
   * @param {Array<string>} dependencies
   * @memberof Instance
   */
  constructor ( properties: { [key: string]: deps }, dependencies: Array<string> ) {
    if ( typeof properties === 'object' && !Array.isArray( properties ) ) {
      Object.keys( properties ).forEach( prop => {
        ;(this: deps)[prop] = properties[prop] //eslint-disable-line
      } )
    } else throw new Error( 'Locator must be provided to class in an object key-value pair' )
    if ( Array.isArray( dependencies ) ) {
      dependencies.forEach( dependency => {
        ;(this: deps)[dependency] = this.expressLocator.get(dependency) //eslint-disable-line
      } )
    }
  }
}
