import HashGeneratorTool from './HashGeneratorTool.vue'

export default {
  id: 'hash-generator',
  name: 'Hash Generator',
  description: 'Compute SHA-1, SHA-256, and SHA-512 digests live via the Web Crypto API.',
  icon: 'Fingerprint',
  category: 'Generator',
  component: HashGeneratorTool,
}
