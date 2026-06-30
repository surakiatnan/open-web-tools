/**
 * Tool Registry
 *
 * Import each tool and add it to the `tools` array to register it.
 * Tools are displayed in the order they appear here.
 *
 * Each tool module must export a default object satisfying the ToolMeta shape:
 *
 * {
 *   id: string          — unique kebab-case identifier, used in the URL
 *   name: string        — display name shown in sidebar & home grid
 *   description: string — one-line description
 *   icon: string        — Lucide icon component name (https://lucide.dev/icons)
 *   category: string    — one of: Generator | Converter | Formatter | Utility
 *   component: Component — Vue component that renders the tool (no required props)
 * }
 */

import qrcode from './qrcode'
import uuid from './uuid'
import password from './password'
import textManager from './text-manager'
import base64 from './base64'
import jsonFormatter from './json-formatter'
import jwtDecoder from './jwt-decoder'
import hashGenerator from './hash-generator'
import unixTimestamp from './unix-timestamp'
import baseConverter from './base-converter'
import httpStatus from './http-status'
import loremIpsum from './lorem-ipsum'
import imageBase64 from './image-base64'

/** @type {import('./types').ToolMeta[]} */
export const tools = [
  qrcode, uuid, password, textManager, base64,
  jsonFormatter, jwtDecoder, hashGenerator, unixTimestamp, baseConverter,
  httpStatus, loremIpsum, imageBase64,
]

/** Quick lookup by ID */
export const toolsById = Object.fromEntries(tools.map((t) => [t.id, t]))

/** Tools grouped by category, preserving insertion order */
export const toolsByCategory = tools.reduce((acc, tool) => {
  ;(acc[tool.category] ??= []).push(tool)
  return acc
}, {})
