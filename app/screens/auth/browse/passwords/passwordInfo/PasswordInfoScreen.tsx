import React, { FC, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Linking, View, Image } from 'react-native'
import { PasswordAction } from '../PasswordAction'
import { PasswordOtp } from '../passwordEdit/Otp'
import { Text, Screen, Header, Icon, TextInput } from 'app/components/cores'
import { AppStackScreenProps, BROWSE_ITEMS } from 'app/navigators'
import { useCipherHelper, useHelper } from 'app/services/hook'
import { useStores } from 'app/models'
import { CipherView } from 'core/models/view'
import { CipherType } from 'core/enums'
import { CipherInfoCommon, DeletedAction } from 'app/components/ciphers'
import { PasswordStrength, Textarea } from 'app/components/utils'

export const PasswordInfoScreen: FC<AppStackScreenProps<'passwords__info'>> = observer((props) => {
  const navigation = props.navigation
  const route = props.route
  const { getWebsiteLogo, getPasswordStrength } = useCipherHelper()
  const { cipherStore } = useStores()
  const { translate } = useHelper()
  const selectedCipher: CipherView = cipherStore.cipherView

  const [showAction, setShowAction] = useState(false)

  const fromQuickShare = route.params?.quickShare

  // ------------------ COMPUTED --------------------
  const lockerMasterPassword = selectedCipher?.type === CipherType.MasterPassword
  const passwordStrength = getPasswordStrength(selectedCipher.login.password)
  const notSync = [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
    selectedCipher.id
  )

  const source = (() => {
    if (selectedCipher.login.uri) {
      const { uri } = getWebsiteLogo(selectedCipher.login.uri)
      if (uri) {
        return { uri }
      }
    }
    return BROWSE_ITEMS.password.icon
  })()

  // ------------------ RENDER --------------------

  return (
    <Screen
      preset="auto"
      padding
      safeAreaEdges={['bottom']}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => navigation.goBack()}
          rightIcon={!lockerMasterPassword && !fromQuickShare ? 'dots-three' : undefined}
          onRightPress={() => setShowAction(true)}
        />
      }
    >
      {selectedCipher.deletedDate ? (
        <DeletedAction
          navigation={navigation}
          isOpen={showAction}
          onClose={() => setShowAction(false)}
        />
      ) : (
        <PasswordAction
          navigation={navigation}
          isOpen={showAction}
          onClose={() => setShowAction(false)}
        />
      )}

      <Image
        source={source}
        style={{ height: 55, width: 55, borderRadius: 8, alignSelf: 'center' }}
      />

      <Text preset="bold" size="xxl" style={{ margin: 20, textAlign: 'center' }}>
        {selectedCipher.name}
        {notSync && (
          <View style={{ paddingLeft: 10 }}>
            <Icon icon="wifi-slash" size={22} />
          </View>
        )}
      </Text>

      {!lockerMasterPassword && (
        <TextInput
          animated
          isCopyable
          label={translate('password.username')}
          value={selectedCipher.login.username}
          editable={false}
        />
      )}

      <TextInput
        animated
        isPassword
        isCopyable={selectedCipher.viewPassword}
        label={translate('common.password')}
        value={selectedCipher.login.password}
        editable={false}
      />

      {selectedCipher.login.hasTotp && (
        <>
          <Text
            size="base"
            preset="label"
            text={translate('password.2fa_setup')}
            style={{ marginBottom: 4 }}
          />

          <View
            style={{
              marginBottom: 20,
            }}
          >
            <PasswordOtp data={selectedCipher.login.totp} secure />
          </View>
        </>
      )}

      <PasswordStrength preset="text" value={passwordStrength.score} />

      <TextInput
        animated
        label={translate('password.website_url')}
        value={selectedCipher.login.uri}
        editable={false}
        RightAccessory={() => (
          <Icon
            icon="external-link"
            size={20}
            onPress={
              !selectedCipher.login.uri
                ? undefined
                : () => {
                    Linking.openURL(selectedCipher.login.uri).catch(() => {
                      Linking.openURL('https://' + selectedCipher.login.uri)
                    })
                  }
            }
            containerStyle={{
              alignSelf: 'center',
              paddingRight: 12,
            }}
          />
        )}
      />

      {!lockerMasterPassword && (
        <>
          <Textarea
            label={translate('common.notes')}
            value={selectedCipher.notes}
            editable={false}
            copyAble
            style={{ marginTop: 12 }}
          />

          <CipherInfoCommon cipher={selectedCipher} />
        </>
      )}

      {lockerMasterPassword && (
        <>
          <Text
            preset="label"
            size="base"
            text={translate('common.notes')}
            style={{ marginBottom: 12 }}
          />
          <Text text={translate('password.master_password_note')} />
        </>
      )}
    </Screen>
  )
})
