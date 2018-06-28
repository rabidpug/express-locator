// @flow

import ControlledError from './ControlledError';
import Instance from './Instance';

type toRegisterType =
  | {
      name?: string,
      dependencies?: Array<string>,
      config?: boolean,
      construct: Function | string,
      invoke?: boolean,
      [key: string]: Function | string,
    }
  | string
  | Array<toRegisterType>;
type dependencyType = {} | Function | Class<any>;
type propsType = {
  config: { [key: string]: mixed } | mixed,
  locator: {},
};
type registeredType = {
  dependencies?: Array<string>,
  config?: boolean,
  construct?: string | ( ( propsType, Array<string> ) => dependencyType ),
  invoke?: boolean,
  [key: string]: Function | string,
};

/**
 * @description A class to manage dependencies and configuration on a node application
 * @export
 * @class Locator
 */

export default class Locator {
  registry: { [key: string]: registeredType };

  cache: { [key: string]: ?dependencyType };

  configs: { [key: string]: mixed };

  constructor () {
    this.registry = {
      Error    : {},
      Instance : {},
    };

    this.cache = {
      Error: ControlledError,
      Instance,
    };
  }

  config ( configs: {}, ...dependencies: Array<toRegisterType> ) {
    this.configs = configs;

    this.register( ...dependencies );
  }

  register ( ...dependencyType: Array<toRegisterType> ) {
    const invokers = [];
    const addDependency = dependency => {
      if ( Array.isArray( dependency ) ) dependency.forEach( addDependency );
      else if ( typeof dependency === 'string' ) this.registry[dependency] = { construct: dependency, };
      else {
        const { name, dependencies, config, construct, invoke, ...rest } = dependency;

        if ( name ) {
          this.registry[name] = {
            config,
            construct,
            dependencies,
          };

          invoke && invokers.push( name );
        } else if ( !name && Object.keys( rest ).length === 1 ) {
          const [ derivedName, ]: Array<string> = Object.keys( rest );
          const derivedConstruct: Function | string = rest[derivedName];

          this.registry[derivedName] = {
            config,
            construct: derivedConstruct,
            dependencies,
          };

          invoke && invokers.push( derivedName );
        } else throw new Error( 'No dependency name has been provided' );
      }
    };

    dependencyType.forEach( addDependency );

    invokers.forEach( name => this.get( name ) );
  }

  get ( dependencyName: string ): dependencyType {
    if ( typeof this.registry[dependencyName] === 'undefined' ) throw new Error( `${dependencyName}: Attempting to retrieve unknown dependency` );

    if ( typeof this.cache[dependencyName] === 'undefined' ) {
      const thisDependency: registeredType = this.registry[dependencyName];

      const { construct, dependencies = [], config, } = thisDependency;

      if ( construct ) {
        if ( typeof construct === 'string' ) {
          const name: string = construct;

          this.cache[dependencyName] = require( name );
        } else {
          const props: propsType = {
            config  : this.configs && ( config ? this.configs : this.configs[dependencyName] ),
            locator : this,
          };

          if ( construct.prototype instanceof Instance ) {
            const Construct = construct;

            this.cache[dependencyName] = new Construct( props, dependencies );
          } else if ( typeof construct === 'function' ) this.cache[dependencyName] = construct( props, dependencies );
        }
      }
    }
    if ( !this.cache[dependencyName] ) throw new Error( `${dependencyName}: Dependency construction object is invalid` );
    return this.cache[dependencyName];
  }

  clear () {
    this.registry = {
      Error    : {},
      Instance : {},
    };

    this.cache = {
      Error: ControlledError,
      Instance,
    };
  }
}

export const locator = new Locator();
