<h1 align="center">Bing Web Search Agentic Service</h1>

## Intro

[Bing Web Search][bing-web-search] provides the ability to comb billions of webpages, images, videos, and news with a single API call. It provides a set of search results that match the query parameters specified in the API request.

## Pre-requisites

Ensure the following environment variable is set:

- `BING_API_KEY` - API key for the Bing Web Search service

Otherwise, you can pass it in as an argument to the `BingWebSearchClient` constructor.

### How to Retrieve API Key

1. Open https://www.microsoft.com/en-us/bing/apis/bing-web-search-api in your browser and click the "Try Now" button to create a Bing Web Search resource in your Azure account.

2. On the opened "Create a Bing search resource" screen, enter your Subscription name and Resource group name. If you don't have a resource group, you can create one by clicking "Create new" and entering a name for the resource group. Enter a name for the search resource and select a region.

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-14/fb65476e-3619-41df-bea2-44a438f9772e/ascreenshot.jpeg?tl_px=290,424&br_px=1410,1054&force_format=png&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=262,139)

3. Under the "Select a pricing tier" dropdown, select **F1 (3 Calls per second, 1k Calls per month)** for the free tier. See [Bing Web Search pricing][bing-web-search-pricing] for more information about the available pricing tiers.

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-14/5fa212c2-574e-4800-b245-96b121a4f47c/ascreenshot.jpeg?tl_px=655,576&br_px=1775,1206&force_format=png&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=262,139)

4. After reviewing the terms and conditions, tick the checkbox and click "Review + create". Review the information on the next screen and click "Create" to create the resource.

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-14/c52f825b-f591-4ab7-8a91-3490f6bde4c4/ascreenshot.jpeg?tl_px=0,750&br_px=1120,1380&force_format=png&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=249,276)

5. Once the resource has been deployed, navigate to it and click on the "Keys and Endpoint" link in the left sidebar:

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-14/b37dbdd2-553e-4736-b341-3e540d492eb2/user_cropped_screenshot.jpeg?tl_px=0,318&br_px=1120,948&force_format=png&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=228,139)

6. Click the "Copy to clipboard" button next to the "Key 1" value to copy the API key to your clipboard (or click "Show" to reveal the key and copy it manually). The other key is a backup key that can be used if the first key is revoked or regenerated.

   ![](https://ajeuwbhvhr.cloudimg.io/colony-recorder.s3.amazonaws.com/files/2023-06-14/993cb2f5-b632-46d4-b81a-43860575794a/user_cropped_screenshot.jpeg?tl_px=792,125&br_px=1912,755&force_format=png&width=560&wat_scale=50&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=521,139)

[bing-web-search]: https://azure.microsoft.com/en-us/services/cognitive-services/bing-web-search-api
[bing-web-search-pricing]: https://azure.microsoft.com/en-us/pricing/details/cognitive-services/search-api/web/
