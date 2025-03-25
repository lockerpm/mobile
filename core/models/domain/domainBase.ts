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
    try {
      const promises = Object.keys(map).map(async (prop) => {
        const mapProp = map[prop] || prop
        if (viewModel.id === "9934826b-1905-4492-bdc7-d1b723d1f920") {
          console.log("decryptObj props", prop, mapProp, this[mapProp])
        }
        if (this[mapProp]) {
          try {
            if (viewModel.id === "9934826b-1905-4492-bdc7-d1b723d1f920") {
              console.log("decryptObj val")
              ;(viewModel as any)[prop] = "test 1234"
            } else {
              const val = await this[mapProp].decrypt(orgId, key, viewModel.id)
              ;(viewModel as any)[prop] = val
            }
          } catch (e) {
            console.error(e)
          }
        }
      })
      await Promise.all(promises)
    } catch (e) {
      console.error("decryptObj", e)
    }

    return viewModel
  }
}
