import Locator from './'

describe( 'Locator class', () => {
  let locator

  beforeEach( () => {
    locator = new Locator()
  } )

  it( 'contains a registry object with the keys ControlledError and Instance', () => {
    const result = [
      'ControlledError',
      'Instance',
    ].sort()

    expect( Object.keys( locator.registry ).sort() ).toEqual( result )
  } )

  it( 'contains a cache object with the keys ControlledError and Instance', () => {
    const result = [
      'ControlledError',
      'Instance',
    ].sort()

    expect( Object.keys( locator.cache ).sort() ).toEqual( result )
  } )

  it( 'allows destructuring of its methods without breaking link to this', () => {
    const result = { MyConfig: 'test', }
    const { config, } = locator

    config( result )

    expect( locator.configs ).toEqual( result )
  } )

  describe( 'clear method', () => {
    it( 'resets the registry when called', () => {
      const dep = 'dependency'

      locator.register( dep )

      const oldRegistry = locator.registry

      locator.clear()

      const newRegistry = locator.registry

      expect( newRegistry ).not.toEqual( oldRegistry )
    } )

    it( 'resets the cache when called', () => {
      const dep = { dependency: () => 'hi', }

      locator.register( dep )

      locator.get( 'dependency' )

      const oldCache = locator.cache

      locator.clear()

      const newCache = locator.cache

      expect( newCache ).not.toEqual( oldCache )
    } )
  } )
} )
