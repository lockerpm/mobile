import { View } from "./view"

export class Fido2CredentialView implements View {
  credentialId: string
  keyType: string = "public-key"
  keyAlgorithm: string = "ECDSA"
  keyCurve: string = "P-256"
  keyValue: string
  rpId: string
  userHandle: string
  userName: string
  counter: number
  rpName: string
  userDisplayName: string
  discoverable: boolean
  creationDate: Date | null = null

  toJSON() {
    return {
      credentialId: this.credentialId,
      keyType: this.keyType,
      keyAlgorithm: this.keyAlgorithm,
      keyCurve: this.keyCurve,
      keyValue: this.keyValue,
      rpId: this.rpId,
      userHandle: this.userHandle,
      userName: this.userName,
      counter: this.counter,
      rpName: this.rpName,
      userDisplayName: this.userDisplayName,
      discoverable: this.discoverable,
      creationDate: this.creationDate?.toISOString() || null,
    }
  }

  static fromJSON(obj: Partial<Fido2CredentialView>): Fido2CredentialView {
    const creationDate = obj.creationDate != null ? new Date(obj.creationDate) : null
    return Object.assign(new Fido2CredentialView(), obj, {
      creationDate,
    })
  }
}
