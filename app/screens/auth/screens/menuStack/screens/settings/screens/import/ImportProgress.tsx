import { StyleSheet, View } from "react-native"
import { Bar } from "react-native-progress"

import { Icon, Text } from "app/components/cores"

import { useAppTheme } from "@/utils/useAppTheme"

interface ImportProgressProps {
  imported: number
  total: number
  file: string
}

export const ImportProgress = (props: ImportProgressProps) => {
  const {
    theme: { colors },
  } = useAppTheme()
  return (
    <View>
      <View style={styles.container}>
        <Icon icon={"file-arrow-up"} size={32} />
        <Text preset="bold" tx={"import:progress"} />
      </View>

      <View style={styles.title}>
        <View style={styles.row}>
          <Icon icon="file-text" size={24} />
          <Text text={props.file} style={styles.text} />
        </View>

        <Text text={`${props.imported}/${props.total}`} />
      </View>
      <Bar
        borderRadius={4}
        unfilledColor={colors.block}
        height={6}
        width={350}
        color={colors.primary}
        progress={props.imported / props.total}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 30,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  text: {
    marginLeft: 5,
    maxWidth: 250,
  },
  title: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
})
