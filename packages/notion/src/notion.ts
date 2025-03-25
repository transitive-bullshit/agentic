import { z } from 'zod'

export namespace notion {
  export const apiBaseUrl = 'https://api.notion.so'

  // -----------------------------------------------------------------------------
  // Component schemas
  // -----------------------------------------------------------------------------

  export const UserObjectResponseSchema = z.object({
    object: z.literal('user'),
    id: z.string(),
    type: z.enum(['person', 'bot']),
    name: z.string(),
    avatar_url: z.string()
  })
  export type UserObjectResponse = z.infer<typeof UserObjectResponseSchema>

  export const AnnotationRequestSchema = z.object({
    bold: z.boolean().optional(),
    italic: z.boolean().optional(),
    strikethrough: z.boolean().optional(),
    underline: z.boolean().optional(),
    code: z.boolean().optional(),
    color: z
      .enum([
        'default',
        'gray',
        'brown',
        'orange',
        'yellow',
        'green',
        'blue',
        'purple',
        'pink',
        'red',
        'gray_background',
        'brown_background',
        'orange_background',
        'yellow_background',
        'green_background',
        'blue_background',
        'purple_background',
        'pink_background',
        'red_background'
      ])
      .optional()
  })
  export type AnnotationRequest = z.infer<typeof AnnotationRequestSchema>

  export const DateRequestSchema = z.object({
    start: z.string(),
    end: z.union([z.string(), z.null()]).optional(),
    time_zone: z.union([z.string(), z.null()]).optional()
  })
  export type DateRequest = z.infer<typeof DateRequestSchema>

  export const PageObjectResponseSchema = z.object({
    object: z.literal('page'),
    id: z.string(),
    created_time: z.string(),
    last_edited_time: z.string(),
    archived: z.boolean(),
    url: z.string()
  })
  export type PageObjectResponse = z.infer<typeof PageObjectResponseSchema>

  export const PartialPageObjectResponseSchema = z.object({
    object: z.literal('page'),
    id: z.string()
  })
  export type PartialPageObjectResponse = z.infer<
    typeof PartialPageObjectResponseSchema
  >

  export const PropertyItemObjectResponseSchema = z.object({
    type: z.string(),
    id: z.string()
  })
  export type PropertyItemObjectResponse = z.infer<
    typeof PropertyItemObjectResponseSchema
  >

  export const PartialBlockObjectResponseSchema = z.object({
    object: z.literal('block'),
    id: z.string()
  })
  export type PartialBlockObjectResponse = z.infer<
    typeof PartialBlockObjectResponseSchema
  >

  export const BlockObjectResponseSchema = z.object({
    object: z.literal('block'),
    id: z.string(),
    type: z.string(),
    created_time: z.string(),
    last_edited_time: z.string(),
    has_children: z.boolean(),
    archived: z.boolean()
  })
  export type BlockObjectResponse = z.infer<typeof BlockObjectResponseSchema>

  export const TitlePropertyResponseSchema = z.object({
    id: z.string(),
    type: z.literal('title'),
    title: z.record(z.any())
  })
  export type TitlePropertyResponse = z.infer<
    typeof TitlePropertyResponseSchema
  >

  export const RichTextPropertyResponseSchema = z.object({
    id: z.string(),
    type: z.literal('rich_text'),
    rich_text: z.record(z.any())
  })
  export type RichTextPropertyResponse = z.infer<
    typeof RichTextPropertyResponseSchema
  >

  export const NumberPropertyResponseSchema = z.object({
    id: z.string(),
    type: z.literal('number'),
    number: z.object({ format: z.string() })
  })
  export type NumberPropertyResponse = z.infer<
    typeof NumberPropertyResponseSchema
  >

  export const SelectOptionSchema = z.object({
    id: z.string(),
    name: z.string(),
    color: z.string()
  })
  export type SelectOption = z.infer<typeof SelectOptionSchema>

  export const DatePropertyResponseSchema = z.object({
    id: z.string(),
    type: z.literal('date'),
    date: z.record(z.any())
  })
  export type DatePropertyResponse = z.infer<typeof DatePropertyResponseSchema>

  export const PeoplePropertyResponseSchema = z.object({
    id: z.string(),
    type: z.literal('people'),
    people: z.record(z.any())
  })
  export type PeoplePropertyResponse = z.infer<
    typeof PeoplePropertyResponseSchema
  >

  export const FilePropertyResponseSchema = z.object({
    id: z.string(),
    type: z.literal('files'),
    files: z.record(z.any())
  })
  export type FilePropertyResponse = z.infer<typeof FilePropertyResponseSchema>

  export const CheckboxPropertyResponseSchema = z.object({
    id: z.string(),
    type: z.literal('checkbox'),
    checkbox: z.record(z.any())
  })
  export type CheckboxPropertyResponse = z.infer<
    typeof CheckboxPropertyResponseSchema
  >

  export const UrlPropertyResponseSchema = z.object({
    id: z.string(),
    type: z.literal('url'),
    url: z.record(z.any())
  })
  export type UrlPropertyResponse = z.infer<typeof UrlPropertyResponseSchema>

  export const EmailPropertyResponseSchema = z.object({
    id: z.string(),
    type: z.literal('email'),
    email: z.record(z.any())
  })
  export type EmailPropertyResponse = z.infer<
    typeof EmailPropertyResponseSchema
  >

  export const PhoneNumberPropertyResponseSchema = z.object({
    id: z.string(),
    type: z.literal('phone_number'),
    phone_number: z.record(z.any())
  })
  export type PhoneNumberPropertyResponse = z.infer<
    typeof PhoneNumberPropertyResponseSchema
  >

  export const FormulaPropertyResponseSchema = z.object({
    id: z.string(),
    type: z.literal('formula'),
    formula: z.object({ expression: z.string() })
  })
  export type FormulaPropertyResponse = z.infer<
    typeof FormulaPropertyResponseSchema
  >

  export const RelationPropertyResponseSchema = z.object({
    id: z.string(),
    type: z.literal('relation'),
    relation: z.object({
      database_id: z.string(),
      synced_property_name: z.string(),
      synced_property_id: z.string()
    })
  })
  export type RelationPropertyResponse = z.infer<
    typeof RelationPropertyResponseSchema
  >

  export const RollupPropertyResponseSchema = z.object({
    id: z.string(),
    type: z.literal('rollup'),
    rollup: z.object({
      relation_property_name: z.string(),
      relation_property_id: z.string(),
      rollup_property_name: z.string(),
      rollup_property_id: z.string(),
      function: z.string()
    })
  })
  export type RollupPropertyResponse = z.infer<
    typeof RollupPropertyResponseSchema
  >

  export const CreatedTimePropertyResponseSchema = z.object({
    id: z.string(),
    type: z.literal('created_time'),
    created_time: z.record(z.any())
  })
  export type CreatedTimePropertyResponse = z.infer<
    typeof CreatedTimePropertyResponseSchema
  >

  export const CreatedByPropertyResponseSchema = z.object({
    id: z.string(),
    type: z.literal('created_by'),
    created_by: z.record(z.any())
  })
  export type CreatedByPropertyResponse = z.infer<
    typeof CreatedByPropertyResponseSchema
  >

  export const LastEditedTimePropertyResponseSchema = z.object({
    id: z.string(),
    type: z.literal('last_edited_time'),
    last_edited_time: z.record(z.any())
  })
  export type LastEditedTimePropertyResponse = z.infer<
    typeof LastEditedTimePropertyResponseSchema
  >

  export const LastEditedByPropertyResponseSchema = z.object({
    id: z.string(),
    type: z.literal('last_edited_by'),
    last_edited_by: z.record(z.any())
  })
  export type LastEditedByPropertyResponse = z.infer<
    typeof LastEditedByPropertyResponseSchema
  >

  export const PartialUserObjectResponseSchema = z.object({
    object: z.literal('user'),
    id: z.string()
  })
  export type PartialUserObjectResponse = z.infer<
    typeof PartialUserObjectResponseSchema
  >

  export const AnnotationResponseSchema = z.object({
    bold: z.boolean(),
    italic: z.boolean(),
    strikethrough: z.boolean(),
    underline: z.boolean(),
    code: z.boolean(),
    color: z.enum([
      'default',
      'gray',
      'brown',
      'orange',
      'yellow',
      'green',
      'blue',
      'purple',
      'pink',
      'red',
      'gray_background',
      'brown_background',
      'orange_background',
      'yellow_background',
      'green_background',
      'blue_background',
      'purple_background',
      'pink_background',
      'red_background'
    ])
  })
  export type AnnotationResponse = z.infer<typeof AnnotationResponseSchema>

  export const DateResponseSchema = z.object({
    start: z.string(),
    end: z.union([z.string(), z.null()]),
    time_zone: z.union([z.string(), z.null()])
  })
  export type DateResponse = z.infer<typeof DateResponseSchema>

  export const PropertyUpdateSchemaSchema = z.object({
    name: z.string().optional(),
    type: z.string().optional()
  })
  export type PropertyUpdateSchema = z.infer<typeof PropertyUpdateSchemaSchema>

  export const TextPropertyFilterSchema = z.object({
    equals: z.string().optional(),
    does_not_equal: z.string().optional(),
    contains: z.string().optional(),
    does_not_contain: z.string().optional(),
    starts_with: z.string().optional(),
    ends_with: z.string().optional(),
    is_empty: z.boolean().optional(),
    is_not_empty: z.boolean().optional()
  })
  export type TextPropertyFilter = z.infer<typeof TextPropertyFilterSchema>

  export const NumberPropertyFilterSchema = z.object({
    equals: z.number().optional(),
    does_not_equal: z.number().optional(),
    greater_than: z.number().optional(),
    less_than: z.number().optional(),
    greater_than_or_equal_to: z.number().optional(),
    less_than_or_equal_to: z.number().optional(),
    is_empty: z.boolean().optional(),
    is_not_empty: z.boolean().optional()
  })
  export type NumberPropertyFilter = z.infer<typeof NumberPropertyFilterSchema>

  export const CheckboxPropertyFilterSchema = z.object({
    equals: z.boolean().optional(),
    does_not_equal: z.boolean().optional()
  })
  export type CheckboxPropertyFilter = z.infer<
    typeof CheckboxPropertyFilterSchema
  >

  export const SelectPropertyFilterSchema = z.object({
    equals: z.string().optional(),
    does_not_equal: z.string().optional(),
    is_empty: z.boolean().optional(),
    is_not_empty: z.boolean().optional()
  })
  export type SelectPropertyFilter = z.infer<typeof SelectPropertyFilterSchema>

  export const MultiSelectPropertyFilterSchema = z.object({
    contains: z.string().optional(),
    does_not_contain: z.string().optional(),
    is_empty: z.boolean().optional(),
    is_not_empty: z.boolean().optional()
  })
  export type MultiSelectPropertyFilter = z.infer<
    typeof MultiSelectPropertyFilterSchema
  >

  export const DatePropertyFilterSchema = z.object({
    equals: z.string().optional(),
    before: z.string().optional(),
    after: z.string().optional(),
    on_or_before: z.string().optional(),
    on_or_after: z.string().optional(),
    past_week: z.any().optional(),
    past_month: z.any().optional(),
    past_year: z.any().optional(),
    next_week: z.any().optional(),
    next_month: z.any().optional(),
    next_year: z.any().optional(),
    is_empty: z.boolean().optional(),
    is_not_empty: z.boolean().optional()
  })
  export type DatePropertyFilter = z.infer<typeof DatePropertyFilterSchema>

  export const PeoplePropertyFilterSchema = z.object({
    contains: z.string().optional(),
    does_not_contain: z.string().optional(),
    is_empty: z.boolean().optional(),
    is_not_empty: z.boolean().optional()
  })
  export type PeoplePropertyFilter = z.infer<typeof PeoplePropertyFilterSchema>

  export const FilesPropertyFilterSchema = z.object({
    is_empty: z.boolean().optional(),
    is_not_empty: z.boolean().optional()
  })
  export type FilesPropertyFilter = z.infer<typeof FilesPropertyFilterSchema>

  export const RelationPropertyFilterSchema = z.object({
    contains: z.string().optional(),
    does_not_contain: z.string().optional(),
    is_empty: z.boolean().optional(),
    is_not_empty: z.boolean().optional()
  })
  export type RelationPropertyFilter = z.infer<
    typeof RelationPropertyFilterSchema
  >

  export const PropertySchemaSchema = z.object({
    type: z.string(),
    name: z.union([z.string(), z.null()]).optional()
  })
  export type PropertySchema = z.infer<typeof PropertySchemaSchema>

  export const SearchParametersSchema = z.object({
    query: z.string().optional(),
    sort: z
      .object({
        direction: z.enum(['ascending', 'descending']),
        timestamp: z.literal('last_edited_time')
      })
      .optional(),
    filter: z
      .object({
        value: z.enum(['page', 'database']),
        property: z.literal('object')
      })
      .optional(),
    start_cursor: z.string().optional(),
    page_size: z.number().int().optional()
  })
  export type SearchParameters = z.infer<typeof SearchParametersSchema>

  export const PartialCommentObjectResponseSchema = z.object({
    object: z.literal('comment'),
    id: z.string()
  })
  export type PartialCommentObjectResponse = z.infer<
    typeof PartialCommentObjectResponseSchema
  >

  export const OauthTokenParametersSchema = z.object({
    grant_type: z.string(),
    code: z.string(),
    redirect_uri: z.string().optional(),
    external_account: z.object({ key: z.string(), name: z.string() }).optional()
  })
  export type OauthTokenParameters = z.infer<typeof OauthTokenParametersSchema>

  export const ListUsersResponseSchema = z.object({
    results: z.array(UserObjectResponseSchema),
    next_cursor: z.union([z.string(), z.null()]),
    has_more: z.boolean()
  })
  export type ListUsersResponse = z.infer<typeof ListUsersResponseSchema>

  export const PropertyItemListResponseSchema = z.object({
    results: z.array(PropertyItemObjectResponseSchema),
    next_cursor: z.union([z.string(), z.null()]),
    has_more: z.boolean()
  })
  export type PropertyItemListResponse = z.infer<
    typeof PropertyItemListResponseSchema
  >

  export const SelectPropertyResponseSchema = z.object({
    id: z.string(),
    type: z.literal('select'),
    select: z.object({ options: z.array(SelectOptionSchema) })
  })
  export type SelectPropertyResponse = z.infer<
    typeof SelectPropertyResponseSchema
  >

  export const MultiSelectPropertyResponseSchema = z.object({
    id: z.string(),
    type: z.literal('multi_select'),
    multi_select: z.object({ options: z.array(SelectOptionSchema) })
  })
  export type MultiSelectPropertyResponse = z.infer<
    typeof MultiSelectPropertyResponseSchema
  >

  export const TextRichTextItemResponseSchema = z.object({
    type: z.literal('text'),
    text: z.object({
      content: z.string(),
      link: z.union([z.object({ url: z.string() }), z.null()])
    }),
    annotations: AnnotationResponseSchema,
    plain_text: z.string(),
    href: z.union([z.string(), z.null()])
  })
  export type TextRichTextItemResponse = z.infer<
    typeof TextRichTextItemResponseSchema
  >

  export const EquationRichTextItemResponseSchema = z.object({
    type: z.literal('equation'),
    equation: z.object({ expression: z.string() }),
    annotations: AnnotationResponseSchema,
    plain_text: z.string(),
    href: z.union([z.string(), z.null()])
  })
  export type EquationRichTextItemResponse = z.infer<
    typeof EquationRichTextItemResponseSchema
  >

  export const ListBlockChildrenResponseSchema = z.object({
    object: z.literal('list'),
    results: z.array(
      z.union([PartialBlockObjectResponseSchema, BlockObjectResponseSchema])
    ),
    next_cursor: z.union([z.string(), z.null()]),
    has_more: z.boolean()
  })
  export type ListBlockChildrenResponse = z.infer<
    typeof ListBlockChildrenResponseSchema
  >

  export const AppendBlockChildrenResponseSchema = z.object({
    object: z.literal('list'),
    results: z.array(
      z.union([PartialBlockObjectResponseSchema, BlockObjectResponseSchema])
    ),
    next_cursor: z.union([z.string(), z.null()]),
    has_more: z.boolean()
  })
  export type AppendBlockChildrenResponse = z.infer<
    typeof AppendBlockChildrenResponseSchema
  >

  export const QueryDatabaseResponseSchema = z.object({
    object: z.literal('list'),
    results: z.array(
      z.union([PageObjectResponseSchema, PartialPageObjectResponseSchema])
    ),
    next_cursor: z.union([z.string(), z.null()]),
    has_more: z.boolean()
  })
  export type QueryDatabaseResponse = z.infer<
    typeof QueryDatabaseResponseSchema
  >

  export const OauthTokenResponseSchema = z.object({
    access_token: z.string(),
    token_type: z.literal('bearer'),
    bot_id: z.string(),
    workspace_name: z.union([z.string(), z.null()]),
    workspace_icon: z.union([z.string(), z.null()]),
    workspace_id: z.string(),
    owner: z.union([
      z.object({
        type: z.literal('user'),
        user: z.union([
          UserObjectResponseSchema,
          PartialUserObjectResponseSchema
        ])
      }),
      z.object({ type: z.literal('workspace'), workspace: z.literal(true) })
    ]),
    duplicated_template_id: z.union([z.string(), z.null()])
  })
  export type OauthTokenResponse = z.infer<typeof OauthTokenResponseSchema>

  export const RichTextItemRequestSchema = z.union([
    z.object({
      text: z.object({
        content: z.string(),
        link: z.union([z.object({ url: z.string() }), z.null()]).optional()
      }),
      type: z.literal('text').optional(),
      annotations: AnnotationRequestSchema.optional()
    }),
    z.object({
      mention: z.union([
        z.object({
          user: z.union([
            z.object({ id: z.string() }),
            UserObjectResponseSchema
          ])
        }),
        z.object({ page: z.object({ id: z.string() }) }),
        z.object({ database: z.object({ id: z.string() }) }),
        z.object({ date: DateRequestSchema })
      ]),
      type: z.literal('mention').optional(),
      annotations: AnnotationRequestSchema.optional()
    }),
    z.object({
      equation: z.object({ expression: z.string() }),
      type: z.literal('equation').optional(),
      annotations: AnnotationRequestSchema.optional()
    })
  ])
  export type RichTextItemRequest = z.infer<typeof RichTextItemRequestSchema>

  export const CreatePageParametersSchema = z.object({
    parent: z
      .record(z.any())
      .and(
        z.union([
          z.object({ type: z.literal('page_id'), page_id: z.string() }),
          z.object({ type: z.literal('database_id'), database_id: z.string() })
        ])
      ),
    properties: z.record(
      z.union([
        z.object({ title: z.array(RichTextItemRequestSchema) }),
        z.object({ rich_text: z.array(RichTextItemRequestSchema) }),
        z.object({ number: z.union([z.number(), z.null()]) }),
        z.object({
          select: z.union([z.object({ name: z.string() }), z.null()])
        })
      ])
    )
  })
  export type CreatePageParameters = z.infer<typeof CreatePageParametersSchema>

  export const UpdatePageParametersSchema = z.object({
    properties: z
      .record(
        z.union([
          z.object({ title: z.array(RichTextItemRequestSchema) }),
          z.object({ rich_text: z.array(RichTextItemRequestSchema) }),
          z.object({ number: z.union([z.number(), z.null()]) }),
          z.object({
            select: z.union([z.object({ name: z.string() }), z.null()])
          })
        ])
      )
      .optional(),
    archived: z.boolean().optional()
  })
  export type UpdatePageParameters = z.infer<typeof UpdatePageParametersSchema>

  export const UpdateBlockParametersSchema = z.object({
    paragraph: z
      .object({
        rich_text: z.array(RichTextItemRequestSchema).optional(),
        color: z.string().optional()
      })
      .optional(),
    heading_1: z
      .object({
        rich_text: z.array(RichTextItemRequestSchema).optional(),
        color: z.string().optional()
      })
      .optional(),
    heading_2: z
      .object({
        rich_text: z.array(RichTextItemRequestSchema).optional(),
        color: z.string().optional()
      })
      .optional(),
    heading_3: z
      .object({
        rich_text: z.array(RichTextItemRequestSchema).optional(),
        color: z.string().optional()
      })
      .optional(),
    bulleted_list_item: z
      .object({
        rich_text: z.array(RichTextItemRequestSchema).optional(),
        color: z.string().optional()
      })
      .optional(),
    numbered_list_item: z
      .object({
        rich_text: z.array(RichTextItemRequestSchema).optional(),
        color: z.string().optional()
      })
      .optional(),
    quote: z
      .object({
        rich_text: z.array(RichTextItemRequestSchema).optional(),
        color: z.string().optional()
      })
      .optional(),
    to_do: z
      .object({
        rich_text: z.array(RichTextItemRequestSchema).optional(),
        checked: z.boolean().optional(),
        color: z.string().optional()
      })
      .optional(),
    toggle: z
      .object({
        rich_text: z.array(RichTextItemRequestSchema).optional(),
        color: z.string().optional()
      })
      .optional(),
    code: z
      .object({
        rich_text: z.array(RichTextItemRequestSchema).optional(),
        language: z.string().optional()
      })
      .optional(),
    embed: z.object({ url: z.string().optional() }).optional(),
    image: z
      .object({ external: z.object({ url: z.string().optional() }).optional() })
      .optional(),
    video: z
      .object({ external: z.object({ url: z.string().optional() }).optional() })
      .optional(),
    file: z
      .object({ external: z.object({ url: z.string().optional() }).optional() })
      .optional(),
    pdf: z
      .object({ external: z.object({ url: z.string().optional() }).optional() })
      .optional(),
    bookmark: z.object({ url: z.string().optional() }).optional(),
    equation: z.object({ expression: z.string().optional() }).optional(),
    divider: z.record(z.any()).optional(),
    table_of_contents: z.object({ color: z.string().optional() }).optional(),
    breadcrumb: z.record(z.any()).optional(),
    column_list: z.record(z.any()).optional(),
    column: z.record(z.any()).optional(),
    link_to_page: z
      .object({
        type: z.enum(['page_id', 'database_id']).optional(),
        page_id: z.string().optional(),
        database_id: z.string().optional()
      })
      .optional(),
    table_row: z
      .object({ cells: z.array(z.array(RichTextItemRequestSchema)).optional() })
      .optional(),
    archived: z.boolean().optional()
  })
  export type UpdateBlockParameters = z.infer<
    typeof UpdateBlockParametersSchema
  >

  export const BlockObjectRequestSchema = z.union([
    z.object({
      object: z.literal('block'),
      type: z.literal('paragraph'),
      paragraph: z.object({
        rich_text: z.array(RichTextItemRequestSchema),
        color: z.string().optional()
      })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('heading_1'),
      heading_1: z.object({
        rich_text: z.array(RichTextItemRequestSchema),
        color: z.string().optional()
      })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('heading_2'),
      heading_2: z.object({
        rich_text: z.array(RichTextItemRequestSchema),
        color: z.string().optional()
      })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('heading_3'),
      heading_3: z.object({
        rich_text: z.array(RichTextItemRequestSchema),
        color: z.string().optional()
      })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('bulleted_list_item'),
      bulleted_list_item: z.object({
        rich_text: z.array(RichTextItemRequestSchema),
        color: z.string().optional()
      })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('numbered_list_item'),
      numbered_list_item: z.object({
        rich_text: z.array(RichTextItemRequestSchema),
        color: z.string().optional()
      })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('to_do'),
      to_do: z.object({
        rich_text: z.array(RichTextItemRequestSchema),
        checked: z.boolean(),
        color: z.string().optional()
      })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('toggle'),
      toggle: z.object({
        rich_text: z.array(RichTextItemRequestSchema),
        color: z.string().optional()
      })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('code'),
      code: z.object({
        rich_text: z.array(RichTextItemRequestSchema),
        language: z.string(),
        caption: z.array(RichTextItemRequestSchema).optional()
      })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('child_page'),
      child_page: z.object({ title: z.string() })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('child_database'),
      child_database: z.object({ title: z.string() })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('embed'),
      embed: z.object({
        url: z.string(),
        caption: z.array(RichTextItemRequestSchema).optional()
      })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('image'),
      image: z.object({
        external: z.object({ url: z.string() }),
        caption: z.array(RichTextItemRequestSchema).optional()
      })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('video'),
      video: z.object({
        external: z.object({ url: z.string() }),
        caption: z.array(RichTextItemRequestSchema).optional()
      })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('file'),
      file: z.object({
        external: z.object({ url: z.string() }),
        caption: z.array(RichTextItemRequestSchema).optional()
      })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('pdf'),
      pdf: z.object({
        external: z.object({ url: z.string() }),
        caption: z.array(RichTextItemRequestSchema).optional()
      })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('bookmark'),
      bookmark: z.object({
        url: z.string(),
        caption: z.array(RichTextItemRequestSchema).optional()
      })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('equation'),
      equation: z.object({ expression: z.string() })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('divider'),
      divider: z.record(z.any())
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('table_of_contents'),
      table_of_contents: z.object({ color: z.string().optional() })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('column_list'),
      column_list: z.record(z.any())
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('column'),
      column: z.record(z.any())
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('link_to_page'),
      link_to_page: z.union([
        z.object({ type: z.literal('page_id'), page_id: z.string() }),
        z.object({ type: z.literal('database_id'), database_id: z.string() })
      ])
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('table'),
      table: z.object({
        table_width: z.number().int(),
        has_column_header: z.boolean().optional(),
        has_row_header: z.boolean().optional(),
        children: z.array(
          // TODO: Support recursive types for `BlockObjectRequestSchema`.
          z.any()
        )
      })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('table_row'),
      table_row: z.object({
        cells: z.array(z.array(RichTextItemRequestSchema))
      })
    }),
    z.object({
      object: z.literal('block'),
      type: z.literal('synced_block'),
      synced_block: z.object({
        synced_from: z
          .union([
            z.object({ type: z.literal('block_id'), block_id: z.string() }),
            z.null()
          ])
          .optional(),
        children: z
          .array(
            // TODO: Support recursive types for `BlockObjectRequestSchema`.
            z.any()
          )
          .optional()
      })
    })
  ])
  export type BlockObjectRequest = z.infer<typeof BlockObjectRequestSchema>

  export const MentionRichTextItemResponseSchema = z.object({
    type: z.literal('mention'),
    mention: z.union([
      z.object({
        type: z.literal('user'),
        user: z.union([
          PartialUserObjectResponseSchema,
          UserObjectResponseSchema
        ])
      }),
      z.object({ type: z.literal('date'), date: DateResponseSchema }),
      z.object({
        type: z.literal('link_preview'),
        link_preview: z.object({ url: z.string() })
      }),
      z.object({ type: z.literal('page'), page: z.object({ id: z.string() }) }),
      z.object({
        type: z.literal('database'),
        database: z.object({ id: z.string() })
      })
    ]),
    annotations: AnnotationResponseSchema,
    plain_text: z.string(),
    href: z.union([z.string(), z.null()])
  })
  export type MentionRichTextItemResponse = z.infer<
    typeof MentionRichTextItemResponseSchema
  >

  export const CreateCommentParametersSchema = z.union([
    z.object({
      parent: z.object({
        page_id: z.string(),
        type: z.literal('page_id').optional()
      }),
      rich_text: z.array(RichTextItemRequestSchema)
    }),
    z.object({
      discussion_id: z.string(),
      rich_text: z.array(RichTextItemRequestSchema)
    })
  ])
  export type CreateCommentParameters = z.infer<
    typeof CreateCommentParametersSchema
  >

  export const AppendBlockChildrenParametersSchema = z.object({
    children: z.array(BlockObjectRequestSchema)
  })
  export type AppendBlockChildrenParameters = z.infer<
    typeof AppendBlockChildrenParametersSchema
  >

  export const UpdateDatabaseParametersSchema = z.object({
    title: z.array(RichTextItemRequestSchema).optional(),
    description: z.array(RichTextItemRequestSchema).optional(),
    icon: z
      .union([
        z.object({ emoji: z.string(), type: z.literal('emoji') }),
        z.object({
          external: z.object({ url: z.string() }),
          type: z.literal('external')
        }),
        z.null()
      ])
      .optional(),
    cover: z
      .union([
        z.object({
          external: z.object({ url: z.string() }),
          type: z.literal('external')
        }),
        z.null()
      ])
      .optional(),
    properties: z.record(PropertyUpdateSchemaSchema).optional(),
    is_inline: z.boolean().optional(),
    archived: z.boolean().optional()
  })
  export type UpdateDatabaseParameters = z.infer<
    typeof UpdateDatabaseParametersSchema
  >

  export const CreateDatabaseParametersSchema = z.object({
    parent: z.union([
      z.object({ type: z.literal('page_id'), page_id: z.string() }),
      z.object({ type: z.literal('database_id'), database_id: z.string() })
    ]),
    properties: z.record(PropertySchemaSchema),
    icon: z
      .union([
        z.object({ type: z.literal('emoji'), emoji: z.string() }),
        z.object({
          type: z.literal('external'),
          external: z.object({ url: z.string() })
        }),
        z.null()
      ])
      .optional(),
    cover: z
      .union([
        z.object({
          type: z.literal('external'),
          external: z.object({ url: z.string() })
        }),
        z.null()
      ])
      .optional(),
    title: z.array(RichTextItemRequestSchema),
    description: z.array(RichTextItemRequestSchema).optional(),
    is_inline: z.boolean().optional()
  })
  export type CreateDatabaseParameters = z.infer<
    typeof CreateDatabaseParametersSchema
  >

  export const RichTextItemResponseSchema = z.union([
    TextRichTextItemResponseSchema,
    MentionRichTextItemResponseSchema,
    EquationRichTextItemResponseSchema
  ])
  export type RichTextItemResponse = z.infer<typeof RichTextItemResponseSchema>

  export const CommentObjectResponseSchema = z.object({
    object: z.literal('comment'),
    id: z.string(),
    parent: z.union([
      z.object({ type: z.literal('page_id'), page_id: z.string() }),
      z.object({ type: z.literal('block_id'), block_id: z.string() })
    ]),
    discussion_id: z.string(),
    rich_text: z.array(RichTextItemResponseSchema),
    created_by: PartialUserObjectResponseSchema,
    created_time: z.string(),
    last_edited_time: z.string()
  })
  export type CommentObjectResponse = z.infer<
    typeof CommentObjectResponseSchema
  >

  export const PropertyFilterSchema = z.union([
    z.object({ property: z.string(), title: TextPropertyFilterSchema }),
    z.object({ property: z.string(), rich_text: TextPropertyFilterSchema }),
    z.object({ property: z.string(), number: NumberPropertyFilterSchema }),
    z.object({ property: z.string(), checkbox: CheckboxPropertyFilterSchema }),
    z.object({ property: z.string(), select: SelectPropertyFilterSchema }),
    z.object({
      property: z.string(),
      multi_select: MultiSelectPropertyFilterSchema
    }),
    z.object({ property: z.string(), date: DatePropertyFilterSchema }),
    z.object({ property: z.string(), people: PeoplePropertyFilterSchema }),
    z.object({ property: z.string(), files: FilesPropertyFilterSchema }),
    z.object({ property: z.string(), url: TextPropertyFilterSchema }),
    z.object({ property: z.string(), email: TextPropertyFilterSchema }),
    z.object({ property: z.string(), phone_number: TextPropertyFilterSchema }),
    z.object({ property: z.string(), relation: RelationPropertyFilterSchema }),
    z.object({ property: z.string(), created_by: PeoplePropertyFilterSchema }),
    z.object({ property: z.string(), created_time: DatePropertyFilterSchema }),
    z.object({
      property: z.string(),
      last_edited_by: PeoplePropertyFilterSchema
    }),
    z.object({
      property: z.string(),
      last_edited_time: DatePropertyFilterSchema
    }),
    z.object({
      timestamp: z.enum(['created_time', 'last_edited_time']),
      created_time: DatePropertyFilterSchema
    }),
    z.object({
      timestamp: z.enum(['created_time', 'last_edited_time']),
      last_edited_time: DatePropertyFilterSchema
    })
  ])
  export type PropertyFilter = z.infer<typeof PropertyFilterSchema>

  export const ListCommentsResponseSchema = z.object({
    object: z.literal('list'),
    results: z.array(CommentObjectResponseSchema),
    next_cursor: z.union([z.string(), z.null()]),
    has_more: z.boolean()
  })
  export type ListCommentsResponse = z.infer<typeof ListCommentsResponseSchema>

  export const CompoundFilterSchema = z.object({
    and: z.array(PropertyFilterSchema).optional(),
    or: z.array(PropertyFilterSchema).optional()
  })
  export type CompoundFilter = z.infer<typeof CompoundFilterSchema>

  export const QueryDatabaseParametersSchema = z.object({
    sorts: z
      .array(
        z.union([
          z.object({
            property: z.string(),
            direction: z.enum(['ascending', 'descending'])
          }),
          z.object({
            timestamp: z.enum(['created_time', 'last_edited_time']),
            direction: z.enum(['ascending', 'descending'])
          })
        ])
      )
      .optional(),
    filter: z.union([PropertyFilterSchema, CompoundFilterSchema]).optional(),
    start_cursor: z.string().optional(),
    page_size: z.number().int().optional(),
    archived: z.boolean().optional()
  })
  export type QueryDatabaseParameters = z.infer<
    typeof QueryDatabaseParametersSchema
  >

  export const DatabasePropertyConfigResponseSchema = z.union([
    TitlePropertyResponseSchema,
    RichTextPropertyResponseSchema,
    NumberPropertyResponseSchema,
    SelectPropertyResponseSchema,
    MultiSelectPropertyResponseSchema,
    DatePropertyResponseSchema,
    PeoplePropertyResponseSchema,
    FilePropertyResponseSchema,
    CheckboxPropertyResponseSchema,
    UrlPropertyResponseSchema,
    EmailPropertyResponseSchema,
    PhoneNumberPropertyResponseSchema,
    FormulaPropertyResponseSchema,
    RelationPropertyResponseSchema,
    RollupPropertyResponseSchema,
    CreatedTimePropertyResponseSchema,
    CreatedByPropertyResponseSchema,
    LastEditedTimePropertyResponseSchema,
    LastEditedByPropertyResponseSchema
  ])
  export type DatabasePropertyConfigResponse = z.infer<
    typeof DatabasePropertyConfigResponseSchema
  >

  export const PartialDatabaseObjectResponseSchema = z.object({
    object: z.literal('database'),
    id: z.string(),
    properties: z.record(DatabasePropertyConfigResponseSchema)
  })
  export type PartialDatabaseObjectResponse = z.infer<
    typeof PartialDatabaseObjectResponseSchema
  >

  export const DatabaseObjectResponseSchema = z.object({
    object: z.literal('database'),
    id: z.string(),
    cover: z
      .union([
        z.object({
          type: z.literal('external'),
          external: z.object({ url: z.string() })
        }),
        z.null()
      ])
      .optional(),
    icon: z
      .union([
        z.object({ type: z.literal('emoji'), emoji: z.string() }),
        z.object({
          type: z.literal('external'),
          external: z.object({ url: z.string() })
        }),
        z.null()
      ])
      .optional(),
    created_time: z.string(),
    created_by: PartialUserObjectResponseSchema,
    last_edited_time: z.string(),
    last_edited_by: PartialUserObjectResponseSchema,
    title: z.array(RichTextItemResponseSchema),
    description: z.array(RichTextItemResponseSchema),
    is_inline: z.boolean(),
    properties: z.record(DatabasePropertyConfigResponseSchema),
    parent: z.union([
      z.object({ type: z.literal('page_id'), page_id: z.string() }),
      z.object({ type: z.literal('workspace'), workspace: z.literal(true) })
    ]),
    url: z.string(),
    archived: z.boolean()
  })
  export type DatabaseObjectResponse = z.infer<
    typeof DatabaseObjectResponseSchema
  >

  export const ListDatabasesResponseSchema = z.object({
    object: z.literal('list'),
    results: z.array(
      z.union([
        PartialDatabaseObjectResponseSchema,
        DatabaseObjectResponseSchema
      ])
    ),
    next_cursor: z.union([z.string(), z.null()]),
    has_more: z.boolean()
  })
  export type ListDatabasesResponse = z.infer<
    typeof ListDatabasesResponseSchema
  >

  export const SearchResponseSchema = z.object({
    object: z.literal('list'),
    results: z.array(
      z.union([
        PageObjectResponseSchema,
        PartialPageObjectResponseSchema,
        PartialDatabaseObjectResponseSchema,
        DatabaseObjectResponseSchema
      ])
    ),
    next_cursor: z.union([z.string(), z.null()]),
    has_more: z.boolean()
  })
  export type SearchResponse = z.infer<typeof SearchResponseSchema>

  // -----------------------------------------------------------------------------
  // Operation schemas
  // -----------------------------------------------------------------------------

  export const GetSelfParamsSchema = z.object({})
  export type GetSelfParams = z.infer<typeof GetSelfParamsSchema>

  export const GetSelfResponseSchema = UserObjectResponseSchema
  export type GetSelfResponse = z.infer<typeof GetSelfResponseSchema>

  export const GetUserParamsSchema = z.object({ user_id: z.string() })
  export type GetUserParams = z.infer<typeof GetUserParamsSchema>

  export const GetUserResponseSchema = UserObjectResponseSchema
  export type GetUserResponse = z.infer<typeof GetUserResponseSchema>

  export const ListUsersParamsSchema = z.object({
    start_cursor: z.string().optional(),
    page_size: z.number().int().optional()
  })
  export type ListUsersParams = z.infer<typeof ListUsersParamsSchema>

  export const CreatePageParamsSchema = CreatePageParametersSchema
  export type CreatePageParams = z.infer<typeof CreatePageParamsSchema>

  export const CreatePageResponseSchema = z.union([
    PageObjectResponseSchema,
    PartialPageObjectResponseSchema
  ])
  export type CreatePageResponse = z.infer<typeof CreatePageResponseSchema>

  export const GetPageParamsSchema = z.object({
    page_id: z.string(),
    filter_properties: z.array(z.string()).optional()
  })
  export type GetPageParams = z.infer<typeof GetPageParamsSchema>

  export const GetPageResponseSchema = z.union([
    PageObjectResponseSchema,
    PartialPageObjectResponseSchema
  ])
  export type GetPageResponse = z.infer<typeof GetPageResponseSchema>

  export const UpdatePageParamsSchema = z
    .object({ page_id: z.string() })
    .merge(UpdatePageParametersSchema)
  export type UpdatePageParams = z.infer<typeof UpdatePageParamsSchema>

  export const UpdatePageResponseSchema = z.union([
    PageObjectResponseSchema,
    PartialPageObjectResponseSchema
  ])
  export type UpdatePageResponse = z.infer<typeof UpdatePageResponseSchema>

  export const GetPagePropertyParamsSchema = z.object({
    page_id: z.string(),
    property_id: z.string(),
    start_cursor: z.string().optional(),
    page_size: z.number().int().optional()
  })
  export type GetPagePropertyParams = z.infer<
    typeof GetPagePropertyParamsSchema
  >

  export const GetPagePropertyResponseSchema = z.union([
    PropertyItemObjectResponseSchema,
    PropertyItemListResponseSchema
  ])
  export type GetPagePropertyResponse = z.infer<
    typeof GetPagePropertyResponseSchema
  >

  export const GetBlockParamsSchema = z.object({ block_id: z.string() })
  export type GetBlockParams = z.infer<typeof GetBlockParamsSchema>

  export const GetBlockResponseSchema = z.union([
    PartialBlockObjectResponseSchema,
    BlockObjectResponseSchema
  ])
  export type GetBlockResponse = z.infer<typeof GetBlockResponseSchema>

  export const DeleteBlockParamsSchema = z.object({ block_id: z.string() })
  export type DeleteBlockParams = z.infer<typeof DeleteBlockParamsSchema>

  export const DeleteBlockResponseSchema = z.union([
    PartialBlockObjectResponseSchema,
    BlockObjectResponseSchema
  ])
  export type DeleteBlockResponse = z.infer<typeof DeleteBlockResponseSchema>

  export const UpdateBlockParamsSchema = z
    .object({ block_id: z.string() })
    .merge(UpdateBlockParametersSchema)
  export type UpdateBlockParams = z.infer<typeof UpdateBlockParamsSchema>

  export const UpdateBlockResponseSchema = z.union([
    PartialBlockObjectResponseSchema,
    BlockObjectResponseSchema
  ])
  export type UpdateBlockResponse = z.infer<typeof UpdateBlockResponseSchema>

  export const ListBlockChildrenParamsSchema = z.object({
    block_id: z.string(),
    start_cursor: z.string().optional(),
    page_size: z.number().int().optional()
  })
  export type ListBlockChildrenParams = z.infer<
    typeof ListBlockChildrenParamsSchema
  >

  export const AppendBlockChildrenParamsSchema = z
    .object({ block_id: z.string() })
    .merge(AppendBlockChildrenParametersSchema)
  export type AppendBlockChildrenParams = z.infer<
    typeof AppendBlockChildrenParamsSchema
  >

  export const GetDatabaseParamsSchema = z.object({ database_id: z.string() })
  export type GetDatabaseParams = z.infer<typeof GetDatabaseParamsSchema>

  export const GetDatabaseResponseSchema = z.union([
    PartialDatabaseObjectResponseSchema,
    DatabaseObjectResponseSchema
  ])
  export type GetDatabaseResponse = z.infer<typeof GetDatabaseResponseSchema>

  export const UpdateDatabaseParamsSchema = z
    .object({ database_id: z.string() })
    .merge(UpdateDatabaseParametersSchema)
  export type UpdateDatabaseParams = z.infer<typeof UpdateDatabaseParamsSchema>

  export const UpdateDatabaseResponseSchema = z.union([
    PartialDatabaseObjectResponseSchema,
    DatabaseObjectResponseSchema
  ])
  export type UpdateDatabaseResponse = z.infer<
    typeof UpdateDatabaseResponseSchema
  >

  export const QueryDatabaseParamsSchema = z
    .object({
      database_id: z.string(),
      filter_properties: z.array(z.string()).optional()
    })
    .merge(QueryDatabaseParametersSchema)
  export type QueryDatabaseParams = z.infer<typeof QueryDatabaseParamsSchema>

  export const ListDatabasesParamsSchema = z.object({
    start_cursor: z.string().optional(),
    page_size: z.number().int().optional()
  })
  export type ListDatabasesParams = z.infer<typeof ListDatabasesParamsSchema>

  export const CreateDatabaseParamsSchema = CreateDatabaseParametersSchema
  export type CreateDatabaseParams = z.infer<typeof CreateDatabaseParamsSchema>

  export const CreateDatabaseResponseSchema = z.union([
    PartialDatabaseObjectResponseSchema,
    DatabaseObjectResponseSchema
  ])
  export type CreateDatabaseResponse = z.infer<
    typeof CreateDatabaseResponseSchema
  >

  export const SearchParamsSchema = SearchParametersSchema
  export type SearchParams = z.infer<typeof SearchParamsSchema>

  export const ListCommentsParamsSchema = z.object({
    block_id: z.string(),
    start_cursor: z.string().optional(),
    page_size: z.number().int().optional()
  })
  export type ListCommentsParams = z.infer<typeof ListCommentsParamsSchema>

  export const CreateCommentParamsSchema = CreateCommentParametersSchema
  export type CreateCommentParams = z.infer<typeof CreateCommentParamsSchema>

  export const CreateCommentResponseSchema = z.union([
    CommentObjectResponseSchema,
    PartialCommentObjectResponseSchema
  ])
  export type CreateCommentResponse = z.infer<
    typeof CreateCommentResponseSchema
  >

  export const OauthTokenParamsSchema = OauthTokenParametersSchema
  export type OauthTokenParams = z.infer<typeof OauthTokenParamsSchema>
}
