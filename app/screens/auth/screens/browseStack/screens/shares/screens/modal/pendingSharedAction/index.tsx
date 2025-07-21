import { ModalBackdrop } from "app/components/cores"
import { ShareScreenProps } from "app/navigators"
import { debounce } from "app/utils/utils"
import { FC, useState } from "react"
import { View, StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"
import { BottomModalContainer } from "app/components/cores"
import { NewActionSheetItem } from "app/components/utils"
import { ShareWithYouItem } from "../../shared/ShareWithYouItem"
import { useCipherData } from "@/services/hook"

export const PendingSharedCipherModalScreen: FC<ShareScreenProps<"pendingSharedCipherModal">> =
  observer(
    ({
      navigation,
      route: {
        params: { cipher },
      },
    }) => {
      const [isLoading1, setIsLoading1] = useState(false)
      const [isLoading2, setIsLoading2] = useState(false)

      const onClose = debounce(navigation.goBack, 400)
      const { acceptShareInvitation, rejectShareInvitation } = useCipherData()

      // Methods
      const handleAccept = async () => {
        setIsLoading1(true)
        await acceptShareInvitation(cipher.id)
        setIsLoading1(false)

        onClose()
      }

      const handleReject = async () => {
        setIsLoading2(true)
        await rejectShareInvitation(cipher.id)
        setIsLoading2(false)
        onClose()
      }
      return (
        <View style={styles.flex}>
          <ModalBackdrop onPress={onClose} />
          <BottomModalContainer>
            <View style={styles.header}>
              <ShareWithYouItem item={cipher} />
            </View>

            <NewActionSheetItem
              isLoading={isLoading1}
              bottomBorder
              tx="common:accept"
              onPress={handleAccept}
            />

            <NewActionSheetItem
              isLoading={isLoading2}
              bottomBorder
              tx="common:reject"
              onPress={handleReject}
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
    paddingHorizontal: 16,
  },
})
