import { View, StyleSheet, ViewStyle, TouchableOpacity } from "react-native"

import { Icon, ImageIcon, PressableScale, Text } from "app/components/cores"
import { CollectionView } from "core/models/view/collectionView"

import { useAppLocale } from "@/i18n"
import { FolderShareType, SharedMemberType } from "@/static/types/cipher.types"
import { SharingStatus } from "@/static/types/enum"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

type Props = {
  item: FolderShareType
  openAction: (item: CollectionView) => void
  openConfirmModal: (members: SharedMemberType[], organizationId: string) => void
}

export const YourShareCollectionItem = ({ item, openAction, openConfirmModal }: Props) => {
  const { translate } = useAppLocale()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const isNeedToConfirm =
    !!item.members && item.members.some((m) => m.status === SharingStatus.ACCEPTED)

  return (
    <View>
      <PressableScale
        disabled={!item.collection.id}
        onPress={() => {
          openAction(item.collection)
        }}
        style={styles.pv12}
      >
        <View style={styles.row}>
          <ImageIcon icon={"folder-share"} size={30} />
          <View style={styles.content}>
            <View style={styles.row}>
              <Text
                preset="bold"
                text={item.collection.name}
                numberOfLines={2}
                style={styles.name}
              />
              {/* Sharing status */}
              {isNeedToConfirm && (
                <View style={styles.status}>
                  <View style={themed($accepted)}>
                    <Text text="1" size="xs" color={colors.white} preset="bold" />
                  </View>
                </View>
              )}
            </View>

            <Text
              size="sm"
              preset="label"
              text={
                (item.collection.cipherCount !== undefined
                  ? `${item.collection.cipherCount} `
                  : "0 ") +
                translate(item.collection.cipherCount > 1 ? "common:items" : "common:item")
              }
            />
          </View>
        </View>
      </PressableScale>
      {isNeedToConfirm && (
        <View style={styles.acceptContainer}>
          <Text tx={"shares:confirm"} size="xs" style={styles.name} />
          <View>
            <TouchableOpacity
              disabled={!item.collection.organizationId}
              onPress={() => {
                if (item.members && item.collection.organizationId) {
                  openConfirmModal(item.members, item.collection.organizationId)
                }
              }}
              style={themed($confirm)}
            >
              <Icon icon="check" color={colors.primary} size={20} />
              <Text tx={"common:confirm"} color={colors.primary} size="xs" style={styles.ml8} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}

const $accepted: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginRight: 4,
  borderRadius: 15,
  width: 20,
  height: 20,
  backgroundColor: colors.error,
  justifyContent: "center",
  alignItems: "center",
})

const $confirm: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  borderRadius: 8,
  borderColor: colors.primary,
  borderWidth: 1,
  padding: 8,
  paddingHorizontal: 12,
  marginLeft: 8,
})

const styles = StyleSheet.create({
  acceptContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    marginHorizontal: 12,
  },
  ml8: {
    marginLeft: 8,
  },
  name: {
    flexGrow: 1,
    flexShrink: 1,
  },

  pv12: {
    paddingVertical: 12,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  status: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
})
