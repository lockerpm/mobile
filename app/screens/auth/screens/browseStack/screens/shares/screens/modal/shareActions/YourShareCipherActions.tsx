import React from "react"
import { View, StyleSheet } from "react-native"
import { BottomModalContainer, Text } from "app/components/cores"
import { useTheme } from "app/services/context"
import { CipherAppView, ShareActionsModal } from "app/static/types"
import { getCipherDescription } from "app/utils/cipherHelper"
import { CipherIconImage } from "app/components/newCiphers"
import { NewActionSheetItem } from "app/components/utils"
import { useNavigation } from "@react-navigation/native"
import { ShareStackScreenProps } from "app/navigators"

interface Props {
  item: CipherAppView
  setNextModal: (action: ShareActionsModal) => void
  onClose: () => void
}

export const YourShareCipherActions = ({ item, setNextModal, onClose }: Props) => {
  const navigation = useNavigation<ShareStackScreenProps<"shareActionsModal">["navigation"]>()

  const { colors } = useTheme()
  // ------------------------COMPUTED------------------------

  const cipherDescription = getCipherDescription(item)

  return (
    <BottomModalContainer>
      <View style={styles.headerContainer}>
        <CipherIconImage cipherType={item.type} source={item.imgLogo} resizeMode="contain" />
        <View style={styles.headerContent}>
          <Text preset="bold" text={item.name} numberOfLines={2} />
          {!!cipherDescription && (
            <Text
              preset="label"
              size="base"
              text={cipherDescription}
              numberOfLines={1}
              ellipsizeMode="tail"
            />
          )}
        </View>
      </View>
      <NewActionSheetItem
        bottomBorder
        tx="common.details"
        icon="list-bullets"
        onPress={() => {
          onClose()
          setTimeout(() => {
            navigation.navigate("browseStack", {
              screen: "cipherDetail",
              params: {
                cipher: item,
              },
            })
          }, 50)
        }}
      />

      <NewActionSheetItem
        bottomBorder
        tx="shares.share_folder.manage_user"
        icon="edit"
        onPress={() => {
          setNextModal(ShareActionsModal.MANAGE_SHARE)
          // navigation.navigate(`${cipherMapper.path}__edit`, { mode: "edit" })
        }}
      />
      <NewActionSheetItem
        bottomBorder
        tx="shares.stop_sharing"
        icon="x-circle"
        color={colors.error}
        iconColor={colors.error}
        onPress={() => {
          // setNextModal(CipherActionsModal.LEAVE_SHARE)
        }}
      />
    </BottomModalContainer>
  )
}

const styles = StyleSheet.create({
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
