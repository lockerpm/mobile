import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Header } from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SettingsItem, SectionWrapperItem } from "../settings-item"
import { useMixins } from "../../../../../services/mixins"
import { DeleteAccountModal } from "./delete-account-modal"
import { PurgeAccountModal } from "./purge-account-modal"


export const DeleteScreen = observer(function DeleteScreen() {
  const navigation = useNavigation()
  const { translate, color } = useMixins()

  const [isDeleteAccount, setIsDeleteAccount] = useState(false)
  const [isDeleteAllItems, setIsDeleteAllItems] = useState(false)
  // ----------------------- PARAMS -----------------------

  // ----------------------- METHODS -----------------------

  // ----------------------- RENDER -----------------------

  return (
    <Layout
      header={(
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={translate('common.delete')}
          right={(<View style={{ width: 30 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <DeleteAccountModal
        isOpen={isDeleteAccount}
        onClose={() => setIsDeleteAccount(false)}
        navigation={navigation}
      />

      <PurgeAccountModal
        isOpen={isDeleteAllItems}
        onClose={() => setIsDeleteAllItems(false)}
        navigation={navigation}
      />

      <SectionWrapperItem>
        <SettingsItem
          color={color.error}
          name={translate('settings.delete_account')}
          action={() => setIsDeleteAccount(true)}
        />

        <SettingsItem
          color={color.error}
          name={translate('settings.delete_all_items')}
          action={() => setIsDeleteAllItems(true)}
        />
      </SectionWrapperItem>
    </Layout>
  )
})
