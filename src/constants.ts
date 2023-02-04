// NOTE: this is not a public model, but it was leaked by the ChatGPT webapp.
// const CHATGPT_MODEL = 'text-chat-davinci-002-20230126'
export const CHATGPT_MODEL = 'text-chat-davinci-002-20221122'

export const USER_LABEL_DEFAULT = 'User'
export const ASSISTANT_LABEL_DEFAULT = 'ChatGPT'

export const API_BASE_URL = 'https://api.openai.com'

export const COMPLETION_PARAMS_DEFAULT = {
  model: CHATGPT_MODEL,
  temperature: 0.7,
  presence_penalty: 0.6,
  stop: ['<|im_end|>']
}

export const USER_ROLE = 'user'
export const ASSISTANT_ROLE = 'assistant'

export const API_SEE_DONE_MESSAGE = '[DONE]'
