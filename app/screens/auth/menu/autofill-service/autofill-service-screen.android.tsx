import React, { useState, useEffect, useRef } from "react"
import { Button, Header, Layout, Text } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../../services/mixins"
import { NativeModules, Image, View, TouchableOpacity, AppState } from "react-native"
import { commonStyles } from "../../../../theme"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import RNAndroidSettingsTool from "react-native-android-settings-tool"
import { getApiLevel, getManufacturer } from 'react-native-device-info'
import * as Animatable from 'react-native-animatable';
import { AutofillServiceEnabled } from "app/utils/autofillHelper"
import Accordion from 'react-native-collapsible/Accordion';



export const AutofillServiceScreen = function AutofillServiceScreen() {
	const navigation = useNavigation()
	const { translate, color } = useMixins()

	const { RNManufacturerSettings } = NativeModules

	const [enabled, setEnabled] = useState(false)
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

	const appState = useRef(AppState.currentState);
	const [appStateVisible, setAppStateVisible] = useState(appState.current);

	// ---------------------------EFFECT-----------------------
	useEffect(() => {
		const subscription = AppState.addEventListener("change", nextAppState => {
			setAppStateVisible(nextAppState);
		});

		return () => {
			subscription == null;
		};
	}, []);

	useEffect(() => {
		mounted()
	}, [])

	useEffect(() => {
		AutofillServiceEnabled(isActived => {
			setEnabled(isActived)
		})
	}, [appStateVisible])

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
		// setting up a active section state
		setActiveSections(sections.includes(undefined) ? [] : sections);
	};

	const renderHeader = (section, _, isActive) => {
		// Accordion Header view
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
		// Accordion Content view
		return (
			<Animatable.View
				duration={200}
				style={{
					padding: 20,
					marginBottom: 16,
					backgroundColor: color.background,
				}}
				transition="backgroundColor">
				<AutofillServiceRender content={section} />
				{!enabled && <Button onPress={section.action} style={{ marginTop: 16 }} text={translate('autofill_service.android.btn')} />}
			</Animatable.View>
		);
	};

	const AutofillServiceRender = ({ content }) => {
		return (<View style={{ justifyContent: "center", flex: 1 }}>
			{
				enabled && (
					<View style={{ alignItems: "center" }}>
						<Image source={require("./autofillActive.png")} style={{ width: 335, height: 215 }}></Image>
						<View style={{ marginTop: 24 }}>
							<Text preset="largeHeader" text={translate("autofill_service.activated.title")} style={{ textAlign: "center" }} />
							<Text preset="black" text={translate("autofill_service.activated.content")} style={{ marginTop: 24, textAlign: "center" }} />
						</View>

					</View>
				)
			}
			{
				!enabled && <View style={{ alignItems: "center" }} >
					<Text preset="header" text={content.header} style={{ marginBottom: 12 }} />

					<Image source={content.image} style={{
						width: 335, height: 227,
						marginVertical: 16,
					}} />

					<Text text={content.desc} />
				</View>
			}
		</View>
		)
	}
	// ----------------- RENDER --------------------


	return (
		<Layout
			header={!enabled ? (
				<Header
					goBack={() => {
						navigation.goBack()
					}}
					title={translate('settings.autofill_service')}
					right={(<View style={{ width: 30 }} />)}
				/>
			) : null}
			footer={(
				<View>
					<Button
						text={enabled ? translate("common.ok") : translate("common.open_settings")}
						onPress={() => {
							if (enabled) {
								navigation.navigate("mainTab", { screen: "homeTab" })
							} else {
								RNAndroidSettingsTool.ACTION_REQUEST_SET_AUTOFILL_SERVICE('packge:com.cystack.locker')
							}

						}}
					>
					</Button>
				</View>
			)}
		>
			{
				contents.length > 1 &&
				<Accordion
					activeSections={activeSections}
					sections={contents}
					touchableComponent={TouchableOpacity}
					renderHeader={renderHeader}
					renderContent={renderContent}
					duration={200}
					onChange={setSections}
				/>
			}
			{
				contents.length === 1 &&
				<AutofillServiceRender content={contents[0]} />
			}
		</Layout>
	)
}
