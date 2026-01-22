import { FC, useState } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"

import { ModalBackdrop } from "app/components/cores"
import { Text, Button, BottomModalContainer, BottomModalHeader } from "app/components/cores"
import { useStores } from "app/models"
import { ShareScreenProps } from "app/navigators"
import { useCipherData } from "app/services/hook"
import { debounce } from "app/utils/utils"

import { ThemedStyle } from "@/theme"
import { delay } from "@/utils/delay"
import { AppEventType, EventBus } from "@/utils/eventBus"
import { useAppTheme } from "@/utils/useAppTheme"

export const ConfirmYourShareModalScreen: FC<ShareScreenProps<"confirmYourShareModal">> = observer(
  ({
    navigation,
    route: {
      params: { organizationId, members },
    },
  }) => {
    const onClose = debounce(navigation.goBack, 400)
    const { cipherStore } = useStores()
    const { themed } = useAppTheme()
    const { confirmShareCipher } = useCipherData()

    // --------------- PARAMS ----------------

    const [isLoading, setIsLoading] = useState(false)

    // --------------- COMPUTED ----------------

    // --------------- METHODS ----------------

    const handleConfirmShare = async () => {
      setIsLoading(true)
      await Promise.all(
        members.map(async (member) => {
          const publicKeyRes = await cipherStore.getSharingPublicKey(member.email)
          if (publicKeyRes.kind === "ok") {
            await confirmShareCipher(organizationId, member.id, publicKeyRes.data.public_key)
          }
        })
      )

      await delay(1000)
      EventBus.emit(AppEventType.RELOAD_YOUR_SHARE, null)
      setIsLoading(false)
      onClose()
    }

    // --------------- EFFECT ----------------

    // --------------- RENDER ----------------

    return (
      <View style={styles.flex}>
        <ModalBackdrop onPress={onClose} />
        <BottomModalContainer>
          <BottomModalHeader tx="shares:confirm_share.title" onClose={onClose} />
          <View style={styles.ph16}>
            <Text tx="shares:confirm_share.list" />
            <View style={themed($fingerprint)}>
              {members.map((member) => (
                <Text key={member.email} text={member.email} />
              ))}
            </View>
            <Text preset="label" tx="shares:confirm_share.des" style={styles.mb24} />

            <Button
              tx="common:confirm"
              disabled={isLoading}
              loading={isLoading}
              onPress={handleConfirmShare}
            />
          </View>
        </BottomModalContainer>
      </View>
    )
  }
)

const $fingerprint: ThemedStyle<ViewStyle> = ({ colors }) => ({
  paddingHorizontal: 15,
  paddingVertical: 10,
  borderRadius: 5,
  backgroundColor: colors.border,
  marginVertical: 16,
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: "flex-end",
  },
  mb24: {
    marginBottom: 25,
  },
  ph16: {
    paddingHorizontal: 16,
  },
})
