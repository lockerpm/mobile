import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { 
  AutoImage as Image, Text, Layout, Button, Header, FloatingInput,
  OwnershipAction
} from "../../../../../components"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, commonStyles } from "../../../../../theme"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'


type NoteEditScreenProp = RouteProp<PrimaryParamList, 'notes__edit'>;


export const NoteEditScreen = observer(function NoteEditScreen() {
  const navigation = useNavigation()
  const route = useRoute<NoteEditScreenProp>()
  const { mode } = route.params

  const [showOwnershipAction, setShowOwnershipAction] = useState(false)

  // Forms
  const [title, setTitle] = useState()
  const [note, setNote] = useState()

  return (
    <Layout
      containerStyle={{ 
        backgroundColor: color.block,
        paddingHorizontal: 0
      }}
      header={(
        <Header
          title={mode === 'add' ? 'Add Secure Note' : 'Edit'}
          goBack={() => navigation.goBack()}
          goBackText="Cancel"
          right={(
            <Button
              preset="link"
              text="Save"
              textStyle={{
                fontSize: 12
              }}
            />
          )}
        />
      )}
    >
      {/* Title */}
      <View
        style={[commonStyles.SECTION_PADDING, { backgroundColor: color.palette.white }]}
      >
        <View
          style={[commonStyles.CENTER_HORIZONTAL_VIEW]}
        >
          <Image
            source={BROWSE_ITEMS.note.icon}
            style={{ height: 40, marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <FloatingInput
              isRequired
              label="Title"
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>
      </View>
      {/* Title end */}

      <View style={commonStyles.SECTION_PADDING}>
        <Text text="DETAILS" style={{ fontSize: 10 }} />
      </View>

      {/* Info */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white,
          paddingBottom: 32
        }]}
      >
        {/* Note */}
        <View style={{ flex: 1, marginTop: 20 }}>
          <FloatingInput
            fixedLabel
            textarea
            label="Note"
            value={note}
            onChangeText={setNote}
          />
        </View>
        {/* Note end */}
      </View>
      {/* Info end */}

      <View style={commonStyles.SECTION_PADDING}>
        <Text text="OTHERS" style={{ fontSize: 10 }} />
      </View>

      {/* Others */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white,
          paddingBottom: 32
        }]}
      >
        {/* Folder */}
        <Button
          preset="link"
          onPress={() => {
            navigation.navigate('folders__action', { mode: mode === 'add' ? 'add' : 'move' })
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
                text="Folder"
                style={{ fontSize: 10 }}
              />
              <Text
                preset="black"
                text="None"
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
          preset="link"
          onPress={() => setShowOwnershipAction(true)}
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
                text="Ownership"
                style={{ fontSize: 10 }}
              />
              <Text
                preset="black"
                text="None"
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
      </View>
      {/* Others end */}

      <OwnershipAction
        isOpen={showOwnershipAction}
        onClose={() => setShowOwnershipAction(false)}
      />
    </Layout>
  )
})
