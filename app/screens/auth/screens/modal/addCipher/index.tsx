import { FC, useCallback } from "react"
import { StyleSheet, View, Image, ViewStyle } from "react-native"
import { debounce } from "app/utils/utils"
import { AuthScreenProps } from "app/navigators"
import {
  ModalBackdrop,
  Text,
  BottomModalContainer,
  PressableScale,
  Icon,
} from "app/components/cores"
import { VAULT_ITEMS } from "app/static/vault"
import { CipherType } from "core/enums"
import { delay } from "@/utils/delay"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { useStores } from "@/models"
import { getTeam } from "@/utils/cipherHelper"
import { AccountRole } from "@/static/types"

export const AddCipherModalScreen: FC<AuthScreenProps<"addCipherModal">> = ({
  navigation,
  route,
}) => {
  const { cipherStore } = useStores()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const onClose = debounce(navigation.goBack, 400)

  const hasAddCollectionPermission = (() => {
    if (route.params?.collectionId) {
      const organizations = cipherStore.organizations
      const organizationRole = getTeam(organizations, route.params.collectionId).type
      return organizationRole === AccountRole.OWNER || organizationRole === AccountRole.ADMIN
    }
    return false
  })()

  const navigateToCreateCipher = useCallback((cipherTypes: CipherType[]) => {
    const initCollectionIds = route.params?.collectionId ? [route.params?.collectionId] : undefined
    const initFolderId = route.params?.folderId || undefined
    onClose()
    delay(30).then(() => {
      navigation.navigate("browseStack", {
        screen: "cipherEdit",
        params: {
          mode: "add",
          cipherType: cipherTypes[0],
          initCollectionIds,
          initFolderId,
        },
      })
    })
  }, [])

  return (
    <View style={styles.flex}>
      <ModalBackdrop onPress={onClose} />
      <BottomModalContainer>
        {VAULT_ITEMS.map((item, index) => (
          <PressableScale key={index} onPress={() => navigateToCreateCipher(item.type)}>
            <View style={styles.itemContainer}>
              <Image source={item.icon} style={styles.icon} resizeMode="contain" />
              <Text tx={item.label} />
            </View>
            <View style={themed($border)} />
          </PressableScale>
        ))}
        {hasAddCollectionPermission && (
          <View style={styles.shareFolderWarningContainer}>
            <Icon icon="info" color={colors.warning} style={styles.mr8} />
            <Text tx="folder:move_to_collection_warning" style={styles.warningText} />
          </View>
        )}
      </BottomModalContainer>
    </View>
  )
}

const $border: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginLeft: 68,
  height: 1,
  backgroundColor: colors.border,
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: "flex-end",
  },
  icon: {
    borderRadius: 8,
    height: 40,
    marginRight: 12,
    overflow: "hidden",
    width: 40,
  },
  itemContainer: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  mr8: {
    marginRight: 8,
  },
  shareFolderWarningContainer: {
    flexDirection: "row",
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  warningText: {
    flexGrow: 1,
    flexShrink: 1,
  },
})
