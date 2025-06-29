export type GenerateTSFromOpenAPIOptions = {
  openapiFilePath: string
  outputDir: string
  dryRun?: boolean
  prettier?: boolean
  eslint?: boolean
  zodSchemaJsDocs?: boolean
}
