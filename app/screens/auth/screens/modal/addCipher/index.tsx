import React, { FC, useCallback } from "react"
import { StyleSheet, View, Image, TouchableOpacity } from "react-native"
import { debounce, delay } from "app/utils/utils"
import { AuthStackScreenProps } from "app/navigators"
import { ModalBackdrop, Text, BottomModalContainer } from "app/components/cores"
import { VAULT_ITEMS } from "app/static/vault"
import { CipherType } from "core/enums"

export const AddCipherModalScreen: FC<AuthStackScreenProps<"addCipherModal">> = ({
  navigation,
}) => {
  const onClose = debounce(navigation.goBack, 400)

  const navigateToCreateCipher = useCallback((cipherTypes: CipherType[]) => {
    onClose()
    delay(50).then(() => {
      navigation.navigate("browseStack", {
        screen: "cipherEdit",
        params: {
          mode: "add",
          cipherType: cipherTypes[0],
        },
      })
    })
  }, [])

  return (
    <View style={styles.flex}>
      <ModalBackdrop onPress={onClose} />
      <BottomModalContainer>
        {VAULT_ITEMS.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => navigateToCreateCipher(item.type)}>
            <View style={styles.itemContainer}>
              <Image source={item.icon} style={styles.icon} resizeMode="contain" />
              <Text tx={item.label} />
            </View>
          </TouchableOpacity>
        ))}
      </BottomModalContainer>
    </View>
  )
}

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
