# 🌊 run `tilt up` to start
# then open http://localhost:10350/r/(all)/overview

load('ext://uibutton', 'cmd_button', 'bool_input', 'location')
# Find docs on Tilt at https://docs.tilt.dev/api.html#api.local_resource
# Find icons at https://fonts.google.com/icons
 
local_resource(
    '🍍 API',
    serve_dir='apps/api',
    serve_cmd='pnpm dev:server',
    links=[ link('http://localhost:3001/v1/health', 'API'), ],
    labels=['Agentic']
)

local_resource(
    '🌶️ Web',
    serve_dir='apps/web',
    serve_cmd='pnpm dev',
    links=[ link('http://localhost:3000', 'Web'), ],
    labels=['Agentic']
)

local_resource(
    '🍉 Gateway',
    serve_dir='apps/gateway',
    serve_cmd='pnpm dev',
    labels=['Agentic']
)

local_resource(
    '📚 Docs',
    serve_dir='docs',
    serve_cmd='mint dev --port 3333',
    links=[ link('http://localhost:3333', 'Docs'), ],
    labels=['Agentic'],
    auto_init=False
)

local_resource(
    '🧪 E2E Tests',
    cmd='echo 0',
    labels=['Testing'],
    auto_init=False
)

local_resource(
    '🔍 Drizzle Studio',
    serve_dir='apps/api',
    serve_cmd='pnpm drizzle-kit studio',
    links=[ link('https://local.drizzle.studio', 'Drizzle Studio'), ],
    labels=['Services'],
)

local_resource(
    '💸 Stripe Webhooks',
    serve_dir='apps/api',
    serve_cmd='pnpm dev:stripe',
    # links=[ link('http://localhost:4983', 'Stripe Webhooks'), ],
    labels=['Services'],
)

cmd_button(
    'Seed Database',
    argv=['sh', '-c', 'cd apps/e2e && pnpm run seed-db'],
    location=location.NAV,
    icon_name='nature',
    text='Seed Database',
)
