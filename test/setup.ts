// we always make sure 'react-native' gets included first
import "react-native"

// // libraries to mock
// import "./__mocks__/mock-helper"

jest.useFakeTimers()
declare global {
  let __TEST__
}
