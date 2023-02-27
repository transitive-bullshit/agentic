import readline from "readline";
import dotenv from 'dotenv-safe'
import { oraPromise } from 'ora'

import { ChatGPTAPI } from '../src'

dotenv.config()

/**
 * Demo CLI for testing conversation between the user and the ChatGPT model real-time.
 *
 * ```
 * npx tsx demos/demo-chatbot.ts
 * ```
 */
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const api = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY,
    debug: false
})

async function main() {
   
    console.log("ChatGPT Started!");
    rl.setPrompt("> ");
    rl.prompt();

    rl.on('line', async (userQuestion) => {
        let res = await oraPromise(api.sendMessage(userQuestion), {
            text: userQuestion
         })
                
        console.log('\n' + res.text + '\n')
     });
    
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})

  


