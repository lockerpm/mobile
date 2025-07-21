import { useStores } from "app/models"
import { FC } from "react"
import { View, StyleSheet } from "react-native"
import { BottomModalContainer, ModalBackdrop, Text } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { CipherIconImage } from "app/components/ciphers"
import { ShareScreenProps } from "@/navigators"
import { useAppTheme } from "@/utils/useAppTheme"
import { debounce } from "@/utils/utils"
import { useClipboard, useToast } from "@/services/utils"
import { Base64 } from "@/utils/base64"
import { getCipherLogo } from "@/utils/cipherHelper"
import { NewActionSheetItem } from "@/components/utils"
import { delay } from "@/utils/delay"
import moment from "moment"

/**
 * Describe your component here
 */
export const QuickSharesActionsModalScreen: FC<ShareScreenProps<"quickSharesActionsModal">> =
  observer(
    ({
      navigation,
      route: {
        params: { cipher },
      },
    }) => {
      const {
        theme: { colors },
      } = useAppTheme()
      const { cipherStore } = useStores()
      const { notifyApiError } = useToast()
      const { copyToClipboard } = useClipboard()

      const isExpired = cipher.expirationDate?.getTime() < Date.now()
      const description = moment.unix(cipher.creationDate.getTime() / 1000).fromNow()

      const onClose = debounce(navigation.goBack, 400)

      const stopQuickShare = async () => {
        const res = await cipherStore.stopQuickSharing(cipher)
        if (res.kind !== "ok") {
          notifyApiError(res)
        }
        onClose()
      }

      const copyShareLink = () => {
        const url = cipherStore.getPublicShareUrl(
          cipher.accessId,
          Base64.bufferToBase64url(cipher.key)
        )
        copyToClipboard(url)
        onClose()
      }

      const navigateToQuickShareDetail = () => {
        onClose()
        delay(20).then(() => {
          navigation.navigate("quickShareCipherDetail", { send: cipher })
        })
      }

      return (
        <View style={styles.flex}>
          <ModalBackdrop onPress={onClose} />
          <BottomModalContainer>
            <View style={styles.header}>
              <CipherIconImage
                source={getCipherLogo(cipher.cipher)}
                // eslint-disable-next-line react-native/no-inline-styles
                style={[styles.logo, { opacity: isExpired ? 0.3 : 1 }]}
                cipherType={cipher.cipher.type}
              />
              <View style={styles.ml12}>
                <Text
                  preset="bold"
                  color={isExpired ? colors.disable : colors.title}
                  text={isExpired ? cipher.cipher.name : cipher.cipher.name}
                  numberOfLines={2}
                  style={styles.name}
                />
                <Text
                  size="sm"
                  color={isExpired ? colors.disable : colors.title}
                  tx="quick_shares:shared_begin"
                  txOptions={{ time: description }}
                  numberOfLines={1}
                />
              </View>
            </View>

            {!isExpired && (
              <NewActionSheetItem
                bottomBorder
                tx="quick_shares:action.detail"
                icon="list-bullets"
                onPress={navigateToQuickShareDetail}
              />
            )}

            {!isExpired && (
              <NewActionSheetItem
                bottomBorder
                tx="quick_shares:action.copy"
                icon="link"
                onPress={copyShareLink}
              />
            )}

            <NewActionSheetItem
              bottomBorder
              tx={isExpired ? "quick_shares:delete_expired" : "quick_shares:action.stop"}
              icon="trash"
              color={colors.error}
              iconColor={colors.error}
              onPress={stopQuickShare}
            />
          </BottomModalContainer>
        </View>
      )
    }
  )

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: "flex-end",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 10,
    paddingHorizontal: 20,
    width: "100%",
  },
  logo: {
    borderRadius: 8,
    height: 40,
    width: 40,
  },
  ml12: {
    marginLeft: 12,
  },
  name: {
    flexGrow: 1,
    flexShrink: 1,
  },
})
