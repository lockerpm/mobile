import { FC } from "react"
import { StyleSheet, View } from "react-native"

import { BottomModalContainer, ModalBackdrop, Text } from "app/components/cores"
import { AndroidAutofillScreenProps } from "app/navigators"
import { debounce } from "app/utils/utils"

import { CipherActionsByType, CipherIconImage } from "@/components/ciphers"
import { NewActionSheetItem } from "@/components/utils"
import { getCipherDescription } from "@/utils/cipherHelper"

import { useActionsNavigate } from "./useActionsNavigate"

export const AndroidAutofillCipherActionsModalScreen: FC<
  AndroidAutofillScreenProps<"passwordActionsModal">
> = ({
  navigation,
  route: {
    params: { item },
  },
}) => {
  const onClose = debounce(navigation.goBack, 400)
  const cipherDescription = getCipherDescription(item)

  const { navigateHistory, navigateCipherDetail, navigateCipherEdit } = useActionsNavigate(
    item,
    onClose
  )

  return (
    <View style={styles.flex}>
      <ModalBackdrop onPress={onClose} />

      <BottomModalContainer>
        <View style={styles.headerContainer}>
          <CipherIconImage
            isHaveKey={item.login.hasFido2Credentials}
            cipherType={item.type}
            source={item.imgLogo}
            resizeMode="contain"
          />
          <View style={styles.headerContent}>
            <Text preset="bold" text={item.name} numberOfLines={2} />
            {!!cipherDescription && (
              <Text
                preset="label"
                size="sm"
                text={cipherDescription}
                numberOfLines={1}
                ellipsizeMode="tail"
              />
            )}
          </View>
        </View>
        <CipherActionsByType item={item} onClose={onClose} />

        <NewActionSheetItem
          bottomBorder
          hide={!item.passwordHistory || item.passwordHistory?.length === 0}
          tx="password_history:view"
          icon="clock-clockwise"
          onPress={navigateHistory}
        />
        <NewActionSheetItem
          bottomBorder
          tx="common:details"
          icon="list-bullets"
          onPress={navigateCipherDetail}
        />
        <NewActionSheetItem
          bottomBorder
          tx="common:edit"
          icon="edit"
          onPress={navigateCipherEdit}
        />
      </BottomModalContainer>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: "flex-end",
  },
  headerContainer: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
    width: "100%",
  },
  headerContent: {
    flexGrow: 1,
    flexShrink: 1,
    marginLeft: 12,
  },
})
