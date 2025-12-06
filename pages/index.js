import React, { useState, useRef } from 'react'
import Editor from '../components/Editor'

const defaultCode = `// Try editing this JS code
function greet(name) {
console.log("Hello, " + name)
}

greet("World")
`

function runCode(code, onOutput) {
  // capture console.log
  const logs = []
  const originalLog = console.log
  try {
    console.log = (...args) => {
      logs.push(args.map(a => String(a)).join(' '))
    }
    // run in a Function to avoid eval scope leakage
    const runner = new Function('console', code)
    runner({ log: console.log, error: console.error, warn: console.warn })
    onOutput({ type: 'success', logs })
  } catch (err) {
    onOutput({ type: 'error', error: String(err), logs })
  } finally {
    console.log = originalLog
  }
}

function autoFix(code) {
  const lines = code.split('\n')
  let indentLevel = 0
  const fixed = lines.map((raw) => {
    let line = raw.replace(/\t/g, '  ')
    // collapse multiple spaces, but keep simple strings intact by skipping lines with quotes (heuristic)
    if (!/['\"`]/.test(line)) {
      line = line.replace(/ {2,}/g, ' ')
    }
    const trimmed = line.trim()
    // adjust indent based on braces in the line (close before formatting)
    if (/^[\s]*\}/.test(trimmed)) {
      indentLevel = Math.max(0, indentLevel - 1)
    }
    const indent = '  '.repeat(indentLevel)
    // add semicolon if looks like a statement and missing
    if (
      trimmed &&
      !trimmed.startsWith('//') &&
      !trimmed.endsWith(';') &&
      !trimmed.endsWith('{') &&
      !trimmed.endsWith('}') &&
      !trimmed.includes('function') &&
      !trimmed.startsWith('if') &&
      !trimmed.startsWith('for') &&
      !trimmed.startsWith('while') &&
      !trimmed.startsWith('switch') &&
      !trimmed.startsWith('return') &&
      !trimmed.includes('=>')
    ) {
      // add semicolon unless it's a block-start or control statement
      line = trimmed + ';'
    } else {
      line = trimmed
    }
    // after processing line, increase indent if line contains opening brace
    if (line.includes('{')) {
      const opens = (line.match(/{/g) || []).length
      const closes = (line.match(/}/g) || []).length
      indentLevel += Math.max(0, opens - closes)
    }
    return indent + line
  })
  let out = fixed.join('\n')
  // balance brackets/parens/braces by counting and appending closers
  const pairs = { '(': ')', '{': '}', '[': ']' }
  for (const open of Object.keys(pairs)) {
    const close = pairs[open]
    const opens = (out.match(new RegExp('\\' + open, 'g')) || []).length
    const closes = (out.match(new RegExp('\\' + close, 'g')) || []).length
    if (opens > closes) {
      out += '\n' + close.repeat(opens - closes)
    }
  }
  return out
}

const helpTips = {
  semicolons: 'Auto-fix will add semicolons to statement-like lines that are missing them.',
  indentation: 'Auto-fix indents using a simple brace-count algorithm (2 spaces per level).',
  brackets: 'Auto-fix attempts to balance (), {}, [] by appending missing closing tokens.',
  run: 'Run executes your JavaScript code inside a Function(...) to isolate scope and captures console.log output.',
  fix: 'Auto-fix is heuristic and line-oriented. It may not handle complex code perfectly; always review changes.'
}

export default function Home() {
  const [code, setCode] = useState(defaultCode)
  const [consoleLines, setConsoleLines] = useState([])
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [helpQuery, setHelpQuery] = useState('')
  const [helpResponse, setHelpResponse] = useState('')
  const consoleRef = useRef(null)

  function handleRun() {
    setConsoleLines(['Running...'])
    runCode(code, (res) => {
      if (res.type === 'success') {
        setConsoleLines(res.logs.length ? res.logs : ['(no output)'])
      } else {
        setConsoleLines([res.error, ...res.logs])
      }
      // scroll console into view
      setTimeout(() => {
        if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight
      }, 50)
    })
  }

  function handleAutoFix() {
    const fixed = autoFix(code)
    setCode(fixed)
    setConsoleLines(['Auto-fix applied. Review changes and run.'])
  }

  function handleHelpAsk() {
    const q = helpQuery.toLowerCase()
    let found = null
    Object.keys(helpTips).forEach(k => {
      if (q.includes(k)) found = k
    })
    if (found) {
      setHelpResponse(helpTips[found])
    } else if (q.trim().length === 0) {
      setHelpResponse('Type a question or a keyword like: semicolons, indentation, brackets, run, fix')
    } else {
      setHelpResponse("I don't have a perfect answer for that. Try keywords: semicolons, indentation, brackets, run, fix")
    }
  }

  return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column', background: '#071024', color: '#e6eef8'}}>
      <header style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)'}}>
        <h1 style={{margin:0, fontSize:18}}>Next.js Code Runner</h1>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <button onClick={() => setIsHelpOpen(true)} style={{padding:'8px 10px', borderRadius:6}}>Help</button>
        </div>
      </header>

      <main style={{display:'flex', flex:1, gap:12, padding:12}}>
        <section style={{flex:1, display:'flex', flexDirection:'column', minWidth:0}}>
          <div style={{flex:1, borderRadius:8, overflow:'hidden', border:'1px solid rgba(255,255,255,0.04)'}}>
            <Editor value={code} onChange={setCode} />
          </div>
          <div style={{display:'flex', gap:8, marginTop:8}}>
            <button onClick={handleRun} style={{padding:'8px 12px', borderRadius:6}}>Run ▶</button>
            <button onClick={handleAutoFix} style={{padding:'8px 12px', borderRadius:6}}>Auto-Fix 🛠️</button>
            <button onClick={() => { setCode(defaultCode); setConsoleLines([]); }} style={{padding:'8px 12px', borderRadius:6}}>Reset</button>
          </div>
        </section>

        <aside style={{width:360, display:'flex', flexDirection:'column', gap:8}}>
          <div style={{flex:1, minHeight:0, borderRadius:8, overflow:'hidden', border:'1px solid rgba(255,255,255,0.04)', background:'#021023'}}>
            <div style={{padding:8, borderBottom:'1px solid rgba(255,255,255,0.03)', fontSize:13}}>Console</div>
            <div ref={consoleRef} style={{padding:10, height:'100%', overflow:'auto', fontFamily:'monospace', fontSize:13}}>
              {consoleLines.map((l, i) => <div key={i} style={{whiteSpace:'pre-wrap', marginBottom:6}}>{l}</div>)}
            </div>
          </div>

          <div style={{borderRadius:8, padding:10, border:'1px solid rgba(255,255,255,0.04)'}}>
            <div style={{fontSize:13, marginBottom:6}}>Quick Tips</div>
            <ul style={{margin:0, paddingLeft:18}}>
              <li>Use Auto-Fix to clean simple mistakes.</li>
              <li>Run executes JS only (no backend).</li>
              <li>Help panel offers keyword-based tips.</li>
            </ul>
          </div>
        </aside>
      </main>

      {isHelpOpen && (
        <div style={{
          position:'fixed', right:18, top:68, width:360, height:300, background:'#083047', border:'1px solid rgba(255,255,255,0.04)',
          borderRadius:10, padding:12, boxShadow:'0 6px 30px rgba(2,6,23,0.6)'
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
            <strong>Help</strong>
            <button onClick={() => setIsHelpOpen(false)}>Close</button>
          </div>
          <div>
            <input
              placeholder="Type a help request (e.g., semicolons, indentation, brackets)"
              value={helpQuery}
              onChange={(e) => setHelpQuery(e.target.value)}
              style={{width:'100%', padding:8, marginBottom:8, borderRadius:6, border:'1px solid #234'}}
            />
            <div style={{display:'flex', gap:8}}>
              <button onClick={handleHelpAsk} style={{padding:'8px 10px', borderRadius:6}}>Ask</button>
              <button onClick={() => { setHelpQuery('semicolons'); setHelpResponse(helpTips['semicolons']) }} style={{padding:'8px 10px', borderRadius:6}}>Example: semicolons</button>
            </div>
            <div style={{marginTop:10, background:'#021223', padding:8, borderRadius:6, minHeight:80}}>
              <div style={{fontSize:13, whiteSpace:'pre-wrap'}}>{helpResponse}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
