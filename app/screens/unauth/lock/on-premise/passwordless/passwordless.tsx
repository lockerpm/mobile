import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Dimensions, FlatList, ScrollView } from "react-native"
import { Button, Screen, Text } from "../../../../../components/cores"
import { useMixins } from "../../../../../services/mixins"
import { OtpPasswordlessGenerator, randomOtpNumber } from "./otp-generator"
import { PasswordlessQrScan } from "./passwordless-qr-scan"

const { width } = Dimensions.get("screen")

export const LockByPasswordless = observer(() => {
  const navigation = useNavigation()
  const { translate } = useMixins()

  const [otp, setOtp] = useState(randomOtpNumber())
  const [index, setIndex] = useState(0)
  const scrollViewRef = useRef(null)
  // ------------------ METHODS ---------------------

  const goStart = () => {
    navigation.navigate("onBoarding")
  }

  const scrollTo = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    })
    setIndex(index)
  }

  const onMomentumScrollEnd = ({ nativeEvent }: any) => {
    const position = nativeEvent.contentOffset
    const _index = Math.round(position.x / width)
    setIndex(_index)
  }

  return (
    <Screen safeAreaEdges={["top"]}>
      <ScrollView
        horizontal
        pagingEnabled
        scrollEnabled={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        ref={scrollViewRef}
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        decelerationRate="fast"
        scrollEventThrottle={16}
      >
        <OtpPasswordlessGenerator
          otp={otp}
          setOtp={setOtp}
          goNext={() => {
            scrollTo(1)
          }}
          goBack={() => {
            navigation.goBack()
          }}
        />
        <PasswordlessQrScan
          otp={otp}
          setOtp={setOtp}
          goBack={() => {
            scrollTo(0)
          }}
          index={index}
        />
      </ScrollView>
    </Screen>
  )
})
