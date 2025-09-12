import { LoginUriData } from "./loginUriData"
import { Fido2CredentialData } from "./fido2CredentialData"
import { LoginApi } from "../api/loginApi"

export class LoginData {
  uris: LoginUriData[]
  fido2Credentials: Fido2CredentialData[]
  username: string
  password: string
  passwordRevisionDate: string
  totp: string

  constructor(data?: LoginApi) {
    if (data == null) {
      return
    }

    this.username = data.username
    this.password = data.password
    this.passwordRevisionDate = data.passwordRevisionDate
    this.totp = data.totp

    if (data.uris) {
      this.uris = data.uris.map((u) => new LoginUriData(u))
    }

    if (data.fido2Credentials) {
      this.fido2Credentials = data.fido2Credentials.map((c) => new Fido2CredentialData(c))
    }
  }
}
