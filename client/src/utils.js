import {DateTime} from 'luxon'

export const getToday = () => DateTime.utc().toFormat('yyyy/MM/dd')
export const dateToSeconds = d =>
  DateTime.fromFormat(d, 'yyyy/MM/dd').toSeconds()
