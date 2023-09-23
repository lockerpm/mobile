import React, { useEffect, useState } from 'react'
import { View } from 'react-native'

import { Text, Icon, Logo } from 'app/components-v2/cores'
import { AppNotification } from 'app/static/types'
import { useTheme } from 'app/services/context'
import { SearchBar } from 'app/components-v2/utils'

import { DeleteConfirmModal } from '../../browse/trash/delete-confirm-modal'
import { useCipherData, useHelper } from 'app/services/hook'
import { useStores } from 'app/models'
import { translate } from 'app/i18n'
import { ShareModal } from 'app/components-v2/ciphers'

interface Props {
  openSort: () => void
  openAdd: () => void
  toggleSelectAll: () => void
  onSearch: (text: string) => void
  searchText: string
  isSelecting: boolean
  setIsSelecting: (val: boolean) => void
  selectedItems: string[]
  setSelectedItems: (val: any) => void
  setIsLoading: (val: boolean) => void
  navigation: any
}

export const HomeHeader = (props: Props) => {
  const {
    openAdd,
    openSort,
    onSearch,
    searchText,
    setIsLoading,
    navigation,
    isSelecting,
    setIsSelecting,
    selectedItems,
    setSelectedItems,
    toggleSelectAll,
  } = props
  const { colors, isDark } = useTheme()
  const { notifyApiError } = useHelper()
  const { toTrashCiphers } = useCipherData()
  const { user, uiStore, toolStore } = useStores()

  // ----------------------- PARAMS ------------------------

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification>(null)

  // ----------------------- COMPUTED ------------------------

  const isFreeAccount = user.isFreePlan

  // ----------------------- METHODS ------------------------

  const fetchInAppNotification = async () => {
    if (navigation.isFocused()) {
      const res = await toolStore.fetchInAppNoti()
      if (res.kind === 'ok') {
        setNotifications(res.data)
      } else {
        notifyApiError(res)
      }
    }
  }

  // ----------------------- EFFECT ------------------------

  // Check online/offline interval
  useEffect(() => {
    fetchInAppNotification()
    const interval = setInterval(fetchInAppNotification, 1000 * 30)
    return () => {
      clearInterval(interval)
    }
  }, [])

  // Header right
  const renderHeaderRight = () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {/** In app notification */}
      <View>
        {notifications?.unread_count > 0 && (
          <View
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              height: 6,
              width: 6,
              borderRadius: 3,
              backgroundColor: colors.error,
            }}
          />
        )}
        <Icon
          icon="bell"
          size={24}
          color={colors.primaryText}
          onPress={() => {
            navigation.navigate('app_list_noti', {
              notifications,
            })
          }}
          containerStyle={{ padding: 8 }}
        />
      </View>

      <Icon
        icon="sliders-horizontal"
        size={24}
        color={colors.primaryText}
        onPress={openSort}
        containerStyle={{ padding: 8 }}
      />
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
          {!uiStore.isOffline && !isFreeAccount && (
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
          <Logo
            preset={isDark ? 'horizontal-light' : 'horizontal-dark'}
            style={{ height: 35, width: 115 }}
          />
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
