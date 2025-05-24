export type Logger = Pick<Console, 'debug' | 'info' | 'warn' | 'error'>

// OpenAPI types are taken from https://github.com/openapi-ts/openapi-typescript/blob/main/packages/openapi-typescript/src/types.ts

// Note: these OpenAPI types are meant only for internal use, not external
// consumption. Some formatting may be better in other libraries meant for
// consumption. Some typing may be “loose” or “incorrect” in order to guarantee
// that all logical paths are handled. In other words, these are built more
// for ways schemas _can_ be written, not necessarily how they _should_ be.

export interface Extensible {
  [key: `x-${string}`]: any
}

/**
 * [4.8] Schema
 * @see https://spec.openapis.org/oas/v3.1.0#schema
 */
export interface LooseOpenAPI3Spec extends Extensible {
  /** REQUIRED. This string MUST be the version number of the OpenAPI Specification that the OpenAPI document uses. The openapi field SHOULD be used by tooling to interpret the OpenAPI document. This is not related to the API info.version string. */
  openapi: string
  /** REQUIRED. Provides metadata about the API. The metadata MAY be used by tooling as required. */
  info: InfoObject // required
  /** The default value for the $schema keyword within Schema Objects contained within this OAS document. This MUST be in the form of a URI. */
  jsonSchemaDialect?: string
  /** An array of Server Objects, which provide connectivity information to a target server. If the servers property is not provided, or is an empty array, the default value would be a Server Object with a url value of /. */
  servers?: ServerObject[]
  /** The available paths and operations for the API. */
  paths?: PathsObject
  /** The incoming webhooks that MAY be received as part of this API and that the API consumer MAY choose to implement. Closely related to the callbacks feature, this section describes requests initiated other than by an API call, for example by an out of band registration. The key name is a unique string to refer to each webhook, while the (optionally referenced) Path Item Object describes a request that may be initiated by the API provider and the expected responses. An example is available. */
  webhooks?: { [id: string]: PathItemObject | ReferenceObject }
  /** An element to hold various schemas for the document. */
  components?: ComponentsObject
  /** A declaration of which security mechanisms can be used across the API. The list of values includes alternative security requirement objects that can be used. Only one of the security requirement objects need to be satisfied to authorize a request. Individual operations can override this definition. To make security optional, an empty security requirement ({}) can be included in the array. */
  security?: SecurityRequirementObject[]
  /** A list of tags used by the document with additional metadata. The order of the tags can be used to reflect on their order by the parsing tools. Not all tags that are used by the Operation Object must be declared. The tags that are not declared MAY be organized randomly or based on the tools’ logic. Each tag name in the list MUST be unique. */
  tags?: TagObject[]
  /** Additional external documentation. */
  externalDocs?: ExternalDocumentationObject
  $defs?: $defs
}

/**
 * [4.8.2] Info Object
 * The object provides metadata about the API.
 */
export interface InfoObject extends Extensible {
  /** REQUIRED. The title of the API. */
  title: string
  /** A short summary of the API. */
  summary?: string
  /** A description of the API. CommonMark syntax MAY be used for rich text representation. */
  description?: string
  /** A URL to the Terms of Service for the API. This MUST be in the form of a URL. */
  termsOfService?: string
  /** The contact information for the exposed API. */
  contact?: ContactObject
  /** The license information for the exposed API. */
  license?: LicenseObject
  /** REQUIRED. The version of the OpenAPI document (which is distinct from the OpenAPI Specification version or the API implementation version). */
  version: string
}

/**
 * [4.8.3] Contact Object
 * Contact information for the exposed API.
 */
export interface ContactObject extends Extensible {
  /** The identifying name of the contact person/organization. */
  name?: string
  /** The URL pointing to the contact information. This MUST be in the form of a URL. */
  url?: string
  /** The email address of the contact person/organization. This MUST be in the form of an email address. */
  email?: string
}

/**
 * [4.8.4] License object
 * License information for the exposed API.
 */
export interface LicenseObject extends Extensible {
  /** REQUIRED. The license name used for the API. */
  name: string
  /** An SPDX license expression for the API. The identifier field is mutually exclusive of the url field. */
  identifier: string
  /** A URL to the license used for the API. This MUST be in the form of a URL. The url field is mutually exclusive of the identifier field. */
  url: string
}

/**
 * [4.8.5] Server Object
 * An object representing a Server.
 */
export interface ServerObject extends Extensible {
  /** REQUIRED. A URL to the target host. This URL supports Server Variables and MAY be relative, to indicate that the host location is relative to the location where the OpenAPI document is being served. Variable substitutions will be made when a variable is named in {brackets}. */
  url: string
  /** An optional string describing the host designated by the URL. CommonMark syntax MAY be used for rich text representation. */
  description: string
  /** A map between a variable name and its value. The value is used for substitution in the server’s URL template. */
  variables: { [name: string]: ServerVariableObject }
}

/**
 * [4.8.6] Server Variable Object
 * An object representing a Server Variable for server URL template substitution.
 */
export interface ServerVariableObject extends Extensible {
  /** An enumeration of string values to be used if the substitution options are from a limited set. The array MUST NOT be empty. */
  enum?: string[]
  /** REQUIRED. The default value to use for substitution, which SHALL be sent if an alternate value is not supplied. Note this behavior is different than the Schema Object’s treatment of default values, because in those cases parameter values are optional. If the enum is defined, the value MUST exist in the enum’s values. */
  default: string
  /** An optional description for the server variable. CommonMark syntax MAY be used for rich text representation. */
  description?: string
}

/**
 * [4.8.7] Components Object
 * Holds a set of reusable objects for different aspects of the OAS.
 */
export interface ComponentsObject extends Extensible {
  /** An object to hold reusable Schema Objects.*/
  schemas?: Record<string, SchemaObject>
  /** An object to hold reusable Response Objects. */
  responses?: Record<string, ResponseObject | ReferenceObject>
  /** An object to hold reusable Parameter Objects. */
  parameters?: Record<string, ParameterObject | ReferenceObject>
  /** An object to hold reusable Example Objects. */
  examples?: Record<string, ExampleObject | ReferenceObject>
  /** An object to hold reusable Request Body Objects. */
  requestBodies?: Record<string, RequestBodyObject | ReferenceObject>
  /** An object to hold reusable Header Objects. */
  headers?: Record<string, HeaderObject | ReferenceObject>
  /** An object to hold reusable Security Scheme Objects. */
  securitySchemes?: Record<string, SecuritySchemeObject | ReferenceObject>
  /** An object to hold reusable Link Objects. */
  links?: Record<string, LinkObject | ReferenceObject>
  /** An object to hold reusable Callback Objects. */
  callbacks?: Record<string, CallbackObject | ReferenceObject>
  /** An object to hold reusable Path Item Objects. */
  pathItems?: Record<string, PathItemObject | ReferenceObject>
}

/**
 * [4.8.8] Paths Object
 * Holds the relative paths to the individual endpoints and their operations. The path is appended to the URL from the Server Object in order to construct the full URL. The Paths MAY be empty, due to Access Control List (ACL) constraints.
 */
export interface PathsObject {
  [pathname: string]: PathItemObject | ReferenceObject // note: paths object does support $refs; the schema just defines it in a weird way
}

/**
 * [x.x.x] Webhooks Object
 * Holds the webhooks definitions, indexed by their names. A webhook is defined by a Path Item Object; the only difference is that the request is initiated by the API provider.
 */
export interface WebhooksObject {
  [name: string]: PathItemObject
}

/**
 * [4.8.9] Path Item Object
 * Describes the operations available on a single path. A Path Item MAY be empty, due to ACL constraints. The path itself is still exposed to the documentation viewer but they will not know which operations and parameters are available.
 */
export interface PathItemObject extends Extensible {
  /** A definition of a GET operation on this path. */
  get?: OperationObject | ReferenceObject
  /** A definition of a PUT operation on this path. */
  put?: OperationObject | ReferenceObject
  /** A definition of a POST operation on this path. */
  post?: OperationObject | ReferenceObject
  /** A definition of a DELETE operation on this path. */
  delete?: OperationObject | ReferenceObject
  /** A definition of a OPTIONS operation on this path. */
  options?: OperationObject | ReferenceObject
  /** A definition of a HEAD operation on this path. */
  head?: OperationObject | ReferenceObject
  /** A definition of a PATCH operation on this path. */
  patch?: OperationObject | ReferenceObject
  /** A definition of a TRACE operation on this path. */
  trace?: OperationObject | ReferenceObject
  /** An alternative server array to service all operations in this path. */
  servers?: ServerObject[]
  /** A list of parameters that are applicable for all the operations described under this path. These parameters can be overridden at the operation level, but cannot be removed there. The list MUST NOT include duplicated parameters. A unique parameter is defined by a combination of a name and location. The list can use the Reference Object to link to parameters that are defined at the OpenAPI Object’s components/parameters. */
  parameters?: (ParameterObject | ReferenceObject)[]
}

/**
 * [4.8.10] Operation Object
 * Describes a single API operation on a path.
 */
export interface OperationObject extends Extensible {
  /** A list of tags for API documentation control. Tags can be used for logical grouping of operations by resources or any other qualifier. */
  tags?: string[]
  /** A short summary of what the operation does. */
  summary?: string
  /** A verbose explanation of the operation behavior. CommonMark syntax MAY be used for rich text representation. */
  description?: string
  /** Additional external documentation for this operation. */
  externalDocs?: ExternalDocumentationObject
  /** Unique string used to identify the operation. The id MUST be unique among all operations described in the API. The operationId value is case-sensitive. Tools and libraries MAY use the operationId to uniquely identify an operation, therefore, it is RECOMMENDED to follow common programming naming conventions. */
  operationId?: string
  /** A list of parameters that are applicable for this operation. If a parameter is already defined at the Path Item, the new definition will override it but can never remove it. The list MUST NOT include duplicated parameters. A unique parameter is defined by a combination of a name and location. The list can use the Reference Object to link to parameters that are defined at the OpenAPI Object’s components/parameters. */
  parameters?: (ParameterObject | ReferenceObject)[]
  /** The request body applicable for this operation. The requestBody is fully supported in HTTP methods where the HTTP 1.1 specification [RFC7231] has explicitly defined semantics for request bodies. In other cases where the HTTP spec is vague (such as GET, HEAD and DELETE), requestBody is permitted but does not have well-defined semantics and SHOULD be avoided if possible. */
  requestBody?: RequestBodyObject | ReferenceObject
  /** The list of possible responses as they are returned from executing this operation. */
  responses?: ResponsesObject
  /** A map of possible out-of band callbacks related to the parent operation. The key is a unique identifier for the Callback Object. Each value in the map is a Callback Object that describes a request that may be initiated by the API provider and the expected responses. */
  callbacks?: Record<string, CallbackObject | ReferenceObject>
  /** Declares this operation to be deprecated. Consumers SHOULD refrain from usage of the declared operation. Default value is false. */
  deprecated?: boolean
  /** A declaration of which security mechanisms can be used for this operation. The list of values includes alternative security requirement objects that can be used. Only one of the security requirement objects need to be satisfied to authorize a request. To make security optional, an empty security requirement ({}) can be included in the array. This definition overrides any declared top-level security. To remove a top-level security declaration, an empty array can be used. */
  security?: SecurityRequirementObject[]
  /** An alternative server array to service this operation. If an alternative server object is specified at the Path Item Object or Root level, it will be overridden by this value. */
  servers?: ServerObject[]
}

/**
 * [4.8.11] External Documentation Object
 * Allows referencing an external resource for extended documentation.
 */
export interface ExternalDocumentationObject extends Extensible {
  /** A description of the target documentation. CommonMark syntax MAY be used for rich text representation. */
  description?: string
  /** REQUIRED. The URL for the target documentation. This MUST be in the form of a URL. */
  url: string
}

/**
 * [4.8.12] Parameter Object
 * Describes a single operation parameter.
 * A unique parameter is defined by a combination of a name and location.
 */
export interface ParameterObject extends Extensible {
  /**
   * REQUIRED. The name of the parameter. Parameter names are case sensitive.
   *
   * - If `in` is `"path"`, the `name` field MUST correspond to a template expression occurring within the path field in the Paths Object. See Path Templating for further information.
   * - If `in` is `"header"` and the `name` field is `"Accept"`, `"Content-Type"` or `"Authorization"`, the parameter definition SHALL be ignored.
   * - For all other cases, the `name` corresponds to the parameter name used by the `in` property.
   */
  name: string
  /** REQUIRED. The location of the parameter. Possible values are "query", "header", "path" or "cookie".*/
  in: 'query' | 'header' | 'path' | 'cookie'
  /** A brief description of the parameter. This could contain examples of use. CommonMark syntax MAY be used for rich text representation. */
  description?: string
  /** Determines whether this parameter is mandatory. If the parameter location is "path", this property is REQUIRED and its value MUST be true. Otherwise, the property MAY be included and its default value is false. */
  required?: boolean
  /** Specifies that a parameter is deprecated and SHOULD be transitioned out of usage. Default value is false. */
  deprecated?: boolean
  /** Sets the ability to pass empty-valued parameters. This is valid only for query parameters and allows sending a parameter with an empty value. Default value is false. If style is used, and if behavior is n/a (cannot be serialized), the value of allowEmptyValue SHALL be ignored. Use of this property is NOT RECOMMENDED, as it is likely to be removed in a later revision. */
  allowEmptyValue?: boolean
  /** Describes how the parameter value will be serialized depending on the type of the parameter value. Default values (based on value of in): for query - form; for path - simple; for header - simple; for cookie - form. */
  style?: string
  /** When this is true, parameter values of type `array` or `object` generate separate parameters for each value of the array or key-value pair of the map. For other types of parameters this property has no effect. When `style` is `form`, the default value is `true`. For all other styles, the default value is `false`. */
  explode?: boolean
  /** Determines whether the parameter value SHOULD allow reserved characters, as defined by [RFC3986] `:/?#[]@!$&'()*+,;=` to be included without percent-encoding. This property only applies to parameters with an `in` value of `query`. The default value is `false`. */
  allowReserved?: boolean
  /** The schema defining the type used for the parameter. */
  schema?: SchemaObject
  /** Example of the parameter’s potential value. */
  example?: any
  /** Examples of the parameter’s potential value. */
  examples?: { [name: string]: ExampleObject | ReferenceObject }
  /** A map containing the representations for the parameter. */
  content?: { [contentType: string]: MediaTypeObject | ReferenceObject }
}

/**
 * [4.8.13] Request Body Object
 * Describes a single request body.
 */
export interface RequestBodyObject extends Extensible {
  /** A brief description of the request body. This could contain examples of use. CommonMark syntax MAY be used for rich text representation. */
  description?: string
  /** REQUIRED. The content of the request body. The key is a media type or media type range and the value describes it. For requests that match multiple keys, only the most specific key is applicable. e.g. text/plain overrides text */
  content: { [contentType: string]: MediaTypeObject | ReferenceObject }
  /** Determines if the request body is required in the request. Defaults to false. */
  required?: boolean
}

/**
 * [4.8.14] Media Type Object
 */
export interface MediaTypeObject extends Extensible {
  /** The schema defining the content of the request, response, or parameter. */
  schema?: SchemaObject | ReferenceObject
  /** Example of the media type. The example object SHOULD be in the correct format as specified by the media type. The example field is mutually exclusive of the examples field. Furthermore, if referencing a schema which contains an example, the example value SHALL override the example provided by the schema. */
  example?: any
  /** Examples of the media type. Each example object SHOULD match the media type and specified schema if present. The examples field is mutually exclusive of the example field. Furthermore, if referencing a schema which contains an example, the examples value SHALL override the example provided by the schema. */
  examples?: { [name: string]: ExampleObject | ReferenceObject }
  /** A map between a property name and its encoding information. The key, being the property name, MUST exist in the schema as a property. The encoding object SHALL only apply to requestBody objects when the media type is multipart or application/x-www-form-urlencoded. */
  encoding?: { [propertyName: string]: EncodingObject }
}

/**
 * [4.8.15] Encoding Object
 * A single encoding definition applied to a single schema property.
 */
export interface EncodingObject extends Extensible {
  /** The Content-Type for encoding a specific property. Default value depends on the property type: for object - application/json; for array – the default is defined based on the inner type; for all other cases the default is application/octet-stream. The value can be a specific media type (e.g. application/json), a wildcard media type (e.g. image/*), or a comma-separated list of the two types. */
  contentType?: string
  /** A map allowing additional information to be provided as headers, for example Content-Disposition. Content-Type is described separately and SHALL be ignored in this section. This property SHALL be ignored if the request body media type is not a multipart. */
  headers?: { [name: string]: HeaderObject | ReferenceObject }
  /** Describes how a specific property value will be serialized depending on its type. See Parameter Object for details on the style property. The behavior follows the same values as query parameters, including default values. This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded or multipart/form-data. If a value is explicitly defined, then the value of contentType (implicit or explicit) SHALL be ignored. */
  style?: string
  /** When this is true, property values of type array or object generate separate parameters for each value of the array, or key-value-pair of the map. For other types of properties this property has no effect. When style is form, the default value is true. For all other styles, the default value is false. This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded or multipart/form-data. If a value is explicitly defined, then the value of contentType (implicit or explicit) SHALL be ignored. */
  explode?: string
  /** Determines whether the parameter value SHOULD allow reserved characters, as defined by [RFC3986] :/?#[]@!$&'()*+,;= to be included without percent-encoding. The default value is false. This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded or multipart/form-data. If a value is explicitly defined, then the value of contentType (implicit or explicit) SHALL be ignored. */
  allowReserved?: string
}

/**
 * [4.8.16] Responses Object
 * A container for the expected responses of an operation. The container maps a HTTP response code to the expected response.
 */
export type ResponsesObject = {
  [responseCode: string]: ResponseObject | ReferenceObject
} & {
  /** The documentation of responses other than the ones declared for specific HTTP response codes. Use this field to cover undeclared responses. */
  default?: ResponseObject | ReferenceObject
}

/**
 * [4.8.17] Response Object
 * Describes a single response from an API Operation, including design-time, static links to operations based on the response.
 */
export interface ResponseObject extends Extensible {
  /** REQUIRED. A description of the response. CommonMark syntax MAY be used for rich text representation. */
  description: string
  /** Maps a header name to its definition. [RFC7230] states header names are case insensitive. If a response header is defined with the name "Content-Type", it SHALL be ignored. */
  headers?: { [name: string]: HeaderObject | ReferenceObject }
  /** A map containing descriptions of potential response payloads. The key is a media type or media type range and the value describes it. For responses that match multiple keys, only the most specific key is applicable. e.g. text/plain overrides text */
  content?: { [contentType: string]: MediaTypeObject }
  /** A map of operations links that can be followed from the response. The key of the map is a short name for the link, following the naming constraints of the names for Component Objects. */
  links?: { [name: string]: LinkObject | ReferenceObject }
}

/**
 * [4.8.18] Callback Object
 * A map of possible out-of band callbacks related to the parent operation. Each value in the map is a Path Item Object that describes a set of requests that may be initiated by the API provider and the expected responses. The key value used to identify the path item object is an expression, evaluated at runtime, that identifies a URL to use for the callback operation.
 */
export type CallbackObject = Record<string, PathItemObject>

/**
 * [4.8.19[ Example Object
 */
export interface ExampleObject extends Extensible {
  /** Short description for the example. */
  summary?: string
  /** Long description for the example. CommonMark syntax MAY be used for rich text representation. */
  description?: string
  /** Embedded literal example. The value field and externalValue field are mutually exclusive. To represent examples of media types that cannot naturally represented in JSON or YAML, use a string value to contain the example, escaping where necessary. */
  value?: any
  /** A URI that points to the literal example. This provides the capability to reference examples that cannot easily be included in JSON or YAML documents. The value field and externalValue field are mutually exclusive. See the rules for resolving Relative References. */
  externalValue?: string
}

/**
 * [4.8.20] Link Object
 * The Link object represents a possible design-time link for a response. The presence of a link does not guarantee the caller’s ability to successfully invoke it, rather it provides a known relationship and traversal mechanism between responses and other operations.
 */
export interface LinkObject extends Extensible {
  /** A relative or absolute URI reference to an OAS operation. This field is mutually exclusive of the operationId field, and MUST point to an Operation Object. Relative operationRef values MAY be used to locate an existing Operation Object in the OpenAPI definition. See the rules for resolving Relative References. */
  operationRef?: string
  /** The name of an existing, resolvable OAS operation, as defined with a unique operationId. This field is mutually exclusive of the operationRef field. */
  operationId?: string
  /** A map representing parameters to pass to an operation as specified with operationId or identified via operationRef. The key is the parameter name to be used, whereas the value can be a constant or an expression to be evaluated and passed to the linked operation. The parameter name can be qualified using the parameter location [{in}.]{name} for operations that use the same parameter name in different locations (e.g. path.id). */
  parameters?: { [name: string]: `$${string}` }
  /** A literal value or {expression} to use as a request body when calling the target operation. */
  requestBody?: `$${string}`
  /** A description of the link. CommonMark syntax MAY be used for rich text representation. */
  description?: string
  /** A server object to be used by the target operation. */
  server?: ServerObject
}

/**
 * [4.8.21] Header Object
 * The Header Object follows the structure of the Parameter Object with the following changes:
 *
 * 1. `name` MUST NOT be specified, it is given in the corresponding `headers` map.
 * 2. `in` MUST NOT be specified, it is implicitly in `header`.
 * 3. All traits that are affected by the location MUST be applicable to a location of `heade`r (for example, `style`).
 */
export type HeaderObject = Omit<ParameterObject, 'name' | 'in'>

/**
 * [4.8.22] Tag Object
 * Adds metadata to a single tag that is used by the Operation Object. It is not mandatory to have a Tag Object per tag defined in the Operation Object instances.
 */
export interface TagObject extends Extensible {
  /** REQUIRED. The name of the tag. */
  name: string
  /** A description for the tag. CommonMark syntax MAY be used for rich text representation. */
  description?: string
  /** Additional external documentation for this tag. */
  externalDocs?: ExternalDocumentationObject
}

/**
 * [4.8.23] Reference Object
 * A simple object to allow referencing other components in the OpenAPI document, internally and externally. The $ref string value contains a URI [RFC3986], which identifies the location of the value being referenced. See the rules for resolving Relative References.
 */
export interface ReferenceObject extends Extensible {
  /** REQUIRED. The reference identifier. This MUST be in the form of a URI. */
  $ref: string
  /** A short summary which by default SHOULD override that of the referenced component. If the referenced object-type does not allow a summary field, then this field has no effect. */
  summary?: string
  /** A description which by default SHOULD override that of the referenced component. CommonMark syntax MAY be used for rich text representation. If the referenced object-type does not allow a description field, then this field has no effect. */
  description?: string
}

/**
 * [4.8.24] Schema Object
 * The Schema Object allows the definition of input and output data types. These types can be objects, but also primitives and arrays. This object is a superset of the JSON Schema Specification Draft 2020-12.
 */
export type SchemaObject = {
  /** The Schema Object allows the definition of input and output data types. These types can be objects, but also primitives and arrays. This object is a superset of the JSON Schema Specification Draft 2020-12. */
  discriminator?: DiscriminatorObject
  /** MAY be used only on properties schemas. It has no effect on root schemas. Adds additional metadata to describe the XML representation of this property. */
  xml?: XMLObject
  /** Additional external documentation for this schema. */
  externalDocs?: ExternalDocumentationObject
  /** @deprecated */
  example?: any
  title?: string
  description?: string
  $comment?: string
  deprecated?: boolean
  readOnly?: boolean
  writeOnly?: boolean
  enum?: unknown[]
  /** Use of this keyword is functionally equivalent to an "enum" (Section 6.1.2) with a single value. */
  const?: unknown
  default?: unknown
  format?: string
  /** @deprecated in 3.1 (still valid for 3.0) */
  nullable?: boolean
  oneOf?: (SchemaObject | ReferenceObject)[]
  allOf?: (SchemaObject | ReferenceObject)[]
  anyOf?: (SchemaObject | ReferenceObject)[]
  required?: string[]
  [key: `x-${string}`]: any
} & (
  | StringSubtype
  | NumberSubtype
  | IntegerSubtype
  | ArraySubtype
  | BooleanSubtype
  | NullSubtype
  | ObjectSubtype
  | {
      type: (
        | 'string'
        | 'number'
        | 'integer'
        | 'array'
        | 'boolean'
        | 'null'
        | 'object'
      )[]
    }
)

export interface StringSubtype {
  type: 'string' | ['string', 'null']
  enum?: (string | ReferenceObject)[]
}

export interface NumberSubtype {
  type: 'number' | ['number', 'null']
  minimum?: number
  maximum?: number
  enum?: (number | ReferenceObject)[]
}

export interface IntegerSubtype {
  type: 'integer' | ['integer', 'null']
  minimum?: number
  maximum?: number
  enum?: (number | ReferenceObject)[]
}

export interface ArraySubtype {
  type: 'array' | ['array', 'null']
  prefixItems?: (SchemaObject | ReferenceObject)[]
  items?: SchemaObject | ReferenceObject | (SchemaObject | ReferenceObject)[]
  minItems?: number
  maxItems?: number
  enum?: (SchemaObject | ReferenceObject)[]
}

export interface BooleanSubtype {
  type: 'boolean' | ['boolean', 'null']
  enum?: (boolean | ReferenceObject)[]
}

export interface NullSubtype {
  type: 'null'
}

export interface ObjectSubtype {
  type: 'object' | ['object', 'null']
  properties?: { [name: string]: SchemaObject | ReferenceObject }
  additionalProperties?:
    | boolean
    | Record<string, never>
    | SchemaObject
    | ReferenceObject
  required?: string[]
  allOf?: (SchemaObject | ReferenceObject)[]
  anyOf?: (SchemaObject | ReferenceObject)[]
  enum?: (SchemaObject | ReferenceObject)[]
  $defs?: $defs
}

/**
 * [4.8.25] Discriminator Object
 * When request bodies or response payloads may be one of a number of different schemas, a discriminator object can be used to aid in serialization, deserialization, and validation. The discriminator is a specific object in a schema which is used to inform the consumer of the document of an alternative schema based on the value associated with it.
 */
export interface DiscriminatorObject {
  /** REQUIRED. The name of the property in the payload that will hold the discriminator value. */
  propertyName: string
  /** An object to hold mappings between payload values and schema names or references. */
  mapping?: Record<string, string>
  /** If this exists, then a discriminator type should be added to objects matching this path */
  oneOf?: string[]
}

/**
 * [4.8.26] XML Object
 * A metadata object that allows for more fine-tuned XML model definitions. When using arrays, XML element names are not inferred (for singular/plural forms) and the `name` property SHOULD be used to add that information. See examples for expected behavior.
 */
export interface XMLObject extends Extensible {
  /** Replaces the name of the element/attribute used for the described schema property. When defined within `items`, it will affect the name of the individual XML elements within the list. When defined alongside `type` being `array` (outside the `items`), it will affect the wrapping element and only if `wrapped` is `true`. If `wrapped` is `false`, it will be ignored. */
  name?: string
  /** The URI of the namespace definition. This MUST be in the form of an absolute URI. */
  namespace?: string
  /** The prefix to be used for the name. */
  prefix?: string
  /** Declares whether the property definition translates to an attribute instead of an element. Default value is `false`. */
  attribute?: boolean
  /** MAY be used only for an array definition. Signifies whether the array is wrapped (for example, `<books><book/><book/></books>`) or unwrapped (`<book/><book/>`). Default value is `false`. The definition takes effect only when defined alongside `type` being `array` (outside the `items`). */
  wrapped?: boolean
}

/**
 * [4.8.27] Security Scheme Object
 * Defines a security scheme that can be used by the operations.
 */
export type SecuritySchemeObject = {
  /** A description for security scheme. CommonMark syntax MAY be used for rich text representation. */
  description?: string
  [key: `x-${string}`]: any
} & (
  | {
      /** REQUIRED. The type of the security scheme. */
      type: 'apiKey'
      /** REQUIRED. The name of the header, query or cookie parameter to be used. */
      name: string
      /** REQUIRED. The location of the API key. */
      in: 'query' | 'header' | 'cookie'
    }
  | {
      /** REQUIRED. The type of the security scheme. */
      type: 'http'
      /** REQUIRED. The name of the HTTP Authorization scheme to be used in the Authorization header as defined in [RFC7235]. The values used SHOULD be registered in the IANA Authentication Scheme registry. */
      scheme: string
      /** A hint to the client to identify how the bearer token is formatted. Bearer tokens are usually generated by an authorization server, so this information is primarily for documentation purposes. */
      bearer?: string
    }
  | {
      /** REQUIRED. The type of the security scheme. */
      type: 'mutualTLS'
    }
  | {
      /** REQUIRED. Tye type of the security scheme. */
      type: 'oauth2'
      /** REQUIRED. An object containing configuration information for the flow types supported. */
      flows: OAuthFlowsObject
    }
  | {
      /** REQUIRED. Tye type of the security scheme. */
      type: 'openIdConnect'
      /** REQUIRED. OpenId Connect URL to discover OAuth2 configuration values. This MUST be in the form of a URL. The OpenID Connect standard requires the use of TLS. */
      openIdConnectUrl: string
    }
)

/**
 * [4.8.26] OAuth Flows Object
 * Allows configuration of the supported OAuth Flows.
 */
export interface OAuthFlowsObject extends Extensible {
  /** Configuration for the OAuth Implicit flow */
  implicit?: OAuthFlowObject
  /** Configuration for the OAuth Resource Owner Password flow */
  password?: OAuthFlowObject
  /** Configuration for the OAuth Client Credentials flow. Previously called `application` in OpenAPI 2.0. */
  clientCredentials?: OAuthFlowObject
  /** Configuration for the OAuth Authorization Code flow. Previously called `accessCode` in OpenAPI 2.0. */
  authorizationCode?: OAuthFlowObject
}

/**
 * [4.8.29] OAuth Flow Object
 * Configuration details for a supported OAuth Flow
 */
export interface OAuthFlowObject extends Extensible {
  /** REQUIRED. The authorization URL to be used for this flow. This MUST be in the form of a URL. The OAuth2 standard requires the use of TLS. */
  authorizationUrl: string
  /** REQUIRED. The token URL to be used for this flow. This MUST be in the form of a URL. The OAuth2 standard requires the use of TLS. */
  tokenUrl: string
  /** The URL to be used for obtaining refresh tokens. This MUST be in the form of a URL. The OAuth2 standard requires the use of TLS. */
  refreshUrl: string
  /** REQUIRED. The available scopes for the OAuth2 security scheme. A map between the scope name and a short description for it. The map MAY be empty. */
  scopes: { [name: string]: string }
}

/**
 * [4.8.30] Security Requirements Object
 * Lists the required security schemes to execute this operation. The name used for each property MUST correspond to a security scheme declared in the Security Schemes under the Components Object.
 */
export type SecurityRequirementObject = {
  [P in keyof ComponentsObject['securitySchemes']]?: string[]
}

export type $defs = Record<string, SchemaObject>
