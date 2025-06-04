import find from "lodash/find"
import React from "react"
import { TouchableOpacity, View } from "react-native"
import { Textarea } from "../../utils"
import { Text, Icon } from "../../cores"
import { useStores } from "app/models"
import { useAppLocale, useTheme } from "app/services/context"

export interface CipherOthersInfoProps {
  hasNote?: boolean
  note?: string
  onChangeNote?: (val: string) => void
  folderId?: string
  collectionId?: string
  isDeleted?: boolean
  isOwner: boolean
}

/**
 * Describe your component here
 */
export const CipherOthersInfo = (props: CipherOthersInfoProps) => {
  const { hasNote, note, onChangeNote, folderId = null, isDeleted, collectionId, isOwner } = props
  const { translate } = useAppLocale()
  const { folderStore, collectionStore } = useStores()
  const { colors } = useTheme()

  const folder = (() => {
    return folderId ? find(folderStore.folders, (e) => e.id === folderId) || {} : {}
  })()

  const collection = (() => {
    return collectionId ? find(collectionStore.collections, (e) => e.id === collectionId) || {} : {}
  })()

  return (
    <View>
      <View style={{ padding: 16, backgroundColor: colors.block }}>
        <Text
          preset="label"
          text={translate("common.others").toUpperCase()}
          style={{ fontSize: 14 }}
        />
      </View>

      {/* Others */}
      <View
        style={{
          backgroundColor: colors.background,
          padding: 16,
          paddingBottom: 32,
        }}
      >
        {/* Folder */}
        {isOwner && (
          <TouchableOpacity
            disabled={isDeleted}
            onPress={() => {
              // navigation.navigate("folders__select", {
              //   mode: "add",
              //   initialId: folderId || collectionId,
              // })
            }}
          >
            <View
              style={{
                justifyContent: "space-between",
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
              }}
            >
              <View>
                <Text
                  preset="label"
                  text={translate("common.folders")}
                  style={{ fontSize: 14, marginBottom: 5 }}
                />
                <Text
                  text={folder?.name || collection?.name || translate("common.none")}
                  numberOfLines={2}
                />
              </View>
              <Icon icon="caret-right" size={20} color={colors.title} />
            </View>
          </TouchableOpacity>
        )}

        {/* Note */}
        {hasNote && (
          <View style={{ flex: 1, marginTop: 20 }}>
            <Textarea label={translate("common.notes")} value={note} onChangeText={onChangeNote} />
          </View>
        )}
      </View>
    </View>
  )
}
