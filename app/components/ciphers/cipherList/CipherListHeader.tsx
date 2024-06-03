import { useStores } from 'app/models'
import { useTheme } from 'app/services/context'
import { useCipherData, useHelper } from 'app/services/hook'
import React, { useState } from 'react'
import { View, BackHandler } from 'react-native'
import { Text, Icon, TabHeader } from 'app/components/cores'
import { SearchBar } from 'app/components/utils'
import { DeleteConfirmModal } from 'app/screens/auth/browse/trash/DeleteConfirmModal'
import { ShareModal } from '../cipherAction/ShareModal'

export interface CipherListHeaderProps {
  openSort?: () => void
  openAdd?: () => void
  navigation: any
  header: string
  onSearch?: (text: string) => void
  searchText?: string
  isSelecting: boolean
  setIsSelecting?: (val: boolean) => void
  selectedItems?: string[]
  setSelectedItems?: (val: any) => void
  toggleSelectAll?: () => void
  setIsLoading: (val: boolean) => void
  isTrash?: boolean
  isAuthenticator?: boolean
  isAutoFill?: boolean
  isShared?: boolean
}

const EmpFc = () => {
  //
}

/**
 * Describe your component here
 */
export const CipherListHeader = (props: CipherListHeaderProps) => {
  const {
    openAdd,
    openSort,
    navigation,
    header,
    onSearch,
    searchText,
    isTrash,
    isAuthenticator,
    isAutoFill,
    isSelecting,
    setIsSelecting = EmpFc,
    selectedItems = [],
    setSelectedItems = EmpFc,
    toggleSelectAll = EmpFc,
    setIsLoading,
    isShared,
  } = props
  const { colors } = useTheme()
  const { translate } = useHelper()
  const { toTrashCiphers, restoreCiphers, deleteCiphers } = useCipherData()
  const { user, uiStore } = useStores()

  // ----------------------- PARAMS ------------------------

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  // ----------------------- COMPUTED ------------------------

  const isFreeAccount = user.isFreePlan
  // ----------------------- METHODS ------------------------

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

  const handleRestore = async () => {
    setIsLoading(true)
    const res = await restoreCiphers(selectedItems)
    setIsLoading(false)
    if (res.kind === 'ok') {
      setIsSelecting(false)
      setSelectedItems([])
    }
  }

  const handlePermaDelete = async () => {
    setIsLoading(true)
    const res = await deleteCiphers(selectedItems)
    setIsLoading(false)
    if (res.kind === 'ok') {
      setIsSelecting(false)
      setSelectedItems([])
    }
  }

  // ----------------------- RENDER ------------------------

  const renderHeaderRight = () => (
    <View
      style={{
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: -8,
      }}
    >
      {!isAuthenticator && (
        <Icon
          icon="sliders-horizontal"
          size={24}
          color={colors.primaryText}
          onPress={openSort}
          containerStyle={{ padding: 8 }}
        />
      )}

      {!!openAdd && (
        <Icon
          icon="plus"
          size={24}
          color={colors.primaryText}
          onPress={openAdd}
          containerStyle={{ padding: 8 }}
        />
      )}
    </View>
  )

  const renderHeaderSelectRight = () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginRight: -8,
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
          {isTrash || isAuthenticator || isAutoFill ? (
            <>
              {isTrash && (
                <Icon
                  icon="repeat"
                  size={24}
                  onPress={handleRestore}
                  containerStyle={{ padding: 8 }}
                />
              )}

              <Icon
                icon="trash"
                size={24}
                color={colors.error}
                onPress={() => setShowConfirmModal(true)}
                containerStyle={{ padding: 8 }}
              />
            </>
          ) : (
            <>
              {!uiStore.isOffline && !isShared && !isFreeAccount && (
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
        </>
      )}
    </View>
  )

  const renderHeaderSelectLeft = () => (
    <View style={{ marginLeft: -8, flexDirection: 'row', alignItems: 'center' }}>
      <Icon
        icon="x"
        size={26}
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
          marginLeft: 5,
        }}
      />
    </View>
  )

  const renderGoBack = () => {
    if (isAuthenticator) {
      return undefined
    }
    if (isAutoFill) {
      return BackHandler.exitApp()
    }
    return navigation.goBack()
  }

  const renderHeaderAuthenticatorLeft = () => <TabHeader title={header} />

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
        ) : isAuthenticator ? (
          renderHeaderAuthenticatorLeft()
        ) : (
          <Icon icon="arrow-left" onPress={renderGoBack} />
        )}

        {isSelecting ? renderHeaderSelectRight() : renderHeaderRight()}
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        {!isSelecting && !isAuthenticator && (
          <Text
            preset="bold"
            size="xl"
            text={header}
            numberOfLines={2}
            style={{ marginBottom: 10 }}
          />
        )}

        <SearchBar value={searchText} onChangeText={onSearch} />
      </View>
      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={isTrash || isAuthenticator ? handlePermaDelete : handleDelete}
        title={
          isTrash || isAuthenticator ? translate('trash.perma_delete') : translate('trash.to_trash')
        }
        desc={
          isTrash || isAuthenticator
            ? translate('trash.perma_delete_desc')
            : translate('trash.to_trash_desc')
        }
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
