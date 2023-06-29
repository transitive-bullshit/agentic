<h1 align="center">Slack Agentic Service</h1>

## Intro

[Slack][slack] is a popular messaging platform for teams. This service provides a simple interface for sending notification messages to Slack channels as part of an Agentic workflow, and optionally to block until a response is received. It is implemented using the [Slack Web API][slack-web-api].

## Pre-requisites

Ensure the following environment variable are set:

- `SLACK_API_KEY`: Slack API key
- `SLACK_DEFAULT_CHANNEL`: ID of Slack channel to send messages to unless otherwise specified

You may provide these alternatively when instantiating the service via the `apiKey` and `defaultChannel` options of the `SlackClient` constructor.

### How to Retrieve an API Key

1. Go to https://api.slack.com/apps
2. Click "Create New App".

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-10/eac4303d-9052-4f89-a069-0753c42f5666/ascreenshot.jpeg?tl_px=1007,0&br_px=2127,630&force_format=png&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=262,85)

3. Use the second option "From an app manifest" so we can reuse a YAML configuration with the required permissions. If you prefer to use the first option, you will need to manually add the required permissions later on under "OAuth & Permissions".

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-10/37ed26ab-ceb1-4a94-a25d-bba6f95a2ebc/ascreenshot.jpeg?tl_px=715,508&br_px=1835,1138&force_format=png&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=262,139)

4. Click on the dropdown menu to select the workspace the application should belong to and click "Next".

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-10/56561c09-6260-4ef6-ac72-28b1c104b7b4/ascreenshot.jpeg?tl_px=527,298&br_px=1647,928&force_format=png&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=262,139)

5. Copy the below YAML content into the editor to overwrite the defaults:

   ```yaml
   display_information:
     name: AgenticBot
   features:
     bot_user:
       display_name: AgenticBot
       always_online: false
   oauth_config:
     scopes:
       bot:
         - channels:history
         - channels:read
         - chat:write
         - chat:write.public
         - channels:join
   settings:
     org_deploy_enabled: false
     socket_mode_enabled: false
     token_rotation_enabled: false
   ```

   Feel free to choose a different name and change the scopes as needed. The scopes above are the minimum required for the Agentic Slack service to function. Click "Next" when you are done.

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-10/fc6a2439-6961-45a2-8059-3df1b923f17a/ascreenshot.jpeg?tl_px=817,445&br_px=1937,1075&force_format=png&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=262,139)

6. Review the OAuth scopes and enabled features and proceed by clicking "Create"

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-10/94d883e4-9059-423a-88ad-a447353edd76/ascreenshot.jpeg?tl_px=922,531&br_px=2042,1161&force_format=png&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=262,139)

7. Click "Install to Workspace" to install your application to your workspace:

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-10/8daf26cc-d412-4a4e-9b3e-81e38a81f5c6/ascreenshot.jpeg?tl_px=278,553&br_px=1398,1183&force_format=png&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=262,139)

8. Almost there! To obtain the API key for the Agentic Service, click "OAuth & Permissions" in the left navigation menu of the Slack Dashboard of your application and scroll down to the "OAuth Tokens for Your Workspace" section.

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-10/c34e3efc-02cd-4aa8-a4d3-9a9fe2395118/user_cropped_screenshot.jpeg?tl_px=0,254&br_px=1120,884&force_format=png&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=66,162)

9. Click "Copy" to copy the Bot User OAuth API Key to your clipboard.

![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-10/6ee4a836-2e62-4eb9-adbf-6d17b2fc5184/user_cropped_screenshot.jpeg?tl_px=0,0&br_px=1086,517&force_format=png&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=487,134)

### How to Retrieve Channel ID

1. Right-click the channel name in the left sidebar to which you want to send messages. Below, we use the private channel of the created app to avoid cluttering other channels and to not have others receive and respond to messages sent by an Agentic workflow. However, you may use any channel the created Slack application has access to.

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-10/dd8ea24f-1077-4c64-8091-013889fac9f1/user_cropped_screenshot.jpeg?tl_px=0,0&br_px=993,517&force_format=png&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=58,151)

2. Click on "View app details" or "View channel details" in the dropdown menu.

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-10/a95c4834-c36e-4813-8998-34a8cdf81782/user_cropped_screenshot.jpeg?tl_px=0,0&br_px=479,630&force_format=png&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=358,103)

3. Click on the "Copy channel id" icon button next to the "Channel ID" to copy the ID to your clipboard.

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-10/72e528b7-58b4-46ca-a361-deb44dcb0b53/user_cropped_screenshot.jpeg?tl_px=0,246&br_px=933,876&force_format=png&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=201,171)

[slack]: https://slack.com
[slack-web-api]: https://api.slack.com/web
