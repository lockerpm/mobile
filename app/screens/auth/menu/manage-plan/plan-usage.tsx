import React, { useEffect, useState } from "react"
import { View, ViewStyle, StyleProp } from "react-native"
import { Text, Button, AutoImage as Image } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../../services/mixins"
import { useStores } from "../../../../models"
import { commonStyles, fontSize } from "../../../../theme"
import ProgressBar from "react-native-ui-lib/progressBar"
import { useCipherToolsMixins } from "../../../../services/mixins/cipher/tools"
import { CipherType } from "../../../../../core/enums"
import { FREE_PLAN_LIMIT } from "../../../../config/constants"
import { PlanType } from "../../../../config/types"


interface PlanItemUsage {
    cipherType: CipherType,
    title: string,
    limits: number,
}

interface PlanStorageProps {
    style?: StyleProp<ViewStyle>
    isUnlimited?: boolean
    cipherType: CipherType,
    limits: number,
    title: string,
}


const ItemStorage = (props: PlanStorageProps) => {
    const { cipherType, style, limits, title, isUnlimited } = props
    const { translate, color } = useMixins()
    const { getCipherCount } = useCipherToolsMixins()
    const [cipherCount, setCipherCount] = useState(0)

    const usagePercentage = cipherCount / limits * 100
    const backgroundColor = usagePercentage >= 80 ? (usagePercentage >= 100 ? color.error :  color.warning) : color.primary

    useEffect(() => {
        const counting = async () => {
            const count = await getCipherCount(cipherType)
          
            setCipherCount(count)
        }
        counting()
    }, [])

    return (
        <View style={[{ width: '100%', marginVertical: 4 }, style]}>
            <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
            }}>
                <Text preset="black">{title}</Text>
                <Text preset="black"> {cipherCount}/{isUnlimited ? "∞" : limits}</Text>
            </View>

            {
                !isUnlimited && <ProgressBar
                    height={6}
                    containerStyle={{
                        borderRadius: 4
                    }}
                    progressBackgroundColor={color.block}
                    backgroundColor={backgroundColor}
                    // @ts-ignore
                    progress={isUnlimited ? 0 : (cipherCount / limits * 100)}
                />
            }
        </View>
    )
}

export const PlanUsage = () => {
    const { color, translate } = useMixins()
    const navigation = useNavigation()
    const { user } = useStores()

    const isFreeAccount = (user.plan?.alias === PlanType.FREE) || !user.plan
    const items: PlanItemUsage[] = [
        {
            cipherType: CipherType.Login,
            title: translate('manage_plan.usage.login'),
            limits: FREE_PLAN_LIMIT.LOGIN,
        },
        {
            cipherType: CipherType.Card,
            title: translate('manage_plan.usage.card'),
            limits: FREE_PLAN_LIMIT.PAYMENT_CARD,
        },
        {
            cipherType: CipherType.Identity,
            title: translate('manage_plan.usage.identity'),
            limits: FREE_PLAN_LIMIT.IDENTITY,
        },
        {
            cipherType: CipherType.SecureNote,
            title: translate('manage_plan.usage.note'),
            limits: FREE_PLAN_LIMIT.NOTE,
        },
        {
            cipherType: CipherType.CryptoWallet,
            title: translate('manage_plan.usage.crypto'),
            limits: FREE_PLAN_LIMIT.CRYPTO,
        },
    ]
    // -------------------- RENDER ----------------------

    const USAGE_CONTAINER: ViewStyle = {
        flex: 1,
        borderRadius: 10,
        padding: 16,
        backgroundColor: color.block
    }
    return (
        <View style={[commonStyles.SECTION_PADDING, { backgroundColor: color.background, marginBottom: 10 }]}>

            <View style={USAGE_CONTAINER}>
                {
                    isFreeAccount && <Text preset="default" text={"Plan Usage"} style={{ marginBottom: 8 }} />
                }
                {
                    !isFreeAccount &&
                    <View style={{ flex: 1, flexDirection: "row", marginBottom: 8 }}>
                        <Text preset="default" text={"Plan Usage"} />
                        <View style={{
                            marginLeft: 8,
                            paddingHorizontal: 10,
                            paddingVertical: 3,
                            backgroundColor: color.primary,
                            borderRadius: 3
                        }}>
                            <Text
                                text= {user.pwd_user_type === "enterprise" ? translate('common.enterprise') : user.plan?.name.toUpperCase()}
                                style={{
                                    fontWeight: 'bold',
                                    color: color.background,
                                    fontSize: fontSize.mini
                                }}
                            />
                        </View>
                    </View>
                }

                {
                    items.map(
                        e => <ItemStorage key={e.cipherType} cipherType={e.cipherType} limits={e.limits} title={e.title} isUnlimited={!isFreeAccount} />
                    )
                }
            </View>
            {isFreeAccount && <Button
                onPress={() => { navigation.navigate("payment") }}
                text={translate('manage_plan.free.button')}
                style={{ marginTop: 12 }}
            />}
        </View>
    )
}
