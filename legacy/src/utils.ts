export const extractJSONObjectFromString = (text: string): string | undefined =>
  text.match(/\{(.|\n)*\}/gm)?.[0]

export const extractJSONArrayFromString = (text: string): string | undefined =>
  text.match(/\[(.|\n)*\]/gm)?.[0]
