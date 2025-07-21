import { View, Image, ImageSourcePropType, StyleSheet } from "react-native"
import { Text } from "app/components/cores"

interface StepProps {
  text: string
  img: ImageSourcePropType
}

export const Step = (props: StepProps) => {
  return (
    <View style={styles.container}>
      <Image resizeMode="contain" source={props.img} style={styles.image} />
      <Text text={props.text} style={styles.text} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  image: {
    height: 24,
    width: 24,
  },
  text: {
    alignSelf: "center",
    fontSize: 16,
    marginLeft: 16,
  },
})
