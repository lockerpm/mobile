import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { Text } from "app/components/cores"
import { useCipherHelper, useDeleteCipher, useHelper } from "app/services/hook"
import { useAppLocale, useTheme } from "app/services/context"
import { useStores } from "app/models"
import { CipherView } from "core/models/view"
import { AccountRoleText } from "app/static/types"
import { CipherType } from "core/enums"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"
import { useClipboard } from "app/services/utils"
import { CipherIconImage } from "app/components/newCiphers"
import { NewActionSheet, NewActionSheetItem } from "app/components/utils"
import { getTeam } from "app/utils/cipherHelper"

interface Props {
  isOpen: boolean
  onClose: () => void
}

/**
 * Describe your component here
 */
export const AutoFillItemAction = observer(function AutoFillItemAction(props: Props) {
  const { isOpen, onClose } = props

  const { copyToClipboard } = useClipboard()

  const { translate } = useAppLocale()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [nextModal, setNextModal] = useState<"trashConfirm" | null>(null)

  const { colors } = useTheme()
  const { toTrashCiphers } = useDeleteCipher()
  const { getWebsiteLogo } = useCipherHelper()
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

  // const handleDelete = async () => {
  //   await toTrashCiphers([selectedCipher.id])
  // }

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
      {/* <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title={translate("trash.to_trash")}
        desc={translate("trash.to_trash_desc")}
        btnText="OK"
      /> */}

      {/* Actionsheet */}
      <NewActionSheet
        isOpen={isOpen}
        onClose={handleActionSheetClose}
        header={
          <View style={{ width: "100%", paddingHorizontal: 20, marginBottom: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <CipherIconImage
                cipherType={CipherType.Login}
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
        <NewActionSheetItem
          tx="password.copy_username"
          icon="copy"
          onPress={() => copyToClipboard(selectedCipher.login.username)}
          // disabled={!selectedCipher.login.username}
        />

        <NewActionSheetItem
          tx="password.copy_password"
          icon="copy"
          onPress={() => copyToClipboard(selectedCipher.login.password)}
          // disabled={!selectedCipher.login.password || !selectedCipher.viewPassword}
        />

        <NewActionSheetItem
          // disabled={!editable || (uiStore.isOffline && !!selectedCipher.organizationId)}
          tx="common.edit"
          icon="edit"
          onPress={() => {
            onClose()
            // navigation.navigate(`${cipherMapper.path}__edit`, { mode: "edit" })
          }}
        />

        <NewActionSheetItem
          // disabled={!editable || (uiStore.isOffline && !!selectedCipher.organizationId)}
          tx="trash.to_trash"
          icon="trash"
          color={colors.error}
          onPress={() => {
            setNextModal("trashConfirm")
            onClose()
          }}
        />
      </NewActionSheet>
    </View>
  )
})
