import { ModalBackdrop } from "app/components/cores"
import { ShareScreenProps } from "app/navigators"
import { debounce } from "app/utils/utils"
import { FC, useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { useCoreService } from "app/services/coreService"
import { useCipherData } from "app/services/hook"
import { StyleSheet, View, ViewStyle } from "react-native"
import { Text, Button, BottomModalContainer, BottomModalHeader } from "app/components/cores"
import { useToast } from "app/services/utils"
import { useAppTheme } from "@/utils/useAppTheme"
import { Base64 } from "@/utils/base64"
import { ThemedStyle } from "@/theme"

export const ConfirmYourShareModalScreen: FC<ShareScreenProps<"confirmYourShareModal">> = observer(
  ({
    navigation,
    route: {
      params: { organizationId, member },
    },
  }) => {
    const onClose = debounce(navigation.goBack, 400)
    const { cipherStore } = useStores()
    const {
      themed,
      theme: { colors },
    } = useAppTheme()
    const { notifyApiError } = useToast()
    const { confirmShareCipher } = useCipherData()
    const { cryptoService } = useCoreService()

    // --------------- PARAMS ----------------

    const [isLoading, setIsLoading] = useState(false)
    const [fingerprint, setFingerprint] = useState("")
    const [publicKey, setPublicKey] = useState("")

    // --------------- COMPUTED ----------------

    // --------------- METHODS ----------------

    const handleConfirmShare = async () => {
      setIsLoading(true)
      const res = await confirmShareCipher(organizationId, member.id, publicKey)
      setIsLoading(false)

      if (res.kind === "ok" || res.kind === "unauthorized") {
        onClose()
      }
    }

    const loadFingerprint = async () => {
      setIsLoading(true)
      const res = await cipherStore.getSharingPublicKey(member.email)
      if (res.kind !== "ok") {
        notifyApiError(res)
        setIsLoading(false)
        return
      }
      setPublicKey(res.data.public_key)
      const pubKey = Base64.fromB64ToArray(res.data.public_key)

      // @ts-ignore
      const fp = await cryptoService.getFingerprint(member.pwd_user_id, pubKey.buffer)
      setFingerprint(fp.join("-"))
      setIsLoading(false)
    }

    // --------------- EFFECT ----------------
    useEffect(() => {
      loadFingerprint()
    }, [])

    // --------------- RENDER ----------------

    return (
      <View style={styles.flex}>
        <ModalBackdrop onPress={onClose} />
        <BottomModalContainer>
          <BottomModalHeader tx="shares:confirm_share.verify_fingerprint" onClose={onClose} />
          <View style={styles.ph16}>
            <Text tx={"shares:confirm_share.verification_desc"} style={styles.mv16} />

            <View style={themed($fingerprint)}>
              <Text text={fingerprint} color={colors.error} />
            </View>

            <Text
              preset="label"
              size="sm"
              tx={"shares:confirm_share.fingerprint_desc"}
              style={styles.mv16}
            />

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
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: "flex-end",
  },
  mv16: {
    marginVertical: 16,
  },
  ph16: {
    paddingHorizontal: 16,
  },
})
