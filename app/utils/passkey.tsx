import {
  PasskeyCreateRequest,
  PasskeyCreateResult,
  PasskeyGetRequest,
  PasskeyGetResult,
} from "react-native-passkey"
import { Base64 } from "./base64"
import { Platform } from "react-native"

const IS_IOS = Platform.OS === "ios"

const convertToBase64url = (input: string): string => {
  if (IS_IOS) {
    return Base64.base64ToBase64url(input)
  }
  return input
}
export type Base64urlString = string

export const credentialCreationOptions = (request: PasskeyCreateRequest) => {
  return {
    ...request,
    user: {
      ...request.user,
      id: request.user.id,
    },
    challenge: convertToBase64url(request.challenge),
    authenticatorSelection: {
      ...request.authenticatorSelection,
      authenticatorAttachment: "platform",
      requireResidentKey: true,
      residentKey: "required",
    },
  }
}

export const publicKeyCredentialWithAttestation = (result: PasskeyCreateResult) => {
  return {
    authenticatorAttachment: "platform",
    ...result,
    rawId: convertToBase64url(result.rawId),
    id: convertToBase64url(result.id),
  }
}

export const credentialAuthOptions = (request: PasskeyGetRequest) => {
  return {
    ...request,
    allowCredentials: [],
    challenge: convertToBase64url(request.challenge),
  }
}

export const publicKeyCredentialWithAssertion = (result: PasskeyGetResult) => {
  return {
    ...result,
    rawId: convertToBase64url(result.rawId),
    id: convertToBase64url(result.id),
  }
}
