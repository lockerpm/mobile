import React, { memo } from 'react'
import { View } from 'react-native'
import { FieldType } from 'core/enums'
import { shouldRerenderItem } from 'app/utils/utils'
import { Icon } from '../../../cores'
import { LabelInput } from './LabelInput'
import { TextField } from './TextField'
import { DateField } from './DateField'
import { useTheme } from 'app/services/context'
import { useHelper } from 'app/services/hook'

type Props = {
  type: FieldType
  name: string
  value: string
  onChange: (params: { type: FieldType; name: string; value: string }) => void
  onDelete: () => void
}

export const FieldEdit = memo(function FieldEdit(props: Props) {
  const { type, name, value, onChange, onDelete } = props
  const { colors } = useTheme()
  const { translate } = useHelper()

  return (
    <View
      style={{
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View style={{ flex: 1 }}>
        <LabelInput value={name} onChange={(val) => onChange({ type, value, name: val })} />
        {[FieldType.Date, FieldType.MonthYear].includes(type) ? (
          <DateField
            type={type}
            value={value}
            onChange={(val) => onChange({ type, name, value: val })}
            placeholder={translate('common.value')}
          />
        ) : (
          <TextField
            type={type}
            value={value}
            onChange={(val) => onChange({ type, name, value: val })}
            placeholder={translate('common.value')}
          />
        )}
      </View>
      <Icon
        icon="minus-circle"
        size={20}
        color={colors.error}
        containerStyle={{
          marginLeft: 12,
        }}
        onPress={onDelete}
      />
    </View>
  )
}, shouldRerenderItem(['onChange']))
