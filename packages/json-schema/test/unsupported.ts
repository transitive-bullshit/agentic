export const unsupportedTests: Record<
  string,
  Record<string, Record<string, boolean>>
> = {
  'draft2019-09/format': {
    'email format': {
      'invalid email string is only an annotation by default': true
    },
    'regex format': {
      'invalid regex string is only an annotation by default': true
    },
    'ipv4 format': {
      'invalid ipv4 string is only an annotation by default': true
    },
    'ipv6 format': {
      'invalid ipv6 string is only an annotation by default': true
    },
    'hostname format': {
      'invalid hostname string is only an annotation by default': true
    },
    'date format': {
      'invalid date string is only an annotation by default': true
    },
    'date-time format': {
      'invalid date-time string is only an annotation by default': true
    },
    'time format': {
      'invalid time string is only an annotation by default': true
    },
    'json-pointer format': {
      'invalid json-pointer string is only an annotation by default': true
    },
    'relative-json-pointer format': {
      'invalid relative-json-pointer string is only an annotation by default': true
    },
    'uri format': {
      'invalid uri string is only an annotation by default': true
    },
    'uri-reference format': {
      'invalid uri-reference string is only an annotation by default': true
    },
    'uri-template format': {
      'invalid uri-template string is only an annotation by default': true
    },
    'uuid format': {
      'invalid uuid string is only an annotation by default': true
    },
    'duration format': {
      'invalid duration string is only an annotation by default': true
    }
  },
  'draft4/type': {
    'multiple types can be specified in an array': {
      'an integer is valid': true
    }
  },
  'draft7/type': {
    'multiple types can be specified in an array': {
      'an integer is valid': true
    },
    'not multiple types': {
      mismatch: true
    }
  },
  'draft2019-09/type': {
    'multiple types can be specified in an array': {
      'an integer is valid': true
    }
  },
  'draft2020-12/type': {
    'multiple types can be specified in an array': {
      'an integer is valid': true
    }
  },
  'draft4/not': {
    'not multiple types': {
      mismatch: true
    }
  },
  'draft7/not': {
    'not multiple types': {
      mismatch: true
    }
  },
  'draft2019-09/not': {
    'not multiple types': {
      mismatch: true
    }
  },
  'draft2020-12/not': {
    'not multiple types': {
      mismatch: true
    }
  },
  'draft2019-09/optional/format/date': {
    'validation of date strings': {
      'a invalid date string with 32 days in January': true,
      'a invalid date string with 29 days in February (normal)': true,
      'a invalid date string with 30 days in February (leap)': true,
      'a invalid date string with 32 days in March': true,
      'a invalid date string with 31 days in April': true,
      'a invalid date string with 32 days in May': true,
      'a invalid date string with 31 days in June': true,
      'a invalid date string with 32 days in July': true,
      'a invalid date string with 32 days in August': true,
      'a invalid date string with 31 days in September': true,
      'a invalid date string with 32 days in October': true,
      'a invalid date string with 31 days in November': true,
      'a invalid date string with 32 days in December': true,
      'a invalid date string with invalid month': true,
      'invalid month': true,
      'invalid month-day combination': true,
      '2021 is not a leap year': true
    }
  },
  'draft2019-09/optional/format/idn-email': {
    'validation of an internationalized e-mail addresses': {
      'an invalid idn e-mail address': true,
      'an invalid e-mail address': true
    }
  },
  'draft2019-09/optional/format/idn-hostname': {
    'validation of internationalized host names': {
      'illegal first char U+302E Hangul single dot tone mark': true,
      'contains illegal char U+302E Hangul single dot tone mark': true,
      'a host name with a component too long': true,
      'invalid label, correct Punycode': true,
      'invalid Punycode': true,
      'U-label contains "--" in the 3rd and 4th position': true,
      'U-label starts with a dash': true,
      'U-label ends with a dash': true,
      'U-label starts and ends with a dash': true,
      'Begins with a Spacing Combining Mark': true,
      'Begins with a Nonspacing Mark': true,
      'Begins with an Enclosing Mark': true,
      'Exceptions that are DISALLOWED, right-to-left chars': true,
      'Exceptions that are DISALLOWED, left-to-right chars': true,
      "MIDDLE DOT with no preceding 'l'": true,
      'MIDDLE DOT with nothing preceding': true,
      "MIDDLE DOT with no following 'l'": true,
      'MIDDLE DOT with nothing following': true,
      'Greek KERAIA not followed by Greek': true,
      'Greek KERAIA not followed by anything': true,
      'Hebrew GERESH not preceded by Hebrew': true,
      'Hebrew GERESH not preceded by anything': true,
      'Hebrew GERSHAYIM not preceded by Hebrew': true,
      'Hebrew GERSHAYIM not preceded by anything': true,
      'KATAKANA MIDDLE DOT with no Hiragana, Katakana, or Han': true,
      'KATAKANA MIDDLE DOT with no other characters': true,
      'Arabic-Indic digits mixed with Extended Arabic-Indic digits': true,
      'ZERO WIDTH JOINER not preceded by Virama': true,
      'ZERO WIDTH JOINER not preceded by anything': true
    }
  },
  'draft2019-09/optional/format/ipv4': {
    'validation of IP addresses': {
      'leading zeroes should be rejected, as they are treated as octals': true
    }
  },
  'draft2019-09/optional/format/iri-reference': {
    'validation of IRI References': {
      'an invalid IRI Reference': true,
      'an invalid IRI fragment': true
    }
  },
  'draft2019-09/optional/format/iri': {
    'validation of IRIs': {
      'an invalid IRI based on IPv6': true,
      'an invalid relative IRI Reference': true,
      'an invalid IRI': true,
      'an invalid IRI though valid IRI reference': true
    }
  },
  'draft2019-09/optional/format/time': {
    'validation of time strings': {
      'valid leap second, positive time-offset': true,
      'valid leap second, large positive time-offset': true,
      'invalid leap second, positive time-offset (wrong hour)': true,
      'invalid leap second, positive time-offset (wrong minute)': true,
      'valid leap second, negative time-offset': true,
      'valid leap second, large negative time-offset': true,
      'invalid leap second, negative time-offset (wrong hour)': true,
      'invalid leap second, negative time-offset (wrong minute)': true,
      'an invalid time string with invalid hour': true,
      'an invalid time string with invalid time numoffset hour': true,
      'an invalid time string with invalid time numoffset minute': true
    }
  },
  'draft2019-09/optional/non-bmp-regex': {
    'Proper UTF-16 surrogate pair handling: pattern': {
      'matches empty': true,
      'matches two': true
    },
    'Proper UTF-16 surrogate pair handling: patternProperties': {
      "doesn't match two": true
    }
  },
  'draft2019-09/optional/unicode': {
    'unicode semantics should be used for all pattern matching': {
      'literal unicode character in json string': true,
      'unicode character in hex format in string': true
    },
    'unicode digits are more than 0 through 9': {
      'non-ascii digits (BENGALI DIGIT FOUR, BENGALI DIGIT TWO)': true
    },
    'unicode semantics should be used for all patternProperties matching': {
      'literal unicode character in json string': true,
      'unicode character in hex format in string': true
    }
  },
  'draft2020-12/defs': {
    'validate definition against metaschema': {
      'invalid definition schema': true
    }
  },
  'draft2020-12/dynamicRef': {
    'A $dynamicRef to a $dynamicAnchor in the same schema resource should behave like a normal $ref to an $anchor':
      {
        'An array containing non-strings is invalid': true
      },
    'A $dynamicRef to an $anchor in the same schema resource should behave like a normal $ref to an $anchor':
      {
        'An array containing non-strings is invalid': true
      },
    'A $ref to a $dynamicAnchor in the same schema resource should behave like a normal $ref to an $anchor':
      {
        'An array of strings is valid': true,
        'An array containing non-strings is invalid': true
      },
    'A $dynamicRef should resolve to the first $dynamicAnchor still in scope that is encountered when the schema is evaluated':
      {
        'An array containing non-strings is invalid': true
      },
    "A $dynamicRef with intermediate scopes that don't include a matching $dynamicAnchor should not affect dynamic scope resolution":
      {
        'An array containing non-strings is invalid': true
      },
    'A $dynamicRef that initially resolves to a schema with a matching $dynamicAnchor should resolve to the first $dynamicAnchor in the dynamic scope':
      {
        'The recursive part is not valid against the root': true
      },
    'multiple dynamic paths to the $dynamicRef keyword': {
      'recurse to integerNode - floats are not allowed': true
    },
    'after leaving a dynamic scope, it should not be used by a $dynamicRef': {
      'string matches /$defs/thingy, but the $dynamicRef does not stop here': true,
      'first_scope is not in dynamic scope for the $dynamicRef': true
    }
  },
  'draft2020-12/format': {
    'email format': {
      'invalid email string is only an annotation by default': true
    },
    'regex format': {
      'invalid regex string is only an annotation by default': true
    },
    'ipv4 format': {
      'invalid ipv4 string is only an annotation by default': true
    },
    'ipv6 format': {
      'invalid ipv6 string is only an annotation by default': true
    },
    'hostname format': {
      'invalid hostname string is only an annotation by default': true
    },
    'date format': {
      'invalid date string is only an annotation by default': true
    },
    'date-time format': {
      'invalid date-time string is only an annotation by default': true
    },
    'time format': {
      'invalid time string is only an annotation by default': true
    },
    'json-pointer format': {
      'invalid json-pointer string is only an annotation by default': true
    },
    'relative-json-pointer format': {
      'invalid relative-json-pointer string is only an annotation by default': true
    },
    'uri format': {
      'invalid uri string is only an annotation by default': true
    },
    'uri-reference format': {
      'invalid uri-reference string is only an annotation by default': true
    },
    'uri-template format': {
      'invalid uri-template string is only an annotation by default': true
    },
    'uuid format': {
      'invalid uuid string is only an annotation by default': true
    },
    'duration format': {
      'invalid duration string is only an annotation by default': true
    }
  },
  'draft2020-12/id': {
    'Invalid use of fragments in location-independent $id': {
      'Identifier name': true,
      'Identifier name and no ref': true,
      'Identifier path': true,
      'Identifier name with absolute URI': true,
      'Identifier path with absolute URI': true,
      'Identifier name with base URI change in subschema': true,
      'Identifier path with base URI change in subschema': true
    }
  },
  'draft2020-12/optional/format/date': {
    'validation of date strings': {
      'a invalid date string with 32 days in January': true,
      'a invalid date string with 29 days in February (normal)': true,
      'a invalid date string with 30 days in February (leap)': true,
      'a invalid date string with 32 days in March': true,
      'a invalid date string with 31 days in April': true,
      'a invalid date string with 32 days in May': true,
      'a invalid date string with 31 days in June': true,
      'a invalid date string with 32 days in July': true,
      'a invalid date string with 32 days in August': true,
      'a invalid date string with 31 days in September': true,
      'a invalid date string with 32 days in October': true,
      'a invalid date string with 31 days in November': true,
      'a invalid date string with 32 days in December': true,
      'a invalid date string with invalid month': true,
      'invalid month': true,
      'invalid month-day combination': true,
      '2021 is not a leap year': true
    }
  },
  'draft2020-12/optional/format/idn-email': {
    'validation of an internationalized e-mail addresses': {
      'an invalid idn e-mail address': true,
      'an invalid e-mail address': true
    }
  },
  'draft2020-12/optional/format/idn-hostname': {
    'validation of internationalized host names': {
      'illegal first char U+302E Hangul single dot tone mark': true,
      'contains illegal char U+302E Hangul single dot tone mark': true,
      'a host name with a component too long': true,
      'invalid label, correct Punycode': true,
      'invalid Punycode': true,
      'U-label contains "--" in the 3rd and 4th position': true,
      'U-label starts with a dash': true,
      'U-label ends with a dash': true,
      'U-label starts and ends with a dash': true,
      'Begins with a Spacing Combining Mark': true,
      'Begins with a Nonspacing Mark': true,
      'Begins with an Enclosing Mark': true,
      'Exceptions that are DISALLOWED, right-to-left chars': true,
      'Exceptions that are DISALLOWED, left-to-right chars': true,
      "MIDDLE DOT with no preceding 'l'": true,
      'MIDDLE DOT with nothing preceding': true,
      "MIDDLE DOT with no following 'l'": true,
      'MIDDLE DOT with nothing following': true,
      'Greek KERAIA not followed by Greek': true,
      'Greek KERAIA not followed by anything': true,
      'Hebrew GERESH not preceded by Hebrew': true,
      'Hebrew GERESH not preceded by anything': true,
      'Hebrew GERSHAYIM not preceded by Hebrew': true,
      'Hebrew GERSHAYIM not preceded by anything': true,
      'KATAKANA MIDDLE DOT with no Hiragana, Katakana, or Han': true,
      'KATAKANA MIDDLE DOT with no other characters': true,
      'Arabic-Indic digits mixed with Extended Arabic-Indic digits': true,
      'ZERO WIDTH JOINER not preceded by Virama': true,
      'ZERO WIDTH JOINER not preceded by anything': true
    }
  },
  'draft2020-12/optional/format/ipv4': {
    'validation of IP addresses': {
      'leading zeroes should be rejected, as they are treated as octals': true
    }
  },
  'draft2020-12/optional/format/iri-reference': {
    'validation of IRI References': {
      'an invalid IRI Reference': true,
      'an invalid IRI fragment': true
    }
  },
  'draft2020-12/optional/format/iri': {
    'validation of IRIs': {
      'an invalid IRI based on IPv6': true,
      'an invalid relative IRI Reference': true,
      'an invalid IRI': true,
      'an invalid IRI though valid IRI reference': true
    }
  },
  'draft2020-12/optional/format/time': {
    'validation of time strings': {
      'valid leap second, positive time-offset': true,
      'valid leap second, large positive time-offset': true,
      'invalid leap second, positive time-offset (wrong hour)': true,
      'invalid leap second, positive time-offset (wrong minute)': true,
      'valid leap second, negative time-offset': true,
      'valid leap second, large negative time-offset': true,
      'invalid leap second, negative time-offset (wrong hour)': true,
      'invalid leap second, negative time-offset (wrong minute)': true,
      'an invalid time string with invalid hour': true,
      'an invalid time string with invalid time numoffset hour': true,
      'an invalid time string with invalid time numoffset minute': true
    }
  },
  'draft2020-12/optional/non-bmp-regex': {
    'Proper UTF-16 surrogate pair handling: pattern': {
      'matches empty': true,
      'matches two': true
    },
    'Proper UTF-16 surrogate pair handling: patternProperties': {
      "doesn't match two": true
    }
  },
  'draft2020-12/optional/unicode': {
    'unicode semantics should be used for all pattern matching': {
      'literal unicode character in json string': true,
      'unicode character in hex format in string': true
    },
    'unicode digits are more than 0 through 9': {
      'non-ascii digits (BENGALI DIGIT FOUR, BENGALI DIGIT TWO)': true
    },
    'unicode semantics should be used for all patternProperties matching': {
      'literal unicode character in json string': true,
      'unicode character in hex format in string': true
    }
  },
  'draft2020-12/ref': {
    'relative pointer ref to array': {
      'mismatch array': true
    }
  },
  'draft4/optional/format/ipv4': {
    'validation of IP addresses': {
      'leading zeroes should be rejected, as they are treated as octals': true
    }
  },
  'draft4/optional/non-bmp-regex': {
    'Proper UTF-16 surrogate pair handling: pattern': {
      'matches empty': true,
      'matches two': true
    },
    'Proper UTF-16 surrogate pair handling: patternProperties': {
      "doesn't match two": true
    }
  },
  'draft4/optional/unicode': {
    'unicode semantics should be used for all pattern matching': {
      'literal unicode character in json string': true,
      'unicode character in hex format in string': true
    },
    'unicode digits are more than 0 through 9': {
      'non-ascii digits (BENGALI DIGIT FOUR, BENGALI DIGIT TWO)': true
    },
    'unicode semantics should be used for all patternProperties matching': {
      'literal unicode character in json string': true,
      'unicode character in hex format in string': true
    }
  },
  'draft4/optional/zeroTerminatedFloats': {
    'some languages do not distinguish between different types of numeric value':
      {
        'a float is not an integer even without fractional part': true
      }
  },
  'draft7/optional/content': {
    'validation of string-encoded content based on media type': {
      'an invalid JSON document': true
    },
    'validation of binary string-encoding': {
      'an invalid base64 string (% is not a valid character)': true
    },
    'validation of binary-encoded media type documents': {
      'a validly-encoded invalid JSON document': true,
      'an invalid base64 string that is valid JSON': true
    }
  },
  'draft7/optional/format/date': {
    'validation of date strings': {
      'a invalid date string with 32 days in January': true,
      'a invalid date string with 29 days in February (normal)': true,
      'a invalid date string with 30 days in February (leap)': true,
      'a invalid date string with 32 days in March': true,
      'a invalid date string with 31 days in April': true,
      'a invalid date string with 32 days in May': true,
      'a invalid date string with 31 days in June': true,
      'a invalid date string with 32 days in July': true,
      'a invalid date string with 32 days in August': true,
      'a invalid date string with 31 days in September': true,
      'a invalid date string with 32 days in October': true,
      'a invalid date string with 31 days in November': true,
      'a invalid date string with 32 days in December': true,
      'a invalid date string with invalid month': true,
      'invalid month': true,
      'invalid month-day combination': true,
      '2021 is not a leap year': true
    }
  },
  'draft7/optional/format/idn-email': {
    'validation of an internationalized e-mail addresses': {
      'an invalid idn e-mail address': true,
      'an invalid e-mail address': true
    }
  },
  'draft7/optional/format/idn-hostname': {
    'validation of internationalized host names': {
      'illegal first char U+302E Hangul single dot tone mark': true,
      'contains illegal char U+302E Hangul single dot tone mark': true,
      'a host name with a component too long': true,
      'invalid label, correct Punycode': true,
      'invalid Punycode': true,
      'U-label contains "--" in the 3rd and 4th position': true,
      'U-label starts with a dash': true,
      'U-label ends with a dash': true,
      'U-label starts and ends with a dash': true,
      'Begins with a Spacing Combining Mark': true,
      'Begins with a Nonspacing Mark': true,
      'Begins with an Enclosing Mark': true,
      'Exceptions that are DISALLOWED, right-to-left chars': true,
      'Exceptions that are DISALLOWED, left-to-right chars': true,
      "MIDDLE DOT with no preceding 'l'": true,
      'MIDDLE DOT with nothing preceding': true,
      "MIDDLE DOT with no following 'l'": true,
      'MIDDLE DOT with nothing following': true,
      'Greek KERAIA not followed by Greek': true,
      'Greek KERAIA not followed by anything': true,
      'Hebrew GERESH not preceded by Hebrew': true,
      'Hebrew GERESH not preceded by anything': true,
      'Hebrew GERSHAYIM not preceded by Hebrew': true,
      'Hebrew GERSHAYIM not preceded by anything': true,
      'KATAKANA MIDDLE DOT with no Hiragana, Katakana, or Han': true,
      'KATAKANA MIDDLE DOT with no other characters': true,
      'Arabic-Indic digits mixed with Extended Arabic-Indic digits': true,
      'ZERO WIDTH JOINER not preceded by Virama': true,
      'ZERO WIDTH JOINER not preceded by anything': true
    }
  },
  'draft7/optional/format/ipv4': {
    'validation of IP addresses': {
      'leading zeroes should be rejected, as they are treated as octals': true
    }
  },
  'draft7/optional/format/iri-reference': {
    'validation of IRI References': {
      'an invalid IRI Reference': true,
      'an invalid IRI fragment': true
    }
  },
  'draft7/optional/format/iri': {
    'validation of IRIs': {
      'an invalid IRI based on IPv6': true,
      'an invalid relative IRI Reference': true,
      'an invalid IRI': true,
      'an invalid IRI though valid IRI reference': true
    }
  },
  'draft7/optional/format/time': {
    'validation of time strings': {
      'valid leap second, positive time-offset': true,
      'valid leap second, large positive time-offset': true,
      'invalid leap second, positive time-offset (wrong hour)': true,
      'invalid leap second, positive time-offset (wrong minute)': true,
      'valid leap second, negative time-offset': true,
      'valid leap second, large negative time-offset': true,
      'invalid leap second, negative time-offset (wrong hour)': true,
      'invalid leap second, negative time-offset (wrong minute)': true,
      'an invalid time string with invalid hour': true,
      'an invalid time string with invalid time numoffset hour': true,
      'an invalid time string with invalid time numoffset minute': true
    }
  },
  'draft7/optional/non-bmp-regex': {
    'Proper UTF-16 surrogate pair handling: pattern': {
      'matches empty': true,
      'matches two': true
    },
    'Proper UTF-16 surrogate pair handling: patternProperties': {
      "doesn't match two": true
    }
  },
  'draft7/optional/unicode': {
    'unicode semantics should be used for all pattern matching': {
      'literal unicode character in json string': true,
      'unicode character in hex format in string': true
    },
    'unicode digits are more than 0 through 9': {
      'non-ascii digits (BENGALI DIGIT FOUR, BENGALI DIGIT TWO)': true
    },
    'unicode semantics should be used for all patternProperties matching': {
      'literal unicode character in json string': true,
      'unicode character in hex format in string': true
    }
  }
}
