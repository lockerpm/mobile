import React, { useEffect, useState } from "react"
import { Platform, View } from "react-native"
import { observer } from "mobx-react-lite"
import { Text } from "app/components/cores"
import { useCipherData } from "app/services/hook"
import { CipherView } from "core/models/view"
import { useStores } from "app/models"
import { getTOTP, parseOTPUri } from "app/utils/totp"
import { ActionItem, ActionSheet } from "app/components/ciphers"
import { useAppLocale, useTheme } from "app/services/context"
import { DeleteOtpModal } from "./DeleteOtpModal"
import { AnalyticEvents, logFirebaseEvent } from "app/utils/analytics"
import { useClipboard } from "app/services/utils"

type Props = {
  navigation: any
  isOpen?: boolean
  onClose?: () => void
  onLoadingChange?: (val: boolean) => void
  cipher: CipherView
}

export const AuthenticatorAction = observer((props: Props) => {
  const { navigation, isOpen, onClose, onLoadingChange, cipher } = props
  const { colors } = useTheme()
  const { translate } = useAppLocale()
  const { copyToClipboard } = useClipboard()
  const { deleteCiphers } = useCipherData()
  const { cipherStore, user } = useStores()

  // ---------------- PARAMS -----------------

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [nextModal, setNextModal] = useState<"deleteConfirm" | null>(null)

  // ---------------- COMPUTED -----------------

  const otp = parseOTPUri(cipher.notes)

  // ---------------- METHODS -----------------

  const handleDelete = async () => {
    onLoadingChange && onLoadingChange(true)
    const res = await deleteCiphers([cipher.id])
    if (res.kind === "unauthorized") {
      onClose && onClose()
    }
    onLoadingChange && onLoadingChange(false)
  }

  const handleActionSheetClose = () => {
    onClose()
    switch (nextModal) {
      case "deleteConfirm":
        setShowConfirmModal(true)
        break
    }
    setNextModal(null)
  }

  // Render
  useEffect(() => {
    if (Platform.OS === "android" && !isOpen) {
      switch (nextModal) {
        case "deleteConfirm":
          setShowConfirmModal(true)
          break
      }
      setNextModal(null)
    }
  }, [isOpen, nextModal])

  // ---------------- RENDER -----------------

  return (
    <View>
      {/* Modals / Actions */}

      <DeleteOtpModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title={translate("trash.perma_delete")}
        desc={translate("trash.delete_desc")}
        btnText={translate("common.delete")}
      />

      <ActionSheet
        isOpen={isOpen}
        onClose={handleActionSheetClose}
        header={
          <View style={{ width: "100%", paddingHorizontal: 20, marginBottom: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text preset="bold" text={cipher.name} numberOfLines={2} />
              </View>
            </View>
          </View>
        }
      >
        <ActionItem
          name={translate("authenticator.copy_code")}
          icon="copy"
          action={() => {
            copyToClipboard(getTOTP(otp))
            logFirebaseEvent(AnalyticEvents.COPY_OTP, user.email)
            onClose()
          }}
        />

        {__DEV__ && (
          <ActionItem
            name={"(DEBUG) Log note"}
            icon="copy"
            action={() => {
              console.log(cipher.notes)
            }}
          />
        )}
        <ActionItem
          name={translate("common.edit")}
          icon="edit"
          action={() => {
            cipherStore.setSelectedCipher(cipher)
            onClose()
            navigation.navigate("authenticator__edit", { mode: "edit" })
          }}
        />
        <ActionItem
          name={translate("common.delete")}
          icon="trash"
          color={colors.error}
          action={() => {
            setNextModal("deleteConfirm")
            onClose()
          }}
        />
      </ActionSheet>
    </View>
  )
})
