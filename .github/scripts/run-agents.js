import fs from 'fs'
import { execSync } from 'child_process'
import { runDDDReview } from './orchestrator.js'

// ==========================================
// LOAD INPUTS
// ==========================================

console.log('🚀 Starting DDD Review Agent...\n')

// Diff PR - use GITHUB_BASE_REF for compatibility
const baseRef = process.env.GITHUB_BASE_REF || 'main'
console.log(`📊 Base ref: origin/${baseRef}`)

let diff
try {
  diff = execSync(`git diff origin/${baseRef}`).toString()
  console.log(`✅ Diff loaded: ${diff.length} characters`)
} catch (error) {
  console.error('❌ Failed to get git diff:', error.message)
  process.exit(1)
}

// Focused context (only ddd-summary.md, not all doc/)
console.log('\n📖 Loading context files...')

let dddSummary
try {
  dddSummary = fs.readFileSync('doc/ddd-summary.md', 'utf-8')
  console.log(`✅ ddd-summary.md: ${dddSummary.length} chars`)
} catch (error) {
  console.error('❌ Failed to read ddd-summary.md:', error.message)
  process.exit(1)
}

let readme
try {
  readme = fs.readFileSync('README.md', 'utf-8')
  console.log(`✅ README.md: ${readme.length} chars`)
} catch (error) {
  console.error('❌ Failed to read README.md:', error.message)
  process.exit(1)
}

let template
try {
  template = fs.readFileSync('.github/templates/review.md', 'utf-8')
  console.log(`✅ review.md template: ${template.length} chars`)
} catch (error) {
  console.error('❌ Failed to read review.md template:', error.message)
  process.exit(1)
}

// ==========================================
// RUN DDD REVIEW
// ==========================================

console.log('\n🧠 Running DDD Review...\n')

const result = await runDDDReview(diff, dddSummary, readme, template)

// ==========================================
// SAVE OUTPUTS
// ==========================================

fs.writeFileSync(
  'result.json',
  JSON.stringify(
    {
      scores: result.scores,
      status: result.status,
      issues: result.issues,
    },
    null,
    2,
  ),
)

fs.writeFileSync('review.md', result.markdownReport)

console.log('\n✅ DDD Review complete!')
console.log(`Status: ${result.status}`)
console.log(`Global Score: ${result.scores.global}/10`)
