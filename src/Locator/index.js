// @flow

import ControlledError from '../ControlledError'
import Instance from '../Instance'

type toRegisterType =
  | {
      name?: string,
      dependencies?: Array<string>,
      config?: boolean,
      construct?: Function | Class<any> | string,
      invoke?: boolean,
      instance?: boolean,
      [key: string]: Function | string,
    }
  | string
  | Array<toRegisterType>
type dependencyType = {} | Function | Class<any>
type configsType = { [key: string]: {} }
type registeredType = {
  dependencies?: Array<string>,
  config?: boolean,
  construct?: string | ( ( dependencyType, configsType, dependencyType | mixed, Array<string> ) => dependencyType ),
  instance?: boolean,
  [key: string]: Function | string,
}

/**
 * @description A class to manage dependencies and configuration on a node application
 * @export
 * @class Locator
 */

export default class Locator {
  registry: { [key: string]: registeredType }

  cache: { [key: string]: dependencyType }

  configs: configsType

  constructor () {
    this.registry = {
      ControlledError : {},
      Instance        : {},
    }

    this.cache = {
      ControlledError,
      Instance,
    }
  }

  config = ( configs: {}, ...dependencies: Array<toRegisterType> ) => {
    this.configs = configs

    this.register( ...dependencies )
  }

  register = ( ...dependencyType: Array<toRegisterType> ) => {
    const invokers = []
    const addDependency = dependency => {
      if ( Array.isArray( dependency ) ) dependency.forEach( addDependency )
      else if ( typeof dependency === 'string' ) this.registry[dependency] = { construct: dependency, }
      else {
        const { name, dependencies, config, construct, invoke, instance, ...rest } = dependency

        if ( name ) {
          this.registry[name] = {
            config,
            construct,
            dependencies,
            instance,
          }

          invoke && invokers.push( name )
        } else if ( !name && Object.keys( rest ).length === 1 ) {
          const [ derivedName, ]: Array<string> = Object.keys( rest )
          const derivedConstruct: Function | string = rest[derivedName]

          this.registry[derivedName] = {
            config,
            construct: derivedConstruct,
            dependencies,
            instance,
          }

          invoke && invokers.push( derivedName )
        } else throw new Error( 'No dependency name has been provided' )
      }
    }

    dependencyType.forEach( addDependency )

    invokers.forEach( name => this.get( name ) )
  }

  get = ( dependencyName: string ): dependencyType | mixed => {
    let property = dependencyName

    if ( typeof this.registry[dependencyName] === 'undefined' ) {
      const slashIndex = dependencyName.indexOf( '.' )

      if ( slashIndex > -1 && typeof this.registry[dependencyName.slice( 0, slashIndex )] !== 'undefined' ) {
        property = property.split( '.' )

        dependencyName = property.shift()
      } else throw new Error( `${dependencyName}: Attempting to retrieve unknown dependency` )
    }

    if ( typeof this.cache[dependencyName] === 'undefined' ) {
      const thisDependency: registeredType = this.registry[dependencyName]
      const { construct, dependencies = [], config, instance, } = thisDependency

      if ( construct ) {
        if ( typeof construct === 'string' ) {
          const name: string = construct

          this.cache[dependencyName] = require( name )
        } else {
          const expressLocator = this
          const configs = this.configs ? config ? this.configs : this.configs[dependencyName] : {}
          const controlledError = this.get( 'ControlledError' )

          if ( construct.prototype instanceof Instance || instance ) {
            const Construct = construct

            this.cache[dependencyName] = new Construct(
              expressLocator, configs, controlledError, dependencies
            )
          } else if ( typeof construct === 'function' ) {
            this.cache[dependencyName] = construct(
              expressLocator, configs, controlledError, dependencies
            )
          }
        }
      }
    }
    if ( !this.cache[dependencyName] ) throw new Error( `${dependencyName}: Dependency construction object is invalid` )
    if ( Array.isArray( property ) && property.length > 0 ) {
      const returnValue = property.reduce( ( obj: dependencyType | mixed, prop: string ): dependencyType | mixed =>
        obj && typeof obj === 'object' ? obj[prop] : false,
                                           this.cache[dependencyName] )

      if ( returnValue ) return returnValue
      else {
        const propPath = property.reduce( ( p, n ) => p ? `${p}.${n}` : n, '' )

        throw new Error( `${dependencyName}: Attempting to retrieve unknown dependency or property ${propPath} ` )
      }
    }
    return this.cache[dependencyName]
  }

  clear = () => {
    this.registry = {
      ControlledError : {},
      Instance        : {},
    }

    this.cache = {
      ControlledError,
      Instance,
    }
  }
}

export const locator = new Locator()
