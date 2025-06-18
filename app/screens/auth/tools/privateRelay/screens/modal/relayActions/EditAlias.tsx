import React, { useEffect, useRef, useState } from "react"
import { StyleSheet, TextInput, View } from "react-native"
import { useStores } from "app/models"
import { useTheme } from "app/services/context"
import { RelayAddress } from "app/static/types"
import { Text, Button, Icon } from "app/components/cores"
import Animated, { FadeInDown } from "react-native-reanimated"
import { useHelper } from "app/services/hook"
import { ModalHOC } from "./ModalHOC"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { IS_IOS } from "app/config/constants"

interface Props {
  onClose?: () => void
  item: RelayAddress
}

export const EditAlias = (props: Props) => {
  const { onClose, item } = props
  const { toolStore } = useStores()
  const { translate, notify } = useHelper()

  // --------------- PARAMS ----------------

  const [isLoading, setIsLoading] = useState(false)
  const [newAddress, setNewAddress] = useState("")

  // --------------- METHODS ----------------

  const handleEdit = async () => {
    setIsLoading(true)
    const address = newAddress.toLowerCase().trim()
    const res = await toolStore.updateRelayAddress(item.id, address)
    if (res.kind === "bad-data") {
      const errorData: {
        details?: {
          [key: string]: string[]
        }
        code: string
        message?: string
      } = res.data
      let errorMessage = ""
      if (errorData.details) {
        for (const key of Object.keys(errorData.details)) {
          if (errorData.details[key][0]) {
            if (!errorMessage) {
              errorMessage = errorData.details[key][0]
            }
          }
        }
      }
      notify("error", errorMessage)
      setNewAddress("")
    } else if (res.kind === "ok") {
      EventBus.emit(AppEventType.PRIVATE_RELAY_UPDATE, {
        ...item,
        address,
        full_address: item.full_address.replace(item.address, address),
      })
    }
    onClose()
    setIsLoading(false)
  }

  // --------------- RENDER ----------------

  return (
    <ModalHOC>
      <View style={styles.header}>
        <Text
          preset="bold"
          text={
            !newAddress
              ? translate("private_relay.edit_modal.titel")
              : translate("private_relay.edit_modal.confirm_title")
          }
          size="large"
          style={styles.title}
        />
        <Icon icon="x" onPress={onClose} />
      </View>
      {!newAddress && (
        <EditView
          full_address={item.full_address}
          address={item.address}
          setConfirmNewAddress={setNewAddress}
        />
      )}
      {!!newAddress && (
        <Animated.View entering={FadeInDown} style={styles.container}>
          <Text
            text={translate("private_relay.edit_warning", { alias: item.full_address })}
            style={styles.confirmNote}
          />
          <View style={styles.confirmContainer}>
            <Button
              preset="secondary"
              text={translate("common.cancel")}
              onPress={onClose}
              style={styles.cancel}
            />
            <Button
              text={translate("common.save")}
              loading={isLoading}
              onPress={handleEdit}
              style={styles.save}
            />
          </View>
        </Animated.View>
      )}
    </ModalHOC>
  )
}

const EditView = (item: {
  full_address: string
  address: string
  setConfirmNewAddress: (val: string) => void
}) => {
  const { colors } = useTheme()
  const { translate } = useHelper()
  const ref = useRef<TextInput>(null)
  const [addressText, setAddressText] = useState("")

  useEffect(() => {
    const timeout = setTimeout(() => {
      ref.current?.focus()
    }, 500)
    return () => {
      clearTimeout(timeout)
    }
  }, [])

  const validNumberCharacters = addressText.length >= 3 && addressText.length <= 63
  const validSpecialCharacters = addressText.length > 0 && /^[a-z0-9-]+$/.test(addressText)

  return (
    <Animated.View entering={FadeInDown} style={styles.container}>
      <Text
        preset="label"
        size="base"
        tx={"private_relay.edit_modal.current"}
        style={styles.label1}
      />

      <Text text={item.full_address} />

      <Text preset="label" size="base" tx={"private_relay.edit_modal.new"} style={styles.label2} />

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: colors.primary,
          },
        ]}
      >
        <TextInput
          ref={ref}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect={false}
          value={addressText}
          onChangeText={setAddressText}
          placeholder={"... "}
          placeholderTextColor={colors.secondaryText}
          selectionColor={colors.primary}
          style={{
            flexGrow: 1,
            flexShrink: 1,
            color: colors.title,
            fontSize: 16,
          }}
        />
        <Text text={item.full_address.replace(item.address, "")} style={styles.domain} />
      </View>

      <View style={styles.note}>
        <Text
          tx="private_relay.edit_modal.error.numberCharacters"
          color={validNumberCharacters ? colors.primary : colors.disable}
          size="small"
        />
        <Text
          tx="private_relay.edit_modal.error.special"
          color={validSpecialCharacters ? colors.primary : colors.disable}
          size="small"
        />
      </View>

      <Button
        text={translate("common.save")}
        disabled={!validNumberCharacters || !validSpecialCharacters}
        onPress={() => item.setConfirmNewAddress(addressText)}
        style={{
          marginBottom: IS_IOS ? 0 : 16,
        }}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  cancel: {
    width: 100,
  },
  confirmContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  confirmNote: {
    marginBottom: 4,
    marginTop: 4,
  },
  container: {
    paddingHorizontal: 16,
  },
  domain: {
    marginLeft: 2,
    right: 0,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    height: 45,
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  inputContainer: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    height: 44,
    justifyContent: "space-between",
    paddingLeft: 12,
    paddingRight: 12,
  },
  label1: {
    marginBottom: 4,
    marginTop: 10,
  },
  label2: {
    marginBottom: 4,
    marginTop: 24,
  },
  note: {
    marginVertical: 16,
  },
  save: {
    marginLeft: 12,
    width: 100,
  },
  title: {
    flexGrow: 1,
    flexShrink: 1,
  },
})
