import Instance from './'

describe( 'Instance class', () => {
  it( 'should assign the first three paramaters to this', () => {
    const result = [
      'expressLocator',
      'config',
      'ControlledError',
    ].sort()
    const instance = new Instance( ...result )

    expect( Object.keys( instance ).sort() ).toEqual( result )
  } )

  it( 'should fetch dependencies from locator', () => {
    const get = jest.fn()
    const props = [
      'config',
      'ControlledError',
    ]
    const result = 'test'
    const deps = [ result, ]

    new Instance( { get, }, ...props, deps )

    expect( get ).toHaveBeenCalledWith( result )
  } )

  it( 'throws an error if called with nothing', () => {
    expect( () => new Instance() ).toThrow( 'Missing paramaters in Instance class constructor' )
  } )
} )
