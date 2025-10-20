import { BottomModal, Button, PressableScale, Switch, Text } from "@/components/cores"
import { MenuItemContainer } from "@/components/utils"
import { useAppLocale } from "@/i18n"
import { useStores } from "@/models"
import { toolApi } from "@/services/api"
import { useToast } from "@/services/utils"
import { useCallback, useEffect, useState } from "react"
import { View, StyleSheet, Alert } from "react-native"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  updateAnonymousSetting: () => void
  isAnonymous: boolean
}

const EnableAnonymousWarningModal = ({
  isOpen,
  onClose,
  updateAnonymousSetting,
  isAnonymous,
}: ModalProps) => {
  return (
    <BottomModal isOpen={isOpen} onClose={onClose}>
      <Text>
        Are you sure you want to {isAnonymous ? "disable" : "enable"} anonymous reporting?
      </Text>
      <Button onPress={updateAnonymousSetting}>Yes</Button>
      <Button onPress={onClose}>No</Button>
    </BottomModal>
  )
}

export const AnonumousReport = () => {
  const { toolStore } = useStores()
  const { notifyApiError } = useToast()
  const { translate } = useAppLocale()

  const [isShowWarning, setIsShowWarning] = useState(false)
  const [isAnonumous, setIsAnonymous] = useState(true)

  const fetchAnonymousSetting = useCallback(async () => {
    const res = await toolApi.scamCheckAnonymous(toolStore.apiToken)
    if (res.kind === "ok") {
      setIsAnonymous(res.isAnonymous)
    }
  }, [toolStore.apiToken])

  const updateAnonymousSetting = useCallback(async () => {
    const res = await toolApi.scamUpdateAnonymous(toolStore.apiToken, !isAnonumous)
    if (res.kind === "ok") {
      setIsAnonymous(!isAnonumous)
    } else {
      notifyApiError(res)
    }
  }, [isAnonumous, toolStore.apiToken])

  const openModal = useCallback(() => {
    if (isAnonumous) {
      Alert.alert(
        translate("scam:home.anonymous.alert.title"),
        translate("scam:home.anonymous.alert.label"),
        [
          {
            text: translate("scam:home.anonymous.alert.cancel"),
            style: "cancel",
          },
          {
            text: translate("scam:home.anonymous.alert.confirm"),
            onPress: () => {
              updateAnonymousSetting()
            },
          },
        ],
        { cancelable: true }
      )
    } else {
      updateAnonymousSetting()
    }
  }, [isAnonumous, translate, updateAnonymousSetting])

  useEffect(() => {
    fetchAnonymousSetting()
  }, [fetchAnonymousSetting])

  return (
    <>
      <EnableAnonymousWarningModal
        isOpen={isShowWarning}
        onClose={() => setIsShowWarning(false)}
        updateAnonymousSetting={updateAnonymousSetting}
        isAnonymous={isAnonumous}
      />
      <MenuItemContainer>
        <PressableScale onPress={openModal} style={styles.itemContainer2}>
          <View style={styles.itemContent2}>
            <Text tx="scam:home.anonymous.title" style={styles.itemText} />
            <Text
              preset="label"
              size="sm"
              tx="scam:home.anonymous.label"
              style={styles.itemLabel}
            />
          </View>
          <Switch value={isAnonumous} onPress={openModal} />
        </PressableScale>
      </MenuItemContainer>
    </>
  )
}

const styles = StyleSheet.create({
  itemContainer2: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemContent2: {
    flex: 1,
    paddingRight: 12,
  },
  itemLabel: {
    marginTop: 4,
  },
  itemText: {
    flexGrow: 1,
    flexShrink: 1,
  },
})
