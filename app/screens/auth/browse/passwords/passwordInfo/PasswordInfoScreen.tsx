import React, { FC, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Linking, View, Image } from 'react-native'
import { PasswordAction } from '../PasswordAction'
import { PasswordOtp } from '../passwordEdit/Otp'
import { Text, Screen, Header, Icon, TextInput } from 'app/components/cores'
import { AppStackScreenProps, BROWSE_ITEMS } from 'app/navigators'
import { useCipherHelper } from 'app/services/hook'
import { useStores } from 'app/models'
import { CipherView } from 'core/models/view'
import { CipherType } from 'core/enums'
import { useTheme } from 'app/services/context'
import { CipherInfoCommon, DeletedAction } from 'app/components/ciphers'
import { translate } from 'app/i18n'
import { PasswordStrength, Textarea } from 'app/components/utils'

export const PasswordInfoScreen: FC<AppStackScreenProps<'passwords__info'>> = observer((props) => {
  const navigation = props.navigation
  const route = props.route
  const { colors } = useTheme()
  const { getWebsiteLogo, getPasswordStrength } = useCipherHelper()
  const { cipherStore } = useStores()
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
      safeAreaEdges={['bottom']}
      backgroundColor={colors.block}
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

      <View>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            paddingTop: 20,
            paddingBottom: 30,
            marginBottom: 10,
          }}
        >
          <Image source={source} style={{ height: 55, width: 55, borderRadius: 8 }} />

          <Text
            preset="bold"
            size="xl"
            text={selectedCipher.name}
            style={{ marginTop: 10, marginHorizontal: 20, textAlign: 'center' }}
          >
            {notSync && (
              <View style={{ paddingLeft: 10 }}>
                <Icon icon="wifi-slash" size={22} />
              </View>
            )}
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: colors.background,
          padding: 16,
          paddingVertical: 22,
        }}
      >
        {!lockerMasterPassword && (
          <TextInput
            isCopyable
            label={translate('password.username')}
            value={selectedCipher.login.username}
            editable={false}
            style={{ marginBottom: 20 }}
          />
        )}

        <TextInput
          isPassword
          isCopyable={selectedCipher.viewPassword}
          label={translate('common.password')}
          value={selectedCipher.login.password}
          editable={false}
          style={{ marginBottom: 20 }}
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

        <Text preset="label" size="base" text={translate('password.password_security')} />
        <PasswordStrength preset="text" value={passwordStrength.score} />

        <TextInput
          label={translate('password.website_url')}
          value={selectedCipher.login.uri}
          editable={false}
          style={{ marginVertical: 20 }}
          RightAccessory={() => (
            <Icon
              icon="external-link"
              size={16}
              onPress={
                !selectedCipher.login.uri
                  ? undefined
                  : () => {
                      Linking.openURL(selectedCipher.login.uri).catch(() => {
                        Linking.openURL('https://' + selectedCipher.login.uri)
                      })
                    }
              }
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
      </View>
      {/* Info end */}
    </Screen>
  )
})
