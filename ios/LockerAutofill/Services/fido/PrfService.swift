//
//  PrfService.swift
//  LockerAutofill
//

import AuthenticationServices
import CryptoKit
import Foundation
import Security
import os

let passkeyPrfLogger = Logger(subsystem: "com.cystack.lockerapp", category: "PasskeyPRF")

enum PasskeyPrfError: Error {
  case randomGenerationFailed(OSStatus)
  case invalidStoredKey
  case invalidCredentialId
}

struct PasskeyPrfResult {
  let first: SymmetricKey
  let second: SymmetricKey?
}

enum PasskeyPrfService {
  private static let keyLength = 32
  private static let context = Data("WebAuthn PRF".utf8)

  static func generateKey() throws -> String {
    var key = Data(count: keyLength)
    let status = key.withUnsafeMutableBytes { bytes in
      SecRandomCopyBytes(kSecRandomDefault, keyLength, bytes.baseAddress!)
    }
    guard status == errSecSuccess else {
      throw PasskeyPrfError.randomGenerationFailed(status)
    }
    return key.base64URLEncodedString()
  }

  @available(iOSApplicationExtension 18.0, *)
  static func evaluate(
    prfKey: String,
    inputValues: ASAuthorizationPublicKeyCredentialPRFAssertionInput.InputValues
  ) throws -> PasskeyPrfResult {
    let key = try decodeStoredKey(prfKey)
    let first = SymmetricKey(data: evaluateValue(key: key, input: inputValues.saltInput1))
    let second = inputValues.saltInput2.map {
      SymmetricKey(data: evaluateValue(key: key, input: $0))
    }
    return PasskeyPrfResult(first: first, second: second)
  }

  static func validateStoredKey(_ value: String) throws {
    _ = try decodeStoredKey(value)
  }

  private static func decodeStoredKey(_ value: String) throws -> SymmetricKey {
    guard
      !value.isEmpty,
      value.range(of: "^[A-Za-z0-9_-]+$", options: .regularExpression) != nil,
      let data = Data(base64URLEncoded: value),
      data.count == keyLength,
      data.base64URLEncodedString() == value
    else {
      throw PasskeyPrfError.invalidStoredKey
    }
    return SymmetricKey(data: data)
  }

  private static func evaluateValue(key: SymmetricKey, input: Data) -> Data {
    var contextualizedInput = context
    contextualizedInput.append(0)
    contextualizedInput.append(input)
    let salt = Data(SHA256.hash(data: contextualizedInput))
    return Data(HMAC<SHA256>.authenticationCode(for: salt, using: key))
  }
}

@available(iOSApplicationExtension 18.0, *)
func registrationPrfInput(
  from request: ASPasskeyCredentialRequest
) -> ASAuthorizationPublicKeyCredentialPRFRegistrationInput? {
  guard case .registration(let extensionInput) = request.extensionInput else {
    return nil
  }
  return extensionInput.prf
}

@available(iOSApplicationExtension 18.0, *)
func assertionPrfInput(
  from request: ASPasskeyCredentialRequest
) -> ASAuthorizationPublicKeyCredentialPRFAssertionInput? {
  guard case .assertion(let extensionInput) = request.extensionInput else {
    return nil
  }
  return extensionInput.prf
}

@available(iOSApplicationExtension 18.0, *)
func addPrfExtensionOutput(
  to assertion: ASPasskeyAssertionCredential,
  item: PasskeyItem,
  input: ASAuthorizationPublicKeyCredentialPRFAssertionInput?
) throws {
  guard let input else {
    passkeyPrfLogger.debug("auth.notRequested")
    return
  }
  guard let prfKey = item.prfKey else {
    passkeyPrfLogger.debug("auth.noStoredKey")
    return
  }
  try PasskeyPrfService.validateStoredKey(prfKey)

  let credentialId: Data
  if GuidUtils.isGuid(item.credentialId) {
    credentialId = try GuidUtils.guidToRawFormat(item.credentialId)
  } else if let decodedCredentialId = Data(base64URLEncoded: item.credentialId) {
    credentialId = decodedCredentialId
  } else {
    throw PasskeyPrfError.invalidCredentialId
  }

  let credentialSpecificValues = input.perCredentialInputValues?[credentialId]
  guard let inputValues = credentialSpecificValues ?? input.inputValues else {
    passkeyPrfLogger.debug("auth.noInput")
    return
  }

  let results = try PasskeyPrfService.evaluate(prfKey: prfKey, inputValues: inputValues)
  let prfOutput = ASAuthorizationPublicKeyCredentialPRFAssertionOutput(
    first: results.first,
    second: results.second
  )
  assertion.extensionOutput = ASPasskeyAssertionCredentialExtensionOutput(prf: prfOutput)
  passkeyPrfLogger.debug(
    "auth.resultReady source=\(credentialSpecificValues == nil ? "eval" : "evalByCredential", privacy: .public) firstInputByteLength=\(inputValues.saltInput1.count) secondInputByteLength=\(inputValues.saltInput2?.count ?? 0) hasSecond=\(results.second != nil)"
  )
}
