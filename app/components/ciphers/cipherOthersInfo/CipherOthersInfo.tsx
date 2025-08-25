import { StyleSheet, View, ViewStyle } from "react-native"
import { Textarea } from "../../utils"
import { Text, ImageIcon } from "../../cores"
import { FolderView } from "core/models/view/folderView"
import { CollectionView } from "core/models/view/collectionView"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { useNavigation } from "@react-navigation/native"
import { BrowseScreenProps } from "@/navigators"
import { CipherEditActionField } from "../cipherEditActionField"

export interface CipherOthersInfoProps {
  isOwner: boolean
  isDeleted: boolean
  folder?: FolderView
  collection?: CollectionView
  hasNote: boolean
  note?: string
  onChangeNote?: (val: string) => void
}

/**
 * Describe your component here
 */
export const CipherOthersInfo = (props: CipherOthersInfoProps) => {
  const navigation = useNavigation<BrowseScreenProps<"cipherEdit">["navigation"]>()
  const { hasNote, note, onChangeNote, folder, isDeleted, collection, isOwner } = props
  const { themed } = useAppTheme()

  return (
    <View>
      <View style={themed($other)}>
        <Text preset="label" tx="common:others" size="sm" />
      </View>

      <View style={themed($container)}>
        {/* Folder */}
        {isOwner && (
          <CipherEditActionField
            disabled={isDeleted}
            onPress={() => {
              navigation.navigate("folderSelect", {
                mode: "add",
                initialId: folder?.id || collection?.id,
              })
            }}
            labelTx="common:folders"
          >
            {(folder || collection) && (
              <View style={styles.folderContainer}>
                <ImageIcon
                  icon={folder ? "folder" : "folder-share"}
                  size={20}
                  containerStyle={styles.mr12}
                />
                <Text text={folder?.name || collection?.name} numberOfLines={1} />
              </View>
            )}
          </CipherEditActionField>
        )}

        {/* Note */}
        {hasNote && (
          <View style={styles.note}>
            <Textarea labelTx={"common:notes"} value={note || ""} onChangeText={onChangeNote} />
          </View>
        )}
      </View>
    </View>
  )
}

const $other: ThemedStyle<ViewStyle> = ({ colors }) => ({
  padding: 16,
  paddingVertical: 8,
  backgroundColor: colors.block,
})

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  padding: 16,
  paddingTop: 24,
})

const styles = StyleSheet.create({
  folderContainer: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    marginRight: 36,
  },
  mr12: {
    marginRight: 12,
  },
  note: {
    flex: 1,
  },
})
