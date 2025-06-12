import React from "react"
import { useStores } from "app/models"
import { CollectionView } from "core/models/view/collectionView"
import { TouchableOpacity, View, Image } from "react-native"
import { BottomModal, Icon, Text } from "../../cores"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"
import { useHelper } from "app/services/hook"
import { AccountRole } from "app/static/types"
import { useTheme } from "app/services/context"

interface Props {
  isOpen: boolean
  onClose: () => void
  navigation: any
  defaultFolder?: string
  collection?: CollectionView
}

export const AddCipherActionModal = (props: Props) => {
  const { isOpen, onClose, navigation, defaultFolder, collection } = props
  const { cipherStore } = useStores()
  const { getTeam } = useHelper()
  const { colors } = useTheme()

  const items = Object.values(BROWSE_ITEMS).filter((item) => item.addable && !item.group)

  const hasAddCollectionPermission = (() => {
    if (collection) {
      const organizations = cipherStore.organizations
      const organizationRole = getTeam(organizations, collection.organizationId).type
      return organizationRole === AccountRole.OWNER || organizationRole === AccountRole.ADMIN
    }
    return false
  })()

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} hideCloseBtn>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            if (defaultFolder) {
              cipherStore.setSelectedFolder(defaultFolder)
            } else {
              cipherStore.setSelectedFolder(null)
            }
            onClose()
            navigation.navigate(`${item.routeName}__edit`, {
              mode: "add",
              collection,
            })
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
              borderTopColor: colors.border,
              borderTopWidth: index > 0 ? 1 : 0,
            }}
          >
            <Image source={item.icon} style={{ height: 40, width: 40 }} resizeMode="contain" />
            <Text tx={item.label} style={{ marginLeft: 12 }} />
          </View>
        </TouchableOpacity>
      ))}
      {hasAddCollectionPermission && (
        <View
          style={{
            flexDirection: "row",
            marginVertical: 12,
          }}
        >
          <Icon icon="info" color={colors.warning} style={{ marginRight: 8 }} />
          <Text
            tx="folder.move_to_collection_warning"
            style={{
              flexGrow: 1,
              flexShrink: 1,
            }}
          />
        </View>
      )}
    </BottomModal>
  )
}
