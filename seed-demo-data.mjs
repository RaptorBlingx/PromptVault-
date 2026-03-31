#!/usr/bin/env node
// PromptVault Demo Data Seeder
// Populates the app with realistic, professional-looking content for screenshots

const API = 'http://localhost:2529/api';

async function post(endpoint, data) {
  const res = await fetch(`${API}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`  ✗ ${endpoint}: ${err}`);
    return false;
  }
  return true;
}

async function seed() {
  console.log('🌱 Seeding PromptVault with demo data...\n');

  // ── Folders ──
  console.log('📁 Creating folders...');
  const folders = [
    { id: 'f1', name: 'Code Generation', icon: '💻', color: '#7C3AED' },
    { id: 'f2', name: 'Writing & Content', icon: '✍️', color: '#F59E0B' },
    { id: 'f3', name: 'Data Analysis', icon: '📊', color: '#10B981' },
    { id: 'f4', name: 'DevOps & Cloud', icon: '☁️', color: '#3B82F6' },
    { id: 'f5', name: 'Business & Strategy', icon: '📈', color: '#EF4444' },
  ];

  for (const folder of folders) {
    const ok = await post('/folders', folder);
    if (ok) console.log(`  ✓ ${folder.icon} ${folder.name}`);
  }

  // ── Prompts ──
  console.log('\n📝 Creating prompts...');
  const now = Date.now();
  const prompts = [
    // ── Pinned + Favorite (show prominently) ──
    {
      id: 'p1',
      title: 'Senior Code Reviewer',
      isPinned: true,
      isFavorite: true,
      folderId: 'f1',
      tags: ['code-review', 'best-practices', 'typescript'],
      content: `You are a senior software engineer conducting a thorough code review.

Review the following code for:
1. **Security vulnerabilities** — injection, XSS, auth bypass
2. **Performance issues** — N+1 queries, memory leaks, unnecessary re-renders
3. **Code quality** — naming, DRY violations, SOLID principles
4. **Error handling** — edge cases, graceful degradation
5. **Type safety** — proper TypeScript usage, no \`any\` types

Language: {{language}}
Context: {{context}}

Code:
\`\`\`
{{code}}
\`\`\`

Provide actionable feedback with severity levels: 🔴 Critical, 🟡 Warning, 🟢 Suggestion.`,
      createdAt: now - 86400000 * 14,
      updatedAt: now - 86400000 * 2,
    },
    {
      id: 'p2',
      title: 'Technical Blog Post Writer',
      isPinned: true,
      isFavorite: true,
      folderId: 'f2',
      tags: ['writing', 'blog', 'technical'],
      content: `Write a comprehensive technical blog post about {{topic}}.

Requirements:
- Target audience: {{audience:intermediate developers}}
- Tone: Professional yet approachable, like explaining to a smart colleague
- Length: 1500-2000 words
- Include real-world examples and code snippets
- Add a TL;DR section at the top
- Structure with clear headings (H2, H3)
- End with a "Key Takeaways" section (3-5 bullet points)
- Include SEO-friendly title suggestions

Avoid: jargon without explanation, "In this article we will...", passive voice.`,
      createdAt: now - 86400000 * 12,
      updatedAt: now - 86400000 * 1,
    },

    // ── Pinned ──
    {
      id: 'p3',
      title: 'SQL Query Optimizer',
      isPinned: true,
      isFavorite: false,
      folderId: 'f3',
      tags: ['sql', 'performance', 'database'],
      content: `You are a database performance expert. Analyze the following SQL query and suggest optimizations.

Database engine: {{engine:PostgreSQL}}
Table size: {{table_size:~10M rows}}
Current execution time: {{current_time}}

Query:
\`\`\`sql
{{query}}
\`\`\`

Provide:
1. Rewritten optimized query
2. Recommended indexes (with CREATE INDEX statements)
3. Explain plan analysis
4. Estimated performance improvement
5. Any schema changes that would help

Note: Prioritize read performance unless specified otherwise.`,
      createdAt: now - 86400000 * 10,
      updatedAt: now - 86400000 * 3,
    },
    {
      id: 'p4',
      title: 'React Component Generator',
      isPinned: true,
      isFavorite: false,
      folderId: 'f1',
      tags: ['react', 'typescript', 'component'],
      content: `Generate a production-ready React component with TypeScript.

Component name: {{component_name}}
Purpose: {{purpose}}
Props: {{props_description}}

Requirements:
- Use functional component with proper TypeScript interfaces
- Include JSDoc comments for the component and its props
- Add proper error boundaries where appropriate
- Use React.memo() if the component is likely to re-render often
- Follow the Single Responsibility Principle
- Include basic unit test file using React Testing Library
- Use CSS modules or styled-components pattern

Do NOT use: class components, any type, inline styles for complex layouts.`,
      createdAt: now - 86400000 * 9,
      updatedAt: now - 86400000 * 1,
    },

    // ── Favorites ──
    {
      id: 'p5',
      title: 'API Error Response Designer',
      isPinned: false,
      isFavorite: true,
      folderId: 'f1',
      tags: ['api', 'error-handling', 'rest'],
      content: `Design a comprehensive error handling strategy for a REST API.

API framework: {{framework:Express.js}}
Auth method: {{auth:JWT}}

Provide:
1. Standardized error response format (JSON schema)
2. Error codes mapping (HTTP status → application error codes)
3. Error middleware implementation
4. Client-friendly error messages vs internal logging
5. Rate limiting error responses
6. Validation error format (field-level errors)

Example scenarios to cover:
- Authentication failure
- Authorization (forbidden)
- Resource not found
- Validation errors (multiple fields)
- Rate limit exceeded
- Internal server error (with correlation ID)`,
      createdAt: now - 86400000 * 8,
      updatedAt: now - 86400000 * 4,
    },
    {
      id: 'p6',
      title: 'LinkedIn Post Copywriter',
      isPinned: false,
      isFavorite: true,
      folderId: 'f2',
      tags: ['linkedin', 'social-media', 'marketing'],
      content: `Write a compelling LinkedIn post about {{topic}}.

Goal: {{goal:thought leadership}}
Tone: {{tone:professional but human}}

Structure:
- Hook line (first 2 lines must stop the scroll)
- Personal insight or story (2-3 sentences)
- Key insight or lesson (the meat)
- Actionable takeaway
- Engagement question at the end
- 3-5 relevant hashtags

Rules:
- Keep under 1300 characters
- Use line breaks for readability (no walls of text)
- Avoid corporate buzzwords (synergy, leverage, etc.)
- Include one emoji per section maximum
- No "I am excited to announce" or "Thrilled to share"
- Make it feel authentic, not like AI wrote it`,
      createdAt: now - 86400000 * 7,
      updatedAt: now - 86400000 * 2,
    },

    // ── Regular prompts ──
    {
      id: 'p7',
      title: 'Docker Compose Generator',
      isPinned: false,
      isFavorite: false,
      folderId: 'f4',
      tags: ['docker', 'devops', 'infrastructure'],
      content: `Generate a production-ready docker-compose.yml for the following stack:

Application: {{app_description}}
Services needed: {{services:web app, database, cache}}
Environment: {{environment:production}}

Requirements:
- Use specific image versions (no :latest)
- Include health checks for all services
- Set resource limits (CPU, memory)
- Use named volumes for persistence
- Include proper networking (internal + external)
- Add restart policies
- Environment variables via .env file (provide template)
- Include logging configuration

Also provide:
- .env.example file
- Makefile with common commands (up, down, logs, backup)`,
      createdAt: now - 86400000 * 6,
      updatedAt: now - 86400000 * 5,
    },
    {
      id: 'p8',
      title: 'Competitive Analysis Framework',
      isPinned: false,
      isFavorite: false,
      folderId: 'f5',
      tags: ['business', 'strategy', 'analysis'],
      content: `Conduct a structured competitive analysis for {{company_or_product}}.

Industry: {{industry}}
Direct competitors: {{competitors:identify top 5}}

Analyze each competitor across:

1. **Product/Service Offering**
   - Core features and unique selling points
   - Pricing model and tiers
   - Technology stack (if relevant)

2. **Market Position**
   - Target audience segments
   - Market share estimates
   - Brand perception

3. **Strengths & Weaknesses**
   - SWOT summary for each
   - Customer reviews sentiment

4. **Strategic Opportunities**
   - Gaps in competitor offerings
   - Underserved segments
   - Differentiation opportunities

Format: Executive summary (1 paragraph) → Detailed analysis → Recommendation matrix`,
      createdAt: now - 86400000 * 5,
      updatedAt: now - 86400000 * 5,
    },
    {
      id: 'p9',
      title: 'Git Commit Message Generator',
      isPinned: false,
      isFavorite: true,
      folderId: 'f1',
      tags: ['git', 'commit', 'conventions'],
      content: `Generate a well-structured git commit message following Conventional Commits.

Changes made:
{{changes}}

Rules:
- Type: feat|fix|docs|style|refactor|perf|test|chore|ci
- Scope: optional, in parentheses
- Subject: imperative mood, no period, under 50 chars
- Body: wrap at 72 chars, explain WHAT and WHY (not HOW)
- Footer: reference issues (Closes #xxx, Fixes #xxx)

Format:
\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

Provide 2-3 options from concise to detailed.`,
      createdAt: now - 86400000 * 4,
      updatedAt: now - 86400000 * 3,
    },
    {
      id: 'p10',
      title: 'Data Pipeline Architecture',
      isPinned: false,
      isFavorite: false,
      folderId: 'f3',
      tags: ['data-engineering', 'etl', 'architecture'],
      content: `Design a data pipeline architecture for the following requirements:

Data sources: {{sources}}
Volume: {{volume:~100GB/day}}
Latency requirement: {{latency:near real-time}}
Cloud provider: {{cloud:AWS}}

Deliver:
1. Architecture diagram description (Mermaid format)
2. Technology choices with justification
3. Data flow: ingestion → processing → storage → serving
4. Error handling and dead letter queues
5. Monitoring and alerting strategy
6. Cost estimation (monthly)
7. Scaling considerations

Trade-offs to address: cost vs latency, consistency vs availability.`,
      createdAt: now - 86400000 * 3,
      updatedAt: now - 86400000 * 3,
    },
    {
      id: 'p11',
      title: 'Terraform Module Template',
      isPinned: false,
      isFavorite: false,
      folderId: 'f4',
      tags: ['terraform', 'iac', 'cloud'],
      content: `Create a reusable Terraform module for {{resource_type}}.

Cloud provider: {{provider:AWS}}
Environment: {{environment:production}}

The module must include:
- variables.tf with descriptions and validation rules
- main.tf with the resource definitions
- outputs.tf with useful outputs
- versions.tf with provider constraints
- README.md with usage examples
- examples/ directory with common configurations

Best practices:
- Use data sources instead of hardcoding
- Include tags/labels as a variable
- Add lifecycle rules where appropriate
- Include IAM roles/policies if needed
- Follow the HashiCorp module structure standard`,
      createdAt: now - 86400000 * 2,
      updatedAt: now - 86400000 * 2,
    },
    {
      id: 'p12',
      title: 'User Story to Technical Spec',
      isPinned: false,
      isFavorite: true,
      folderId: 'f5',
      tags: ['agile', 'planning', 'specs'],
      content: `Convert the following user story into a detailed technical specification.

User Story:
{{user_story}}

Acceptance Criteria:
{{acceptance_criteria}}

Generate:
1. **Technical Overview** — approach and architecture impact
2. **Database Changes** — new tables, columns, migrations
3. **API Changes** — new/modified endpoints with request/response schemas
4. **Frontend Changes** — component tree, state management, UI flow
5. **Test Plan** — unit, integration, and E2E test cases
6. **Dependencies** — blocked by or blocking other work
7. **Estimated Effort** — in story points (1/2/3/5/8/13)
8. **Risks & Edge Cases** — what could go wrong

Format as a Notion/Confluence-ready document.`,
      createdAt: now - 86400000 * 1,
      updatedAt: now - 86400000 * 1,
    },
    {
      id: 'p13',
      title: 'Email Sequence Writer',
      isPinned: false,
      isFavorite: false,
      folderId: 'f2',
      tags: ['email', 'marketing', 'copywriting'],
      content: `Create a {{length:5}}-email onboarding sequence for {{product}}.

Target user: {{persona}}
Goal: {{goal:activate users within 7 days}}

For each email provide:
- Subject line (+ one A/B variant)
- Preview text
- Send timing (Day X, time)
- Email body (HTML-ready)
- CTA button text and link placeholder

Tone: {{tone:friendly, not salesy}}

Sequence framework:
1. Welcome + quick win
2. Core feature highlight
3. Social proof / case study
4. Overcome objection
5. Urgency / next steps

Each email under 150 words. Mobile-first formatting.`,
      createdAt: now - 3600000 * 18,
      updatedAt: now - 3600000 * 18,
    },
    {
      id: 'p14',
      title: 'Python Data Class Generator',
      isPinned: false,
      isFavorite: false,
      folderId: 'f1',
      tags: ['python', 'dataclass', 'typing'],
      content: `Generate Python dataclasses from the following schema description:

{{schema_description}}

Requirements:
- Use @dataclass with frozen=True for immutable data
- Add proper type hints (use Optional, List, Dict from typing)
- Include field validators using __post_init__
- Add from_dict() and to_dict() class methods
- Include docstrings with field descriptions
- Add __str__ and __repr__ for readable output
- Handle datetime serialization
- Include Pydantic model equivalent if requested

Python version: {{python_version:3.11}}`,
      createdAt: now - 3600000 * 8,
      updatedAt: now - 3600000 * 8,
    },
    {
      id: 'p15',
      title: 'Incident Postmortem Template',
      isPinned: false,
      isFavorite: false,
      folderId: 'f4',
      tags: ['incident', 'postmortem', 'sre'],
      content: `Write a blameless incident postmortem report.

Incident: {{incident_summary}}
Severity: {{severity:SEV-2}}
Duration: {{duration}}
Services affected: {{services}}

Structure:
1. **Executive Summary** (3-4 sentences)
2. **Timeline** (bullet points with timestamps)
3. **Root Cause Analysis** (5 Whys format)
4. **Impact** (users affected, revenue impact, SLA breach)
5. **What Went Well** (detection, response, communication)
6. **What Went Wrong** (gaps in monitoring, process failures)
7. **Action Items** (table: action, owner, priority, due date)
8. **Lessons Learned**

Tone: factual, blameless, focused on systems not people.`,
      createdAt: now - 3600000 * 2,
      updatedAt: now - 3600000 * 2,
    },
  ];

  for (const prompt of prompts) {
    prompt.versions = [];
    const ok = await post('/prompts', prompt);
    if (ok) {
      const badges = [
        prompt.isPinned ? '📌' : '',
        prompt.isFavorite ? '⭐' : '',
      ].filter(Boolean).join(' ');
      console.log(`  ✓ ${prompt.title} ${badges}`);
    }
  }

  console.log('\n✅ Done! Seeded 5 folders and 15 prompts.');
  console.log('   📌 4 pinned  |  ⭐ 5 favorited  |  {{ }} 10 with variables');
  console.log('\n🔄 Refresh your browser at http://localhost:2528');
}

seed().catch(err => {
  console.error('Failed to seed:', err.message);
  process.exit(1);
});
