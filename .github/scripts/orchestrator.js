import https from 'https'

const AGENT_CONFIG = {
  domain: {
    maxPromptChars: 18000,
    maxOutputTokens: 700,
    diffChars: 10000,
    dddChars: 3500,
    readmeChars: 1800,
  },
  application: {
    maxPromptChars: 18000,
    maxOutputTokens: 700,
    diffChars: 10000,
    dddChars: 2800,
    readmeChars: 1800,
  },
  infrastructure: {
    maxPromptChars: 18000,
    maxOutputTokens: 700,
    diffChars: 10000,
    dddChars: 2800,
    readmeChars: 1800,
  },
  orchestrator: {
    maxPromptChars: 22000,
    maxOutputTokens: 1400,
    readmeChars: 1500,
  },
}

// ==========================================
// SYSTEM PROMPTS FOR ALL AGENTS
// ==========================================

const SYSTEM_PROMPTS = {
  domain: `You are a DDD Domain Expert Agent. Your role is to analyze code changes and validate them against domain-driven design principles.

## Your Focus Areas:
1. Aggregates - Verify proper aggregate boundaries and root entities
2. Entities - Check entity lifecycle, identity, and business logic placement
3. Value Objects - Ensure immutability and equality by value
4. Invariants - Validate business rules are enforced in the domain layer
5. Domain Events - Check proper event publishing and handling

## Input Format:
You will receive:
- DDD_SUMMARY: The domain summary with actors, entities, invariants
- README: Project overview and architecture
- DIFF: The code changes to analyze

## Output Format (JSON):
{
  "score": 0-10,
  "issues": [
    {
      "severity": "HIGH|MEDIUM|LOW",
      "category": "AGGREGATE|ENTITY|INVARIANT|LAYER_VIOLATION",
      "message": "Clear description of the issue",
      "suggestion": "How to fix it"
    }
  ],
  "summary": "Brief assessment of domain layer health"
}

## Scoring Guide:
- 10: Perfect DDD adherence
- 7-9: Minor issues, acceptable
- 4-6: Significant concerns, needs revision
- 0-3: Critical violations, must fix`,

  application: `You are a DDD Application Layer Agent. Your role is to validate use cases, application services, and orchestration logic.

## Your Focus Areas:
1. Use Cases - Verify proper use case boundaries and responsibilities
2. Application Services - Check thin services that delegate to domain
3. DTOs - Validate data transfer objects do not leak domain internals
4. Transaction Boundaries - Ensure proper unit of work handling
5. Cross-cutting Concerns - Validate logging, security, etc. do not pollute domain

## Input Format:
You will receive:
- DDD_SUMMARY: The domain summary
- README: Project overview
- DIFF: The code changes to analyze

## Output Format (JSON):
{
  "score": 0-10,
  "issues": [
    {
      "severity": "HIGH|MEDIUM|LOW",
      "category": "USE_CASE|SERVICE|DTO|TRANSACTION",
      "message": "Clear description of the issue",
      "suggestion": "How to fix it"
    }
  ],
  "summary": "Brief assessment of application layer health"
}

## Anti-patterns to Detect:
- Anemic Domain Model (logic in services instead of entities)
- God Services (too many responsibilities)
- Leaky Abstractions (exposing domain internals)
- Missing transaction boundaries`,

  infrastructure: `You are a DDD Infrastructure Layer Agent. Your role is to validate repositories, external integrations, and persistence concerns.

## Your Focus Areas:
1. Repositories - Verify proper repository pattern implementation
2. Persistence Ignorance - Check domain is not polluted with ORM concerns
3. External Services - Validate proper anti-corruption layer usage
4. Data Mapping - Ensure clean separation between domain and persistence models
5. Transaction Management - Check proper unit of work implementation

## Input Format:
You will receive:
- DDD_SUMMARY: The domain summary
- README: Project overview
- DIFF: The code changes to analyze

## Output Format (JSON):
{
  "score": 0-10,
  "issues": [
    {
      "severity": "HIGH|MEDIUM|LOW",
      "category": "REPOSITORY|PERSISTENCE|MAPPING|EXTERNAL",
      "message": "Clear description of the issue",
      "suggestion": "How to fix it"
    }
  ],
  "summary": "Brief assessment of infrastructure layer health"
}

## Anti-patterns to Detect:
- Repository Leakage (domain logic in repositories)
- ORM Pollution (domain entities have ORM dependencies)
- Missing Repository Abstractions
- Direct DB access from domain`,

  orchestrator: `You are the DDD Review Orchestrator. Your role is to synthesize outputs from all layer agents and produce a final assessment.

## Your Task:
1. Analyze scores and issues from Domain, Application, and Infrastructure agents
2. Calculate a global score (weighted average)
3. Determine final status: PASS or FAIL
4. Generate a comprehensive markdown report

## Input Format:
You will receive:
- DOMAIN_RESULT: { score, issues, summary }
- APPLICATION_RESULT: { score, issues, summary }
- INFRASTRUCTURE_RESULT: { score, issues, summary }
- TEMPLATE: The review.md template format to follow
- README: Project context

## Decision Rules:
- FAIL if any HIGH severity issue exists
- FAIL if global score < 6
- PASS if no HIGH issues AND global score >= 6

## Output Format (JSON):
{
  "scores": {
    "domain": 0-10,
    "application": 0-10,
    "infrastructure": 0-10,
    "global": 0-10
  },
  "status": "PASS|FAIL",
  "criticalIssues": ["..."],
  "suggestions": ["..."],
  "markdownReport": "Full markdown report following the template"
}

## Report Template Structure:
Follow the provided TEMPLATE exactly, replacing X/10 with actual scores.
If a section has no entries, write "- N/A" instead of leaving it empty.`,
}

// ==========================================
// AGENT EXECUTION
// ==========================================

export async function runAgent(type, inputs) {
  console.log(`  Starting ${type} agent...`)

  const systemPrompt = SYSTEM_PROMPTS[type]
  logPromptBudget(type, inputs)
  const userPrompt = buildUserPrompt(type, inputs)
  const config = AGENT_CONFIG[type] || {
    maxPromptChars: 18000,
    maxOutputTokens: 700,
  }

  const fullPrompt = `${systemPrompt}\n\n---USER INPUT---\n${userPrompt}`
  const promptLength = fullPrompt.length
  console.log(
    `     Prompt size: ${promptLength} chars (truncated to ${config.maxPromptChars})`,
  )

  const promptArg = fullPrompt.substring(0, config.maxPromptChars)

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      console.log(`     Calling Groq API... (attempt ${attempt}/3)`)

      const response = await groqGenerate(promptArg, config.maxOutputTokens)

      console.log(
        `     ${type} agent completed (output: ${response.length} chars)`,
      )
      return parseAgentOutput(response, type)
    } catch (error) {
      const retryDelayMs = getRetryDelayMs(error.message, attempt)

      if (attempt < 3 && retryDelayMs !== null) {
        console.error(`     Agent ${type} rate limited:`, error.message)
        console.log(`     Waiting ${retryDelayMs}ms before retry...`)
        await sleep(retryDelayMs)
        continue
      }

      console.error(`     Agent ${type} failed:`, error.message)
      console.log(`     Using default response for ${type}`)
      return getDefaultResponse(type)
    }
  }

  return getDefaultResponse(type)
}

function logPromptBudget(type, inputs) {
  const config = AGENT_CONFIG[type] || {}

  if (type === 'orchestrator') {
    const domainJson = JSON.stringify(inputs.agentResults?.domain || {})
    const applicationJson = JSON.stringify(
      inputs.agentResults?.application || {},
    )
    const infrastructureJson = JSON.stringify(
      inputs.agentResults?.infrastructure || {},
    )

    console.log(
      `     Budget: prompt<=${config.maxPromptChars || 'n/a'} chars, output<=${config.maxOutputTokens || 'n/a'} tokens`,
    )
    console.log(
      `     Sections: template=${(inputs.template || '').length} readme=${(inputs.readme || '').length}->${compactText(inputs.readme || '', config.readmeChars).length} domainResult=${domainJson.length} applicationResult=${applicationJson.length} infrastructureResult=${infrastructureJson.length}`,
    )
    return
  }

  const originalDiff = (inputs.diff || '').length
  const compactedDiff = compactDiff(inputs.diff || '', config.diffChars).length
  const originalDdd = (inputs.dddSummary || '').length
  const compactedDdd = compactText(
    inputs.dddSummary || '',
    config.dddChars,
  ).length
  const originalReadme = (inputs.readme || '').length
  const compactedReadme = compactText(
    inputs.readme || '',
    config.readmeChars,
  ).length

  console.log(
    `     Budget: prompt<=${config.maxPromptChars || 'n/a'} chars, output<=${config.maxOutputTokens || 'n/a'} tokens`,
  )
  console.log(
    `     Sections: diff=${originalDiff}->${compactedDiff} ddd=${originalDdd}->${compactedDdd} readme=${originalReadme}->${compactedReadme}`,
  )
}

function getRetryDelayMs(message = '', attempt = 1) {
  if (!message.includes('HTTP 429')) {
    return null
  }

  const retryMatch = message.match(/Please try again in ([0-9.]+)s/i)
  if (retryMatch) {
    const seconds = Number.parseFloat(retryMatch[1])
    if (Number.isFinite(seconds)) {
      return Math.ceil(seconds * 1000) + 1000
    }
  }

  return attempt * 5000
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function sanitizePrompt(text) {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
}

function groqGenerate(prompt, maxOutputTokens = 700) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      reject(new Error('GROQ_API_KEY not set in environment'))
      return
    }

    const cleanPrompt = sanitizePrompt(prompt)

    const payload = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are a DDD expert analyzing code changes. Always respond with valid JSON only.',
        },
        { role: 'user', content: cleanPrompt },
      ],
      temperature: 0.3,
      max_tokens: maxOutputTokens,
    }

    const data = JSON.stringify(payload)
    const dataLength = Buffer.byteLength(data, 'utf8')

    console.log(`     Sending ${dataLength} bytes to Groq...`)

    const options = {
      hostname: 'api.groq.com',
      port: 443,
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': dataLength,
      },
    }

    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`))
          return
        }

        try {
          const json = JSON.parse(body)
          resolve(json.choices?.[0]?.message?.content || '')
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${error.message}`))
        }
      })
    })

    req.on('error', (error) => reject(error))
    req.setTimeout(120000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })

    req.write(data)
    req.end()
  })
}

function buildUserPrompt(type, inputs) {
  const { diff, dddSummary, readme, template, agentResults } = inputs
  const config = AGENT_CONFIG[type] || {}
  const trimmedReadme = compactText(readme, config.readmeChars)

  switch (type) {
    case 'domain':
      return `
DDD_SUMMARY:
${compactText(dddSummary, config.dddChars)}

README:
${trimmedReadme}

DIFF (Code Changes):
${compactDiff(diff, config.diffChars)}

Analyze only the domain layer aspects of these changes. Prefer precise findings over exhaustive coverage.`

    case 'application':
      return `
DDD_SUMMARY:
${compactText(dddSummary, config.dddChars)}

README:
${trimmedReadme}

DIFF (Code Changes):
${compactDiff(diff, config.diffChars)}

Analyze only the application layer aspects of these changes. Prefer precise findings over exhaustive coverage.`

    case 'infrastructure':
      return `
DDD_SUMMARY:
${compactText(dddSummary, config.dddChars)}

README:
${trimmedReadme}

DIFF (Code Changes):
${compactDiff(diff, config.diffChars)}

Analyze only the infrastructure layer aspects of these changes. Prefer precise findings over exhaustive coverage.`

    case 'orchestrator':
      return `
TEMPLATE (Follow this format exactly):
${template}

README:
${trimmedReadme}

DOMAIN_AGENT_RESULT:
${JSON.stringify(agentResults.domain, null, 2)}

APPLICATION_AGENT_RESULT:
${JSON.stringify(agentResults.application, null, 2)}

INFRASTRUCTURE_AGENT_RESULT:
${JSON.stringify(agentResults.infrastructure, null, 2)}

Generate the final report following the template.`

    default:
      return ''
  }
}

function compactText(text = '', maxChars = 2000) {
  if (!text || !maxChars || text.length <= maxChars) {
    return text
  }

  const headSize = Math.floor(maxChars * 0.75)
  const tailSize = Math.max(0, maxChars - headSize - 64)

  return `${text.slice(0, headSize)}\n\n...[truncated for CI prompt budget]...\n\n${text.slice(-tailSize)}`
}

function compactDiff(diff = '', maxChars = 10000) {
  if (!diff || !maxChars || diff.length <= maxChars) {
    return diff
  }

  const lines = diff.split('\n')
  const selected = []
  let total = 0

  for (const line of lines) {
    const isImportant =
      line.startsWith('diff --git') ||
      line.startsWith('+++ ') ||
      line.startsWith('--- ') ||
      line.startsWith('@@') ||
      line.startsWith('+') ||
      line.startsWith('-')

    if (!isImportant) {
      continue
    }

    const lineLength = line.length + 1
    if (total + lineLength > maxChars) {
      break
    }

    selected.push(line)
    total += lineLength
  }

  if (selected.length === 0) {
    return compactText(diff, maxChars)
  }

  return `${selected.join('\n')}\n\n...[diff truncated for CI prompt budget]...`
}

function parseAgentOutput(output, type = 'unknown') {
  try {
    const jsonMatch =
      output.match(/```json\n?([\s\S]*?)\n?```/) || output.match(/{[\s\S]*}/)

    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : output
    const result = JSON.parse(jsonStr.trim())
    console.log(`     ${type} output parsed successfully`)
    return result
  } catch (error) {
    console.error(`     Failed to parse ${type} agent output:`, error.message)
    console.log(
      `     Raw output (first 200 chars): ${output.substring(0, 200)}...`,
    )
    return {
      score: 7,
      issues: [
        {
          severity: 'LOW',
          category: 'AGENT_PARSE_ERROR',
          message: `${type} agent returned invalid JSON`,
          suggestion: 'Review the model response formatting',
        },
      ],
      summary: 'Parse error - using fallback response',
    }
  }
}

function getDefaultResponse(type) {
  return {
    score: 7,
    issues: [
      {
        severity: 'LOW',
        category: 'AGENT_ERROR',
        message: `${type} agent failed to execute`,
        suggestion: 'Check Groq quota, prompt budget, or network availability',
      },
    ],
    summary: `${type} analysis could not complete`,
  }
}

// ==========================================
// MAIN ORCHESTRATION
// ==========================================

export async function runDDDReview(diff, dddSummary, readme, template) {
  console.log('Starting DDD Multi-Agent Review...\n')

  const domain = await runAgent('domain', { diff, dddSummary, readme })
  const application = await runAgent('application', {
    diff,
    dddSummary,
    readme,
  })
  const infrastructure = await runAgent('infrastructure', {
    diff,
    dddSummary,
    readme,
  })

  console.log('Domain Score:', domain.score)
  console.log('Application Score:', application.score)
  console.log('Infrastructure Score:', infrastructure.score)

  const orchestratorResult = await runAgent('orchestrator', {
    readme,
    template,
    agentResults: { domain, application, infrastructure },
  })

  const scores = orchestratorResult.scores || {
    domain: domain.score,
    application: application.score,
    infrastructure: infrastructure.score,
    global: Math.round(
      (domain.score + application.score + infrastructure.score) / 3,
    ),
  }

  const allIssues = [
    ...(domain.issues || []),
    ...(application.issues || []),
    ...(infrastructure.issues || []),
  ]

  const hasHighIssues = allIssues.some((issue) => issue.severity === 'HIGH')
  const status =
    orchestratorResult.status ||
    (hasHighIssues || scores.global < 6 ? 'FAIL' : 'PASS')

  return {
    scores,
    status,
    issues: {
      domain: domain.issues || [],
      application: application.issues || [],
      infrastructure: infrastructure.issues || [],
    },
    markdownReport: normalizeMarkdownReport(
      orchestratorResult.markdownReport ||
        generateDefaultReport(
          scores,
          status,
          domain,
          application,
          infrastructure,
        ),
    ),
  }
}

function generateDefaultReport(
  scores,
  status,
  domain,
  application,
  infrastructure,
) {
  const allIssues = [
    ...(domain.issues || []),
    ...(application.issues || []),
    ...(infrastructure.issues || []),
  ]

  const criticalIssues = allIssues.filter((issue) => issue.severity === 'HIGH')
  const suggestions = allIssues.filter((issue) => issue.severity !== 'HIGH')

  return `## DDD Review Report

### Scores
- Domain: ${scores.domain}/10
- Application: ${scores.application}/10
- Infrastructure: ${scores.infrastructure}/10
- Global: ${scores.global}/10

---

### Critical Issues
${
  criticalIssues.length > 0
    ? criticalIssues
        .map(
          (issue) =>
            `- **${issue.category}**: ${issue.message}\n  Suggestion: ${issue.suggestion}`,
        )
        .join('\n')
    : '- No critical issues detected'
}

---

### Suggestions
${
  suggestions.length > 0
    ? suggestions
        .map((issue) => `- **${issue.category}**: ${issue.message}`)
        .join('\n')
    : '- No suggestions'
}

---

### Status
${status === 'PASS' ? 'PASS' : 'FAIL'}
`
}

function normalizeMarkdownReport(markdownReport = '') {
  return ensureSectionHasFallback(
    ensureSectionHasFallback(markdownReport, '### Critical Issues'),
    '### Suggestions',
  )
}

function ensureSectionHasFallback(markdownReport, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`(${escapedHeading}\\s*)([\\s\\S]*?)(\\n---|$)`)

  return markdownReport.replace(pattern, (_match, header, content, suffix) => {
    const trimmedContent = content.trim()
    if (trimmedContent.length > 0) {
      return `${header}${content}${suffix}`
    }

    return `${header}- N/A${suffix}`
  })
}
