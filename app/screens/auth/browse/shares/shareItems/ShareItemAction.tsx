import React, { useEffect, useState } from "react"
import { View, Image, Platform } from "react-native"
import { EditShareModal } from "./EditShareModal"
import { SharedGroupType, SharedMemberType } from "app/static/types"
import { useCipherData, useCipherHelper, useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { CipherView } from "core/models/view"
import { ActionItem, ActionSheet } from "app/components/ciphers"
import { Text } from "app/components/cores"
import { useTheme } from "app/services/context"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"

type Props = {
  isOpen: boolean
  onClose: () => void
  onLoadingChange: (val: boolean) => void
  member: SharedMemberType
  group?: SharedGroupType
  goToDetail: (val: any) => void
}

/**
 * Describe your component here
 */
export const ShareItemAction = (props: Props) => {
  const { isOpen, onClose, onLoadingChange, member, goToDetail, group } = props
  const { stopShareCipher, stopShareCipherForGroup } = useCipherData()
  const { getCipherInfo } = useCipherHelper()
  const { translate } = useHelper()
  const { cipherStore, uiStore } = useStores()
  const { colors } = useTheme()
  // Params

  const [nextModal, setNextModal] = useState<"edit" | "confirm" | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Computed

  const selectedCipher: CipherView = cipherStore.cipherView

  const cipherMapper = (() => {
    const cipherInfo = getCipherInfo(selectedCipher)
    return cipherInfo
  })()

  // Methods

  const handleStopShare = async () => {
    onClose()
    onLoadingChange(true)
    if (member) {
      await stopShareCipher(selectedCipher, member.id)
    }
    if (group) {
      await stopShareCipherForGroup(selectedCipher, group.id)
    }
    onLoadingChange(false)
  }

  const handleActionSheetClose = () => {
    onClose()
    switch (nextModal) {
      case "confirm":
        break
      case "edit":
        setShowEditModal(true)
        break
    }
    setNextModal(null)
  }

  useEffect(() => {
    if (Platform.OS === "android" && !isOpen) {
      switch (nextModal) {
        case "confirm":
          break
        case "edit":
          setShowEditModal(true)
          break
      }
      setNextModal(null)
    }
  }, [isOpen, nextModal])
  // Render

  return (
    <View>
      <EditShareModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        member={member}
        group={group}
      />

      <ActionSheet
        isOpen={isOpen}
        onClose={handleActionSheetClose}
        header={
          <View style={{ width: "100%", paddingHorizontal: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                defaultSource={BROWSE_ITEMS.password.icon}
                resizeMode="contain"
                source={cipherMapper.img}
                style={{ height: 40, width: 40, borderRadius: 8 }}
              />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text preset="bold" text={selectedCipher.name} numberOfLines={2} />
              </View>
            </View>
          </View>
        }
      >
        <ActionItem
          name={translate("common.details")}
          icon="list-bullets"
          action={() => {
            goToDetail(selectedCipher)
            onClose()
          }}
        />

        <ActionItem
          disabled={uiStore.isOffline}
          name={translate("common.edit")}
          icon="edit"
          action={() => {
            setNextModal("edit")
            onClose()
          }}
        />

        <ActionItem
          disabled={uiStore.isOffline}
          icon="x-circle"
          color={colors.error}
          name={translate("shares.stop_sharing")}
          action={handleStopShare}
        />
      </ActionSheet>
    </View>
  )
}
