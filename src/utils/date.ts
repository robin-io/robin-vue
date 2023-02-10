const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()

const formatTimestamp = (date: Date, format?: string) => {
  let timestampFormat = isSameDay(date, new Date()) ? 'h:mma' : format ? 'YYYY-MM-DD' : 'MMM DD YYYY'

  if (format) {
    timestampFormat = format
  } else {
    if (isSameDay(date, new Date())) {
      timestampFormat = 'h:mma'
    } else {
      timestampFormat = 'MMM DD YYYY'
    }
  }

  switch (timestampFormat) {
    case 'h:mma': {
      const options: Record<string, any> = { hour: 'numeric', minute: 'numeric', hour12: true }
      return getDate(options, date)
    }
    case 'MMM DD YYYY': {
      const options: Record<string, any> = { year: 'numeric', month: 'short', day: 'numeric' }
      return getDate(options, date)
    }
    case 'YYYY-MM-DD': {
      const options: Record<string, string> = { year: 'numeric', month: '2-digit', day: '2-digit' }
      return getDate(options, date)
    }
    default:
      return date.getSeconds() + ' secs'
  }
}

const getDate = (options: ObjectType, date: Date): string => {
  try {
    return new Intl.DateTimeFormat('en-US', options).format(date)
  } catch (e) {
    return ''
  }
}

export { formatTimestamp, isSameDay }
