import React, { useState } from "react"
import { View, Image } from "react-native"
import { observer } from "mobx-react-lite"
import { Text } from "app/components/cores"
import { useCipherData, useCipherHelper, useHelper } from "app/services/hook"
import { useTheme } from "app/services/context"
import { useStores } from "app/models"
import { CipherView } from "core/models/view"
import { AccountRoleText } from "app/static/types"
import { DeleteConfirmModal } from "../browse/trash/DeleteConfirmModal"
import { ActionItem, ActionSheet } from "app/components/ciphers"
import { CipherType } from "core/enums"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"

interface Props {
  isOpen?: boolean
  onClose?: () => void
  navigation: any
  onLoadingChange?: (val: boolean) => void
}

/**
 * Describe your component here
 */
export const AutoFillItemAction = observer(function AutoFillItemAction(props: Props) {
  const { navigation, isOpen, onClose } = props

  const { translate } = useHelper()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [nextModal, setNextModal] = useState<"trashConfirm" | null>(null)

  const { colors } = useTheme()
  const { getTeam, copyToClipboard } = useHelper()
  const { getWebsiteLogo } = useCipherHelper()
  const { toTrashCiphers } = useCipherData()
  const { cipherStore, user, uiStore } = useStores()
  const selectedCipher: CipherView = cipherStore.cipherView

  // Computed

  const teamUser = getTeam(user.teams, selectedCipher.organizationId)
  const editable = !selectedCipher.organizationId || teamUser.role !== AccountRoleText.MEMBER

  const cipherMapper = (() => {
    let img = {}
    if (selectedCipher.login.uri) {
      const { uri } = getWebsiteLogo(selectedCipher.login.uri)
      if (uri) {
        img = { uri }
      } else {
        img = BROWSE_ITEMS.password.icon
      }
    }
    return {
      img,
      path: "passwords",
    }
  })()

  // Methods

  const handleDelete = async () => {
    await toTrashCiphers([selectedCipher.id])
  }

  const handleActionSheetClose = () => {
    onClose()
    switch (nextModal) {
      case "trashConfirm":
        setShowConfirmModal(true)
        break
    }
    setNextModal(null)
  }

  // Render

  return (
    <View>
      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title={translate("trash.to_trash")}
        desc={translate("trash.to_trash_desc")}
        btnText="OK"
      />

      {/* Actionsheet */}
      <ActionSheet
        isOpen={isOpen}
        onClose={handleActionSheetClose}
        header={
          <View style={{ width: "100%", paddingHorizontal: 20, marginBottom: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={cipherMapper.img}
                resizeMode="contain"
                style={{ height: 40, width: 40, borderRadius: 8 }}
              />
              <View style={{ marginLeft: 10 }}>
                <Text preset="bold" text={selectedCipher.name} />
                {selectedCipher.type === CipherType.Login && !!selectedCipher.login.username && (
                  <Text
                    preset="label"
                    text={selectedCipher.login.username}
                    style={{ fontSize: 14 }}
                  />
                )}
              </View>
            </View>
          </View>
        }
      >
        <ActionItem
          name={translate("password.copy_username")}
          icon="copy"
          action={() => copyToClipboard(selectedCipher.login.username)}
          disabled={!selectedCipher.login.username}
        />

        <ActionItem
          name={translate("password.copy_password")}
          icon="copy"
          action={() => copyToClipboard(selectedCipher.login.password)}
          disabled={!selectedCipher.login.password || !selectedCipher.viewPassword}
        />

        <ActionItem
          disabled={!editable || (uiStore.isOffline && !!selectedCipher.organizationId)}
          name={translate("common.edit")}
          icon="edit"
          action={() => {
            onClose()
            navigation.navigate(`${cipherMapper.path}__edit`, { mode: "edit" })
          }}
        />

        <ActionItem
          disabled={!editable || (uiStore.isOffline && !!selectedCipher.organizationId)}
          name={translate("trash.to_trash")}
          icon="trash"
          color={colors.error}
          action={() => {
            setNextModal("trashConfirm")
            onClose()
          }}
        />
      </ActionSheet>
    </View>
  )
})
