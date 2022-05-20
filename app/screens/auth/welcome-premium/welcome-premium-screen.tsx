import React from 'react';
import { View, Image } from "react-native"
import { Layout, Text, Button } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../services/mixins"
import { useStores } from '../../../models';
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons"
const LottieView = require("lottie-react-native");


export const WelcomePremiumScreen = () => {
    const navigation = useNavigation()
    const { user } = useStores()
    const { translate, color } = useMixins()

    const UnlockFeature = ({ text }) => {
        return (
            <View style={{ flexDirection: "row", marginVertical: 4 }}>
                <SimpleLineIcons name="check" color={"white"} size={16} style={{
                    alignContent: "center",
                    alignSelf: "center",
                }} />
                <Text text={text} style={{
                    marginLeft: 5,
                    color: "white",
                }} />
            </View>
        )
    }

    return (
        <Layout
            style={{
                // bar style
                backgroundColor: color.primary
            }}
            containerStyle={{
                backgroundColor: color.primary
            }}
        >
            <LottieView
                source={require('./bg_lottie.json')}
                style={{
                    zIndex: 2,
                    height: "100%",
                    position: "absolute"
                }}
                autoPlay
                loop
            />
            <View style={{ zIndex: 1, flex: 1, alignItems: "center" }}>
                <Image source={require('./LockerPremium.png')} style={{
                    width: 152,
                    height: 32
                }} />
                <Image source={require('./HighFive.png')} style={{
                    marginTop: 24,
                    width: 155,
                    height: 163
                }} />

                <Text preset='bold' text={translate('welcome_premium.title')} style={{
                    marginTop: 24,
                    color: "white",
                    fontSize: 24,
                    textAlign: "center"

                }} />
                <Text text={translate('welcome_premium.all_features')} style={{
                    marginTop: 16,
                    color: "white",
                    textAlign: "center"
                }} />

                <View style={{
                    marginTop: 16,
                    borderRadius: 10,
                    width: "100%",
                    backgroundColor: "#21632F",
                    paddingHorizontal: 16,
                    paddingVertical: 8

                }}>
                    <UnlockFeature text={translate('welcome_premium.features.unlimited')} />
                    <UnlockFeature text={translate('welcome_premium.features.share')} />
                    <UnlockFeature text={translate('welcome_premium.features.monitor')} />
                    <UnlockFeature text={translate('welcome_premium.features.emergency')} />
                    <Text text={translate('welcome_premium.features.more')} style={{
                        color: "white",
                    }} />
                </View>
            </View>

            <Button
                text={translate('welcome_premium.btn')}
                onPress={() => {
                    navigation.navigate("mainTab", { screen: user.defaultTab })
                }}
                style={{
                    zIndex: 3,
                    width: '100%',
                    marginHorizontal: 20,
                    backgroundColor: "white",
                    position: "absolute",
                    bottom: 20
                }}
                textStyle={{
                    fontWeight: "bold",
                    color: color.primary
                }}
            />
        </Layout>
    )
}
