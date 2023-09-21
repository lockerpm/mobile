import React from "react"
import { TouchableOpacity, View, ViewStyle, Image } from "react-native"
import { Text } from "app/components-v2/cores"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "app/services/context"
import { useStores } from "app/models"
import { translate } from "app/i18n"

export const PREMIUM_FEATURES_IMG = {
    locker: require("assets/images/intro/locker.png"),
    emergencyContact: require("assets/images/intro/emergency-contact.png"),
    web: require("assets/images/intro/web.png"),
    sharePassword: require("assets/images/intro/share-password.png")
}

export const PremiumFeature = () => {
    const { colors } = useTheme()
    const { user } = useStores()
    const navigation = useNavigation()
    const isFreeAccount = user.isFreePlan

    const item = {
        locker: {
            img: PREMIUM_FEATURES_IMG.locker,
            desc: translate('manage_plan.feature.locker'),
            action: () => {
                isFreeAccount ? navigation.navigate("payment", { benefitTab: 0 })
                    : navigation.navigate('mainTab', { screen: 'homeTab' });
            }
        },
        emergencyContact: {
            img: PREMIUM_FEATURES_IMG.emergencyContact,
            desc: translate('manage_plan.feature.emergency_contact.header'),
            action: () => {
                isFreeAccount ? navigation.navigate("payment", { benefitTab: 2 })
                    : navigation.navigate('yourTrustedContact')
            }
        },
        web: {
            img: PREMIUM_FEATURES_IMG.web,
            desc: translate('manage_plan.feature.web'),
            action: () => {
                isFreeAccount ? navigation.navigate("payment", { benefitTab: 1 })
                    : navigation.navigate('mainTab', { screen: 'toolsTab' });
            }
        },
        sharePassword: {
            img: PREMIUM_FEATURES_IMG.sharePassword,
            desc: translate('manage_plan.feature.share_password'),
            action: () => {
                isFreeAccount ? navigation.navigate("payment", { benefitTab: 3 })
                    : navigation.navigate('mainTab', {
                        screen: 'browseTab',
                        params: {
                            screen: 'shares',
                        },
                    });
            }
        }
    }

    // -------------------- RENDER ----------------------

    const ROW_ITEMS: ViewStyle = {
        height: 130,
        width: '100%',
        flexDirection: "row",
        justifyContent: "space-between",
    }




    return (
        <View style={{ backgroundColor: colors.background, padding: 16 }}>
            <Text preset="bold" text={translate('manage_plan.feature.title')} style={{ marginBottom: 20 }} />
            <View>
                <View style={ROW_ITEMS}>
                    <PremiumFeatureItem item={item.locker} leftItem={true} />
                    <PremiumFeatureItem item={item.emergencyContact} />
                </View>
                <View style={[ROW_ITEMS, { marginTop: 18 }]}>
                    <PremiumFeatureItem item={item.web} leftItem={true} />
                    <PremiumFeatureItem item={item.sharePassword} />
                </View>
            </View>
        </View>
    )
}


const PremiumFeatureItem = (prop: {
    item: {
        img: any,
        desc: string,
        action: () => void
    },
    leftItem?: boolean
}) => {
    const { colors } = useTheme()
    const BOX: ViewStyle = {
        flex: 1,
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        backgroundColor: colors.block
    }
    return (
        <TouchableOpacity onPress={prop.item.action} style={[BOX, {
            marginRight: prop.leftItem ? 18 : 0,
            maxHeight: 200
        }]}>
            <Image source={prop.item.img} style={{ height: "80%", width: "80%" }} />
            <Text text={prop.item.desc} style={{ fontSize: 12, marginVertical: 10 }} />
        </TouchableOpacity>
    )
}
