import { describe, expect, test } from 'vitest'

import {
  deleteStorageObject,
  getStorageObject,
  putStorageObject,
  uploadFileUrlToStorage
} from './storage'

describe('Storage', () => {
  test('putObject, getObject, deleteObject', async () => {
    await putStorageObject('test.txt', 'hello world', {
      ContentType: 'text/plain'
    })

    const obj = await getStorageObject('test.txt')
    expect(obj.ContentType).toEqual('text/plain')

    const body = await obj.Body?.transformToString()
    expect(body).toEqual('hello world')

    const res = await deleteStorageObject('test.txt')
    expect(res.$metadata.httpStatusCode).toEqual(204)
  })

  test('uploadFileUrlToStorage url', async () => {
    const url = await uploadFileUrlToStorage(
      'https://agentic.so/agentic-icon-circle-light.svg',
      {
        prefix: '@dev/test'
      }
    )

    expect(url).toBeTruthy()
    expect(new URL(url).origin).toEqual('https://storage.agentic.so')
    expect(url).toMatchSnapshot()
  })

  test('uploadFileUrlToStorage data-uri', async () => {
    const url = await uploadFileUrlToStorage(
      'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22400%22%20viewBox%3D%220%200%20124%20124%22%20fill%3D%22none%22%3E%3Crect%20width%3D%22124%22%20height%3D%22124%22%20rx%3D%2224%22%20fill%3D%22%23F97316%22%2F%3E%3Cpath%20d%3D%22M19.375%2036.7818V100.625C19.375%20102.834%2021.1659%20104.625%2023.375%20104.625H87.2181C90.7818%20104.625%2092.5664%20100.316%2090.0466%2097.7966L26.2034%2033.9534C23.6836%2031.4336%2019.375%2033.2182%2019.375%2036.7818Z%22%20fill%3D%22white%22%2F%3E%3Ccircle%20cx%3D%2263.2109%22%20cy%3D%2237.5391%22%20r%3D%2218.1641%22%20fill%3D%22black%22%2F%3E%3Crect%20opacity%3D%220.4%22%20x%3D%2281.1328%22%20y%3D%2280.7198%22%20width%3D%2217.5687%22%20height%3D%2217.3876%22%20rx%3D%224%22%20transform%3D%22rotate(-45%2081.1328%2080.7198)%22%20fill%3D%22%23FDBA74%22%2F%3E%3C%2Fsvg%3E',
      {
        prefix: '@dev/test'
      }
    )

    expect(url).toBeTruthy()
    expect(new URL(url).origin).toEqual('https://storage.agentic.so')
    expect(url).toMatchSnapshot()
  })

  test('uploadFileUrlToStorage data-uri 2', async () => {
    const url = await uploadFileUrlToStorage(
      'data:application/octet-stream;base64,IyBUZXN0IEV2ZXJ5dGhpbmcgT3BlbkFQSQoKVGhpcyBpcyB0ZXN0aW5nICoqcmVhZG1lIHJlbmRlcmluZyoqLgoKIyMgTWlzYwoKLSBbIF0gSXRlbSAxCi0gWyBdIEl0ZW0gMgotIFt4XSBJdGVtIDMKCi0tLQoKLSBfaXRhbGljXwotICoqYm9sZCoqCi0gW2xpbmtdKGh0dHBzOi8vd3d3Lmdvb2dsZS5jb20pCi0gYGNvZGVgCgojIyBDb2RlCgpgYGB0cwpjb25zdCBhID0gMQoKZXhwb3J0IGZ1bmN0aW9uIGZvbygpIHsKICBjb25zb2xlLmxvZygnaGVsbG8gd29ybGQnKQp9CmBgYAoKIyMgSW1hZ2VzCgohW0ltYWdlXShodHRwczovL3BsYWNlaG9sZC5jby82MDB4NDAwKQo=',
      {
        prefix: '@dev/test'
      }
    )

    expect(url).toBeTruthy()
    expect(new URL(url).origin).toEqual('https://storage.agentic.so')
    expect(url).toMatchSnapshot()
  })
})
