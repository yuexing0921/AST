import { getAPISchema as run } from "./schema/index"

run('demo/index.ts').then(resp => {
    console.dir(resp)
})