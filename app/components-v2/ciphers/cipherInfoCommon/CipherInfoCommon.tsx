import { TextInput, Text, ImageIcon } from 'app/components-v2/cores'
import { translate } from 'app/i18n'
import { useStores } from 'app/models'
import { useTheme } from 'app/services/context'
import { useHelper } from 'app/services/hook'
import { SharedMemberType } from 'app/static/types'
import { FieldType } from 'core/enums'
import { CipherView } from 'core/models/view'
import { CollectionView } from 'core/models/view/collectionView'
import filter from 'lodash/filter'
import find from 'lodash/find'
import * as React from 'react'
import { StyleProp, View, ViewStyle, Image, TouchableOpacity } from 'react-native'

const CONTAINER: ViewStyle = {
  justifyContent: 'center',
}

export interface CipherInfoCommonProps {
  style?: StyleProp<ViewStyle>
  cipher: CipherView
}

/**
 * Describe your component here
 */
export const CipherInfoCommon = (props: CipherInfoCommonProps) => {
  const { style, cipher } = props
  const { getTeam } = useHelper()
  const { user, folderStore, collectionStore, cipherStore } = useStores()

  const [showFullShareMember, setShowFullShareMember] = React.useState<boolean>(false)

  // ------------- COMPUTED ---------------

  const collections = (() => {
    return (
      filter(
        collectionStore.collections,
        (e) => cipher.collectionIds && cipher.collectionIds.includes(e.id)
      ) || []
    )
  })()

  const folder = (() => {
    return find(folderStore.folders, (e) => e.id === cipher.folderId) || {}
  })()

  const shareMember: { isShared: boolean; member: SharedMemberType[] } = (() => {
    const share = cipherStore.myShares.find((s) => s.id === cipher.organizationId)
    if (share && share.members.length > 0) {
      return { isShared: true, member: share.members }
    }
    return { isShared: false, member: [] }
  })()

  // ------------- RENDER ---------------

  return (
    <View style={[CONTAINER, style]}>
      {/* Custom fields */}
      {(cipher.fields || []).map((item, index) => (
        <TextInput
          isCopyable
          key={index}
          editable={false}
          isPassword={item.type === FieldType.Hidden}
          label={item.name}
          value={item.value}
          style={{
            marginTop: 20,
          }}
        />
      ))}

      {/* Owned by */}
      <Text
        preset='label'
        size='base'
        text={translate('common.owned_by')}
        style={{ marginTop: 20, marginBottom: 5 }}
      />
      <Text
        text={
          getTeam(user.teams, cipher.organizationId).name ||
          getTeam(cipherStore.organizations, cipher.organizationId).name ||
          translate('common.me')
        }
      />

      {/* Shared with */}
      <SharedWith
        shareMember={shareMember}
        show={showFullShareMember}
        setShow={setShowFullShareMember}
      />

      {/* Folder */}
      <Text
        preset='label'
        size='base'
        text={translate('common.folders')}
        style={{ marginTop: 20, marginBottom: 10 }}
      />
      {collections.length > 0
        ? collections.map((c: CollectionView) => (
          <View
            key={c.id}
            style={
              {
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
              }
            }
          >
            <ImageIcon icon='folder-share' size={30} />
            <Text
              text={c.name || translate('folder.unassigned')}
              style={{ marginLeft: 10 }}
            />
          </View>
        ))
        : (!cipher.organizationId ||
          !!folder.name ||
          getTeam(user.teams, cipher.organizationId)) && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ImageIcon icon='folder' size={30} />
            <Text
              text={folder.name || translate('folder.unassigned')}
              numberOfLines={2}
              style={{ marginLeft: 10, flex: 1 }}
            />
          </View>
        )}
    </View>
  )
}

const SharedWith = ({ shareMember, show, setShow }) => {
  const { colors } = useTheme()

  return (
    shareMember.isShared && (
      <View>
        <Text
          preset='label'
          text={translate('common.share_with')}
          style={{ fontSize: 14, marginTop: 20, marginBottom: 5 }}
        />
        <View
          style={{
            flexDirection: show ? 'column' : 'row',
            alignItems: !show ? 'center' : 'flex-start',
          }}
        >
          {shareMember.member.map((element, index) => {
            if (index > 4 && !show) {
              return null
            } else {
              return (
                <View
                  key={index}
                  style={{
                    marginVertical: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Image
                    source={{ uri: element.avatar }}
                    style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
                  />
                  {show && <Text text={element.email} />}
                </View>
              )
            }
          })}

          <TouchableOpacity
            style={{ marginTop: 10 }}
            onPress={() => setShow(!show)}
          >
            <Text text={!show ? translate('common.see_all') : translate('common.collapse')} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    )
  )
}
