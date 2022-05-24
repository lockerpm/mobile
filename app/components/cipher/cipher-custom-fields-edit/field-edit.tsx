import React, { memo } from 'react'
import { View } from 'react-native'
import { FieldType } from '../../../../core/enums'
import { useMixins } from '../../../services/mixins'
import { shouldRerenderItem } from '../../../utils/helpers'
import { Button } from '../../button/button'
import { FloatingInput } from '../../floating-input'
import { Select } from '../../select/select'


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
  const { translate } = useMixins()

  return (
    <View style={{
      marginBottom: 20
    }}>
      <FloatingInput
        label={translate('common.name')}
        value={name}
        onChangeText={val => {
          onChange({ type, value, name: val })
        }}
        style={{
          marginBottom: 20
        }}
      />
      
      {
        type !== FieldType.Boolean ? (
          <FloatingInput
            isPassword={type === FieldType.Hidden}
            label={translate('common.value')}
            value={value}
            onChangeText={val => {
              onChange({ type, name, value: val })
            }}
          />
        ) : (
          <Select
            floating
            placeholder={translate('common.value')}
            value={value}
            options={[
              {
                value: '',
                label: 'false'
              },
              {
                value: '1',
                label: 'true'
              }
            ]}
            onChange={(val: string) => {
              onChange({ type, name, value: val })
            }}
          />
        )
      }

      <Button
        preset='error'
        text={translate('common.delete')}
        onPress={onDelete}
        style={{
          marginTop: 20
        }}
      />
    </View>
  )
}, shouldRerenderItem(['onChange']))
