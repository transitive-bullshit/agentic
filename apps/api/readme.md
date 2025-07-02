<p align="center">
  <a href="https://agentic.so">
    <img alt="Agentic" src="https://raw.githubusercontent.com/transitive-bullshit/agentic/main/apps/web/public/agentic-social-image-light.jpg" width="640">
  </a>
</p>

<p>
  <a href="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml"><img alt="Build Status" src="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml/badge.svg" /></a>
  <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg" /></a>
</p>

# Agentic API <!-- omit from toc -->

> Backend API for the Agentic platform.

- [Website](https://agentic.so)
- [Docs](https://docs.agentic.so)

## Dependencies

- **Postgres**
  - `DATABASE_URL` - Postgres connection string
  - [On macOS](https://wiki.postgresql.org/wiki/Homebrew): `brew install postgresql && brew services start postgresql`
  - You'll need to run `pnpm drizzle-kit push` to set up your database schema
- **S3** - Required to use file attachments
  - Any S3-compatible provider is supported, such as [Cloudflare R2](https://developers.cloudflare.com/r2/)
  - Alterantively, you can use a local S3 server like [MinIO](https://github.com/minio/minio#homebrew-recommended) or [LocalStack](https://github.com/localstack/localstack)
    - To run LocalStack on macOS: `brew install localstack/tap/localstack-cli && localstack start -d`
    - To run MinIO macOS: `brew install minio/stable/minio && minio server /data`
  - I recommend using Cloudflare R2, though – it's amazing and should be free for most use cases!
  - `S3_BUCKET` - Required
  - `S3_REGION` - Optional; defaults to `auto`
  - `S3_ENDPOINT` - Required; example: `https://<id>.r2.cloudflarestorage.com`
  - `ACCESS_KEY_ID` - Required ([cloudflare R2 docs](https://developers.cloudflare.com/r2/api/s3/tokens/))
  - `SECRET_ACCESS_KEY` - Required ([cloudflare R2 docs](https://developers.cloudflare.com/r2/api/s3/tokens/))

## License

[GNU AGPL 3.0](https://choosealicense.com/licenses/agpl-3.0/)
