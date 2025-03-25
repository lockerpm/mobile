import { EncString } from "./encString"

import { View } from "../view/view"

import { SymmetricCryptoKey } from "./symmetricCryptoKey"

export default class Domain {
  protected buildDomainModel<D extends Domain>(
    domain: D,
    dataObj: any,
    map: any,
    alreadyEncrypted: boolean,
    notEncList: any[] = [],
  ) {
    for (const prop in map) {
      if (!map.hasOwnProperty(prop)) {
        continue
      }

      const objProp = dataObj[map[prop] || prop]
      if (alreadyEncrypted === true || notEncList.indexOf(prop) > -1) {
        ;(domain as any)[prop] = objProp || null
      } else {
        ;(domain as any)[prop] = objProp ? new EncString(objProp) : null
      }
    }
  }

  protected buildDataModel<D extends Domain>(
    domain: D,
    dataObj: any,
    map: any,
    notEncStringList: any[] = [],
  ) {
    for (const prop in map) {
      if (!map.hasOwnProperty(prop)) {
        continue
      }

      const objProp = (domain as any)[map[prop] || prop]
      if (notEncStringList.indexOf(prop) > -1) {
        ;(dataObj as any)[prop] = objProp != null ? objProp : null
      } else {
        ;(dataObj as any)[prop] = objProp != null ? (objProp as EncString).encryptedString : null
      }
    }
  }

  protected async decryptObj<T extends View>(
    viewModel: T,
    map: any,
    orgId: string,
    key: SymmetricCryptoKey = null,
  ): Promise<T> {
    const promises = Object.keys(map).map(async (prop) => {
      const mapProp = map[prop] || prop

      if (this[mapProp]) {
        const val = await this[mapProp].decrypt(orgId, key)
        ;(viewModel as any)[prop] = val
      }
    })
    await Promise.all(promises)
    return viewModel
  }
}
