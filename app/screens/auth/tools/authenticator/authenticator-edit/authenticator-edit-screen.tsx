import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import {
  AutoImage as Image, Layout, Button, Header, FloatingInput
} from "../../../../../components"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { commonStyles, fontSize } from "../../../../../theme"
import { TOOLS_ITEMS } from "../../../../../common/mappings"
import { useMixins } from "../../../../../services/mixins"
import { CipherType } from "../../../../../../core/enums"
import { getTOTP, parseOTPUri } from "../../../../../utils/totp"
import { useStores } from "../../../../../models"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { CipherView } from "../../../../../../core/models/view"
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers"

type ScreenProp = RouteProp<PrimaryParamList, 'authenticator__edit'>;


export const AuthenticatorEditScreen = observer(function AuthenticatorEditScreen() {
  const navigation = useNavigation()
  const { translate, notify, color } = useMixins()

  const { createCipher, updateCipher } = useCipherDataMixins()
  const { newCipher } = useCipherHelpersMixins()
  const { cipherStore } = useStores()
  const route = useRoute<ScreenProp>()

  const { mode } = route.params
  const selectedCipher: CipherView = cipherStore.cipherView
  const defaultSecretKey = (() => {
    const otp = parseOTPUri(selectedCipher.notes)
    return otp ? otp.secret : ''
  })()

  // ----------------- PARAMS ------------------

  const [isLoading, setIsLoading] = useState(false)

  // Forms
  const [name, setName] = useState(mode !== 'add' ? selectedCipher.name : '')
  const [secretKey, setSecretKey] = useState(mode !== 'add' ? defaultSecretKey : '')

  // ----------------- METHODS ------------------

  const handleSave = async () => {
    try {
      const otp = getTOTP({ secret: secretKey })
      if (!otp) {
        notify('error', translate('authenticator.invalid_key'))
        return
      }
    } catch (e) {
      notify('error', translate('authenticator.invalid_key'))
      return
    }

    setIsLoading(true)
    let payload: CipherView
    if (mode === 'add') {
      payload = newCipher(CipherType.TOTP)
    } else {
      // @ts-ignore
      payload = {...selectedCipher}
    }

    payload.name = name
    payload.notes = `otpauth://totp/${encodeURIComponent(name)}?secret=${secretKey}&issuer=${encodeURIComponent(name)}&algorithm=SHA1&digits=6&period=30`

    let res = { kind: 'unknown' }
    if (['add', 'clone'].includes(mode)) {
      res = await createCipher(payload, 0, [])
    } else {
      res = await updateCipher(payload.id, payload, 0, [])
    }

    setIsLoading(false)
    if (res.kind === 'ok') {
      navigation.goBack()
    }
  }

  // ----------------- RENDER ------------------

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0
      }}
      header={(
        <Header
          title={
            mode === 'add'
              ? translate('authenticator.enter_key')
              : translate('common.edit')
          }
          goBack={() => {
            navigation.goBack()
          }}
          goBackText={translate('common.cancel')}
          right={(
            <Button
              isDisabled={isLoading || !name.trim() || !secretKey.trim()}
              preset="link"
              text={translate('common.save')}
              onPress={handleSave}
              style={{ 
                height: 35,
                alignItems: 'center'
              }}
              textStyle={{
                fontSize: fontSize.p
              }}
            />
          )}
        />
      )}
    >
      {/* Name */}
      <View
        style={[commonStyles.SECTION_PADDING, { backgroundColor: color.background }]}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <Image
            source={TOOLS_ITEMS.authenticator.icon}
            style={{ height: 40, width: 40, marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <FloatingInput
              isRequired
              label={translate('common.item_name')}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>
      </View>
      {/* Name end */}

      {/* Info */}
      {
        mode === 'add' && (
          <View
            style={[commonStyles.SECTION_PADDING, {
              backgroundColor: color.background,
              paddingBottom: 32
            }]}
          >
            {/* Secret key */}
            <View style={{ flex: 1 }}>
              <FloatingInput
                isPassword
                isRequired
                label={translate('authenticator.secret_key')}
                value={secretKey}
                onChangeText={(val) => {
                  setSecretKey(val.replace(/\s/g, ''))
                }}
              />
            </View>
            {/* Password end */}
          </View>
        )
      }
      {/* Info end */}
    </Layout>
  )
})
