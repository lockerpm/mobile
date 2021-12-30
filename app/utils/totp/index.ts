import totp from 'totp-generator'
import proto from './migration-payload_pb'
import base32 from 'hi-base32'


export interface OTPData {
  account?: string
  secret: string
  algorithm?: 'SHA-1' | 'SHA-256' | 'SHA-512' | 'MD-5' | string
  period?: number
  digits?: number
}

export const getTOTP = (otp: OTPData) => {
  try {
    return totp(otp.secret, {
      algorithm: otp.algorithm || 'SHA-1',
      period: otp.period || 30,
      digits: otp.digits || 6
    })
  } catch(e) {
    return null
  }
}

// Parse OTP from URI
export const parseOTPUri = (uri: string) => {
  const res: OTPData = {
    account: undefined,
    secret: undefined,
    algorithm: undefined,
    period: undefined,
    digits: undefined
  }

  if (!uri) {
    return res
  }

  const components = uri.split('/')

  if (!components.length) {
    return res
  }

  const data = components[components.length - 1].split('?')

  if (!data.length) {
    return res
  }

  const account = decodeURIComponent(data[0])
  const query = _parseQueryString(data[1])

  res.account = account
  res.secret = query.secret
  res.algorithm = _parseAlgorithm(query.algorithm)
  try {
    res.period = parseInt(query.period)
  } catch(e) {
    // Do nothing
  }
  if (!res.period) {
    res.period = 30
  }
  try {
    res.digits = parseInt(query.digits)
  } catch(e) {
    // Do nothing
  }
  if (!res.digits) {
    res.digits = 6
  }

  return res
}

export const decodeGoogleAuthenticatorImport = (uri: string): OTPData[] => {
  if (!uri) {
    return []
  }

  const components = uri.split('?')

  if (components.length < 2) {
    return []
  }

  const query = _parseQueryString(components[1]) 
  const buffer = query.data

  const payload = proto.MigrationPayload.deserializeBinary(buffer)
  const data = payload.toObject()

  // Currently only accept TOTP
  return data.otpParametersList.filter(item => item.type === 2).map(item => {
    let algorithm: string
    let digits: number

    switch (item.algorithm) {
      case 1:
        algorithm = 'SHA-1'
        break
      case 2:
        algorithm = 'SHA-256'
        break
      case 3:
        algorithm = 'SHA-512'
        break
      case 4:
        algorithm = 'MD5'
        break
      default:
        algorithm = 'SHA-1'
    }
    switch (item.digits) {
      case 1:
        digits = 6
        break
      case 2:
        digits = 8
        break
      default:
        digits = 6
    }
    
    const account = (item.issuer && !item.name.startsWith(item.issuer)) ? `${item.issuer} (${item.name})` : item.name

    const otp: OTPData = {
      algorithm,
      digits,
      account,
      secret: base32.encode(Buffer.from(item.secret, "base64")),
      period: 30
    }

    return otp
  })
}

// ------------------ SUPPORT --------------------

const _parseQueryString = (query: string) => {
  const vars = query.split("&")
  const query_string = {
    account: undefined,
    secret: undefined,
    algorithm: undefined,
    period: undefined,
    digits: undefined,
    data: undefined
  }
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split("=")
    const key = decodeURIComponent(pair[0])
    const value = decodeURIComponent(pair[1])
    if (typeof query_string[key] === "undefined") {
      query_string[key] = decodeURIComponent(value)
    } else if (typeof query_string[key] === "string") {
      const arr = [query_string[key], decodeURIComponent(value)]
      query_string[key] = arr
    } else {
      query_string[key].push(decodeURIComponent(value))
    }
  }
  return query_string
}

const _parseAlgorithm = (algo: string) => {
  if (!algo) {
    return 'SHA-1'
  }

  switch (algo.toLowerCase()) {
    case 'sha1':
      return 'SHA-1'
    case 'sha256':
      return 'SHA-256'
    case 'sha512':
      return 'SHA-512'
    case 'md5':
      return 'MD5'
  }
  return 'SHA-1'
}

export const beautifyName = (name: string) => {
  try {
    if (name.includes(':')) {
      const components = name.split(':')
      const provider = components[0]
      const account = components.slice(1).join(':')
      return `${provider} (${account})`
    }
  } catch (e) {
    return name
  }

  return name
}
