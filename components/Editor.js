import React from 'react'

export default function Editor({ value, onChange }) {
  return (
    <textarea
      aria-label="code-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        height: '100%',
        fontFamily: 'monospace',
        fontSize: 14,
        padding: 12,
        boxSizing: 'border-box',
        borderRadius: 6,
        border: '1px solid #ccc',
        resize: 'none',
        background: '#0f172a',
        color: '#e6eef8'
      }}
    />
  )
}
