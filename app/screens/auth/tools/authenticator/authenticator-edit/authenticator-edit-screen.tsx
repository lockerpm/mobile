import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import {
  AutoImage as Image, Layout, Button, Header, FloatingInput
} from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { color as colorLight, colorDark, commonStyles, fontSize } from "../../../../../theme"
import { TOOLS_ITEMS } from "../../../../../common/mappings"
import { useMixins } from "../../../../../services/mixins"
import { CipherType } from "../../../../../../core/enums"
import { getTOTP } from "../../../../../utils/totp"
import { useStores } from "../../../../../models"


export const AuthenticatorEditScreen = observer(function AuthenticatorEditScreen() {
  const navigation = useNavigation()
  const { newCipher, createCipher, translate, notify } = useMixins()
  const { uiStore } = useStores()
  const color = uiStore.isDark ? colorDark : colorLight

  // ----------------- PARAMS ------------------

  const [isLoading, setIsLoading] = useState(false)

  // Forms
  const [name, setName] = useState('')
  const [secretKey, setSecretKey] = useState('')

  // ----------------- EFFECTS ------------------

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
    const payload = newCipher(CipherType.TOTP)

    payload.name = name
    payload.notes = `otpauth://totp/${encodeURIComponent(name)}?secret=${secretKey}&issuer=${encodeURIComponent(name)}&algorithm=SHA1&digits=6&period=30`

    const res = await createCipher(payload, 0, [])

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
          title={translate('authenticator.enter_key')}
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
              label={translate('common.name')}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>
      </View>
      {/* Name end */}

      {/* Info */}
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
            onChangeText={setSecretKey}
          />
        </View>
        {/* Password end */}
      </View>
      {/* Info end */}
    </Layout>
  )
})
