<p>
  <a href="https://github.com/transitive-bullshit/agentic-platform/actions/workflows/main.yml"><img alt="Build Status" src="https://github.com/transitive-bullshit/agentic-platform/actions/workflows/main.yml/badge.svg" /></a>
  <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg" /></a>
</p>

# Agentic <!-- omit from toc -->

## TODO

- stripe
  - plans => prices
    - monthly vs yearly prices
  - re-add custom metrics
  - re-add coupons
  - declarative json-based pricing
    - like https://github.com/tierrun/tier and Saasify
    - https://github.com/tierrun/tier/blob/main/pricing/schema.json
    - https://blog.tier.run/tier-hello-world-demo
- auth
  - decide on approach for auth
    - built-in, first-party, tight coupling
    - https://github.com/toolbeam/openauth
    - https://github.com/aipotheosis-labs/aci/tree/main/backend/apps
    - https://github.com/NangoHQ/nango
    - https://github.com/transitive-bullshit?submit=Search&q=oauth&tab=stars&type=&sort=&direction=&submit=Search
    - clerk / workos / auth0
- db
  - replace `enabled` with soft `deletedAt` timestamp
- switch to [consola](https://github.com/unjs/consola) for logging

## License

UNLICENSED PROPRIETARY © [Agentic](https://x.com/transitive_bs)

To stay up to date or learn more, follow [@transitive_bs](https://x.com/transitive_bs) on Twitter.
