import 'dotenv/config'

import { ExaClient } from '@agentic/stdlib'
import restoreCursor from 'restore-cursor'

/**
 * Scratch pad for testing.
 */
async function main() {
  restoreCursor()

  // const clearbit = new ClearbitClient()
  // const res = await clearbit.companyEnrichment({
  //   domain: 'https://clay.com'
  // })
  // console.log(JSON.stringify(res, null, 2))

  // const proxycurl = new ProxycurlClient()
  // const res = await proxycurl.getLinkedInPerson({
  //   linkedin_profile_url: 'https://linkedin.com/in/fisch2'
  // })
  // console.log(JSON.stringify(res, null, 2))

  // const wikipedia = new WikipediaClient()
  // const res = await wikipedia.getPageSummary({
  //   // title: 'Naruto_(TV_series)'
  //   title: 'SpaceX'
  // })
  // console.log(JSON.stringify(res, null, 2))

  // const searxng = new SearxngClient()
  // const res = await searxng.search({
  //   query: 'golden gate bridge',
  //   engines: ['reddit']
  // })
  // console.log(JSON.stringify(res, null, 2))

  // const perigon = new PerigonClient()
  // const res = await perigon.searchArticles({
  //   q: 'AI agents AND startup',
  //   sourceGroup: 'top50tech'
  // })
  // console.log(JSON.stringify(res, null, 2))

  // const firecrawl = new FirecrawlClient()
  // const res = await firecrawl.scrapeUrl({
  //   url: 'https://www.bbc.com/news/articles/cp4475gwny1o'
  //   // url: 'https://www.theguardian.com/technology/article/2024/jun/04/openai-google-ai-risks-letter'
  //   // url: 'https://www.firecrawl.dev'
  // })
  // console.log(JSON.stringify(res, null, 2))

  // const exa = new ExaClient()
  // const res = await exa.search({
  //   query: 'OpenAI',
  //   contents: { text: true }
  // })
  // console.log(JSON.stringify(res, null, 2))

  // const diffbot = new DiffbotClient()
  // // const res = await diffbot.analyzeUrl({
  // //   url: 'https://www.bbc.com/news/articles/cp4475gwny1o'
  // // })
  // const res = await diffbot.enhanceEntity({
  //   type: 'Person',
  //   name: 'Kevin Raheja'
  // })
  // console.log(JSON.stringify(res, null, 2))

  // const wolfram = new WolframAlphaClient()
  // const res = await wolfram.ask({
  //   input: 'population of new york city'
  // })
  // console.log(res)

  // const client = await createTwitterV2Client({
  //   scopes: ['tweet.read', 'users.read', 'offline.access']
  // })
  // const twitter = new TwitterClient({ client })
  // // const res = await twitter.findUserByUsername({ username: 'transitive_bs' })
  // const res = await twitter.searchRecentTweets({
  //   query: 'open source AI agents'
  // })
  // console.log(res)

  // const midjourney = new MidjourneyClient()
  // const res = await midjourney.imagine(
  //   'tiny lil baby kittens playing with an inquisitive AI robot, kawaii, anime'
  // )
  // console.log(JSON.stringify(res, null, 2))

  // const bing = new BingClient()
  // const res = await bing.search({
  //   q: 'world cup 2024 freestyle wrestling news'
  // })
  // console.log(JSON.stringify(res, null, 2))

  // const tavily = new TavilyClient()
  // const res = await tavily.search({
  //   query: 'when do experts predict that OpenAI will release GPT-5?',
  //   include_answer: true
  // })
  // console.log(JSON.stringify(res, null, 2))

  // const socialData = new SocialDataClient()
  // const res = await socialData.getUserByUsername('transitive_bs')
  // console.log(JSON.stringify(res, null, 2))

  // const hunter = new HunterClient()
  // // const res = await hunter.emailVerifier({
  // //   email: 'travis@transitivebullsh.it'
  // // })
  // const res = await hunter.emailFinder({
  //   domain: 'aomni.com',
  //   first_name: 'David',
  //   last_name: 'Zhang'
  // })
  // console.log(JSON.stringify(res, null, 2))

  // const jina = new JinaClient()
  // const res = await jina.readUrl({
  //   url: 'https://news.ycombinator.com'
  //   // returnFormat: 'screenshot'
  //   // json: true
  // })
  // const res = await jina.search({
  //   query: 'trump assassination attempt',
  //   // returnFormat: 'screenshot',
  //   json: true
  // })

  const exa = new ExaClient()
  const res = await exa.search({
    query: 'OpenAI',
    category: 'fodojdifjoidfj'
  })

  console.log(JSON.stringify(res, null, 2))
}

await main()
