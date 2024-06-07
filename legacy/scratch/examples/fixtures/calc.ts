export type Problem = {
  id: string
  question: string
  expected: string
  grade: string
  kind: string
}

function decimalCalcProblems(places: number, placesText: string): Problem[] {
  return [
    {
      id: `${placesText}-calc-0001`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the result of adding -942.12 and 1441.23? Give answer rounded to ${placesText} decimal places.`,
      expected: (-942.12 + 1441.23).toFixed(places)
    },
    {
      id: `${placesText}-calc-0002`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the result of multiplying -942.12 by 1441.23?  Give answer rounded to ${placesText} decimal places.`,
      expected: (-942.12 * 1441.23).toFixed(places)
    },
    {
      id: `${placesText}-calc-0003`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the square root of 1441.23?  Give answer rounded to ${placesText} decimal places.`,
      expected: Math.sqrt(1441.23).toFixed(places)
    },
    {
      id: `${placesText}-calc-0004`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the absolute value of -942.12?  Give answer rounded to ${placesText} decimal places.`,
      expected: Math.abs(-942.12).toFixed(places)
    },
    {
      id: `${placesText}-calc-0005`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the mean of -942.12 and 1441.23?  Give answer rounded to ${placesText} decimal places.`,
      expected: ((-942.12 + 1441.23) / 2).toFixed(places)
    },
    {
      id: `${placesText}-calc-0006`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the sign of -942.12?  Give answer rounded to ${placesText} decimal places.`,
      expected: Math.sign(-942.12).toFixed(places)
    },
    {
      id: `${placesText}-calc-0007`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the result of calculating e raised to the power of 2?  Give answer rounded to ${placesText} decimal places.`,
      expected: Math.exp(2).toFixed(places)
    },
    {
      id: `${placesText}-calc-0008`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the natural logarithm of 1441.23?  Give answer rounded to ${placesText} decimal places.`,
      expected: Math.log(1441.23).toFixed(places)
    },
    {
      id: `${placesText}-calc-0009`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the result of calculating sine of -1.12?  Give answer rounded to ${placesText} decimal places.`,
      expected: Math.sin(-1.12).toFixed(places)
    },
    {
      id: `${placesText}-calc-0010`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the result of calculating cosine of 1.23?  Give answer rounded to ${placesText} decimal places.`,
      expected: Math.cos(1.23).toFixed(places)
    },
    {
      id: `${placesText}-calc-0011`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the result of calculating tangent of -1.12?  Give answer rounded to ${placesText} decimal places.`,
      expected: Math.tan(-1.12).toFixed(places)
    },
    {
      id: `${placesText}-calc-0012`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the result of calculating arctangent of 1.23?  Give answer in radians rounded to ${placesText} decimal places.`,
      expected: Math.atan(1.23).toFixed(places)
    },
    {
      id: `${placesText}-calc-0013`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the result of calculating arccosine of 0.12?  Give answer in radians rounded to ${placesText} decimal places.`,
      expected: Math.acos(0.12).toFixed(places)
    },
    {
      id: `${placesText}-calc-0014`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the result of calculating arcsine of 0.23?  Give answer in radians rounded to ${placesText} decimal places.`,
      expected: Math.asin(0.23).toFixed(places)
    },
    {
      id: `${placesText}-calc-0015`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the result of adding -942.1421 and 1441.134?  Give answer rounded to ${placesText} decimal places.`,
      expected: (-942.1421 + 1441.134).toFixed(places)
    },
    {
      id: `${placesText}-calc-0016`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `Calculate (2.12^3)^2.   Give answer rounded to ${placesText} decimal places.`,
      expected: ((2.12 ** 3) ** 2).toFixed(places)
    },
    {
      id: `${placesText}-calc-0017`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `Calculate (2.18^3)^4.  Give answer rounded to ${placesText} decimal places.`,
      expected: ((2.18 ** 3) ** 4).toFixed(places)
    },
    {
      id: `${placesText}-calc-0018`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `Calculate (2.3*3)^4.  Give answer rounded to ${placesText} decimal places.`,
      expected: ((2.3 * 3) ** 4).toFixed(places)
    },
    {
      id: `${placesText}-calc-0019`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the result of adding 6.421 and -4.2?  Give answer rounded to ${placesText} decimal places.`,
      expected: (6.421 + -4.2).toFixed(places)
    },
    {
      id: `${placesText}-calc-0020`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the result of subtracting 8.133 from 17.3?  Give answer rounded to ${placesText} decimal places.`,
      expected: (17.3 - 8.133).toFixed(places)
    },
    {
      id: `${placesText}-calc-0021`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the result of multiplying -0.0431 by 6.42?  Give answer rounded to ${placesText} decimal places.`,
      expected: (-0.0431 * 6.42).toFixed(places)
    },
    {
      id: `${placesText}-calc-0022`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the square root of 17.3?  Give answer rounded to ${placesText} decimal places.`,
      expected: Math.sqrt(17.3).toFixed(places)
    },
    {
      id: `${placesText}-calc-0023`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the absolute value of -4.213?  Give answer rounded to ${placesText} decimal places.`,
      expected: Math.abs(-4.213).toFixed(places)
    },
    {
      id: `${placesText}-calc-0024`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the natural logarithm of 8.131?  Give answer rounded to ${placesText} decimal places.`,
      expected: Math.log(8.131).toFixed(places)
    },
    {
      id: `${placesText}-calc-0025`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the sine of -0.413 radians?  Give answer rounded to ${placesText} decimal places.`,
      expected: Math.sin(-0.413).toFixed(places)
    },
    {
      id: `${placesText}-calc-0026`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the cosine of 6.42 radians?  Give answer rounded to ${placesText} decimal places.`,
      expected: Math.cos(6.42).toFixed(places)
    },
    {
      id: `${placesText}-calc-0027`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the tangent of -4.21 radians?  Give answer rounded to ${placesText} decimal places.`,
      expected: Math.tan(-4.21).toFixed(places)
    },
    {
      id: `${placesText}-calc-0028`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the arctangent of 17.3?  Give answer in radians rounded to ${placesText} decimal places.`,
      expected: Math.atan(17.3).toFixed(places)
    },
    {
      id: `${placesText}-calc-0029`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the arccosine of -0.04?  Give answer in radians rounded to ${placesText} decimal places.`,
      expected: Math.acos(-0.04).toFixed(places)
    },
    {
      id: `${placesText}-calc-0030`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is the arcsine of 0.113?  Give answer in radians rounded to ${placesText} decimal places.`,
      expected: Math.asin(0.113).toFixed(places)
    },
    {
      id: `${placesText}-calc-0031`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is 6.21 raised to power 8.  Give answer rounded to ${placesText} decimal places.`,
      expected: (6.21 ** 8).toFixed(places)
    },
    {
      id: `${placesText}-calc-0032`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is e raised to power pi/2.  Give answer rounded to ${placesText} decimal places.`,
      expected: Math.exp(Math.PI / 2).toFixed(places)
    },
    {
      id: `${placesText}-calc-0033`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is pi/2 raised to power e.  Give answer rounded to ${placesText} decimal places.`,
      expected: ((Math.PI / 2) ** Math.E).toFixed(places)
    },
    {
      id: `${placesText}-calc-0034`,
      grade: `6`,
      kind: `decimal calculation`,
      question: `What is e raised to power 3.2.  Give answer rounded to ${placesText} decimal places.`,
      expected: Math.exp(3.2).toFixed(places)
    }
  ]
}

function decimalComparisonProblems(): Problem[] {
  return [
    {
      id: `calc-0035`,
      grade: `6`,
      kind: `decimal comparison`,
      question: `Is 0.31 plus 0.21 greater than 0.11 plus 0.99? Answer "true" or "false" without quotes.`,
      expected: (0.31 + 0.21 > 0.11 + 0.99).toString()
    },
    {
      id: `calc-0036`,
      grade: `6`,
      kind: `decimal comparison`,
      question: `Is 0.56 minus 0.23 less than or equal to 0.78 divided by 0.34? Answer "true" or "false" without quotes.`,
      expected: (0.56 - 0.23 <= 0.78 / 0.34).toString()
    },
    {
      id: `calc-0037`,
      grade: `6`,
      kind: `decimal comparison`,
      question: `Is 0.67 times 0.45 not equal to 0.23 plus 0.54? Answer "true" or "false" without quotes.`,
      expected: (0.67 * 0.45 != 0.23 + 0.54).toString()
    },
    {
      id: `calc-0038`,
      grade: `6`,
      kind: `decimal comparison`,
      question: `Is 0.89 divided by 0.12 greater than or equal to 0.34 minus 0.12? Answer "true" or "false" without quotes.`,
      expected: (0.89 / 0.12 >= 0.34 - 0.12).toString()
    },
    {
      id: `calc-0039`,
      grade: `6`,
      kind: `decimal comparison`,
      question: `Is 0.45 plus 0.67 less than or equal to 1 minus (1/3)? Answer "true" or "false" without quotes.`,
      expected: (0.45 + 0.67 <= 1 - 1 / 3).toString()
    },
    {
      id: `calc-0040`,
      grade: `6`,
      kind: `decimal comparison`,
      question: `Is (1/2) times (1/3) less than or equal to (1/4) plus (1/8)? Answer "true" or "false" without quotes.`,
      expected: ((1 / 2) * (1 / 3) <= 1 / 4 + 1 / 8).toString()
    },
    {
      id: `calc-0041`,
      grade: `6`,
      kind: `decimal comparison`,
      question: `Is (1/5) divided by (1/7) greater than or equal to (1/6) minus (1/8)? Answer "true" or "false" without quotes.`,
      expected: (1 / 5 / (1 / 7) >= 1 / 6 - 1 / 8).toString()
    },
    {
      id: `calc-0042`,
      grade: `6`,
      kind: `decimal comparison`,
      question: `Is (2/3) times (3/4) greater than or equal to (5/6) minus (7/8)? Answer "true" or "false" without quotes.`,
      expected: ((2 / 3) * (3 / 4) >= 5 / 6 - 7 / 8).toString()
    },
    {
      id: `calc-0043`,
      grade: `6`,
      kind: `decimal comparison`,
      question: `Is (9/10) divided by (7/10) less than or equal to (5/6) plus (7/8)? Answer "true" or "false" without quotes.`,
      expected: (9 / 10 / (7 / 10) <= 5 / 6 + 7 / 8).toString()
    },
    {
      id: `calc-0044`,
      grade: `6`,
      kind: `decimal comparison`,
      question: `Is sqrt(2)/2 times sqrt(3)/3 less than or equal to sqrt(5)/5 plus sqrt(7)/7? Answer "true" or "false" without quotes.`,
      expected: (
        ((Math.sqrt(2) / 2) * Math.sqrt(3)) / 3 <=
        Math.sqrt(5) / 5 + Math.sqrt(7) / 7
      ).toString()
    },
    {
      id: `calc-0045`,
      grade: `6`,
      kind: `decimal comparison`,
      question: `Is sqrt(11)/11 divided by sqrt(13)/13 greater than or equal to sqrt(17)/17 minus sqrt(19)/19? Answer "true" or "false" without quotes.`,
      expected: (
        Math.sqrt(11) / 11 / (Math.sqrt(13) / 13) >=
        Math.sqrt(17) / 17 - Math.sqrt(19) / 19
      ).toString()
    },
    {
      id: `calc-0046`,
      grade: `6`,
      kind: `decimal comparison`,
      question: `Is sqrt(23)/23 times sqrt(29)/29 greater than or equal to sqrt(31)/31 minus sqrt(37)/37? Answer "true" or "false" without quotes.`,
      expected: (
        ((Math.sqrt(23) / 23) * Math.sqrt(29)) / 29 >=
        Math.sqrt(31) / 31 - Math.sqrt(37) / 37
      ).toString()
    }
  ]
}

function integerCalcProblems(): Problem[] {
  return [
    {
      id: `calc-0047`,
      grade: `6`,
      kind: `integer comparison`,
      question: `Is 31 plus 210 greater than 11 plus 99? Answer "true" or "false" without quotes.`,
      expected: (31 + 210 > 11 + 99).toString()
    },
    {
      id: `calc-0048`,
      grade: `6`,
      kind: `integer comparison`,
      question: `Is 100 divided by 5 less than or equal to 20? Answer "true" or "false" without quotes.`,
      expected: (100 / 5 <= 20).toString()
    },
    {
      id: `calc-0049`,
      grade: `6`,
      kind: `integer comparison`,
      question: `Is 999 minus 888 greater than or equal to 100? Answer "true" or "false" without quotes.`,
      expected: (999 - 888 >= 100).toString()
    },
    {
      id: `calc-0050`,
      grade: `6`,
      kind: `integer comparison`,
      question: `Is 50 times 10 not equal to 500? Answer "true" or "false" without quotes.`,
      expected: (50 * 10 != 500).toString()
    },
    {
      id: `calc-0051`,
      grade: `6`,
      kind: `integer comparison`,
      question: `Is 999 divided by 3 less than or equal to 333? Answer "true" or "false" without quotes.`,
      expected: (999 / 3 <= 333).toString()
    }
  ]
}
export const getProblems = () => ({
  one: decimalCalcProblems(1, 'one'),
  two: decimalCalcProblems(2, 'two'),
  three: decimalCalcProblems(3, 'three'),
  four: decimalCalcProblems(4, 'four'),
  comparison: decimalComparisonProblems(),
  integer: integerCalcProblems()
})
