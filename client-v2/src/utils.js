import { DateTime } from 'luxon'
export const dateToSeconds = d => DateTime.fromISO(d).toSeconds()

export const displayFormat = 'HH:mm:ss, MMM dd, yyyy'
export const pikrDisplayFormat = 'M d, Y at H:i'
