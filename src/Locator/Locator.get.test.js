import Locator from './'

describe( 'Locator class get method', () => {
  let locator

  beforeEach( () => {
    locator = new Locator()
  } )

  it( 'throws an error if called with an unknown dependency', () => {
    const dep = 'dependency'
    const result = `${dep}: Attempting to retrieve unknown dependency`

    expect( () => locator.get( dep ) ).toThrow( result )
  } )

  it( 'returns the dependency from cache if it is already registered', () => {
    const dep = 'Instance'
    const result = locator.cache[dep]

    expect( locator.get( dep ) ).toBe( result )
  } )

  it( 'throws an error if called with a dependency that has been registered with an invalid constructor function', () => {
    const dep = 'dependency'
    const register = { [dep]: () => null, }

    locator.register( register )

    const result = `${dep}: Dependency construction object is invalid`

    expect( () => locator.get( dep ) ).toThrow( result )
  } )

  it( 'throws an error if called with a dependency that has been registered with a missing constructor function', () => {
    const dep = 'dependency'
    const register = { [dep]: null, }

    locator.register( register )

    const result = `${dep}: Dependency construction object is invalid`

    expect( () => locator.get( dep ) ).toThrow( result )
  } )

  it( 'throws an error if called with a dependency that has been registered with an invalid constructor type', () => {
    const dep = 'dependency'
    const register = { [dep]: true, }

    locator.register( register )

    const result = `${dep}: Dependency construction object is invalid`

    expect( () => locator.get( dep ) ).toThrow( result )
  } )

  it( 'calls the construct function of a dependency with the same named config, locator, and dependencies', () => {
    const dep = 'dependency'
    const construct = jest.fn()
    const register = {
      [dep] ( ...args ) {
        construct( ...args )

        return true
      },
      dependencies: [ 'ControlledError', ],
    }
    const configs = { [dep]: 'hi', }
    const result = [
      locator,
      configs[dep],
      locator.get( 'ControlledError' ),
      [ 'ControlledError', ],
    ]

    locator.config( configs, register )

    locator.get( dep )

    expect( construct ).toBeCalledWith( ...result )
  } )

  it( 'calls the construct function of a dependency with the entire config object when the dependency is registered with the config property', () => {
    const dep = 'dependency'
    const construct = jest.fn()
    const register = {
      config: true,
      [dep] ( ...args ) {
        construct( ...args )

        return true
      },
    }
    const config = { [dep]: 'hi', }
    const result = [
      locator,
      config,
      locator.get( 'ControlledError' ),
      [],
    ]

    locator.config( config, register )

    locator.get( dep )

    expect( construct ).toBeCalledWith( ...result )
  } )

  it( 'require()s the called on dependency when registered as a string', () => {
    const dep = 'dependency'

    jest.mock( dep )

    locator.register( dep )

    const dependency = require( dep )

    locator.get( dep )()

    expect( dependency ).toBeCalled()
  } )

  it( 'returns the property of a dependency when provided a dot separated path', () => {
    const get = 'test.this.path'
    const result = 'hello!'
    const dep = { test: () => ( { this: { path: result, }, } ), }

    locator.register( dep )

    expect( locator.get( get ) ).toBe( result )
  } )

  it( 'throws an error when provided a dot separated path to a property that does not exist', () => {
    const get = 'test.this.path'
    const dep = { test: () => ( { this: {}, } ), }
    const result = `test: Attempting to retrieve unknown dependency or property this.path`

    locator.register( dep )

    expect( () => locator.get( get ) ).toThrow( result )
  } )

  it( 'throws an error when provided a dot separated path to a property for a dependency that is not an object', () => {
    const get = 'test.this.path'
    const dep = { test: () => () => null, }
    const result = `test: Attempting to retrieve unknown dependency or property this.path`

    locator.register( dep )

    expect( () => locator.get( get ) ).toThrow( result )
  } )

  it( 'constructs a class that is an instance of Instance', () => {
    const dep = 'dependency'
    const Instance = locator.get( 'Instance' )
    const spy = jest.fn()

    class Dependency extends Instance {
      constructor ( ...args ) {
        super( ...args )

        spy( ...args )
      }
    }
    const register = { [dep]: Dependency, }

    locator.register( register )

    const dependency = locator.get( dep )

    expect( dependency instanceof Instance ).toBe( true )
  } )

  it( 'calls the constructor for the Instance child class with locator and dependencies', () => {
    const dep = 'dependency'
    const Instance = locator.get( 'Instance' )
    const spy = jest.fn()

    class Dependency extends Instance {
      constructor ( ...args ) {
        super( ...args )

        spy( ...args )
      }
    }
    const register = {
      [dep]        : Dependency,
      dependencies : [ 'ControlledError', ],
    }

    locator.register( register )

    locator.get( dep )

    const result = [
      locator,
      {},
      locator.get( 'ControlledError' ),
      [ 'ControlledError', ],
    ]

    expect( spy ).toBeCalledWith( ...result )
  } )

  it( 'constructs a class that is an instance of the provided class when including the instance property on register', () => {
    const dep = 'dependency'
    const spy = jest.fn()

    class Dependency {
      constructor ( ...args ) {
        spy( ...args )
      }
    }
    const register = {
      [dep]    : Dependency,
      instance : true,
    }

    locator.register( register )

    const dependency = locator.get( dep )

    expect( dependency instanceof Dependency ).toBe( true )
  } )

  it( 'calls the constructor for the class with locator and dependencies when including the instance property on register', () => {
    const dep = 'dependency'
    const spy = jest.fn()

    class Dependency {
      constructor ( ...args ) {
        spy( ...args )
      }
    }
    const register = {
      [dep]        : Dependency,
      dependencies : [ 'ControlledError', ],
      instance     : true,
    }

    locator.register( register )

    locator.get( dep )

    const result = [
      locator,
      {},
      locator.get( 'ControlledError' ),
      [ 'ControlledError', ],
    ]

    expect( spy ).toBeCalledWith( ...result )
  } )
} )
