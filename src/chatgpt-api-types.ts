/**
 * https://chat.openapi.com/api/auth/session
 */
export type SessionResult = {
  /**
   * Object of the current user
   */
  user: APIUser

  /**
   * ISO date of the expiration date of the access token
   */
  expires: string

  /**
   * The access token
   */
  accessToken: string
}

export type APIUser = {
  /**
   * ID of the user
   */
  id: string

  /**
   * Name of the user
   */
  name: string

  /**
   * Email of the user
   */
  email: string

  /**
   * Image of the user
   */
  image: string

  /**
   * Picture of the user
   */
  picture: string

  /**
   * Groups the user is in
   */
  groups: string[] | []

  /**
   * Features the user is in
   */
  features: string[] | []
}

/**
 * https://chat.openapi.com/backend-api/models
 */
export type ModelsResult = {
  /**
   * Array of models
   */
  models: APIModel[]
}

export type APIModel = {
  /**
   * Name of the model
   */
  slug: string

  /**
   * Max tokens of the model
   */
  max_tokens: number

  /**
   * Whether or not the model is special
   */
  is_special: boolean
}

/**
 * https://chat.openapi.com/backend-api/moderations
 */
export type ModerationsJSONBody = {
  /**
   * Input for the moderation decision
   */
  input: string

  /**
   * The model to use in the decision
   */
  model: AvailableModerationModels
}

export type AvailableModerationModels = 'text-moderation-playground'

/**
 * https://chat.openapi.com/backend-api/moderations
 */
export type ModerationsJSONResult = {
  /**
   * Whether or not the input is flagged
   */
  flagged: boolean

  /**
   * Whether or not the input is blocked
   */
  blocked: boolean

  /**
   * The ID of the decision
   */
  moderation_id: string
}

/**
 * https://chat.openapi.com/backend-api/conversation
 */
export type ConversationJSONBody = {
  /**
   * The action to take
   */
  action: string

  /**
   * The ID of the conversation
   */
  conversation_id?: string

  /**
   * Prompts to provide
   */
  messages: APIPrompt[]

  /**
   * The model to use
   */
  model: string

  /**
   * The parent message ID
   */
  parent_message_id: string
}

export type APIPrompt = {
  /**
   * The content of the prompt
   */
  content: APIPromptContent

  /**
   * The ID of the prompt
   */
  id: string

  /**
   * The role played in the prompt
   */
  role: APIPromptRole
}

export type APIPromptContent = {
  /**
   * The content type of the prompt
   */
  content_type: APIPromptContentType

  /**
   * The parts to the prompt
   */
  parts: string[]
}

export type APIPromptContentType = 'text'

export type APIPromptRole = 'user'

/**
 * https://chat.openapi.com/backend-api/conversation/message_feedback
 */
export type MessageFeedbackJSONBody = {
  /**
   * The ID of the conversation
   */
  conversation_id: string

  /**
   * The message ID
   */
  message_id: string

  /**
   * The rating
   */
  rating: APIMessageFeedbackRating

  /**
   * Tags to give the rating
   */
  tags?: APIMessageFeedbackTags[]

  /**
   * The text to include
   */
  text?: string
}

export type APIMessageFeedbackTags = 'harmful' | 'false' | 'not-helpful'

export type MessageFeedbackResult = {
  /**
   * The message ID
   */
  message_id: string

  /**
   * The ID of the conversation
   */
  conversation_id: string

  /**
   * The ID of the user
   */
  user_id: string

  /**
   * The rating
   */
  rating: APIMessageFeedbackRating

  /**
   * The text the server received, including tags
   */
  text?: string
}

export type APIMessageFeedbackRating = 'thumbsUp' | 'thumbsDown'
