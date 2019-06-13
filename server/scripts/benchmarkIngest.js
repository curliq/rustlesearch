const {Client} = require('@elastic/elasticsearch')

const client = new Client({
  node: process.env.ELASTIC_LOCATION,
})
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const average = arr => arr.reduce((a, b) => a + b, 0) / arr.length

const getCount = async() => {
  const result = await client.count({
    index: process.env.INDEX_NAME,
  })
  return result.body.count
}

const main = async() => {
  const res1 = await getCount()
  console.log('1st:', res1)
  await sleep(1000 * 60)
  const res2 = await getCount()
  console.log('2nd:', res2)
  await sleep(1000 * 60)
  const res3 = await getCount()
  console.log('3rd:', res3)
  console.log(average([res2 - res1, res3 - res2]))
}

main()
