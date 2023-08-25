import {
  PasskeyAuthenticationRequest,
  PasskeyAuthenticationResult,
  PasskeyRegistrationRequest,
  PasskeyRegistrationResult,
} from "react-native-passkey/lib/typescript/Passkey"
import { Utils } from "../services/core-service/utils"

export type Base64urlString = string

export const credentialCreationOptions = (request: PasskeyRegistrationRequest) => {
  console.log(request)
  return  {
    ...request,
    user: {
      ...request.user,
      id: Utils.base64UrlToBase64(request.user.id),
    },
    challenge: Utils.base64UrlToBase64(request.challenge),
    authenticatorSelection: {
      ...request.authenticatorSelection,
      authenticatorAttachment: "cross-platform",
      requireResidentKey: true,
      residentKey: "required", 
    }
  }


  // return Platform.select({
  //   ios: {
  //     ...request,
  //     user: {
  //       ...request.user,
  //       id: Utils.base64UrlToBase64(request.user.id),
  //     },
  //     challenge: Utils.base64UrlToBase64(request.challenge),
  //   },
  //   android: {
  //     ...request,
  //     authenticatorSelection: {
  //       authenticatorAttachment: "platform",
  //       requireResidentKey: true,
  //       residentKey: "required",
  //       userVerification: "required",
  //     },
  //   },
  // })
}

export const publicKeyCredentialWithAttestation = (result: PasskeyRegistrationResult) => {
  return {
    authenticatorAttachment: "platform",
    ...result,
    rawId: Utils.base64ToBase64url(result.rawId),
    id: Utils.base64ToBase64url(result.id),
  }
}

export const credentialAuthOptions = (request: PasskeyAuthenticationRequest) => {
  return {
    ...request,
    challenge: Utils.base64UrlToBase64(request.challenge),
  }
}

export const publicKeyCredentialWithAssertion = (result: PasskeyAuthenticationResult) => {
  return {
    ...result,
    rawId: Utils.base64ToBase64url(result.rawId),
    id: Utils.base64ToBase64url(result.id),
  }
}

// eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiWVBpOTV0OTZSRHhSckdGY2R1azlvVi1GcTFwV3JLaWh3M2RGdk1qVXl1b2RCODRSX2k3TWlIcmItdC1TaE5uQUxvNWpWU2ZnNEJKY3kwSndfSnc0bFEiLCJvcmlnaW4iOiJodHRwczovL2xvY2tlci5pbyJ9

//eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiRTRBU1dfOXZBeVNLNUxQeVRrRDZfNHFaWTVoNFZRNHQ4SkRabkpoUU1vNzZQNnZyOHJoY2trWk5IZ0hDeTQzVGhnRjFIXzdXUEp2UTBCdmk4UHVqN1EiLCJvcmlnaW4iOiJhbmRyb2lkOmFway1rZXktaGFzaDotc1lYUmR3SkEzaHZ1ZTNtS3BZck9aOXpTUEM3YjRtYmd6Sm1kWkVETzV3IiwiYW5kcm9pZFBhY2thZ2VOYW1lIjoiY29tLmN5c3RhY2subG9ja2VyIn0