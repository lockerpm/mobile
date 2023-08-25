import React, { useState } from "react"
import { View, BackHandler, ViewStyle } from "react-native"
import { commonStyles, fontSize } from "../../theme"
import { Button } from "../button/button"
import { Text } from "../text/text"
import { Header } from "../header/header"
import { SearchBar } from "../search-bar/search-bar"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { useMixins } from "../../services/mixins"
import { DeleteConfirmModal } from "../../screens/auth/browse/trash/delete-confirm-modal"
import { useCipherDataMixins } from "../../services/mixins/cipher/data"
import { useStores } from "../../models"
import { PlanType } from "../../config/types"
import { observer } from "mobx-react-lite"
import { ShareModal } from "../cipher/cipher-action/share-modal"

import ConfigIcon from './config.svg'
import ConfigIconLight from './config-light.svg'
import PlusIcon from './plus.svg'
import PlusIconLight from './plus-light.svg'


export interface BrowseItemHeaderProps {
  openSort?: Function,
  openAdd?: Function,
  navigation: any,
  header: string,
  onSearch?: (text: string) => void,
  searchText?: string
  isSelecting: boolean
  setIsSelecting: Function
  selectedItems: string[]
  setSelectedItems: Function
  toggleSelectAll: Function
  setIsLoading: Function
  isTrash?: boolean
  isAuthenticator?: boolean
  isAutoFill?: boolean
  isShared?: boolean
}

const BUTTON_LEFT: ViewStyle = {
  height: 35,
  width: 35,
  justifyContent: 'flex-start',
  alignItems: 'center',
  paddingLeft: 8
}

const BUTTON_RIGHT: ViewStyle = {
  height: 35,
  width: 35,
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingRight: 8
}

/**
 * Describe your component here
 */
export const BrowseItemHeader = observer((props: BrowseItemHeaderProps) => {
  const { 
    openAdd, openSort, navigation, header, onSearch, searchText, isTrash, isAuthenticator, isAutoFill,
    isSelecting, setIsSelecting, selectedItems, setSelectedItems, toggleSelectAll, setIsLoading, isShared
  } = props
  const { translate, color, isDark } = useMixins()
  const { toTrashCiphers, restoreCiphers, deleteCiphers } = useCipherDataMixins()
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
      cipherIds: selectedItems
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
      style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        justifyContent: 'space-between',
        marginRight: -8
      }]}
    >
      {
        !isAuthenticator && (
          <Button
            preset="link"
            style={BUTTON_RIGHT}
            onPress={() => openSort && openSort()}
          >
            {
              isDark ? (
                <ConfigIconLight height={17} />
              ) : (
                <ConfigIcon height={17} />
              )
            }
          </Button>
        )
      }
      
      {
        openAdd && (
          <Button
            preset="link"
            style={BUTTON_RIGHT}
            onPress={() => openAdd && openAdd()}
          >
            {
              isDark ? (
                <PlusIconLight height={18} />
              ) : (
                <PlusIcon height={18} />
              )
            }
          </Button>
        )
      }
    </View>
  )

  const renderHeaderSelectRight = () => (
    <View
      style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        justifyContent: 'space-between',
        marginRight: -8
      }]}
    >
      <Button
        preset="link"
        style={BUTTON_RIGHT}
        onPress={() => toggleSelectAll()}
      >
        <IoniconsIcon
          name="checkmark-done"
          size={24}
          color={color.textBlack}
        />
      </Button>

      {
        selectedItems.length > 0 && (
          <>
            {
              isTrash || isAuthenticator || isAutoFill ? (
                <>
                  {
                    isTrash && (
                      <Button
                        preset="link"
                        onPress={handleRestore}
                        style={BUTTON_RIGHT}
                      >
                        <FontAwesomeIcon
                          name="repeat"
                          size={17}
                          color={color.textBlack}
                        />
                      </Button>
                    )
                  }

                  <Button
                    preset="link"
                    onPress={() => setShowConfirmModal(true)}
                    style={BUTTON_RIGHT}
                  >
                    <FontAwesomeIcon
                      name="trash"
                      size={20}
                      color={color.error}
                    />
                  </Button>
                </>
              ) : (
                <>
                  {
                    !uiStore.isOffline && !isShared && !isFreeAccount && (
                      <Button
                        preset="link"
                        onPress={() => setShowShareModal(true)}
                        style={BUTTON_RIGHT}
                      >
                        <FontAwesomeIcon
                          name="share-square-o"
                          size={20}
                          color={color.textBlack}
                        />
                      </Button>
                    )
                  }

                  <Button
                    preset="link"
                    onPress={handleMoveFolder}
                    style={BUTTON_RIGHT}
                  >
                    <FontAwesomeIcon
                      name="folder-o"
                      size={20}
                      color={color.textBlack}
                    />
                  </Button>

                  <Button
                    preset="link"
                    onPress={() => setShowConfirmModal(true)}
                    style={BUTTON_RIGHT}
                  >
                    <FontAwesomeIcon
                      name="trash"
                      size={20}
                      color={color.error}
                    />
                  </Button>
                </>
              )
            }
          </>
        )
      }
    </View>
  )

  const renderHeaderSelectLeft = () => (
    <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, { marginLeft: - 8 }]}>
      <Button
        preset="link"
        style={BUTTON_LEFT}
        onPress={() => {
          setIsSelecting(false)
          setSelectedItems([])
        }}
      >
        <IoniconsIcon
          name="close"
          size={26}
          color={color.title}
        />
      </Button>

      <Text
        preset="black"
        text={selectedItems.length ? `${selectedItems.length} ${translate('common.selected')}` : translate('common.select')}
        style={{
          fontSize: fontSize.h5,
          marginLeft: 5
        }}
      />
    </View>
  )

  const renderGoBack = () => {
    if (isAuthenticator) {
      return undefined
    }
    if (isAutoFill) {
      return () => BackHandler.exitApp()
    }
    return () => navigation.goBack()
  }

  const renderHeaderAuthenticatorLeft = () => (
    <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
      <Text
        preset="largeHeader"
        text={header}
      />
    </View>
  )

  return (
    <Header
      goBack={renderGoBack()}
      right={isSelecting ? renderHeaderSelectRight() : renderHeaderRight()}
      left={isSelecting ? renderHeaderSelectLeft() : isAuthenticator && renderHeaderAuthenticatorLeft()}
    >
      <View style={{ marginTop: 10 }}>
				{
          !isSelecting && !isAuthenticator && (
            <Text
              preset="largeHeader"
              text={header}
              numberOfLines={2}
              style={{ marginBottom: 10 }}
            />
          )
        }

        <SearchBar value={searchText} onSearch={onSearch} />
      </View>

      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={isTrash || isAuthenticator ? handlePermaDelete : handleDelete}
        title={isTrash || isAuthenticator ? translate('trash.perma_delete') : translate('trash.to_trash')}
        desc={isTrash || isAuthenticator ? translate('trash.perma_delete_desc') : translate('trash.to_trash_desc')}
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
    </Header>
  )
})
