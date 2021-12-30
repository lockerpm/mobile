import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Linking, View } from "react-native"
import {
  Layout, Header, Button, AutoImage as Image, Text, FloatingInput, PasswordStrength, CipherInfoCommon
} from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles, fontSize } from "../../../../../theme"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { PasswordAction } from "../password-action"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { DeletedAction } from "../../../../../components/cipher/cipher-action/deleted-action"
import { CipherView } from "../../../../../../core/models/view"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers"


export const PasswordInfoScreen = observer(function PasswordInfoScreen() {
  const navigation = useNavigation()
  const { getWebsiteLogo, translate, color } = useMixins()
  const { getPasswordStrength } = useCipherHelpersMixins()
  const { cipherStore } = useStores()
  const selectedCipher: CipherView = cipherStore.cipherView

  const [showAction, setShowAction] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // ------------------ COMPUTED --------------------

  const passwordStrength = getPasswordStrength(selectedCipher.login.password)


  // ------------------ RENDER --------------------

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
          <PasswordAction
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
          <Image
            source={
              selectedCipher.login.uri
                ? getWebsiteLogo(selectedCipher.login.uri)
                : BROWSE_ITEMS.password.icon
            }
            backupSource={BROWSE_ITEMS.password.icon}
            style={{ height: 55, width: 55, marginBottom: 5, borderRadius: 8 }}
          />
          <Text
            preset="header"
            style={{ marginTop: 5 }}
          >
            {selectedCipher.name}
            {
              cipherStore.notSynchedCiphers.includes(selectedCipher.id) && (
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
          label={translate('password.username')}
          value={selectedCipher.login.username}
          editable={false}
        />

        {/* Password */}
        <FloatingInput
          isPassword
          fixedLabel
          copyAble
          lockCopy={!selectedCipher.viewPassword}
          hidePassword={!selectedCipher.viewPassword}
          label={translate('common.password')}
          value={selectedCipher.login.password}
          editable={false}
          style={{ marginVertical: 20 }}
        />

        {/* Password strength */}
        <Text
          text={translate('password.password_security')}
          style={{ fontSize: fontSize.small }}
        />
        <PasswordStrength preset="text" value={passwordStrength.score} />

        {/* Website URL */}
        <FloatingInput
          fixedLabel
          label={translate('password.website_url')}
          value={selectedCipher.login.uri}
          editable={false}
          style={{ marginVertical: 20 }}
          buttonRight={(
            <Button
              isDisabled={!selectedCipher.login.uri}
              preset="link"
              onPress={() => {
                Linking.openURL(selectedCipher.login.uri)
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
          value={selectedCipher.notes}
          editable={false}
          textarea
          fixedLabel
          copyAble
        />
        {/* Notes end */}

        {/* Others common info */}
        <CipherInfoCommon cipher={selectedCipher} />
        {/* Others common info end */}
      </View>
      {/* Info end */}
    </Layout>
  )
})
