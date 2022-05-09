import { observer } from 'mobx-react-lite'
import React from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { useStores } from '../../../../models'
import Animated, { withSequence, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated'
import { useMixins } from '../../../../services/mixins'
import { Text } from '../../../../components'
import { fontSize } from '../../../../theme'


type Props = {
  style?: StyleProp<ViewStyle>
}


export const LoadingHeader = observer((props: Props) => {
  const { style } = props
  const { toolStore } = useStores()
  const { color, translate } = useMixins()

  // @ts-ignore
  const spin = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withRepeat(
            withSequence(withTiming('360deg', { duration: 0 }), withTiming('0deg', { duration: 1000 })),
            -1,
            false
          )
        }
      ]
    }
  })

  const Render = ({ title }) => {
    return (
      <View style={[{
        backgroundColor: '#161922',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 4
      }, style]}>
        {/* <Animated.View style={spin}>
        <MaterialIconsIcon
          name="sync"
          size={18}
          color={color.white}
        />
      </Animated.View> */}
        <Text
          style={{
            fontSize: fontSize.small,
            color: color.white,
            marginLeft: 5
          }}
          text={title + '...'}
        />
      </View>
    )
  }

  return toolStore.isDataLoading ? (
    <Render title={translate('common.loading') + '...'} />
  ) : toolStore.isLoadingHealth ? (
    <Render title={translate('common.calculating') + '...'} />
  ) : null
})
