import React, { useState, useEffect } from "react"
import { Button, Header, Layout, Text } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../../services/mixins"
import { View } from "react-native"
import { commonStyles, fontSize } from "../../../../theme"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import RNAndroidSettingsTool from "react-native-android-settings-tool"
import { getApiLevel } from 'react-native-device-info'


export const AutofillServiceScreen = function AutofillServiceScreen() {
  const navigation = useNavigation()
  const { translate, color } = useMixins()

	const [api, setApi] = useState(0)

	const mounted = async () => {
		const res = await getApiLevel()
		setApi(res)
	}

	useEffect(() => {
		mounted()
	}, [])

  // ----------------- RENDER --------------------

  const renderOption = (title: string, desc: string, action: () => void, disabled?: boolean, border?: boolean) => (
		<Button
      isDisabled={disabled}
      preset="link"
      onPress={action}
      style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        borderBottomColor: color.line,
        borderBottomWidth: border ? 1 : 0,
        justifyContent: 'space-between',
        paddingVertical: 16,
				paddingHorizontal: 20,
				backgroundColor: color.background
      }]}
    >
      <View style={{ paddingRight: 15 }}>
				<View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
					flexWrap: 'wrap',
					marginBottom: 3
				}]}>
					<Text
						preset="black"
						text={title}
						style={{ marginRight: disabled ? 7 : 0 }}
					/>
					{
						disabled && (
							<Text
								text={`(${translate('error.not_supported')})`}
								style={{ color: color.error }}
							/>
						)
					}
				</View>

				<Text
					text={desc}
					style={{
						fontSize: fontSize.small
					}}
				/>
			</View>
      <FontAwesomeIcon
				name="angle-right"
				size={18}
				color={color.textBlack}
			/>
    </Button>
	)

  return (
    <Layout
      header={(
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={translate('settings.autofill_service')}
          right={(<View style={{ width: 10 }} />)}
        />
      )}
      containerStyle={{ 
				backgroundColor: color.block,
				paddingHorizontal: 0
			}}
    >
			{
				renderOption(
					translate('autofill_service.android.android_autofill.name'),
					translate('autofill_service.android.android_autofill.desc'),
					() => {
						RNAndroidSettingsTool.ACTION_REQUEST_SET_AUTOFILL_SERVICE('packge:com.cystack.locker')
					},
					api < 26
				)
			}
    </Layout>
  )
}
