import React from 'react'
import { ImageURISource } from 'react-native'
import Ionicons from 'react-native-vector-icons/dist/Ionicons'
import AntDesign from 'react-native-vector-icons/dist/AntDesign'
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons'
import EvilIcons from 'react-native-vector-icons/dist/EvilIcons'
import FontAwesome from 'react-native-vector-icons/dist/FontAwesome'
import Feather from 'react-native-vector-icons/dist/Feather'
import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons'
import EntypoIcons from 'react-native-vector-icons/dist/Entypo'
import Octicons from 'react-native-vector-icons/dist/Octicons'

import { IconProps } from '../icon.props'

import Authenticator from './svg/navigator/authenticator.svg'
import Bell from './svg/common/bell.svg'
import Check from './svg/common/check.svg'
import Cross from './svg/common/cross.svg'
import DefaultAvatar from './svg/common/default-avatar.svg'
import Home from './svg/navigator/home.svg'
import Menu2 from './svg/navigator/menu-2.svg'
import Menu from './svg/navigator/menu.svg'
import Settings from './svg/navigator/settings.svg'
import UserPlus from './svg/common/user-plus.svg'
import UserMinus from './svg/common/user-minus.svg'
import Eye from './svg/common/eye.svg'
import PemcilSimple from './svg/common/pencil-simple.svg'

Ionicons.loadFont()
AntDesign.loadFont()
MaterialCommunityIcons.loadFont()
EvilIcons.loadFont()
FontAwesome.loadFont()
Feather.loadFont()
MaterialIcons.loadFont()
EntypoIcons.loadFont()
Octicons.loadFont()

type IconType = {
  [name: string]: {
    type: 'component' | 'source'
    render?: (props: Object) => React.ReactNode
    source?: ImageURISource
  }
}

const a: IconType = {}

const b: IconType = {
  bell: {
    type: 'component',
    render: (props: IconProps) => (
      <Bell height={props.size} width={props.size} color={props.color} />
    ),
  },
}

const e: IconType = {
  eye: {
    type: 'component',
    render: (props: IconProps) => (
      <Eye height={props.size} width={props.size} color={props.color} />
    ),
  },
}

const h: IconType = {}

const c: IconType = {
  cross: {
    type: 'component',
    render: (props: IconProps) => (
      <Cross height={props.size} width={props.size} color={props.color} />
    ),
  },
  check: {
    type: 'component',
    render: (props: IconProps) => (
      <Check height={props.size} width={props.size} color={props.color} />
    ),
  },
}

const d: IconType = {
  'defaule-avatar': {
    type: 'component',
    render: (props: IconProps) => (
      <DefaultAvatar height={props.size} width={props.size} color={props.color} />
    ),
  },
}

const p: IconType = {
  'pencil-simple': {
    type: 'component',
    render: (props: IconProps) => (
      <PemcilSimple height={props.size} width={props.size} color={props.color} />
    ),
  },
}

const t: IconType = {
  'tab-navigator': {
    type: 'component',
    render: (props: IconProps) => (
      <Authenticator height={props.size} width={props.size} color={props.color} />
    ),
  },
  'tab-home': {
    type: 'component',
    render: (props: IconProps) => (
      <Home height={props.size} width={props.size} color={props.color} />
    ),
  },
  'tab-menu2': {
    type: 'component',
    render: (props: IconProps) => (
      <Menu2 height={props.size} width={props.size} color={props.color} />
    ),
  },
  'tab-menu': {
    type: 'component',
    render: (props: IconProps) => (
      <Menu height={props.size} width={props.size} color={props.color} />
    ),
  },
  'tab-settings': {
    type: 'component',
    render: (props: IconProps) => (
      <Settings height={props.size} width={props.size} color={props.color} />
    ),
  },
}

const u: IconType = {
  'user-plus': {
    type: 'component',
    render: (props: IconProps) => (
      <UserPlus height={props.size} width={props.size} color={props.color} />
    ),
  },
  'user-minus': {
    type: 'component',
    render: (props: IconProps) => (
      <UserMinus height={props.size} width={props.size} color={props.color} />
    ),
  },
}

export const icons: IconType = {
  ...a,
  ...b,
  ...c,
  ...e,
  ...d,
  ...p,
  ...t,
  ...u,
}

export type IconTypes = keyof typeof icons
