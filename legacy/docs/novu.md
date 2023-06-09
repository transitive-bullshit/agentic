<h1 align="center">Novu Agentic Service</h1>

## Intro

[Novu][novu] provides open-source notification infrastructure for all communication channels in one place: Email, SMS, Direct, and Push. It integrates with almost all major email providers (Mailgun, Sendgrid, Postmark, etc.), SMS providers (e.g., Twilio or Plivo), and a large selection of push and chat providers (such as OneSignal or Slack) while providing a unified API for sending notifications.

## Pre-requisites

Ensure the following environment variable is set:

- `NOVU_API_KEY` - Novu API key.

Otherwise, you can pass it in as an argument to the `NovuClient` constructor.

### How to Retrieve API Key

1. Open https://web.novu.co and sign in with your existing Novu account credentials (create a new account with your email address and a password or sign in with GitHub if you don't have an account yet.)

2. Navigate to "Settings":

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-08/bc87f12a-6f3b-48ef-af7f-b8f876baf912/ascreenshot.jpeg?tl_px=0,588&br_px=1120,1218&sharp=0.8&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-labs-public.s3.us-east-2.amazonaws.com/images/watermarks/watermark_default.png&wat_pad=82,139)

3. Click "API Keys":

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-08/b1036717-015e-491a-8e98-ad959c3d1e4e/user_cropped_screenshot.jpeg?tl_px=164,0&br_px=1284,630&sharp=0.8&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-labs-public.s3.us-east-2.amazonaws.com/images/watermarks/watermark_default.png&wat_pad=262,83)

4. Click here to copy your API key to your clipboard:

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-08/43c0f398-5896-46dd-aa63-7c4418dc0ea1/user_cropped_screenshot.jpeg?tl_px=461,47&br_px=1581,677&sharp=0.8&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-labs-public.s3.us-east-2.amazonaws.com/images/watermarks/watermark_default.png&wat_pad=452,199)

### Create a Notification Template

For each notification type you want to send, you need to create a template in Novu. This is a one-time setup step that you can do on the Novu web interface. 

It is possible to customize the notification content at each invocation via handlebars-style placeholders. For example, you can create a template for an email notification that looks like this:

```
Hello {{name}},
{{content}}
```

The placeholders will be replaced with the actual values of the `payload` object you pass to the `send` method.

To create a template, follow these steps:

1. Open https://web.novu.co and sign in with your Novu account credentials.

2. Click "Notifications":

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-08/18f9a014-9f47-473f-9ef9-acc25d15ee29/ascreenshot.jpeg?tl_px=0,87&br_px=1120,717&sharp=0.8&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-labs-public.s3.us-east-2.amazonaws.com/images/watermarks/watermark_default.png&wat_pad=61,139)

3. Click "Create Workflow" on the top-right:

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-08/07362d5c-1823-46ee-a6b2-17a363da74d9/user_cropped_screenshot.jpeg?tl_px=317,0&br_px=1437,404&sharp=0.8&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-labs-public.s3.us-east-2.amazonaws.com/images/watermarks/watermark_default.png&wat_pad=415,82)

4. Double-click the "notification name" field and enter the name of the template. For this example, we choose the name `send-sms`. This is the event name with which the respective notification may be triggered from the API.

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-08/ec09f2f6-b79d-4b51-a00e-fa7314fbc62b/ascreenshot.jpeg?tl_px=64,0&br_px=1184,630&sharp=0.8&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-labs-public.s3.us-east-2.amazonaws.com/images/watermarks/watermark_default.png&wat_pad=262,84)

5. To create, for example, a SMS notification template, click and hold "SMS" and drag it to the left underneath the trigger.

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-08/09474128-3c2e-4bec-916f-23236d88b933/ascreenshot.jpeg?tl_px=803,250&br_px=1923,880&sharp=0.8&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-labs-public.s3.us-east-2.amazonaws.com/images/watermarks/watermark_default.png&wat_pad=437,139)

6. Click inside the "SMS message content" text field on the right and enter the content of your SMS, e.g. a handlebars placeholder such as `{{content}}`.

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-08/8cf3d995-5ef4-465c-9a25-43c680e67f8c/ascreenshot.jpeg?tl_px=745,177&br_px=1865,807&sharp=0.8&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-labs-public.s3.us-east-2.amazonaws.com/images/watermarks/watermark_default.png&wat_pad=262,139)

7. When you're done, click "Update" on the top-right.  

You are now ready to send SMS notifications via the API! For example, to manually trigger a notification via the Agentic Novu Service client:

```ts
import { NovuClient } from '@agentic/core'

const client = new NovuClient()

client.triggerEvent('send-sms', { content: 'Hello World!' }, [{
  subscriberId: '1',
  name: 'Jane Doe',
  email: 'jane.doe-123@hotmail.com'
  phone: '+11234567890'
}])
```

The `subscriberId` is a required field with the ID of the subscriber in Novu. If a subscriber with a provided `subscriberId` does not exist yet in Novu, a new subscriber will be created before the trigger will be executed synchronously. You can find more information about subscribers [in the official Novu documentation][novu-subscribers].

[novu]: https://novu.co/
[novu-subscribers]: https://docs.novu.co/platform/subscribers
