import Locator from './'

describe( 'Locator class register method', () => {
  let locator

  beforeEach( () => {
    locator = new Locator()
  } )

  it( 'throws an error if called with an unnamed dependency', () => {
    const construct = 'dependency'
    const register = { construct, }
    const result = 'No dependency name has been provided'

    expect( () => locator.register( register ) ).toThrow( result )
  } )

  it( 'registers a dependency when the register method is called with a string', () => {
    const dep = 'dependency'
    const result = { [dep]: { construct: dep, }, }

    locator.register( dep )

    expect( locator.registry ).toEqual( expect.objectContaining( result ) )
  } )

  it( 'registers an array of dependencies when the register method is called with an array', () => {
    const deps = [
      'dependency',
      'other',
    ]
    const result = {}

    deps.forEach( dep => result[dep] = { construct: dep, } )

    locator.register( deps )

    expect( locator.registry ).toEqual( expect.objectContaining( result ) )
  } )

  it( 'registers a dependency when the register method is called with an object', () => {
    const name = 'dependency'
    const construct = () => null
    const dep = {
      construct,
      name,
    }
    const result = { [name]: { construct, }, }

    locator.register( dep )

    expect( locator.registry ).toEqual( expect.objectContaining( result ) )
  } )

  it( 'registers a dependency when the register method is called with an object without the name property', () => {
    const name = 'dependency'
    const construct = () => null
    const dep = { [name]: construct, }
    const result = { [name]: { construct, }, }

    locator.register( dep )

    expect( locator.registry ).toEqual( expect.objectContaining( result ) )
  } )

  it( 'calls the get method with the dependency name when the register method is called with an object with the invoke property and a derived name', () => {
    const result = 'dependency'
    const invoke = true
    const construct = () => null
    const get = jest.fn()
    const dep = {
      invoke,
      [result]: construct,
    }

    locator.get = get

    locator.register( dep )

    expect( get ).toBeCalledWith( result )
  } )

  it( 'calls the get method with the dependency name when the register method is called with an object with the invoke property and a specified name', () => {
    const result = 'dependency'
    const invoke = true
    const construct = () => null
    const get = jest.fn()
    const dep = {
      construct,
      invoke,
      name: result,
    }

    locator.get = get

    locator.register( dep )

    expect( get ).toBeCalledWith( result )
  } )
} )
