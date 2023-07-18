import { PasskeyAuthenticationRequest, PasskeyAuthenticationResult, PasskeyRegistrationRequest, PasskeyRegistrationResult } from "react-native-passkey/lib/typescript/Passkey";
import { Utils } from "../services/core-service/utils";

export type Base64urlString = string;

export const credentialCreationOptions = (request: PasskeyRegistrationRequest) =>{ 
  return  {
    ...request,
    user: {
      ...request.user,
      id: Utils.base64UrlToBase64(request.user.id),
    },
    challenge: Utils.base64UrlToBase64(request.challenge),
    authenticatorSelection: {  
      authenticatorAttachment: "platform",  
      requireResidentKey: true,  
      residentKey: "required",
      userVerification: "required"
    },
  }
}

export const publicKeyCredentialWithAttestation = (result: PasskeyRegistrationResult) =>{ 
  return  {
    authenticatorAttachment: 'platform',
    ...result,
    rawId:  Utils.base64ToBase64url(result.rawId),
    id: Utils.base64ToBase64url(result.id),  
  }
}

export const credentialAuthOptions = (request: PasskeyAuthenticationRequest) =>{ 
  return  {
    ...request,
    challenge: Utils.base64UrlToBase64(request.challenge),
  }
}


export const publicKeyCredentialWithAssertion = (result: PasskeyAuthenticationResult) =>{ 
  return  {
    ...result,
    rawId:  Utils.base64ToBase64url(result.rawId),
    id: Utils.base64ToBase64url(result.id),  
  }
}
