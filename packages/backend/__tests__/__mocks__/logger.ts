/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
  fatal: jest.fn(),
  child: jest.fn(),
}

mockLogger.child.mockReturnValue(mockLogger)

export default mockLogger
