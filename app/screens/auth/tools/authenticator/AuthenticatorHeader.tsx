import React, { useState } from 'react'
import { View } from 'react-native'

import { Text, Icon } from 'app/components/cores'
import { useTheme } from 'app/services/context'
import { SearchBar } from 'app/components/utils'

import { DeleteConfirmModal } from '../../browse/trash/DeleteConfirmModal'
import { useCipherData, useHelper } from 'app/services/hook'
import { useStores } from 'app/models'
import { ShareModal } from 'app/components/ciphers'

interface Props {
  openSort: () => void
  openAdd: () => void
  toggleSelectAll: () => void
  onSearch: (text: string) => void
  searchText: string
  header: string
  isSelecting: boolean
  setIsSelecting: (val: boolean) => void
  selectedItems: string[]
  setSelectedItems: (val: any) => void
  setIsLoading: (val: boolean) => void
  navigation: any
}

export const AuthenticatorHeader = (props: Props) => {
  const {
    openAdd,
    onSearch,
    searchText,
    setIsLoading,
    navigation,
    header,
    isSelecting,
    setIsSelecting,
    selectedItems,
    setSelectedItems,
    toggleSelectAll,
  } = props
  const { translate } = useHelper()
  const { colors } = useTheme()
  const { toTrashCiphers } = useCipherData()
  const { uiStore } = useStores()

  // ----------------------- PARAMS ------------------------

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  // ----------------------- COMPUTED ------------------------

  // Header right
  const renderHeaderRight = () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Icon
        icon="plus"
        size={24}
        color={colors.primaryText}
        onPress={openAdd}
        containerStyle={{ padding: 8 }}
      />
    </View>
  )

  // Select right
  const renderHeaderSelectRight = () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Icon
        icon="check-bold"
        size={24}
        color={colors.primaryText}
        onPress={toggleSelectAll}
        containerStyle={{ padding: 8 }}
      />
      {selectedItems.length > 0 && (
        <>
          {!uiStore.isOffline && (
            <Icon
              icon="share"
              size={24}
              color={colors.primaryText}
              onPress={() => setShowShareModal(true)}
              containerStyle={{ padding: 8 }}
            />
          )}
          <Icon
            icon="folder-simple"
            size={24}
            color={colors.primaryText}
            onPress={handleMoveFolder}
            containerStyle={{ padding: 8 }}
          />
          <Icon
            icon="trash"
            size={24}
            color={colors.error}
            onPress={() => setShowConfirmModal(true)}
            containerStyle={{ padding: 8 }}
          />
        </>
      )}
    </View>
  )

  // Select left
  const renderHeaderSelectLeft = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Icon
        icon="x"
        size={24}
        color={colors.primaryText}
        onPress={() => {
          setIsSelecting(false)
          setSelectedItems([])
        }}
      />
      <Text
        size="xl"
        text={
          selectedItems.length
            ? `${selectedItems.length} ${translate('common.selected')}`
            : translate('common.select')
        }
        style={{
          marginLeft: 8,
        }}
      />
    </View>
  )

  // Actions

  const handleDelete = async () => {
    setIsLoading(true)
    const res = await toTrashCiphers(selectedItems)
    setIsLoading(false)
    if (res.kind === 'ok') {
      setIsSelecting(false)
      setSelectedItems([])
    }
  }

  const handleMoveFolder = () => {
    navigation.navigate('folders__select', {
      mode: 'move',
      initialId: null,
      cipherIds: selectedItems,
    })
    setIsSelecting(false)
    setSelectedItems([])
  }

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
        {isSelecting ? (
          renderHeaderSelectLeft()
        ) : (
          <View style={{ height: 56, justifyContent: 'center' }}>
            <Text preset="bold" size="xxl" weight="semibold" text={header} />
          </View>
        )}

        {isSelecting ? renderHeaderSelectRight() : renderHeaderRight()}
      </View>

      <SearchBar
        containerStyle={{ marginTop: 10, marginHorizontal: 20, marginBottom: 2 }}
        onChangeText={onSearch}
        value={searchText}
      />

      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title={translate('trash.to_trash')}
        desc={translate('trash.to_trash_desc')}
        btnText="OK"
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        cipherIds={selectedItems}
        onSuccess={() => {
          setIsSelecting(false)
          setSelectedItems([])
        }}
      />
    </View>
  )
}
