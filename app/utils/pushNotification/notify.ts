import notifee, { Notification, AndroidLaunchActivityFlag } from '@notifee/react-native'

// Display push notification
export const notify = async (data: Notification) => {
  // Create a channel
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  })
  // Display a notification
  await notifee.displayNotification({
    ...data,
    android: {
      channelId,
      pressAction: {
        launchActivity: 'default',
        id: 'default',
        launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
      },
      // smallIcon: 'locker_small',
      color: '#268334',
    },
  })
}
