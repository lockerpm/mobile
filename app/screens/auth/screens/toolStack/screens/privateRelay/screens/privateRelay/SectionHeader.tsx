import { memo } from "react"
import { StyleSheet } from "react-native"

import { Text } from "app/components/cores"
import { TxKeyPath } from "app/i18n"

interface Props {
  tx?: TxKeyPath
  text?: string
}

export const SectionHeader = memo(({ tx, text }: Props) => (
  <Text preset="label" size="xs" tx={tx} text={text} style={styles.title} />
))

SectionHeader.displayName = "SectionHeader"

const styles = StyleSheet.create({
  title: {
    paddingBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
})
