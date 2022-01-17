import * as React from "react"
import { Text } from "../text/text"
import { StyleProp, ViewStyle, View } from "react-native"
import ProgressBar from "react-native-ui-lib/progressBar"
import { useMixins } from "../../services/mixins"


export interface PlanStorageProps {
    style?: StyleProp<ViewStyle>
    value: number,
    limits: number,
    title: string,
}

/**
 * Describe your component here
 */
export const PlanStorage = function PlanStorage(props: PlanStorageProps) {
    const { value, style, limits, title } = props
    const { translate, color } = useMixins()
    return (
        <View style={[{ width: '100%' }, style]}>
            <View style={{flexDirection: "row", justifyContent:"space-between"}}>
                <Text>{title}</Text>
                <Text>{value}/{limits}</Text>
            </View>

            <ProgressBar
                height={8}
                containerStyle={{
                    borderRadius: 4
                }}
                progressBackgroundColor={color.block}
                backgroundColor={color.primary}
                // @ts-ignore
                progress={value / limits * 100}
            />
        </View>
    )
}
