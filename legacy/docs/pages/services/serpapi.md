<h1 align="center">SerpAPI Agentic Service</h1>

## Intro

[SerpApi][serpapi] is a service that provides a simple API to scrape Google search results.

## Pre-requisites

Ensure the following environment variable is set:

- `SERPAPI_API_KEY` - API key for SerpAPI.

Otherwise, you can pass it in as an argument to the `SerpAPIClient` constructor.

### How to Retrieve API Key

1. Navigate to the [SerpAPI dashboard][serpapi-dashboard].

2. If you are not already logged in, you will be greeted by a signup screen. Click "Register" or "Sign in" depending on whether you already have an account. If you are registering, you will need to verify your email address and phone number before you can proceed. As of this writing, SerpAPI is free to use for up to 100 searches per month on the free plan, so depending on your use case, you may not need to upgrade to a paid plan to use this service. For more information, see [their pricing information][serpapi-pricing].

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-09/33f3c072-91ab-4289-a2be-0bbdfcf5b48c/user_cropped_screenshot.jpeg?tl_px=369,0&br_px=1489,630&sharp=0.8&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-labs-public.s3.us-east-2.amazonaws.com/images/watermarks/watermark_default.png&wat_pad=262,105)

3. Inside the "Your Private API Key" box, click on the button to the right to copy the API key to your clipboard. You can also find your API key by clicking on "Api Key" in the left sidebar.

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-09/bcf72167-0023-4711-9cc0-719046e13714/user_cropped_screenshot.jpeg?tl_px=1265,547&br_px=2385,1177&sharp=0.8&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-labs-public.s3.us-east-2.amazonaws.com/images/watermarks/watermark_default.png&wat_pad=480,216)

[serpapi]: https://serpapi.com
[serpapi-dashboard]: https://serpapi.com/dashboard
[serpapi-pricing]: https://serpapi.com/pricing
