import JwtDecoderTool from './JwtDecoderTool.vue'

export default {
  id: 'jwt-decoder',
  name: 'JWT Decoder',
  description: 'Decode JWT tokens to inspect header and payload claims without a secret.',
  icon: 'ShieldCheck',
  category: 'Converter',
  component: JwtDecoderTool,
}
