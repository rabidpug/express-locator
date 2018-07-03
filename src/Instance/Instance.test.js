import Instance from './'

describe( 'Instance class', () => {
  it( 'should assign the passed props to this', () => {
    const props = {
      hello : 'hi',
      you   : 'lo',
    }
    const instance = new Instance( props )

    expect( instance ).toEqual( expect.objectContaining( props ) )
  } )

  it( 'should fetch dependencies from locator', () => {
    const get = jest.fn()
    const props = { expressLocator: { get, }, }
    const result = 'test'
    const deps = [ result, ]

    new Instance( props, deps )

    expect( get ).toHaveBeenCalledWith( result )
  } )

  it( 'throws an error if called with nothing', () => {
    let err

    try {
      new Instance()
    } catch ( e ) {
      err = e
    }

    expect( err.message ).toBe( 'Locator must be provided to class in an object key-value pair' )
  } )
} )
