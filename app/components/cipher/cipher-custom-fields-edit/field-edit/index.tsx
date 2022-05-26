import React, { memo } from 'react'
import { View } from 'react-native'
import { FieldType } from '../../../../../core/enums'
import { useMixins } from '../../../../services/mixins'
import { commonStyles, spacing } from '../../../../theme'
import { shouldRerenderItem } from '../../../../utils/helpers'
import { Button } from '../../../button/button'
import { LabelInput } from './label-input'
import { TextField } from './text-field'
import AntDesign from 'react-native-vector-icons/AntDesign'


type Props = {
  type: FieldType
  name: string
  value: string
  onChange: (params: {
    type: FieldType
    name: string
    value: string
  }) => void
  onDelete: () => void
}

export const FieldEdit = memo((props: Props) => {
  const { type, name, value, onChange, onDelete } = props
  const { color, translate } = useMixins()

  return (
    <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
      marginBottom: 20
    }]}>
      <View style={{ flex: 1 }}>
        <LabelInput
          value={name}
          onChange={val => onChange({ type, value, name: val })}
        />
        <TextField
          type={type}
          value={value}
          onChange={val => onChange({ type, name, value: val })}
          placeholder={translate('common.value')}
        />
      </View>

      <Button
        preset='link'
        onPress={onDelete}
        style={{
          marginLeft: spacing[3]
        }}
      >
        <AntDesign name="minuscircleo" size={20} color={color.error} />
      </Button>
    </View>
  )
}, shouldRerenderItem(['onChange']))
