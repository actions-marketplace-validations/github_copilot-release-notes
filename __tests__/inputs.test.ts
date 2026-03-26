// Mock @actions/core before any imports
jest.mock('@actions/core', () => ({
  warning: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  getInput: jest.fn()
}))

import * as core from '@actions/core'
import {getInputs} from '../src/inputs'

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>

describe('getInputs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock implementation — no inputs set
    mockGetInput.mockReturnValue('')
  })

  it('requires base-ref', () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'base-ref') return ''
      return ''
    })
    expect(() => getInputs()).toThrow('base-ref is required')
  })

  it('parses all inputs correctly', () => {
    mockGetInput.mockImplementation((name: string) => {
      switch (name) {
        case 'base-ref':
          return 'v1.0'
        case 'head-ref':
          return 'v2.0'
        case 'instructions':
          return 'guide.md'
        case 'model':
          return 'gpt-4'
        case 'pr-strategy':
          return 'github-api'
        default:
          return ''
      }
    })
    const inputs = getInputs()
    expect(inputs.baseRef).toBe('v1.0')
    expect(inputs.headRef).toBe('v2.0')
    expect(inputs.model).toBe('gpt-4')
    expect(inputs.prStrategy).toBe('github-api')
  })

  it('defaults head-ref to HEAD', () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'base-ref') return 'v1.0'
      return ''
    })
    const inputs = getInputs()
    expect(inputs.headRef).toBe('HEAD')
  })

  it('defaults pr-strategy to merge-commits', () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'base-ref') return 'v1.0'
      return ''
    })
    const inputs = getInputs()
    expect(inputs.prStrategy).toBe('merge-commits')
  })

  it('rejects invalid pr-strategy', () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'base-ref') return 'v1.0'
      if (name === 'pr-strategy') return 'invalid'
      return ''
    })
    expect(() => getInputs()).toThrow('Invalid pr-strategy')
  })
})
