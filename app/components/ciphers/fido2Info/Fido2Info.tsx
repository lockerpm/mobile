import { View, ViewStyle, StyleSheet, TextStyle } from "react-native"
import { ThemedStyle, typography } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { Text } from "@/components/cores"
import { Fido2CredentialView } from "core/models/view/fido2CredentialView"
import { formatDate } from "@/utils/formatDate"
import { useAppLocale } from "@/i18n"

type Props = {
  fido2: Fido2CredentialView
}

export const Fido2Info = ({ fido2 }: Props) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()

  const $titleAnim: TextStyle = {
    fontSize: 16,
    fontFamily: typography.primary.medium,
    marginBottom: 4,
    zIndex: 2,
    backgroundColor: colors.background,
    paddingHorizontal: 4,
    transform: [
      {
        scale: 0.9,
      },
      {
        translateY: 16,
      },
    ],
    color: colors.text,
    alignSelf: "flex-start",
  }

  return (
    <>
      <View style={styles.container}>
        <Text style={$titleAnim} text="Passkey" />
        <View style={themed($container)}>
          <View>
            <View style={themed($divider)} />

            {fido2.creationDate?.getTime() && (
              <View style={styles.infoItem}>
                <Text
                  text={translate("common:createdAt") + formatDate(fido2.creationDate?.getTime())}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  infoItem: {
    alignItems: "center",
    flexDirection: "row",
    padding: 12,
  },
})

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  width: "100%",
  backgroundColor: colors.border,
})

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: "100%",
  overflow: "hidden",
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
})
