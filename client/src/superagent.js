import superagent from 'superagent'
import superagentUse from 'superagent-use'
import prefix from 'superagent-prefix'

const agent = superagentUse(superagent)

agent.use(prefix(process.env.VUE_APP_API || 'http://localhost:5000'))

export default agent
