<h1 align="center">Twilio Agentic Service</h1>

## Intro

[Twilio][twilio] allows software developers to programmatically make and receive phone calls, send and receive text messages, and perform other communication functions using its web service APIs. Agentic provides a simple interface to Twilio's APIs for sending text messages (SMS) and optionally waiting for a reply from the recipient as part of an agentic workflow.

Twilio offers a free [trial account][twilio-trial] with a small balance that you can use to test out the service. However, you will need to upgrade to a paid plan to use this service in production. Among other [restrictions][twilio-restrictions], the trial requires to verify any non-Twilio phone number before you can send text messages to it.

## Pre-requisites

Ensure the following environment variables are set:

- `TWILIO_ACCOUNT_SID`: Your Twilio account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio auth token
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number from which the Agentic service will send text messages
- `TWILIO_DEFAULT_RECIPIENT_PHONE_NUMBER`: The default recipient phone number to use if none is specified in the workflow

Otherwise, these can be passed directly to the `TwilioConversationClient` constructor.

### How to get your Twilio credentials

1. Open the [Twilio console][twilio-console] and log in or create an account.

2. In the "Account Info" box, click on the "Copy to clipboard" buttons next to the "Account SID", "Auth Token", and "My Twilio phone number" fields to copy the respective value to your clipboard.

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-09/74c8d823-b6ea-4b75-981a-a54b09044cfd/user_cropped_screenshot.jpeg?tl_px=245,189&br_px=1365,819&sharp=0.8&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-labs-public.s3.us-east-2.amazonaws.com/images/watermarks/watermark_default.png&wat_pad=472,139)

[twilio]: https://www.twilio.com
[twilio-trial]: https://support.twilio.com/hc/en-us/articles/223136107-How-does-Twilio-s-Free-Trial-work-
[twilio-restrictions]: https://support.twilio.com/hc/en-us/articles/360036052753-Twilio-Free-Trial-Limitations
[twilio-console]: https://www.twilio.com/console
