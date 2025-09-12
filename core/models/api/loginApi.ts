import { BaseResponse } from "../response/baseResponse"

import { LoginUriApi } from "./loginUriApi"
import { Fido2CredentialApi } from "./fido2CredentialApi"

export class LoginApi extends BaseResponse {
  uris: LoginUriApi[]
  fido2Credentials: Fido2CredentialApi[]
  username: string
  password: string
  passwordRevisionDate: string
  totp: string

  constructor(data: any = null) {
    super(data)
    if (data == null) {
      return
    }
    this.username = this.getResponseProperty("Username")
    this.password = this.getResponseProperty("Password")
    this.passwordRevisionDate = this.getResponseProperty("PasswordRevisionDate")
    this.totp = this.getResponseProperty("Totp")

    const uris = this.getResponseProperty("Uris")
    if (uris != null) {
      this.uris = uris.map((u: any) => new LoginUriApi(u))
    }

    const fido2Credentials = this.getResponseProperty("Fido2Credentials")
    if (fido2Credentials != null) {
      this.fido2Credentials = fido2Credentials.map((c: any) => new Fido2CredentialApi(c))
    }
  }
}
