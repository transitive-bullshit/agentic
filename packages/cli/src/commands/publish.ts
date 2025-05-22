import { Command } from 'commander'
// import ora from 'ora'

export const publish = new Command('publish')
  .description('Publishes a deployment')
  .argument('[deploymentId]', 'deployment ID')
  .action(async (_opts) => {
    // const spinner = ora('Publishing deployment').start()
    // try {
    //   const deployment = await client.publishDeployment(
    //     { version: '1.0.0' },
    //     { deploymentId }
    //   )
    //   spinner.succeed('Deployment published successfully')
    //   console.log(JSON.stringify(deployment, null, 2))
    // } catch (err) {
    //   spinner.fail('Failed to publish deployment')
    //   console.error(err)
    //   process.exit(1)
    // }
  })
