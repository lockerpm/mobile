import React, { useState, useRef } from 'react'
import { View, TextInput } from 'react-native'
import { Button, Text } from '../../../../../components'
import { useMixins } from '../../../../../services/mixins'
import { fontSize } from '../../../../../theme'
import Feather from 'react-native-vector-icons/Feather'


type Props = {
  seed: string
  setSeed: (val: string) => void
}

export const SeedPhraseInput = (props: Props) => {
  const { seed, setSeed } = props
  const MAX_WORD_COUNT = 24

  const [wordCount, setWordCount] = useState(12) 
  const [maxWidth, setMaxWidth] = useState(0) 

  const words = (() => {
    const res = seed.split(' ').map(w => w ? w.trim() : '')
    while (res.length < MAX_WORD_COUNT) {
      res.push('')
    }
    return res
  })()

  const refs = words.map(() => {
    return useRef(null)
  })

  const handleChange = (val: string, index: number) => {
    const res = [...words]
    const ws = val.trim().split(' ')
    if (val === '') {
      res[index] = ''
    } else {
      ws.forEach((w, i) => {
        if (w.trim() && index + i < MAX_WORD_COUNT) {
          res[index + i] = w.trim()
        }
      })
    }
    
    setSeed(res.join(' '))
    if (ws.length > 1 && index + ws.length - 1 < MAX_WORD_COUNT) {
      if (index + ws.length > wordCount) {
        setWordCount(index + ws.length)
      }
      setTimeout(() => {
        refs[index + ws.length - 1].current?.focus()
      }, 0)
    } else if (val.endsWith(' ') && index + 1 < MAX_WORD_COUNT) {
      setTimeout(() => {
        refs[index + 1].current?.focus()
      }, 0)
    }
  }

  return (
    <View
      onLayout={(e) => {
        const { width } = e.nativeEvent.layout
        setMaxWidth((width - 24) / 3)
      }}
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
        marginVertical: 8
      }}
    >
      {
        words.filter((w, index) => !!w.trim() || index < wordCount).map((w, index) => (
          <WordInput
            maxWidth={maxWidth}
            outerRef={refs[index]}
            key={index}
            index={index}
            value={w}
            onChange={(val: string) => {
              handleChange(val, index)
            }}
          />
        ))
      }

      {
        (wordCount < MAX_WORD_COUNT) && (
          <AddWordBtn
            maxWidth={maxWidth}
            onPress={() => {
              if (wordCount < MAX_WORD_COUNT) {
                setWordCount(wordCount + 1)
              }
            }}
          />
        )
      }
    </View>
  )
}


type InputProps = {
  outerRef?: any
  index: number
  value: string
  onChange: (val: string) => void
  maxWidth?: number
}

export const WordInput = (props: InputProps) => {
  const { value, onChange, index, outerRef, maxWidth } = props
  const { color } = useMixins()

  const [isFocused, setIsFocused] = useState(false)

  return (
    <View style={{
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isFocused ? color.primary : color.line,
      minWidth: 100,
      maxWidth: maxWidth || undefined,
      marginHorizontal: 4,
      paddingHorizontal: 12,
      marginBottom: 8
    }}>
      <Text
        preset='black'
        text={`${index + 1}.`}
      />
      <TextInput
        selectTextOnFocus
        ref={outerRef}
        value={value}
        onChangeText={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        selectionColor={color.primary}
        style={{
          flex: 1,
          fontSize: fontSize.p,
          color: color.textBlack,
          height: 28,
          paddingVertical: 0
        }}
      />
    </View>
  )
}


type BtnProps = {
  onPress: () => void
  maxWidth?: number
}

export const AddWordBtn = (props: BtnProps) => {
  const { onPress, maxWidth } = props
  const { translate, color } = useMixins()

  return (
    <Button
      preset='link'
      onPress={onPress}
      style= {{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderRadius: 16,
        minWidth: 100,
        maxWidth: maxWidth || undefined,
        marginHorizontal: 4,
        paddingHorizontal: 12,
        marginBottom: 8,
        backgroundColor: color.block,
        height: 28
      }}
    >
      <Feather name='plus-circle' color={color.textBlack} size={18} />
      <Text
        preset='black'
        text={translate('common.add')}
        style={{ marginLeft: 4 }}
      />
    </Button>
  )
}
