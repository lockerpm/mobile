import { Icon } from 'app/components/cores'
import { useStores } from 'app/models'
import { AppStackScreenProps } from 'app/navigators/navigators.types'
import { useTheme } from 'app/services/context'
import { observer } from 'mobx-react-lite'
import React, { FC, useEffect, useRef } from 'react'
import {
  Dimensions,
  Image,
  Linking,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

export const MarketingScreen: FC<AppStackScreenProps<'marketing'>> = observer((props) => {
  const navigation = props.navigation
  const data = props.route.params.data
  const { colors } = useTheme()
  const { uiStore } = useStores()
  const { width, height } = Dimensions.get('screen')

  const isGoBack = useRef(false)

  const goBack = () => {
    if (!isGoBack.current) {
      isGoBack.current = true
      navigation.goBack()
    }
  }
  useEffect(() => {
    uiStore.setIsShowedPopupMarketing(true)
  }, [])

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.transparentModal,
      }}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          Linking.canOpenURL(data.link).then((val) => {
            if (val) Linking.openURL(data.link)
          })
          goBack()
        }}
      >
        <Image
          source={{ uri: data.image }}
          style={{
            height,
            width: width - 40,
          }}
          resizeMode="contain"
        />
      </TouchableWithoutFeedback>

      <TouchableOpacity
        style={{
          position: 'absolute',
          top: '10%',
          right: 0,
          padding: 20,
        }}
        onPress={goBack}
      >
        <Icon icon="x" size={30} color={colors.white} />
      </TouchableOpacity>
    </View>
  )
})
