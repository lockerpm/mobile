import React, { useState, useEffect } from "react"
import { Button, Header, Layout, Text } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../../services/mixins"
import { NativeModules, Image, View, TouchableOpacity } from "react-native"
import { commonStyles } from "../../../../theme"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import RNAndroidSettingsTool from "react-native-android-settings-tool"
import { getApiLevel, getManufacturer } from 'react-native-device-info'
import * as Animatable from 'react-native-animatable';
import Accordion from 'react-native-collapsible/Accordion';



export const AutofillServiceScreen = function AutofillServiceScreen() {
	const navigation = useNavigation()
	const { translate, color } = useMixins()

	const { RNManufacturerSettings } = NativeModules

	const [activeSections, setActiveSections] = useState([]);
	const [contents, setContent] = useState([]);
	const [api, setApi] = useState(0)
	const [manufacturer, setManufacturer] = useState("")

	const mounted = async () => {
		const res = await getApiLevel()
		const manufacturer = await getManufacturer()
		setManufacturer(manufacturer.toLowerCase())
		setApi(res)
	}

	useEffect(() => {
		mounted()
	}, [])

	useEffect(() => {
		const contents = [{
			title: translate('autofill_service.android.android_autofill.name'),
			header: translate('autofill_service.android.android_autofill.header'),
			desc: translate('autofill_service.android.android_autofill.desc'),
			image: require("./androidHint.png"),
			action: () => {
				RNAndroidSettingsTool.ACTION_REQUEST_SET_AUTOFILL_SERVICE('packge:com.cystack.locker')
			},
			disabled: api < 26,
			border: false
		}]

		if (manufacturer == "xiaomi") {
			contents.unshift({
				title: translate('autofill_service.android.other_permission.name_xiaomi'),
				header: translate('autofill_service.android.other_permission.header'),
				desc: translate('autofill_service.android.other_permission.desc'),
				image: require("./otherXiaomiPermission.png"),
				action: () => {
					RNManufacturerSettings.XIAOMI_APP_PERM_EDITOR()
				},
				disabled: api < 26,
				border: true
			})
		} else {
			setActiveSections(contents)
		}

		setContent(contents)
	}, [manufacturer, api])


	const setSections = (sections) => {
		//setting up a active section state
		setActiveSections(sections.includes(undefined) ? [] : sections);
	};

	const renderHeader = (section, _, isActive) => {
		//Accordion Header view
		return (
			<View
				style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
					borderBottomColor: color.line,
					borderBottomWidth: section.border && !isActive ? 1 : 0,
					justifyContent: 'space-between',
					paddingVertical: 16,
					paddingHorizontal: 20,
					backgroundColor: color.background,
				}]}
			>
				<View style={{ paddingRight: 15 }}>
					<View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
						flexWrap: 'wrap',
						marginBottom: 3,
					}]}>
						<Text
							preset="black"
							text={section.title}
							style={{ marginRight: section.disabled ? 7 : 0 }}
						/>
						{
							section.disabled && (
								<Text
									text={`(${translate('error.not_supported')})`}
									style={{ color: color.error }}
								/>
							)
						}
					</View>
				</View>
				<FontAwesomeIcon
					name="angle-right"
					size={18}
					color={color.textBlack}
				/>
			</View>
		);
	};

	const renderContent = (section, _, isActive) => {
		//Accordion Content view
		return (
			<Animatable.View
				duration={200}
				style={{
					padding: 20,
					marginBottom: 16,
					backgroundColor: '#fff',
				}}
				transition="backgroundColor">
				<View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>

					<Text preset="header" text={section.header} />

					<Image source={section.image} style={{
						width: 335, height: 227,
						marginVertical: 16
					}}></Image>

					<Text text={section.desc} />
				</View>
				<Button onPress={section.action} style={{ marginTop: 16 }} text={translate('autofill_service.android.btn')} />
			</Animatable.View>
		);
	};
	// ----------------- RENDER --------------------


	return (
		<Layout
			header={(
				<Header
					goBack={() => {
						navigation.goBack()
					}}
					title={translate('settings.autofill_service')}
					right={(<View style={{ width: 30 }} />)}
				/>
			)}
			containerStyle={{
				backgroundColor: color.block,
				paddingHorizontal: 0
			}}
		>
			<Accordion
				activeSections={activeSections}
				sections={contents}
				touchableComponent={TouchableOpacity}
				renderHeader={renderHeader}
				renderContent={renderContent}
				duration={200}
				onChange={setSections}
			/>
		</Layout>
	)
}
