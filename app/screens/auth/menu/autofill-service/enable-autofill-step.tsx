import React from "react";
import { Text } from "../../../../components";
import { View, Image } from "react-native";



interface StepProps {
    text: string,
    img: any
}

export const Step = (props: StepProps) => {
    return (
        <View style={{
            paddingVertical: 8,
            flexDirection: "row"
        }}>
            <Image source={props.img} style={{ width: 24, height: 24 }} />
            <Text text={props.text} preset="black" style={{
                alignSelf: "center",
                marginLeft: 16,
                fontSize: 16
            }} />
        </View>
    )
}