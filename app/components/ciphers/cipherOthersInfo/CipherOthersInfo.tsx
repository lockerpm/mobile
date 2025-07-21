import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native"
import { DividerText, Textarea } from "../../utils"
import { Text, Icon } from "../../cores"
import { FolderView } from "core/models/view/folderView"
import { CollectionView } from "core/models/view/collectionView"
import { useAppLocale } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { useNavigation } from "@react-navigation/native"
import { BrowseScreenProps } from "@/navigators"
import { CipherEditActionField } from "../cipherEdit/CipherEditActionField"

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
  const { translate } = useAppLocale()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <View>
      <View style={themed($other)}>
        <Text preset="label" tx="common:others" size="sm" />
      </View>

      <View style={themed($container)}>
        <CipherEditActionField
          haveValue={!!folder || !!collection}
          editable={!isDeleted}
          onPress={() => {
            navigation.navigate("folderSelect", {
              mode: "add",
              initialId: folder?.id || collection?.id,
            })
          }}
        >
          <View style={styles.folderContainer}>
            <View>
              <Text preset="label" tx={"common:folders"} size="sm" style={styles.mb5} />
              <Text
                text={folder?.name || collection?.name || translate("common:none")}
                numberOfLines={2}
              />
            </View>
            <Icon icon="caret-right" size={20} color={colors.label} />
          </View>
        </CipherEditActionField>
        {/* Folder */}
        {isOwner && (
          <TouchableOpacity
            disabled={isDeleted}
            onPress={() => {
              navigation.navigate("folderSelect", {
                mode: "add",
                initialId: folder?.id || collection?.id,
              })
            }}
          >
            <View style={styles.folderContainer}>
              <View>
                <Text preset="label" tx={"common:folders"} size="sm" style={styles.mb5} />
                <Text
                  text={folder?.name || collection?.name || translate("common:none")}
                  numberOfLines={2}
                />
              </View>
              <Icon icon="caret-right" size={20} color={colors.label} />
            </View>
          </TouchableOpacity>
        )}

        <DividerText style={styles.mv8} />

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
  paddingBottom: 32,
})

const styles = StyleSheet.create({
  folderContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  mb5: {
    marginBottom: 5,
  },
  mv8: {
    marginTop: 8,
  },
  note: {
    flex: 1,
  },
})
