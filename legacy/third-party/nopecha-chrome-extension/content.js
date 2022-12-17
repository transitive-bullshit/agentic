class BG {
  static exec() {
    return new Promise((a) => {
      try {
        chrome.runtime.sendMessage([...arguments], a)
      } catch (e) {
        a(null)
      }
    })
  }
}
class Net {
  static async fetch(e, a) {
    return BG.exec('Net.fetch', { url: e, options: a })
  }
}
class Script {
  static inject_file(t) {
    return new Promise((e) => {
      var a = document.createElement('script')
      ;(a.src = chrome.runtime.getURL(t)),
        (a.onload = e),
        (document.head || document.documentElement).appendChild(a)
    })
  }
}
class Location {
  static parse_hostname(e) {
    return e.replace(/^(.*:)\/\/([A-Za-z0-9\-\.]+)(:[0-9]+)?(.*)$/, '$2')
  }
  static async hostname() {
    var e = await BG.exec('Tab.info'),
      e = e.url || 'Unknown Host'
    return Location.parse_hostname(e)
  }
}
class Image {
  static encode(a) {
    return new Promise((t) => {
      if (null === a) return t(null)
      const e = new XMLHttpRequest()
      ;(e.onload = () => {
        const a = new FileReader()
        ;(a.onloadend = () => {
          let e = a.result
          if (e.startsWith('data:text/html;base64,')) return t(null)
          ;(e = e.replace('data:image/jpeg;base64,', '')), t(e)
        }),
          a.readAsDataURL(e.response)
      }),
        (e.onerror = () => {
          t(null)
        }),
        (e.onreadystatechange = () => {
          4 == this.readyState && 200 != this.status && t(null)
        }),
        e.open('GET', a),
        (e.responseType = 'blob'),
        e.send()
    })
  }
}
class NopeCHA {
  static INFERENCE_URL = 'https://api.nopecha.com'
  static MAX_WAIT_POST = 60
  static MAX_WAIT_GET = 60
  static ERRORS = {
    UNKNOWN: 9,
    INVALID_REQUEST: 10,
    RATE_LIIMTED: 11,
    BANNED_USER: 12,
    NO_JOB: 13,
    INCOMPLETE_JOB: 14,
    INVALID_KEY: 15,
    NO_CREDIT: 16,
    UPDATE_REQUIRED: 17
  }
  static async post({
    captcha_type: e,
    task: a,
    image_urls: t,
    image_data: r,
    grid: n,
    audio_data: o,
    key: i
  }) {
    for (
      var s = Date.now(), c = await BG.exec('Tab.info');
      !(Date.now() - s > 1e3 * NopeCHA.MAX_WAIT_POST);

    ) {
      var d = {
        type: e,
        task: a,
        key: i,
        v: chrome.runtime.getManifest().version,
        url: c ? c.url : window.location.href
      }
      t && (d.image_urls = t),
        r && (d.image_data = r),
        n && (d.grid = n),
        o && (d.audio_data = o)
      try {
        var l = { 'Content-Type': 'application/json' },
          u =
            (i && 'undefined' !== i && (l.Authorization = 'Bearer ' + i),
            await Net.fetch(NopeCHA.INFERENCE_URL, {
              method: 'POST',
              headers: l,
              body: JSON.stringify(d)
            })),
          p = JSON.parse(u)
        if (!p) {
          break
        }
        if ('error' in p) {
          if (p.error === NopeCHA.ERRORS.RATE_LIMITED) {
            await Time.sleep(2e3)
            continue
          }
          if (p.error === NopeCHA.ERRORS.INVALID_KEY) break
          if (p.error === NopeCHA.ERRORS.NO_CREDIT) break
          break
        }
        var _ = p.data
        return await NopeCHA.get({ job_id: _, key: i })
      } catch (e) {}
      await Time.sleep(1e3)
    }
    return { job_id: null, data: null }
  }
  static async get({ job_id: e, key: a }) {
    for (var t = Date.now(); !(Date.now() - t > 1e3 * NopeCHA.MAX_WAIT_GET); ) {
      await Time.sleep(1e3)
      var r = {},
        r =
          (a && 'undefined' !== a && (r.Authorization = 'Bearer ' + a),
          await Net.fetch(NopeCHA.INFERENCE_URL + `?id=${e}&key=` + a, {
            headers: r
          }))
      try {
        var n = JSON.parse(r)
        if (!('error' in n))
          return { job_id: e, data: n.data, metadata: n.metadata }
        if (n.error !== NopeCHA.ERRORS.INCOMPLETE_JOB)
          return { job_id: e, data: null, metadata: null }
      } catch (e) {}
    }
    return { job_id: e, data: null, metadata: null }
  }
}
