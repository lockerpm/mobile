import React, { useState } from 'react'
import { View } from 'react-native'
import { Icon, Text } from 'app/components/cores'
import { useTheme } from 'app/services/context'
import { MAX_MULTIPLE_SHARE_COUNT } from 'app/static/constants'
import { SearchBar } from 'app/components/utils'
import { ShareModal } from 'app/components/ciphers'
import { useHelper } from 'app/services/hook'

interface Props {
  openSort: () => void
  openAdd: () => void
  onSearch: (text: string) => void
  searchText: string
  selectedItems: string[]
  setSelectedItems: (val: any) => void
  toggleSelectAll: () => void
  navigation: any
}

export const ShareMultipleHeader = (props: Props) => {
  const {
    openAdd,
    openSort,
    onSearch,
    searchText,
    navigation,
    selectedItems,
    setSelectedItems,
    toggleSelectAll,
  } = props
  const { colors } = useTheme()
  const { translate } = useHelper()

  // ----------------------- PARAMS ------------------------

  const [showShareModal, setShowShareModal] = useState(false)

  // ----------------------- COMPUTED ------------------------

  const isExceeded = selectedItems.length > MAX_MULTIPLE_SHARE_COUNT

  // ----------------------- METHODS ------------------------

  // Select right
  const renderHeaderSelectRight = () => (
    <View
      style={{
        justifyContent: 'space-between',
        marginRight: -8,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Icon icon="check-bold" size={24} onPress={toggleSelectAll} />

      {selectedItems.length > 0 && !isExceeded && (
        <Icon icon="share" size={20} onPress={() => setShowShareModal(true)} />
      )}

      <Icon
        icon="sliders-horizontal"
        size={20}
        containerStyle={{ padding: 8 }}
        onPress={() => openSort && openSort()}
      />
      <Icon
        icon="plus"
        size={20}
        containerStyle={{ padding: 8 }}
        onPress={() => openAdd && openAdd()}
      />
    </View>
  )

  // Select left
  const renderHeaderSelectLeft = () => (
    <View style={{ marginLeft: -8, flexDirection: 'row', alignItems: 'center' }}>
      <Icon
        icon="x"
        size={26}
        onPress={() => {
          setSelectedItems([])
          navigation.goBack()
        }}
      />

      <Text
        size="large"
        color={isExceeded ? colors.error : colors.title}
        text={
          selectedItems.length
            ? `${selectedItems.length} ${translate('common.selected')} (${translate(
                'common.max'
              )} ${MAX_MULTIPLE_SHARE_COUNT})`
            : translate('common.select')
        }
        style={{
          marginLeft: 5,
        }}
      />
    </View>
  )

  // Actions

  // ----------------------- RENDER ------------------------

  return (
    <View
      style={{
        backgroundColor: colors.background,
      }}
    >
      <View
        style={{
          height: 56,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
        }}
      >
        {renderHeaderSelectLeft()}
        {renderHeaderSelectRight()}
      </View>

      <SearchBar
        containerStyle={{ marginTop: 10, marginHorizontal: 20, marginBottom: 2 }}
        onChangeText={onSearch}
        value={searchText}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        cipherIds={selectedItems}
        onSuccess={() => {
          setSelectedItems([])
          navigation.goBack()
        }}
      />
    </View>
  )
}
