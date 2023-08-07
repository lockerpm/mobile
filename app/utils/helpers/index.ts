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

// export const getUrlParameterByName = (name: string, url: string) => {
//   name = name.replace(/[\[\]]/g, "\\$&")
//   const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)")
//   const results = regex.exec(url)
//   if (!results) return null
//   if (!results[2]) return ""
//   return decodeURIComponent(results[2].replace(/\+/g, " "))
// }

export const getUrlParameterByName = (name: string, url: string) => {
  var regex = /[?&]([^=#]+)=([^&#]*)/g, params = {},  match
  while ((match = regex.exec(url))) {
    params[match[1]] = match[2]
  }
  return params[name] || ''
}
