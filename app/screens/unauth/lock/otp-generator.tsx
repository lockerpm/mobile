import React from 'react'
import {  View, Text, Platform } from 'react-native';
import Animated, {
  scrollTo,
  useDerivedValue,
  useAnimatedRef,
} from 'react-native-reanimated';


const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const indices = [0, 1, 2, 3, 5, 6];

const range = [0, 999999];


export function OtpPasswordlessGenerator({otp}: {otp: number}): React.ReactElement {
  const number = useDerivedValue(() => {
    const val = range[0] + Math.round(otp * (range[1] - range[0]));
    return val;
  });

  return (
      <View style={{ alignItems: 'center',  }}>
        <NumberDisplay number={number} />
     
      </View>
  );
}

function getDigit(number: Animated.SharedValue<number>, i: number) {
  return useDerivedValue(() => {
    return Math.floor(number.value / 10 ** i) % 10;
  });
}

function NumberDisplay({ number }: { number: Animated.SharedValue<number> }) {
  return (
    <View style={{ height: 150, width: 200 }}>
      <View
        style={{
          flexDirection: 'row-reverse',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        {indices.map((i) => {
          return <Digit digit={getDigit(number, i)} key={i} />;
        })}
      </View>
    </View>
  );
}

function Digit({ digit }: { digit: Animated.SharedValue<number> }) {
  const aref = useAnimatedRef<Animated.ScrollView>();

  useDerivedValue(() => {
    if (Platform.OS === 'web') {
      if (aref && aref.current) {
        aref.current.getNode().scrollTo({ y: digit.value * 200 });
      }
    } else {
      // TODO fix this
      scrollTo(aref, 0, digit.value * 200, true);
    }
  });

  return (
    <View
      style={{ height: 200, width: Platform.OS === 'web' ? 50 : undefined }}>
      <Animated.ScrollView ref={aref}>
        {digits.map((i) => {
          return (
            <View
              style={{
                height: 200,
                alignItems: 'center',
                flexDirection: 'row',
              }}
              key={i}>
              <Text style={{ fontSize: 30 }}>{i}</Text>
            </View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

