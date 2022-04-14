import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Linking, View } from "react-native"
import { Layout, Header, Button, Text, FloatingInput, CipherInfoCommon, PasswordStrength } from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles, fontSize } from "../../../../../theme"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { CryptoAccountAction } from "../crypto-account-action"
import { useStores } from "../../../../../models"
import { DeletedAction } from "../../../../../components/cipher/cipher-action/deleted-action"
import { useMixins } from "../../../../../services/mixins"
import { toCryptoAccountData } from "../../../../../utils/crypto"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'


export const CryptoAccountInfoScreen = observer(() => {
  const navigation = useNavigation()
  const { translate, color } = useMixins()
  const { cipherStore } = useStores()
  const { getPasswordStrength } = useCipherHelpersMixins()

  const selectedCipher = cipherStore.cipherView
  const cryptoAccountData = toCryptoAccountData(selectedCipher.notes)
  const passwordStrength = getPasswordStrength(cryptoAccountData.password)

  const notSync = [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(selectedCipher.id)

  const [showAction, setShowAction] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0,
        paddingTop: 0
      }}
      header={(
        <Header
          goBack={() => navigation.goBack()}
          right={(
            <Button
              preset="link"
              onPress={() => setShowAction(true)}
              style={{ 
                height: 35,
                alignItems: 'center',
                paddingLeft: 10
              }}
            >
              <IoniconsIcon
                name="ellipsis-horizontal"
                size={18}
                color={color.title}
              />
            </Button>
          )}
        />
      )}
    >
      {/* Actions */}
      {
        selectedCipher.deletedDate ? (
          <DeletedAction
            navigation={navigation}
            isOpen={showAction}
            onClose={() => setShowAction(false)}
            onLoadingChange={setIsLoading}
          />
        ) : (
          <CryptoAccountAction
            navigation={navigation}
            isOpen={showAction}
            onClose={() => setShowAction(false)}
            onLoadingChange={setIsLoading}
          />
        )
      }
      {/* Actions end */}

      {/* Intro */}
      <View>
        <View style={[commonStyles.CENTER_VIEW, {
          backgroundColor: color.background,
          paddingTop: 20,
          paddingBottom: 30,
          marginBottom: 10
        }]}>
          <BROWSE_ITEMS.cryptoAccount.svgIcon height={55} width={55} />
          <Text
            preset="header"
            style={{ marginTop: 5, marginHorizontal: 20, textAlign: 'center' }}
          >
            {selectedCipher.name}
            {
              notSync && (
                <View style={{ paddingLeft: 10 }}>
                  <MaterialCommunityIconsIcon
                    name="cloud-off-outline"
                    size={22}
                    color={color.textBlack}
                  />
                </View>
              )
            }
          </Text>
        </View>
      </View>
      {/* Intro end */}

      {/* Info */}
      <View style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.background,
          paddingVertical: 22
      }]}>
        {/* Username */}
        <FloatingInput
          fixedLabel
          copyAble
          label={translate('common.username')}
          value={cryptoAccountData.username}
          editable={false}
        />

        {/* Password */}
        <FloatingInput
          isPassword
          fixedLabel
          copyAble
          label={translate('common.password')}
          value={cryptoAccountData.password}
          editable={false}
          style={{ marginVertical: 20 }}
        />

        {/* Password strength */}
        <Text
          text={translate('password.password_security')}
          style={{ fontSize: fontSize.small }}
        />
        <PasswordStrength preset="text" value={passwordStrength.score} />

        {/* Phone */}
        <FloatingInput
          fixedLabel
          copyAble
          label={translate('common.phone')}
          value={cryptoAccountData.phone}
          editable={false}
          style={{ marginVertical: 20 }}
        />

        {/* Email recovery */}
        <FloatingInput
          fixedLabel
          copyAble
          label={translate('crypto_asset.email_recovery')}
          value={cryptoAccountData.emailRecovery}
          editable={false}
        />

        {/* Website URL */}
        <FloatingInput
          fixedLabel
          label={translate('password.website_url')}
          value={cryptoAccountData.uris.uri}
          editable={false}
          style={{ marginVertical: 20 }}
          buttonRight={(
            <Button
              isDisabled={!cryptoAccountData.uris.uri}
              preset="link"
              onPress={() => {
                Linking.openURL(cryptoAccountData.uris.uri)
              }}
              style={{
                alignItems: 'center',
                width: 35,
                height: 30
              }}
            >
              <FontAwesomeIcon
                name="external-link"
                size={16}
                color={color.text}
              />
            </Button>
          )}
        />
        
        {/* Notes */}
        <FloatingInput
          label={translate('common.notes')}
          value={cryptoAccountData.notes}
          editable={false}
          textarea
          fixedLabel
          copyAble
        />

        {/* Others common info */}
        <CipherInfoCommon cipher={selectedCipher} />
      </View>
      {/* Info end */}
    </Layout>
  )
})
