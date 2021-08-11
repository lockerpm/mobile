import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Text, Header, Button, AutoImage as Image } from "../../../../../components"
import { useNavigation, useRoute } from "@react-navigation/native"
import { color, commonStyles } from "../../../../../theme"
import { RouteProp } from "@react-navigation/native"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { NewFolderModal } from "../new-folder-modal"


type FolderActionScreenProp = RouteProp<PrimaryParamList, 'folders__action'>;


export const FolderActionScreen = observer(function FolderActionScreen() {
  const navigation = useNavigation()
  const route = useRoute<FolderActionScreenProp>()
  const { mode } = route.params

  const [showNewFolderModal, setShowNewFolderModal] = useState(false)

  return (
    <Layout
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0
      }}
      header={(
        <Header
          title={mode === 'add' ? 'Add to Folder' : 'Move to Folder'}
          goBack={() => navigation.goBack()}
          goBackText={mode === 'move' ? "Cancel" : undefined}
          right={mode === 'move' ? (
            <Button
              preset="link"
              text="Save"
              textStyle={{
                fontSize: 12
              }}
            />
          ) : (
            <View style={{ width: 10 }} />
          )}
        />
      )}
    >
      <NewFolderModal
        isOpen={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
      />

      {/* None */}
      <Button
        preset="link"
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white,
          marginBottom: 10
        }]}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <Text preset="black" style={{ flex: 1 }}>
            None
          </Text>
          <IoniconsIcon
            name="checkmark"
            size={18}
            color={color.palette.green}
          />
        </View>
      </Button>
      {/* None end */}

      {/* Create */}
      <Button
        preset="link"
        onPress={() => setShowNewFolderModal(true)}
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white
        }]}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <Image
            source={require('../folder-add.png')}
            style={{ height: 30, marginRight: 10 }}
          />
          <Text preset="black" style={{ flex: 1 }}>
            New Folder
          </Text>
          <FontAwesomeIcon
            name="angle-right"
            size={20}
            color={color.text}
          />
        </View>
      </Button>
      {/* Create end */}

      {/* Other folders */}
      <Button
        preset="link"
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white
        }]}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <Image
            source={require('../folder-share.png')}
            style={{ height: 30, marginRight: 10 }}
          />
          <Text preset="black" style={{ flex: 1 }}>
            CyStack
          </Text>
        </View>
      </Button>

      <Button
        preset="link"
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white
        }]}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <Image
            source={require('../folder.png')}
            style={{ height: 30, marginRight: 10 }}
          />
          <Text preset="black" style={{ flex: 1 }}>
            Test
          </Text>
        </View>
      </Button>
      {/* Other folders end */}
    </Layout>
  )
})
