import { useState } from "react"
import { View, TouchableOpacity, Image, StyleSheet, ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"

import { BottomModal, Button, Icon, Text } from "app/components/cores"
import { useStores } from "app/models"

import { useAppLocale } from "@/i18n"
import { SettingsScreenProps } from "@/navigators"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

interface Props {
  imported: number
  total: number
  skipped?: number
  isLimited?: boolean
  setIsLimited: (val: boolean) => void
}

const LOCKER_IMG = require("assets/images/intro/locker.png")

export const ImportResult = (props: Props) => {
  const navigation = useNavigation<SettingsScreenProps<"import">["navigation"]>()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()
  const { user } = useStores()
  const { imported, total, skipped = 0, isLimited = false, setIsLimited } = props
  const isFreeAccount = user.isFreePlan
  const isAllImported = imported === total
  const [isFree, setIsFree] = useState(true)

  return (
    <View>
      <View style={styles.center}>
        <Icon icon="check" size={32} color={colors.primary} />
        <Text preset="bold" tx={"import:imported"} style={styles.imported} />

        <View style={styles.row}>
          {isAllImported ? (
            <Icon icon={"check"} size={24} color={colors.primary} />
          ) : (
            <Icon icon={"warning"} size={24} color={colors.error} />
          )}
          <Text
            preset="bold"
            text={`${props.imported}/${props.total} ` + translate("import:imported_free.result")}
            color={isAllImported ? colors.primary : colors.error}
            style={styles.ml10}
          />
        </View>
        {skipped > 0 && (
          <Text
            text={translate("import:duplicate_skipped", { count: skipped })}
            style={styles.skipped}
          />
        )}
        {isAllImported && (
          <Button
            tx={"import:result_btn"}
            onPress={() =>
              navigation.navigate("mainTab", {
                screen: "homeTab",
              })
            }
            style={styles.btnResult}
          />
        )}
      </View>

      {!isAllImported && isFree && (
        <View style={themed($notAllImport)}>
          <View style={styles.mr36}>
            <Text tx={"import:imported_free.guild"} style={{ color: colors.black }} />
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("payment")
              }}
            >
              <Text weight="semiBold" color={colors.primary} text="Upgrade to Premium" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              setIsFree(false)
            }}
          >
            <Icon icon="x" size={24} color={"black"} />
          </TouchableOpacity>
        </View>
      )}

      <BottomModal
        tx={"import:limited"}
        isOpen={isLimited && isFreeAccount}
        onClose={() => {
          setIsLimited(false)
        }}
      >
        <View style={styles.center}>
          <Image resizeMode="contain" source={LOCKER_IMG} style={styles.importImage} />
          <Text
            text={`${imported}/${total} ` + translate("import:imported_free.note")}
            style={styles.importNote}
          />

          <Button
            text="Get Unlimited"
            onPress={() => {
              setIsLimited(false)
              navigation.navigate("payment")
            }}
            style={styles.button}
          />
        </View>
      </BottomModal>
    </View>
  )
}

const $notAllImport: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginTop: 16,
  borderWidth: 1,
  borderColor: colors.palette.orange10,
  backgroundColor: colors.palette.orange4,
  flexDirection: "row",
  justifyContent: "space-around",
  paddingVertical: 16,
  paddingHorizontal: 20,
  width: "100%",
})

const styles = StyleSheet.create({
  btnResult: {
    marginBottom: 10,
    marginHorizontal: 20,
    marginTop: 30,
  },
  button: {
    marginBottom: 50,
    width: "90%",
  },
  center: { alignItems: "center" },
  importImage: {
    height: 60,
    marginBottom: 12,
    width: 60,
  },
  importNote: {
    marginBottom: 16,
    maxWidth: "90%",
    textAlign: "center",
  },
  imported: { marginBottom: 16, marginTop: 8 },
  ml10: {
    marginLeft: 10,
  },
  mr36: {
    marginRight: 36,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  skipped: {
    marginTop: 8,
    textAlign: "center",
  },
})
