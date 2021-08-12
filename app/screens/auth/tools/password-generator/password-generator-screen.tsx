import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Header, Text, Button } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, commonStyles } from "../../../../theme"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { Checkbox, Slider } from "native-base"


export const PasswordGeneratorScreen = observer(function PasswordGeneratorScreen() {
  const navigation = useNavigation()
  
  const [options, setOptions] = useState([])
  const [passwordLength, setPasswordLength] = useState(12)

  const OPTIONS = [
    {
      label: 'Use uppercase letters (A-Z)',
      value: '0'
    },
    {
      label: 'Use lowercase letters (a-z)',
      value: '1'
    },
    {
      label: 'Use digits (0-9)',
      value: '2'
    },
    {
      label: 'Use symbols (@!$%*)',
      value: '3'
    },
    {
      label: 'Avoid ambiguous characters',
      value: '4'
    }
  ]

  return (
    <Layout
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0
      }}
      header={(
        <Header
          title="Password Generator"
          goBack={() => navigation.goBack()}
          right={(
            <View style={{ width: 10 }} />
          )}
        />
      )}
      footer={(
        <Button
          isNativeBase
          text="Use Password"
        />
      )}
    >
      {/* Password */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white
        }]}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <Text preset="black" style={{ flex: 1, fontSize: 16 }}>
            jPk%4TJ%K^87
          </Text>
          <IoniconsIcon
            name="copy-outline"
            size={18}
            color={color.textBlack}
          />
        </View>

        <Text
          preset="green"
          style={{
            marginTop: 10,
            fontSize: 10
          }}
        >
          <IoniconsIcon
            name="shield-checkmark"
            size={12}
            color={color.palette.green}
          />
          {" Strong"}
        </Text>
      </View>
      {/* Password end */}

      <View style={commonStyles.SECTION_PADDING}>
        <Text text="OPTIONS" style={{ fontSize: 10 }} />
      </View>

      {/* Options */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white
        }]}
      >
        <Text
          text="Length"
          preset="black"
          style={{ fontSize: 12 }}
        />
        <Slider
          colorScheme="csGreen"
          defaultValue={12}
          minValue={0}
          maxValue={30}
          accessibilityLabel="hello world"
          step={1}
          mb={7}
          onChange={setPasswordLength}
        >
          <Slider.Track bg={color.block}>
            <Slider.FilledTrack />
          </Slider.Track>
          <Slider.Thumb>
            <View style={{
              position: 'absolute',
              top: 20,
              left: -4,
              width: 25,
              borderColor: color.text,
              borderWidth: 1,
              borderRadius: 5
            }}>
              <Text
                preset="black"
                style={{ fontSize: 12, textAlign: 'center' }}
                text={passwordLength.toString()}
              />
            </View>
          </Slider.Thumb>
        </Slider>

        <Checkbox.Group
          colorScheme="csGreen"
          onChange={setOptions}
          value={options}
        >
          {
            OPTIONS.map((item) => (
              <Checkbox
                key={item.value}
                value={item.value}
                my={1}
                accessibilityLabel={item.value}
              >
                <Text
                  text={item.label}
                  preset="black"
                  style={{ marginLeft: 10 }}
                />
              </Checkbox>
            ))
          }
        </Checkbox.Group>
      </View>
      {/* Options end */}
    </Layout>
  )
})
