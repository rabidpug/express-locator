import Locator from './'

describe( 'Locator class config method', () => {
  let locator

  beforeEach( () => {
    locator = new Locator()
  } )

  it( 'contains the configs property after the config method is called with an object', () => {
    const result = { MyConfig: 'test', }

    locator.config( result )

    expect( locator.configs ).toEqual( result )
  } )

  it( 'allows destructuring of its methods without breaking link to this', () => {
    const result = { MyConfig: 'test', }
    const { config, } = locator

    config( result )

    expect( locator.configs ).toEqual( result )
  } )

  it( 'calls the register method with dependencies when additional parameters are passed to the config method', () => {
    const register = jest.fn()

    locator.register = register

    const result = 'dependency'

    locator.config( {}, result )

    expect( register ).toBeCalledWith( result )
  } )
} )
