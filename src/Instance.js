// @flow
type deps = {} | Function | Class<any>;

/**
 * @description A class to automatically assign dependencies, relevant config and locator to this of the child class
 * @export
 * @class Instance
 */

export default class Instance {
  locator: { get: string => deps };

  constructor ( properties: { [key: string]: deps }, dependencies: Array<string> ) {
    if ( typeof properties === 'object' && !Array.isArray( properties ) ) {
      Object.keys( properties ).forEach( prop => {
        (this: deps)[prop] = properties[prop]; //eslint-disable-line
      } );
    } else throw new Error( 'Locator must be provided to class in an object key-value pair' );
    if ( Array.isArray( dependencies ) ) {
      dependencies.forEach( dependency => {
        (this: deps)[dependency] = this.locator.get(dependency); //eslint-disable-line
      } );
    }
  }
}
