const isServer = globalThis.window === undefined
const isSafari =
  !isServer && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

if (!isServer) {
  // Workaround for nav links not being able to point to relative paths
  for (const a of document.querySelectorAll('a[href="https://agentic.so"]')) {
    a.removeAttribute('target')
  }

  for (const a of document.querySelectorAll(
    'a[href="https://agentic.so/contact"]'
  )) {
    a.removeAttribute('target')
  }

  for (const a of document.querySelectorAll(
    'a[href="https://agentic.so/marketplace"]'
  )) {
    a.removeAttribute('target')
  }

  // document
  //   .getElementById('https://agentic.so/contact')
  //   .querySelector('.lucide-arrow-up-right')
  //   .classList.add('hidden')
}

const detail = `
- https://github.com/transitive-bullshit/agentic
- https://x.com/transitive_bs
`

const banner = `
 █████╗  ██████╗ ███████╗███╗   ██╗████████╗██╗ ██████╗
██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██║██╔════╝
███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ██║██║
██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ██║██║
██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ██║╚██████╗
╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝ ╚═════╝

${detail}
`

function bootstrap() {
  if (isSafari) {
    console.log(detail)
  } else {
    console.log(banner)
  }
}

bootstrap()
