import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Alert, BackHandler, Button, Platform, View, Text } from "react-native"
// import DateTimePicker from '@react-native-community/datetimepicker';


export const TestScreen = observer(() => {
  const [date, setDate] = useState(new Date(1598051730000));
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    // setShow(false);
    setDate(currentDate);
  };

  const showDatepicker = () => {
    setShow(true);
  };


  return (
    <View style={{backgroundColor: "white", flex: 1, justifyContent: "center"}}>
      <Button onPress={showDatepicker} title="Show date picker!" />
      <Text>selected: {date.toLocaleString()}</Text>
      {/* {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode='date'
          onChange={onChange}
        />
      )} */}
    </View>
  );
})
