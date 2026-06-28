export function capitalizeBackendText(value: string | null | undefined) {
  if (!value) {
    return ''
  }

  const firstChar = value[0]

  if (!firstChar) {
    return value
  }

  return `${firstChar.toLocaleUpperCase('ru-RU')}${value.slice(1)}`
}
