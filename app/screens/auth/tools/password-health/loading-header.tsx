import { observer } from 'mobx-react-lite'
import React from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { useStores } from '../../../../models'
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

  const Render = ({ title }) => {
    return (
      <View
        style={[
          {
            backgroundColor: color.textBlack,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 4,
          },
          style,
        ]}
      >
        <Text
          style={{
            fontSize: fontSize.small,
            color: color.white,
            marginLeft: 5,
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
