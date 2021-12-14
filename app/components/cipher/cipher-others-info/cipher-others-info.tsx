import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { Button } from "../../button/button"
import { Text } from "../../text/text"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import find from 'lodash/find'
import { useStores } from "../../../models"
import { commonStyles, fontSize } from "../../../theme"
import { FloatingInput } from "../../floating-input"
import { useMixins } from "../../../services/mixins"
import { OwnershipSelectionModal } from "../cipher-action/ownership-selection-modal"


export interface CipherOthersInfoProps {
  navigation: any
  hasNote?: boolean
  note?: string
  onChangeNote?: Function
  folderId?: string
  organizationId: string
  setOrganizationId: Function
  collectionIds: string[]
  setCollectionIds: Function
  isDeleted?: boolean
}

/**
 * Describe your component here
 */
export const CipherOthersInfo = observer(function CipherOthersInfo(props: CipherOthersInfoProps) {
  const { 
    navigation, hasNote, note, onChangeNote, folderId = null, isDeleted,
    organizationId, collectionIds, setOrganizationId, setCollectionIds
  } = props
  const { folderStore, user, uiStore } = useStores()
  const { translate, getTeam, color } = useMixins()

  const [showOwnershipSelectionModal, setShowOwnershipSelectionModal] = useState(false)

  const folder = (() => {
    return folderId ? find(folderStore.folders, e => e.id === folderId) || {} : {}
  })()

  return (
    <View>
      <View style={commonStyles.SECTION_PADDING}>
        <Text
          text={translate('common.others')}
          style={{ fontSize: fontSize.small }}
        />
      </View>

      {/* Others */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.background,
          paddingBottom: 32
        }]}
      >
        {/* Folder */}
        <Button
          preset="link"
          isDisabled={isDeleted}
          onPress={() => {
            navigation.navigate('folders__select', {
              mode: 'add',
              initialId: folderId
            })
          }}
        >
          <View
            style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
              justifyContent: 'space-between',
              width: '100%'
            }]}
          >
            <View>
              <Text
                text={translate('common.folder')}
                style={{ fontSize: fontSize.small, marginBottom: 5 }}
              />
              <Text
                preset="black"
                text={folder.name || translate('common.none')}
              />
            </View>
            <FontAwesomeIcon
              name="angle-right"
              size={20}
              color={color.text}
            />
          </View>
        </Button>
        {/* Folder end */}

        {/* Ownership */}
        <Button
          isDisabled={uiStore.isOffline || isDeleted}
          preset="link"
          onPress={() => {
            setShowOwnershipSelectionModal(true)
          }}
          style={{
            marginTop: 20
          }}
        >
          <View
            style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
              justifyContent: 'space-between',
              width: '100%'
            }]}
          >
            <View>
              <Text
                text={translate('common.ownership')}
                style={{ fontSize: fontSize.small, marginBottom: 5 }}
              />
              <Text
                preset="black"
                text={getTeam(user.teams, organizationId).name || translate('common.me')}
              />
            </View>
            <FontAwesomeIcon
              name="angle-right"
              size={20}
              color={color.text}
            />
          </View>
        </Button>
        {/* Ownership end */}

        {/* Note */}
        {
          hasNote && (
            <View style={{ flex: 1, marginTop: 20 }}>
              <FloatingInput
                textarea
                label={translate('common.notes')}
                value={note}
                onChangeText={(text) => onChangeNote(text)}
              />
            </View>
          )
        }
        {/* Note end */}
      </View>
      {/* Others end */}

      <OwnershipSelectionModal
        isOpen={showOwnershipSelectionModal}
        onClose={() => setShowOwnershipSelectionModal(false)}
        organizationId={organizationId}
        setOrganizationId={setOrganizationId}
        collectionIds={collectionIds}
        setCollectionIds={setCollectionIds}
      />
    </View>
  )
})
