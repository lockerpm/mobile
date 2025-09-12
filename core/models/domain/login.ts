import { LoginUri } from "./loginUri"
import { Fido2Credential } from "./fido2Credential"

import { LoginData } from "../data/loginData"

import { LoginView } from "../view/loginView"

import Domain from "./domainBase"
import { EncString } from "./encString"
import { SymmetricCryptoKey } from "./symmetricCryptoKey"

export class Login extends Domain {
  uris: LoginUri[]
  fido2Credentials: Fido2Credential[]
  username: EncString
  password: EncString
  passwordRevisionDate?: Date
  totp: EncString

  constructor(obj?: LoginData, alreadyEncrypted: boolean = false) {
    super()
    if (obj == null) {
      return
    }

    this.passwordRevisionDate =
      obj.passwordRevisionDate != null ? new Date(obj.passwordRevisionDate) : null
    this.buildDomainModel(
      this,
      obj,
      {
        username: null,
        password: null,
        totp: null,
      },
      alreadyEncrypted,
      []
    )

    if (obj.uris) {
      this.uris = []
      obj.uris.forEach((u) => {
        this.uris.push(new LoginUri(u, alreadyEncrypted))
      })
    }

    if (obj.fido2Credentials) {
      this.fido2Credentials = []
      obj.fido2Credentials.forEach((c) => {
        this.fido2Credentials.push(new Fido2Credential(c, alreadyEncrypted))
      })
    }
  }

  async decrypt(orgId: string, encKey?: SymmetricCryptoKey): Promise<LoginView> {
    const view = await this.decryptObj(
      new LoginView(this),
      {
        username: null,
        password: null,
        totp: null,
      },
      orgId,
      encKey
    )

    if (this.uris != null) {
      view.uris = []
      for (let i = 0; i < this.uris.length; i++) {
        const uri = await this.uris[i].decrypt(orgId, encKey)
        view.uris.push(uri)
      }
    }

    if (this.fido2Credentials != null) {
      view.fido2Credentials = []
      for (let i = 0; i < this.fido2Credentials.length; i++) {
        const cred = await this.fido2Credentials[i].decrypt(orgId, encKey)
        view.fido2Credentials.push(cred)
      }
    }

    return view
  }

  toLoginData(): LoginData {
    const l = new LoginData()
    l.passwordRevisionDate =
      this.passwordRevisionDate != null ? this.passwordRevisionDate.toISOString() : null
    this.buildDataModel(this, l, {
      username: null,
      password: null,
      totp: null,
    })

    if (this.uris != null && this.uris.length > 0) {
      l.uris = []
      this.uris.forEach((u) => {
        l.uris.push(u.toLoginUriData())
      })
    }

    if (this.fido2Credentials != null && this.fido2Credentials.length > 0) {
      l.fido2Credentials = []
      this.fido2Credentials.forEach((c) => {
        l.fido2Credentials.push(c.toFido2CredentialData())
      })
    }

    return l
  }
}
