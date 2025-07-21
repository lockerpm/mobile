import { FC, useCallback } from "react"
import { StyleSheet, View, Image, ViewStyle } from "react-native"
import { debounce } from "app/utils/utils"
import { AuthScreenProps } from "app/navigators"
import { ModalBackdrop, Text, BottomModalContainer, PressableScale } from "app/components/cores"
import { VAULT_ITEMS } from "app/static/vault"
import { CipherType } from "core/enums"
import { delay } from "@/utils/delay"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

export const AddCipherModalScreen: FC<AuthScreenProps<"addCipherModal">> = ({
  navigation,
  route,
}) => {
  const { themed } = useAppTheme()
  const onClose = debounce(navigation.goBack, 400)

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
})
