import ControlledError from './'

describe( 'ControlledError class', () => {
  const result = 'testing'

  Error.captureStackTrace = null

  const error = new ControlledError( result )

  it( 'should have a prototype instance of Error', () => {
    expect( ControlledError.prototype instanceof Error ).toBe( true )
  } )

  describe( 'instance of ControlledError', () => {
    it( 'Should contain the message provided to the constructor', () => {
      expect( error.message ).toBe( result )
    } )

    it( 'Should contain the isControlled prop with the value true', () => {
      expect( error.isControlled ).toBe( true )
    } )

    it( 'Should call captureStackTrace if it exists', () => {
      const watch = jest.fn()

      Error.captureStackTrace = watch

      new ControlledError()

      expect( watch ).toBeCalled()
    } )
  } )
} )
