<script setup>
import { ref, computed } from 'vue'
import { Copy } from 'lucide-vue-next'

const STATUSES = [
  { code: 100, name: 'Continue',                        desc: 'The server received the request headers; the client should proceed to send the body.' },
  { code: 101, name: 'Switching Protocols',             desc: 'The server is switching protocols as requested, e.g. HTTP/1.1 to WebSocket.' },
  { code: 102, name: 'Processing',                      desc: 'WebDAV: the server has received the request and is processing it, but no response is available yet.' },
  { code: 103, name: 'Early Hints',                     desc: 'Used to return headers before the final response so the client can start preloading resources.' },
  { code: 200, name: 'OK',                              desc: 'Standard success response. The request succeeded and the response body contains the result.' },
  { code: 201, name: 'Created',                         desc: 'The request succeeded and a new resource was created. Returned after POST or PUT.' },
  { code: 202, name: 'Accepted',                        desc: 'The request was accepted for processing but processing has not completed yet.' },
  { code: 203, name: 'Non-Authoritative Information',   desc: 'The response was modified by a proxy from the origin server\'s 200 response.' },
  { code: 204, name: 'No Content',                      desc: 'Success with no response body. Common after DELETE or a PATCH with nothing to return.' },
  { code: 205, name: 'Reset Content',                   desc: 'Tells the client to reset the document view, e.g. clear a form after submission.' },
  { code: 206, name: 'Partial Content',                 desc: 'The server is delivering only part of the resource due to a Range header in the request.' },
  { code: 207, name: 'Multi-Status',                    desc: 'WebDAV: the response body contains XML with multiple separate response codes.' },
  { code: 208, name: 'Already Reported',                desc: 'WebDAV: members of a binding have already been enumerated in a preceding part of the response.' },
  { code: 226, name: 'IM Used',                         desc: 'The server has fulfilled a GET request and the response is the result of instance manipulations.' },
  { code: 300, name: 'Multiple Choices',                desc: 'The request has more than one possible response. The client or user should choose one.' },
  { code: 301, name: 'Moved Permanently',               desc: 'The resource has permanently moved. Future requests should use the new URL provided in the Location header.' },
  { code: 302, name: 'Found',                           desc: 'The resource is temporarily at a different URL. The client should continue using the original URL.' },
  { code: 303, name: 'See Other',                       desc: 'The response to the request is at a different URI and should be retrieved using GET.' },
  { code: 304, name: 'Not Modified',                    desc: 'Cached response is still valid. The client can reuse its cached copy — no body is sent.' },
  { code: 307, name: 'Temporary Redirect',              desc: 'Like 302, but the client must use the same HTTP method for the redirect request.' },
  { code: 308, name: 'Permanent Redirect',              desc: 'Like 301, but the client must use the same HTTP method for all future requests.' },
  { code: 400, name: 'Bad Request',                     desc: 'The server cannot process the request due to malformed syntax or invalid parameters.' },
  { code: 401, name: 'Unauthorized',                    desc: 'Authentication is required. The client must authenticate itself to get the requested resource.' },
  { code: 402, name: 'Payment Required',                desc: 'Reserved for future use. Rarely used — occasionally seen in payment-gated APIs.' },
  { code: 403, name: 'Forbidden',                       desc: 'The server understood the request but refuses to authorize it. Re-authenticating won\'t help.' },
  { code: 404, name: 'Not Found',                       desc: 'The server can\'t find the requested resource. The URL may be wrong or the resource may be deleted.' },
  { code: 405, name: 'Method Not Allowed',              desc: 'The HTTP method is not supported for this resource. The Allow header lists what\'s permitted.' },
  { code: 406, name: 'Not Acceptable',                  desc: 'No content type in the Accept header sent by the client matches what the server can produce.' },
  { code: 407, name: 'Proxy Authentication Required',   desc: 'The client must first authenticate with the proxy before the server can respond.' },
  { code: 408, name: 'Request Timeout',                 desc: 'The server timed out waiting for the client to finish sending the request.' },
  { code: 409, name: 'Conflict',                        desc: 'The request conflicts with the current state of the resource, e.g. an edit conflict or duplicate.' },
  { code: 410, name: 'Gone',                            desc: 'The resource was permanently deleted and will not be available again. More definitive than 404.' },
  { code: 411, name: 'Length Required',                 desc: 'The server requires a Content-Length header which was not provided in the request.' },
  { code: 412, name: 'Precondition Failed',             desc: 'A conditional request header (e.g. If-Match) evaluated to false on the server.' },
  { code: 413, name: 'Content Too Large',               desc: 'The request body is larger than the server is willing or able to process.' },
  { code: 414, name: 'URI Too Long',                    desc: 'The URI provided by the client is longer than the server is willing to process.' },
  { code: 415, name: 'Unsupported Media Type',          desc: 'The Content-Type of the request body is not supported by the server for this resource.' },
  { code: 416, name: 'Range Not Satisfiable',           desc: 'The range specified in the Range header can\'t be fulfilled by the server.' },
  { code: 417, name: 'Expectation Failed',              desc: 'The server cannot meet the requirements set in the Expect request header.' },
  { code: 418, name: 'I\'m a Teapot',                  desc: 'An April Fool\'s joke from RFC 2324 — the server refuses to brew coffee because it is a teapot.' },
  { code: 421, name: 'Misdirected Request',             desc: 'The request was directed at a server that is not able to produce a response.' },
  { code: 422, name: 'Unprocessable Content',           desc: 'The request is well-formed but contains semantic errors. Common for REST API validation failures.' },
  { code: 423, name: 'Locked',                          desc: 'WebDAV: the resource being accessed is locked.' },
  { code: 424, name: 'Failed Dependency',               desc: 'WebDAV: the request failed because it depended on another request that also failed.' },
  { code: 425, name: 'Too Early',                       desc: 'The server is unwilling to process a request that might be replayed (TLS 1.3 early data).' },
  { code: 426, name: 'Upgrade Required',                desc: 'The client should switch to a different protocol, specified in the Upgrade header.' },
  { code: 428, name: 'Precondition Required',           desc: 'The origin server requires the request to be conditional to prevent the lost-update problem.' },
  { code: 429, name: 'Too Many Requests',               desc: 'The client has sent too many requests in a given time window (rate limiting).' },
  { code: 431, name: 'Request Header Fields Too Large', desc: 'The server is unwilling to process the request because its header fields are too large.' },
  { code: 451, name: 'Unavailable For Legal Reasons',   desc: 'The resource is unavailable due to a legal demand, e.g. government-ordered censorship.' },
  { code: 500, name: 'Internal Server Error',           desc: 'A generic server error when an unexpected condition was encountered. Check server logs.' },
  { code: 501, name: 'Not Implemented',                 desc: 'The server does not recognize the request method or cannot fulfill the request.' },
  { code: 502, name: 'Bad Gateway',                     desc: 'The server acting as a gateway received an invalid response from an upstream server.' },
  { code: 503, name: 'Service Unavailable',             desc: 'The server is temporarily unable to handle requests, often due to maintenance or overload.' },
  { code: 504, name: 'Gateway Timeout',                 desc: 'The gateway server did not receive a timely response from an upstream server.' },
  { code: 505, name: 'HTTP Version Not Supported',      desc: 'The server does not support the HTTP protocol version used in the request.' },
  { code: 506, name: 'Variant Also Negotiates',         desc: 'The server has a configuration error in transparent content negotiation.' },
  { code: 507, name: 'Insufficient Storage',            desc: 'WebDAV: the server cannot store the representation needed to complete the request.' },
  { code: 508, name: 'Loop Detected',                   desc: 'WebDAV: the server detected an infinite loop while processing the request.' },
  { code: 510, name: 'Not Extended',                    desc: 'Further extensions to the request are required for the server to fulfill it.' },
  { code: 511, name: 'Network Authentication Required', desc: 'The client needs to authenticate to gain network access, e.g. through a captive portal.' },
]

const BADGE = { 1: 'badge-info', 2: 'badge-success', 3: 'badge-warning', 4: 'badge-error', 5: 'badge-error' }
const TABS  = ['All', '1xx', '2xx', '3xx', '4xx', '5xx']

const tab    = ref('All')
const query  = ref('')
const copied = ref('')

const filtered = computed(() => {
  let list = STATUSES
  if (tab.value !== 'All') {
    const century = parseInt(tab.value)
    list = list.filter((s) => Math.floor(s.code / 100) === century)
  }
  const q = query.value.toLowerCase().trim()
  if (q) list = list.filter((s) => String(s.code).includes(q) || s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q))
  return list
})

async function copy(code) {
  await navigator.clipboard.writeText(String(code))
  copied.value = String(code)
  setTimeout(() => (copied.value = ''), 1500)
}
</script>

<template>
  <div class="max-w-3xl space-y-4">
    <!-- Search -->
    <input
      v-model="query"
      type="search"
      placeholder="Search by code, name, or description…"
      class="input input-sm w-full"
    />

    <!-- Tabs -->
    <div class="flex gap-1.5 flex-wrap">
      <button
        v-for="t in TABS"
        :key="t"
        @click="tab = t"
        class="btn btn-xs"
        :class="tab === t ? 'btn-primary' : 'btn-ghost'"
      >{{ t }}</button>
    </div>

    <!-- Status list -->
    <div class="space-y-1.5">
      <div
        v-for="s in filtered"
        :key="s.code"
        class="bg-base-100 border border-base-300 rounded-box px-4 py-3 flex items-start gap-3 group hover:border-base-content/20 transition-colors"
      >
        <span
          class="badge badge-sm font-mono font-bold shrink-0 mt-0.5"
          :class="BADGE[Math.floor(s.code / 100)] ?? 'badge-neutral'"
        >{{ s.code }}</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-base-content leading-snug">{{ s.name }}</p>
          <p class="text-xs text-base-content/50 mt-0.5 leading-relaxed">{{ s.desc }}</p>
        </div>
        <button
          @click="copy(s.code)"
          class="btn btn-ghost btn-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Copy code"
        >
          <Copy class="w-3 h-3" />
          <span v-if="copied === String(s.code)" class="text-success">✓</span>
        </button>
      </div>

      <div v-if="!filtered.length" class="text-center py-10 text-base-content/40 text-sm">
        No codes match "{{ query }}"
      </div>
    </div>

    <p class="text-xs text-base-content/30">{{ filtered.length }} of {{ STATUSES.length }} codes</p>
  </div>
</template>
