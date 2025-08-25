import isEqual from "lodash/isEqual"

type ItemProps = {
  [key: string]: any
}

export const shouldRerenderItem = (ignoreProps: string[]) => {
  return (prev: ItemProps, next: ItemProps) => {
    const prevProps = Object.keys(prev)
    const nextProps = Object.keys(next)
    if (!isEqual(prevProps, nextProps)) {
      return false
    }
    const isPropsEqual = prevProps.reduce((val, key) => {
      if (ignoreProps.includes(key)) {
        return val
      }
      return val && isEqual(prev[key], next[key])
    }, true)
    return isPropsEqual
  }
}

export const getUrlParameterByName = (name: string, url: string) => {
  const regex = /[?&]([^=#]+)=([^&#]*)/g
  const params: Record<string, string> = {}
  let match
  while ((match = regex.exec(url))) {
    params[match[1]] = match[2]
  }
  return params[name] || ""
}

/**
 * Validates if a string is a valid email address
 * Uses a comprehensive regex pattern that covers most email formats
 * including international domains and special characters
 *
 * @param email - The email string to validate
 * @returns boolean - true if valid email, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== "string") {
    return false
  }

  // Remove leading/trailing whitespace
  const trimmedEmail = email.trim()

  // Check basic length constraints
  if (trimmedEmail.length === 0 || trimmedEmail.length > 254) {
    return false
  }

  // Check for multiple @ symbols
  const atCount = (trimmedEmail.match(/@/g) || []).length
  if (atCount !== 1) {
    return false
  }

  // Split into local and domain parts
  const [localPart, domainPart] = trimmedEmail.split("@")

  // Validate local part (before @)
  if (!localPart || localPart.length === 0 || localPart.length > 64) {
    return false
  }

  // Validate domain part (after @)
  if (!domainPart || domainPart.length === 0 || domainPart.length > 253) {
    return false
  }

  // Comprehensive email regex pattern
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  // Test against regex
  if (!emailRegex.test(trimmedEmail)) {
    return false
  }

  // Additional checks for edge cases
  // Don't allow consecutive dots
  if (trimmedEmail.includes("..")) {
    return false
  }

  // Don't allow dots at the beginning or end of local part
  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return false
  }

  // Don't allow domain to start or end with hyphen
  if (domainPart.startsWith("-") || domainPart.endsWith("-")) {
    return false
  }

  // Ensure domain has at least one dot (TLD requirement)
  if (!domainPart.includes(".")) {
    return false
  }

  // Check that TLD is at least 2 characters
  const domainParts = domainPart.split(".")
  const tld = domainParts[domainParts.length - 1]
  if (tld.length < 2) {
    return false
  }

  return true
}
/**
 * A debounce utility function that ensures the callback is executed only once
 * during rapid successive calls within the specified delay.
 * This implementation includes a "leading" behavior, meaning it executes
 * immediately on the first call.
 *
 * @param fn - The callback function to be debounced
 * @param delay - The delay in milliseconds before allowing another execution
 * @returns A debounced version of the callback function
 */
export const debounce = (fn: () => void, delay: number) => {
  let timeout: NodeJS.Timeout
  let isLeading = true
  return () => {
    if (isLeading) {
      fn()
      isLeading = false
    }
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      isLeading = true
    }, delay)
  }
}

/**
 * Validates if a string is a valid Vietnamese phone number
 * Supports formats:
 * - Mobile: 09x, 08x, 07x, 05x, 03x (10 digits)
 * - With country code: +84 or 84 followed by mobile number (without leading 0)
 * - With or without spaces, dots, dashes
 *
 * @param phoneNumber - The phone number string to validate
 * @returns boolean - true if valid Vietnamese phone number, false otherwise
 */
export const validateVietnamesePhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber || typeof phoneNumber !== "string") {
    return false
  }

  // Remove all spaces, dots, dashes, and parentheses
  const cleanNumber = phoneNumber.replace(/[\s.\-()]/g, "")

  // Vietnamese mobile number patterns
  const patterns = [
    // Mobile numbers starting with 0 (domestic format): 09x, 08x, 07x, 05x, 03x
    /^0(9[0-9]|8[0-9]|7[0-9]|5[0-9]|3[2-9])[0-9]{7}$/,

    // With +84 country code (international format)
    /^\+84(9[0-9]|8[0-9]|7[0-9]|5[0-9]|3[2-9])[0-9]{7}$/,

    // With 84 country code (without + sign)
    /^84(9[0-9]|8[0-9]|7[0-9]|5[0-9]|3[2-9])[0-9]{7}$/,
  ]

  return patterns.some((pattern) => pattern.test(cleanNumber))
}

/**
 * Formats a Vietnamese phone number to a standard format
 * @param phoneNumber - The phone number to format
 * @returns string - Formatted phone number or original string if invalid
 */
export const formatVietnamesePhoneNumber = (phoneNumber: string): string => {
  if (!validateVietnamesePhoneNumber(phoneNumber)) {
    return phoneNumber
  }

  const cleanNumber = phoneNumber.replace(/[\s.\-()]/g, "")

  // If it starts with +84, format as +84 xxx xxx xxx
  if (cleanNumber.startsWith("+84")) {
    const number = cleanNumber.substring(3)
    return `+84 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`
  }

  // If it starts with 84, format as +84 xxx xxx xxx
  if (cleanNumber.startsWith("84") && cleanNumber.length === 11) {
    const number = cleanNumber.substring(2)
    return `+84 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`
  }

  // If it starts with 0, format as 0xxx xxx xxx
  if (cleanNumber.startsWith("0") && cleanNumber.length === 10) {
    return `${cleanNumber.substring(0, 4)} ${cleanNumber.substring(4, 7)} ${cleanNumber.substring(7)}`
  }

  return phoneNumber
}
