export const BROWSE_ITEMS = {
  folder: {
    label: 'Folders',
    icon: require('./images/icons/folder.png'),
    routeName: 'folders',
    addable: false
  },
  password: {
    label: 'Passwords',
    icon: require('./images/icons/password.png'),
    routeName: 'passwords',
    addable: true
  },
  note: {
    label: 'Secure Notes',
    icon: require('./images/icons/note.png'),
    routeName: 'notes',
    addable: true
  },
  card: {
    label: 'Cards',
    icon: require('./images/icons/card.png'),
    routeName: 'cards',
    addable: true
  },
  identity: {
    label: 'Personal Info',
    icon: require('./images/icons/info.png'),
    routeName: 'identities',
    addable: true
  },
  shared: {
    label: 'Shared Items',
    icon: require('./images/icons/shared.png'),
    routeName: 'shares',
    addable: false
  },
  trash: {
    label: 'Trash',
    icon: require('./images/icons/trash.png'),
    routeName: 'trash',
    addable: false
  }
}

export const TOOLS_ITEMS = {
  passwordGenerator: {
    label: 'Password Generator',
    desc: 'Quickly generate new secure password',
    icon: require('./images/icons/password-generator.png'),
    routeName: 'passwordGenerator'
  },
  passwordHealth: {
    label: 'Password Health',
    desc: 'Identify passwords that can put you at risk',
    icon: require('./images/icons/password-health.png'),
    routeName: 'passwordHealth'
  },
  dataBreachScanner: {
    label: 'Data Breach Scanner',
    desc: 'Check if sensitive data is leaked online',
    icon: require('./images/icons/data-breach-scanner.png'),
    routeName: 'dataBreachScanner'
  }
}

export const FOLDER_IMG = {
  add: {
    img: require('./images/folder/folder-add.png')
  },
  share: {
    img: require('./images/folder/folder-share.png')
  },
  normal: {
    img: require('./images/folder/folder.png')
  }
}
