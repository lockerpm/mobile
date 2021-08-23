import * as React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { Text, AutoImage as Image } from "../"
import { flatten } from "ramda"
import find from 'lodash/find'
import { CipherView } from "../../../core/models/view"
import { commonStyles } from "../../theme"
import { FOLDER_IMG } from "../../common/mappings"
import { useMixins } from "../../services/mixins"
import { useStores } from "../../models"

const CONTAINER: ViewStyle = {
  justifyContent: "center",
}

export interface CipherInfoCommonProps {
  style?: StyleProp<ViewStyle>,
  cipher: CipherView
}

/**
 * Describe your component here
 */
export const CipherInfoCommon = observer(function CipherInfoCommon(props: CipherInfoCommonProps) {
  const { style, cipher } = props
  const { getTeam, getCollections, getFolders } = useMixins()
  const { user } = useStores()

  const [collections, setCollections] = React.useState([])
  const [folders, setFolders] = React.useState([])

  const styles = flatten([CONTAINER, style])

  // Computed
  const collection = (() => {
    return { name: 'Unassigned Folder', id: 'unassigned' }
  })()

  const folder = (() => {
    return find(folders, e => e.id === cipher.folderId) || {}
  })()

  // Mounted
  React.useEffect(() => {
    const mounted = async () => {
      const [collectionRes, folderRes] = await Promise.all([
        getCollections(),
        getFolders()
      ])
      setCollections(collectionRes)
      setFolders(folderRes)
    }
    mounted()
  }, [])

  return (
    <View style={styles}>
      {/* Owned by */}
      <Text
        text="Owned by"
        style={{ fontSize: 10, marginTop: 20, marginBottom: 5 }}
      />
      <Text
        preset="black"
        text={getTeam(user.teams, cipher.organizationId).name || 'Me'}
      />

      {/* Folder */}
      <Text
        text="Folder"
        style={{ fontSize: 10, marginTop: 20, marginBottom: 10 }}
      />
      {
        !!cipher.organizationId ? (
          <View style={[commonStyles.CENTER_HORIZONTAL_VIEW]}>
            <Image
              source={FOLDER_IMG[collection.id === 'unassigned' ? 'normal' : 'share'].img}
              style={{
                marginRight: 10
              }}
            />
            <Text
              preset="black"
              text={collection.name}
            />
          </View>
        ) : (
          <View style={[commonStyles.CENTER_HORIZONTAL_VIEW]}>
            <Image
              source={FOLDER_IMG.normal.img}
              style={{
                marginRight: 10
              }}
            />
            <Text
              preset="black"
              text={folder.name || 'No folder'}
            />
          </View>
        )
      }
    </View>
  )
})
