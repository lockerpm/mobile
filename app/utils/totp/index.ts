import totp from 'totp-generator'
import protobuf from 'protobufjs'


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
  try {
    res.digits = parseInt(query.digits)
  } catch(e) {
    // Do nothing
  }

  return res
}

export const decodeGoogleAuthenticatorImport = async (buffer) => {
  const root = await protobuf.load("migration-payload.proto");
  const payload = root.lookupType("MigrationPayload");
  const err = payload.verify(buffer);
  if (err) {
      throw err;
  }
  const message = payload.decode(buffer);
  const obj = payload.toObject(message);
  return obj
}

// ------------------ SUPPORT --------------------

const _parseQueryString = (query: string) => {
  const vars = query.split("&")
  const query_string = {
    account: undefined,
    secret: undefined,
    algorithm: undefined,
    period: undefined,
    digits: undefined
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
  switch (algo) {
    case 'sha1':
      return 'SHA-1'
    case 'sha256':
      return 'SHA-256'
    case 'sha512':
      return 'SHA-512'
    case 'md5':
      return 'MD5'
  }
  return algo
}
