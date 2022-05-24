import * as React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { flatten } from "ramda"
import { AutoImage as Image } from "../../auto-image/auto-image"
import { Text } from "../../text/text"
import { Button } from "../../button/button"
import filter from 'lodash/filter'
import find from 'lodash/find'
import { CipherView } from "../../../../core/models/view"
import { useMixins } from "../../../services/mixins"
import { useStores } from "../../../models"
import { commonStyles, fontSize } from "../../../theme"
import { FOLDER_IMG } from "../../../common/mappings"
import { CollectionView } from "../../../../core/models/view/collectionView"
import { SharedMemberType } from "../../../services/api"
import { FloatingInput } from "../../floating-input"
import { FieldType } from "../../../../core/enums"

const CONTAINER: ViewStyle = {
  justifyContent: "center"
}

export interface CipherInfoCommonProps {
  style?: StyleProp<ViewStyle>
  cipher: CipherView
}

/**
 * Describe your component here
 */
export const CipherInfoCommon = observer((props: CipherInfoCommonProps) => {
  const { style, cipher } = props
  const { getTeam, translate } = useMixins()
  const { user, folderStore, collectionStore, cipherStore } = useStores()

  const styles = flatten([CONTAINER, style])

  const [showFullShareMember, setShowFullShareMember] = React.useState<boolean>(false)

  // ------------- COMPUTED ---------------

  const collections = (() => {
    return filter(collectionStore.collections, e => cipher.collectionIds && cipher.collectionIds.includes(e.id)) || []
  })()

  const folder = (() => {
    return find(folderStore.folders, e => e.id === cipher.folderId) || {}
  })()

  const shareMember: { isShared: boolean, member: SharedMemberType[] } = (() => {
    const share = cipherStore.myShares.find(s => s.id === cipher.organizationId)
    if (share && share.members.length > 0) {
      return { isShared: true, member: share.members }
    }
    return { isShared: false, member: [] }
  })()

  // ------------- RENDER ---------------

  return (
    <View style={styles}>
      {/* Custom fields */}
      {
        (cipher.fields || []).map((item, index) => (
          <FloatingInput
            key={index}
            editable={false}
            isPassword={item.type === FieldType.Hidden}
            label={item.name}
            value={item.name}
            style={{
              marginTop: 20
            }}
          />
        ))
      }
      {/* Custom fields end */}

      {/* Owned by */}
      <Text
        text={translate('common.owned_by')}
        style={{ fontSize: fontSize.small, marginTop: 20, marginBottom: 5 }}
      />
      <Text
        preset="black"
        text={
          getTeam(user.teams, cipher.organizationId).name
          || getTeam(cipherStore.organizations, cipher.organizationId).name
          || translate('common.me')
        }
      />
      {/* Owned by end */}

      {/* Shared with */}
      <SharedWith 
        shareMember={shareMember} 
        show={showFullShareMember} 
        setShow={setShowFullShareMember}
      />
      {/* Shared with end */}

      {/* Folder */}
      <Text
        text={translate('common.folder')}
        style={{ fontSize: fontSize.small, marginTop: 20, marginBottom: 10 }}
      />
      {
        collections.map((c: CollectionView) => (
          (
            <View
              key={c.id}
              style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
                marginBottom: 10
              }]}
            >
              <FOLDER_IMG.share.svg height={30} />
              <Text
                preset="black"
                text={c.name || translate('folder.unassigned')}
                style={{ marginLeft: 10 }}
              />
            </View>
          )
        ))
      }
      {
        (!cipher.organizationId || !!folder.name || getTeam(user.teams, cipher.organizationId)) && (
          <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
            <FOLDER_IMG.normal.svg height={30} />
            <Text
              preset="black"
              text={folder.name || translate('folder.unassigned')}
              numberOfLines={2}
              style={{ marginLeft: 10, flex: 1 }}
            />
          </View>
        )
      }
    </View>
  )
})

const SharedWith = ({ shareMember, show, setShow }) => {
  const { translate } = useMixins()

  return shareMember.isShared && (<View>
    <Text
      text={translate('common.share_with')}
      style={{ fontSize: fontSize.small, marginTop: 20, marginBottom: 5 }}
    />
    <View style={{
      flexDirection: show ? "column" : "row",
      alignItems: !show ? "center" : "flex-start"
    }}>
      {
        shareMember.member.map((element, index) => {
          if (index > 4 && !show) {
            return null
          } else {
            return (
              <View key={index} style={{
                marginVertical: 5,
                flexDirection: "row",
                alignItems: "center"
              }}>
                <Image
                  source={{ uri: element.avatar }}
                  style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
                />
                {
                  show && <Text preset="black" text={element.email} />
                }
              </View>
            )
          }
        }
        )
      }

      <Button preset="link"
        style={{ marginTop: 10 }}
        text={!show ? translate('common.see_all') : translate('common.collapse')}
        textStyle={{ color: "blue" }}
        onPress={() => setShow(!show)}
      />
    </View>
  </View>
  )
}
