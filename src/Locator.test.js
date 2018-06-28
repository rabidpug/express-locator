import Locator from './Locator';

describe( 'Locator class', () => {
  let locator;

  beforeEach( () => {
    locator = new Locator();
  } );

  it( 'contains a registry object with the keys Error and Instance', () => {
    const result = [
      'Error',
      'Instance',
    ].sort();

    expect( Object.keys( locator.registry ).sort() ).toEqual( result );
  } );

  it( 'contains a cache object with the keys Error and Instance', () => {
    const result = [
      'Error',
      'Instance',
    ].sort();

    expect( Object.keys( locator.cache ).sort() ).toEqual( result );
  } );

  describe( 'config method', () => {
    it( 'contains the configs property after the config method is called with an object', () => {
      const result = { MyConfig: 'test', };

      locator.config( result );

      expect( locator.configs ).toEqual( result );
    } );

    it( 'calls the register method with dependencies when additional parameters are passed to the config method', () => {
      const register = jest.fn();

      locator.register = register;

      const result = 'dependency';

      locator.config( {}, result );

      expect( register ).toBeCalledWith( result );
    } );
  } );

  describe( 'register method', () => {
    it( 'throws an error if called with an unnamed dependency', () => {
      const construct = 'dependency';
      const register = { construct, };
      const result = 'No dependency name has been provided';

      expect( () => locator.register( register ) ).toThrow( result );
    } );

    it( 'registers a dependency when the register method is called with a string', () => {
      const dep = 'dependency';
      const result = { [dep]: { construct: dep, }, };

      locator.register( dep );

      expect( locator.registry ).toEqual( expect.objectContaining( result ) );
    } );

    it( 'registers an array of dependencies when the register method is called with an array', () => {
      const deps = [
        'dependency',
        'other',
      ];
      const result = {};

      deps.forEach( dep => result[dep] = { construct: dep, } );

      locator.register( deps );

      expect( locator.registry ).toEqual( expect.objectContaining( result ) );
    } );

    it( 'registers a dependency when the register method is called with an object', () => {
      const name = 'dependency';
      const construct = () => null;
      const dep = {
        construct,
        name,
      };
      const result = { [name]: { construct, }, };

      locator.register( dep );

      expect( locator.registry ).toEqual( expect.objectContaining( result ) );
    } );

    it( 'registers a dependency when the register method is called with an object without the name property', () => {
      const name = 'dependency';
      const construct = () => null;
      const dep = { [name]: construct, };
      const result = { [name]: { construct, }, };

      locator.register( dep );

      expect( locator.registry ).toEqual( expect.objectContaining( result ) );
    } );

    it( 'calls the get method with the dependency name when the register method is called with an object with the invoke property and a derived name', () => {
      const result = 'dependency';
      const invoke = true;
      const construct = () => null;
      const get = jest.fn();
      const dep = {
        invoke,
        [result]: construct,
      };

      locator.get = get;

      locator.register( dep );

      expect( get ).toBeCalledWith( result );
    } );

    it( 'calls the get method with the dependency name when the register method is called with an object with the invoke property and a specified name', () => {
      const result = 'dependency';
      const invoke = true;
      const construct = () => null;
      const get = jest.fn();
      const dep = {
        construct,
        invoke,
        name: result,
      };

      locator.get = get;

      locator.register( dep );

      expect( get ).toBeCalledWith( result );
    } );
  } );

  describe( 'get method', () => {
    it( 'throws an error if called with an unknown dependency', () => {
      const dep = 'dependency';
      const result = `${dep}: Attempting to retrieve unknown dependency`;

      expect( () => locator.get( dep ) ).toThrow( result );
    } );

    it( 'returns the dependency from cache if it is already registered', () => {
      const dep = 'Instance';
      const result = locator.cache[dep];

      expect( locator.get( dep ) ).toBe( result );
    } );

    it( 'throws an error if called with a dependency that has been registered with an invalid constructor function', () => {
      const dep = 'dependency';
      const register = { [dep]: () => null, };

      locator.register( register );

      const result = `${dep}: Dependency construction object is invalid`;

      expect( () => locator.get( dep ) ).toThrow( result );
    } );

    it( 'throws an error if called with a dependency that has been registered with a missing constructor function', () => {
      const dep = 'dependency';
      const register = { [dep]: null, };

      locator.register( register );

      const result = `${dep}: Dependency construction object is invalid`;

      expect( () => locator.get( dep ) ).toThrow( result );
    } );

    it( 'throws an error if called with a dependency that has been registered with an invalid constructor type', () => {
      const dep = 'dependency';
      const register = { [dep]: true, };

      locator.register( register );

      const result = `${dep}: Dependency construction object is invalid`;

      expect( () => locator.get( dep ) ).toThrow( result );
    } );

    it( 'calls the construct function of a dependency with the same named config, locator, and dependencies', () => {
      const dep = 'dependency';
      const construct = jest.fn();
      const register = {
        [dep] ( ...args ) {
          construct( ...args );

          return true;
        },
        dependencies: [ 'Error', ],
      };
      const config = { [dep]: 'hi', };
      const result = [
        {
          config: config[dep],
          locator,
        },
        [ 'Error', ],
      ];

      locator.config( config, register );

      locator.get( dep );

      expect( construct ).toBeCalledWith( ...result );
    } );

    it( 'calls the construct function of a dependency with the entire config object when the dependency is registered with the config property', () => {
      const dep = 'dependency';
      const construct = jest.fn();
      const register = {
        config: true,
        [dep] ( ...args ) {
          construct( ...args );

          return true;
        },
      };
      const config = { [dep]: 'hi', };
      const result = [
        {
          config,
          locator,
        },
        [],
      ];

      locator.config( config, register );

      locator.get( dep );

      expect( construct ).toBeCalledWith( ...result );
    } );

    it( 'require()s the called on dependency when registered as a string', () => {
      const dep = 'dependency';

      jest.mock( dep );

      locator.register( dep );

      const dependency = require( dep );

      locator.get( dep )();

      expect( dependency ).toBeCalled();
    } );

    it( 'constructs a class that is an instance of Instance', () => {
      const dep = 'dependency';
      const Instance = locator.get( 'Instance' );
      const spy = jest.fn();

      class Dependency extends Instance {
        constructor ( ...args ) {
          super( ...args );

          spy( ...args );
        }
      }
      const register = { [dep]: Dependency, };

      locator.register( register );

      const dependency = locator.get( dep );

      expect( dependency instanceof Instance ).toBe( true );
    } );

    it( 'calls the constructor for the Instance child class with locator and dependencies', () => {
      const dep = 'dependency';
      const Instance = locator.get( 'Instance' );
      const spy = jest.fn();

      class Dependency extends Instance {
        constructor ( ...args ) {
          super( ...args );

          spy( ...args );
        }
      }
      const register = {
        [dep]        : Dependency,
        dependencies : [ 'Error', ],
      };

      locator.register( register );

      locator.get( dep );

      const result = [
        {
          config: undefined, //eslint-disable-line
          locator,
        },
        [ 'Error', ],
      ];

      expect( spy ).toBeCalledWith( ...result );
    } );
  } );

  describe( 'clear method', () => {
    it( 'resets the registry when called', () => {
      const dep = 'dependency';

      locator.register( dep );

      const oldRegistry = locator.registry;

      locator.clear();

      const newRegistry = locator.registry;

      expect( newRegistry ).not.toEqual( oldRegistry );
    } );

    it( 'resets the cache when called', () => {
      const dep = { dependency: () => 'hi', };

      locator.register( dep );

      locator.get( 'dependency' );

      const oldCache = locator.cache;

      locator.clear();

      const newCache = locator.cache;

      expect( newCache ).not.toEqual( oldCache );
    } );
  } );
} );
