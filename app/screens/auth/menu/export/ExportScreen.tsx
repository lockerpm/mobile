import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigation } from '@react-navigation/native'
import { ConfirmPassModal } from './ConfirmPassModal'
import { useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { useCoreService } from 'app/services/coreService'

import { Screen, Header } from 'app/components/cores'
import { MenuItemContainer, SettingsItem } from 'app/components/utils'

export const ExportScreen = observer(() => {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { notify, translate } = useHelper()
  const { platformUtilsService, exportService } = useCoreService()

  // ----------------------- PARAMS -----------------------

  const formats = [
    'csv',
    'json',
    // 'encrypted_json'
  ]
  const [format, setFormat] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // ----------------------- METHODS -----------------------

  const handleExport = async () => {
    // @ts-ignore
    const data = await exportService.getExport(format)
    const isSuccess = await downloadFile(data)
    if (isSuccess) {
      notify('success', translate('export.success'))
    } else {
      notify('error', translate('error.something_went_wrong'))
    }
  }

  const downloadFile = (csv) => {
    const fileName = createFileName(null)
    return platformUtilsService.saveFile(csv, 'utf8', fileName)
  }

  const createFileName = (prefix) => {
    let extension = format
    if (format === 'encrypted_json') {
      if (prefix == null) {
        prefix = 'encrypted'
      } else {
        prefix = 'encrypted_' + prefix
      }
      extension = 'json'
    }
    return getFileName(prefix, extension)
  }

  const getFileName = (prefix = null, extension = 'csv') => {
    const now = new Date()
    const dateString =
      now.getFullYear() +
      '' +
      padNumber(now.getMonth() + 1, 2) +
      '' +
      padNumber(now.getDate(), 2) +
      padNumber(now.getHours(), 2) +
      '' +
      padNumber(now.getMinutes(), 2) +
      padNumber(now.getSeconds(), 2)

    return 'cystack' + (prefix ? '_' + prefix : '') + '_export_' + dateString + '.' + extension
  }

  const padNumber = (num: number, width: number, padCharacter = '0') => {
    const numString = num.toString()
    return numString.length >= width
      ? numString
      : new Array(width - numString.length + 1).join(padCharacter) + numString
  }

  // ----------------------- EFFECT -----------------------

  // ----------------------- RENDER -----------------------

  return (
    <Screen
      padding
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
          title={translate('settings.export')}
        />
      }
      backgroundColor={colors.block}
    >
      <ConfirmPassModal
        navigation={navigation}
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleExport}
      />

      <MenuItemContainer>
        {formats.map((f) => (
          <SettingsItem
            key={f}
            name={f.toUpperCase()}
            onPress={() => {
              setFormat(f)
              setShowConfirmModal(true)
            }}
          />
        ))}
      </MenuItemContainer>
    </Screen>
  )
})
