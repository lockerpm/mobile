import React from 'react'
import { View } from 'react-native'
import { ProgressBar } from 'react-native-ui-lib'
import { Icon, Text } from 'app/components/cores'
import { useTheme } from 'app/services/context'
import { useHelper } from 'app/services/hook'

interface ImportProgressProps {
  imported: number
  total: number
  file: string
}

export const ImportProgress = (props: ImportProgressProps) => {
  const { colors } = useTheme()
  const { translate } = useHelper()
  return (
    <View>
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <Icon icon={'file-arrow-up'} size={32} />
        <Text preset="bold" text={translate('import.progress')} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <Icon icon="file-text" size={24} />
          <Text style={{ maxWidth: 250, marginLeft: 5 }}>{props.file}</Text>
        </View>

        <Text>
          {' '}
          {props.imported}/{props.total}
        </Text>
      </View>
      <ProgressBar
        style={{
          borderRadius: 4,
          height: 6,
          backgroundColor: colors.block,
        }}
        progressColor={colors.primary}
        progress={(props.imported / props.total) * 100}
      />
    </View>
  )
}
