import { LoginUri } from "./loginUri"
import { Fido2Credential } from "./fido2Credential"

import { LoginView } from "../view/loginView"

import { EncString } from "../domain/encString"
import { Login as LoginDomain } from "../domain/login"

export class Login {
  static template(): Login {
    const req = new Login()
    req.uris = []
    req.fido2Credentials = []
    req.username = "jdoe"
    req.password = "myp@ssword123"
    req.totp = "JBSWY3DPEHPK3PXP"
    return req
  }

  static toView(req: Login, view = new LoginView()) {
    if (req.uris != null) {
      view.uris = req.uris.map((u) => LoginUri.toView(u))
    }
    if (req.fido2Credentials != null) {
      view.fido2Credentials = req.fido2Credentials.map((c) => Fido2Credential.toView(c))
    }
    view.username = req.username
    view.password = req.password
    view.totp = req.totp
    return view
  }

  static toDomain(req: Login, domain = new LoginDomain()) {
    if (req.uris != null) {
      domain.uris = req.uris.map((u) => LoginUri.toDomain(u))
    }
    if (req.fido2Credentials != null) {
      domain.fido2Credentials = req.fido2Credentials.map((c) => Fido2Credential.toDomain(c))
    }
    domain.username = req.username != null ? new EncString(req.username) : null
    domain.password = req.password != null ? new EncString(req.password) : null
    domain.totp = req.totp != null ? new EncString(req.totp) : null
    return domain
  }

  uris: LoginUri[]
  fido2Credentials: Fido2Credential[]
  username: string
  password: string
  totp: string

  constructor(o?: LoginView | LoginDomain) {
    if (o == null) {
      return
    }

    if (o.uris != null) {
      if (o instanceof LoginView) {
        this.uris = o.uris.map((u) => new LoginUri(u))
      } else {
        this.uris = o.uris.map((u) => new LoginUri(u))
      }
    }

    if (o.fido2Credentials != null) {
      if (o instanceof LoginView) {
        this.fido2Credentials = o.fido2Credentials.map((c) => new Fido2Credential(c))
      } else {
        this.fido2Credentials = o.fido2Credentials.map((c) => new Fido2Credential(c))
      }
    }

    if (o instanceof LoginView) {
      this.username = o.username
      this.password = o.password
      this.totp = o.totp
    } else {
      this.username = o.username?.encryptedString
      this.password = o.password?.encryptedString
      this.totp = o.totp?.encryptedString
    }
  }
}
