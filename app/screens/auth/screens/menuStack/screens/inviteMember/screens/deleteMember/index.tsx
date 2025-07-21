import { FC, useState } from "react"
import { StyleSheet, View, Image } from "react-native"
import { debounce } from "app/utils/utils"
import { InviteToFamilyScreenProps } from "app/navigators"
import { ModalBackdrop } from "app/components/cores"

import { Text, Button, BottomModalContainer } from "app/components/cores"
import { useStores } from "@/models"
import { useToast } from "@/services/utils"
import { AppEventType, EventBus } from "@/utils/eventBus"

const TRASH = require("assets/images/intro/trash.png")

export const DeleteMemberModalScreen: FC<InviteToFamilyScreenProps<"deleteMember">> = ({
  navigation,
  route: {
    params: { id, email, avatar },
  },
}) => {
  const { user } = useStores()
  const { notifyTx, notifyApiError } = useToast()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const onClose = debounce(navigation.goBack, 400)

  const removeFamilyMember = async () => {
    setIsLoading(true)
    const res = await user.removeFamilyMember(id.toString())
    setIsLoading(false)
    if (res.kind === "ok") {
      notifyTx("success", "invite_member:delete_noti")
      EventBus.emit(AppEventType.INVITE_TO_FAMILY_MEMBER_UPDATE, null)
    } else {
      notifyApiError(res)
    }
    onClose()
  }

  return (
    <View style={styles.flex}>
      <ModalBackdrop onPress={onClose} />

      <BottomModalContainer style={styles.container}>
        <View style={styles.row}>
          <Image resizeMode="contain" source={{ uri: avatar }} style={styles.modalImage} />
          <Text ellipsizeMode="tail" text={email} style={styles.modalText} />
        </View>
        <Image resizeMode="contain" source={TRASH} style={styles.image} />

        <Button
          preset="delete"
          disabled={isLoading}
          loading={isLoading}
          onPress={removeFamilyMember}
          tx="invite_member:remove"
        />
      </BottomModalContainer>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  flex: {
    flex: 1,
    justifyContent: "flex-end",
  },
  image: {
    alignSelf: "center",
    height: 110,
    marginBottom: 12,
    width: 100,
  },
  modalImage: {
    borderRadius: 20,
    height: 30,
    marginRight: 12,
    width: 30,
  },
  modalText: {
    flexShrink: 1,
  },
  row: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    marginBottom: 12,
  },
})
