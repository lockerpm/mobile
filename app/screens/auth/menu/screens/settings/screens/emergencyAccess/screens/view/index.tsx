import React, { useState, useEffect, FC } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { CipherList } from "./CipherList"
import { useStores } from "app/models"
import { useCipherData, useCipherHelper, useHelper } from "app/services/hook"
import { TrustedContact } from "app/static/types"
import { CipherData } from "core/models/data"
import { Cipher, EncString, SymmetricCryptoKey } from "core/models/domain"
import { CipherView } from "core/models/view"
import { Header, Screen, Text } from "app/components/cores"
import { useCoreService } from "app/services/coreService"
import { EmergencyAccessScreenProps } from "../../route"
import { useAppLocale } from "app/services/context"

export const ViewEAScreen: FC<EmergencyAccessScreenProps<"viewEA">> = observer(
  ({ navigation, route }) => {
    const { cryptoService, cipherService } = useCoreService()
    const { notify } = useHelper()
    const { user } = useStores()
    const { translate } = useAppLocale()

    const { getEncKeyFromDecryptedKey } = useCipherData()
    const { getCipherInfo } = useCipherHelper()

    const trustContact: TrustedContact = route.params.trusted
    // -------------- PARAMS ------------------

    const [ciphers, setCiphers] = useState([])

    // -------------- METHOD ------------------
    const getAllCiphers = async (response) => {
      // Get enc key
      let encKey
      try {
        // const keyBuffer = await cryptoService.rsaDecrypt(response.key_encrypted)
        encKey = await getEncKeyFromDecryptedKey(response.key_encrypted)
      } catch (error) {
        notify("error", "Invalid key, cannot decrypt data")
        return []
      }

      // Decrypt orgs
      const orgMap = {}
      try {
        const privateKey = await cryptoService.decryptToBytes(
          new EncString(response.private_key),
          encKey,
        )
        const promises = []
        const _getOrgKey = async (id, key) => {
          const decKeyBuffer = await cryptoService.rsaDecrypt(key, privateKey)
          orgMap[id] = new SymmetricCryptoKey(decKeyBuffer)
        }
        response.organizations.forEach((org) => {
          promises.push(_getOrgKey(org.id, org.key))
        })
        await Promise.allSettled(promises)
      } catch (error) {
        //
      }

      // Decrypt ciphers
      const decCiphers = []

      try {
        const ciphers = response.ciphers
        const promises = []
        const _decryptCipher = async (cipherResponse) => {
          const cipherData = new CipherData(cipherResponse)
          const cipher = new Cipher(cipherData)
          const decCipher = await cipher.decrypt(orgMap[cipherResponse.organization_id] || encKey)
          decCiphers.push(decCipher)
        }
        ciphers.forEach((cipherResponse) => {
          promises.push(_decryptCipher(cipherResponse))
        })
        await Promise.allSettled(promises)
      } catch (error) {
        //
      }
      // Done, process new types and sort
      decCiphers.sort(cipherService.getLocaleSortingFunction())
      return decCiphers
    }

    const mount = async () => {
      const fetchKeyRes = await user.viewEA(trustContact.id)
      if (fetchKeyRes.kind !== "ok") return

      try {
        const decCiphers = await getAllCiphers(fetchKeyRes.data)

        const res = decCiphers.map((c: CipherView) => {
          const cipherInfo = getCipherInfo(c)
          const data = {
            ...c,
            imgLogo: cipherInfo.img,
          }
          return data
        })

        setCiphers(res)
      } catch (e) {
        //
      }
    }

    // -------------- EFFECT ------------------
    useEffect(() => {
      mount()
    }, [])

    // -------------- RENDER ------------------

    return (
      <Screen
        safeAreaEdges={["bottom"]}
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={() => navigation.goBack()}
            title={translate("emergency_access.view")}
          />
        }
        contentContainerStyle={{
          flex: 1,
        }}
      >
        <Text
          text={translate("emergency_access.view_user_vault", {
            name: trustContact.full_name,
          })}
          style={{ marginLeft: 20 }}
        />

        <CipherList
          ciphers={ciphers}
          navigation={navigation}
          emptyContent={
            <View>
              <Text text="No data" />
            </View>
          }
        />
      </Screen>
    )
  },
)
