import React, { useState } from "react"
import { useMixins } from "../../../../../services/mixins";
import { View, StyleSheet, Text, TouchableOpacity} from "react-native"


interface PlanDescription {
    id: number;
    label: string,
    description: string,
    price: string,
    priceDescription: string,
    features: string[]
}

interface Props {
    selected: number
    plan: PlanDescription,
    onSelect?(id): void;
}

const Plan: React.FC<Props> = ({
    selected,
    plan,
    onSelect
}) => {

    //test
    const [load, setLoad] = useState(false);
    const {color} = useMixins();
    const borderColor = selected === plan.id ? color.primary : "rgba(230, 230, 232, 1)"

    const handleSelected = () => {
        onSelect(plan.id);
    }

    return (
        <TouchableOpacity onPress={handleSelected} style={[styles.container, { borderColor: borderColor,}]}>
            <View style={styles.text}>
                <Text style={styles.label}>{plan.label}</Text>
                <Text style={styles.description}>{plan.description}</Text>
                <View style={styles.priceContainer}>
                    <Text style={styles.price}>{plan.price}</Text>
                    <Text style={[styles.description, { marginTop: 14 }]}>{plan.priceDescription}</Text>
                </View>
                <View style={styles.featuresContainer}>
                    {
                        plan.features.map((i) => {
                            return <Text key={i} style={styles.feature}> + {i}</Text>
                        })
                    }
                </View>
            </View>

        </TouchableOpacity>
    )

}

const styles = StyleSheet.create({
    container: {
        margin: 20,
        padding: 15,
        borderWidth: 1,
        borderRadius: 5,
        position: "relative",
        borderStyle: 'solid',
        display: 'flex',
    },
    text: {

        // height: "100%",
        display: "flex",
        flexDirection: "column"
    },
    label: {
        padding: 4,
        textTransform: "uppercase",
        backgroundColor: 'black',
        alignSelf: 'center',
        color: "white"
    },
    description: {
        marginTop: 0.5,
        color: 'rgba(97, 114, 150, 1)'
    },
    priceContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
    },
    price: {
        marginRight: 15,
        fontWeight: "500",
        fontSize: 30,
    },
    featuresContainer: {
        marginTop: 10,
    },
    feature: {
        marginLeft: 6,
    }

});


export default Plan;
