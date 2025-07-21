import isEqual from "lodash/isEqual"

type ItemProps = {
  [key: string]: any
}

export const shouldRerenderItem = (ignoreProps: string[]) => {
  return (prev: ItemProps, next: ItemProps) => {
    const prevProps = Object.keys(prev)
    const nextProps = Object.keys(next)
    if (!isEqual(prevProps, nextProps)) {
      return false
    }
    const isPropsEqual = prevProps.reduce((val, key) => {
      if (ignoreProps.includes(key)) {
        return val
      }
      return val && isEqual(prev[key], next[key])
    }, true)
    return isPropsEqual
  }
}

export const getUrlParameterByName = (name: string, url: string) => {
  const regex = /[?&]([^=#]+)=([^&#]*)/g
  const params: Record<string, string> = {}
  let match
  while ((match = regex.exec(url))) {
    params[match[1]] = match[2]
  }
  return params[name] || ""
}

export const validateEmail = (email: string) => {
  // eslint-disable-next-line prefer-regex-literals
  const globalRegex = new RegExp(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    "g"
  )
  return globalRegex.test(email)
}

/**
 * A debounce utility function that ensures the callback is executed only once
 * during rapid successive calls within the specified delay.
 * This implementation includes a "leading" behavior, meaning it executes
 * immediately on the first call.
 *
 * @param fn - The callback function to be debounced
 * @param delay - The delay in milliseconds before allowing another execution
 * @returns A debounced version of the callback function
 */
export const debounce = (fn: () => void, delay: number) => {
  let timeout: NodeJS.Timeout
  let isLeading = true
  return () => {
    if (isLeading) {
      fn()
      isLeading = false
    }
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      isLeading = true
    }, delay)
  }
}
