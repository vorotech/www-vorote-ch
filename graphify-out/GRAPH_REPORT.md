# Graph Report - www-vorote-ch  (2026-07-01)

## Corpus Check
- 153 files · ~73,411 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1044 nodes · 1460 edges · 78 communities (61 shown, 17 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a70a3790`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Author Data Models|Author Data Models]]
- [[_COMMUNITY_Page Section Components|Page Section Components]]
- [[_COMMUNITY_Next.js Page Routing|Next.js Page Routing]]
- [[_COMMUNITY_Calendar and Scheduling|Calendar and Scheduling]]
- [[_COMMUNITY_Project Dependencies|Project Dependencies]]
- [[_COMMUNITY_Biome Formatter Configuration|Biome Formatter Configuration]]
- [[_COMMUNITY_Hero and Animation Components|Hero and Animation Components]]
- [[_COMMUNITY_TinaCMS Generated Client|TinaCMS Generated Client]]
- [[_COMMUNITY_API Routes and Email|API Routes and Email]]
- [[_COMMUNITY_Linting and Code Quality|Linting and Code Quality]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Content Schema Definitions|Content Schema Definitions]]
- [[_COMMUNITY_Development Dependencies|Development Dependencies]]
- [[_COMMUNITY_UI Elements and Utilities|UI Elements and Utilities]]
- [[_COMMUNITY_Project Structure Configuration|Project Structure Configuration]]
- [[_COMMUNITY_Feature Card Components|Feature Card Components]]
- [[_COMMUNITY_Video Dialog Providers|Video Dialog Providers]]
- [[_COMMUNITY_Security Audit Components|Security Audit Components]]
- [[_COMMUNITY_Journey Roadmap Components|Journey Roadmap Components]]
- [[_COMMUNITY_Prebuild Configuration|Prebuild Configuration]]
- [[_COMMUNITY_Root Layout and Styling|Root Layout and Styling]]
- [[_COMMUNITY_Post Client Logic|Post Client Logic]]
- [[_COMMUNITY_Progressive Blur Effects|Progressive Blur Effects]]
- [[_COMMUNITY_GraphQL Request SDK|GraphQL Request SDK]]
- [[_COMMUNITY_Infinite Slider Component|Infinite Slider Component]]
- [[_COMMUNITY_PostCSS Configuration|PostCSS Configuration]]
- [[_COMMUNITY_Tailwind CSS Configuration|Tailwind CSS Configuration]]
- [[_COMMUNITY_Visual Assets|Visual Assets]]
- [[_COMMUNITY_Living-Off-The-Land-LOTL-Attacks-The-Stealthy-Threat-Within|Living-Off-The-Land-LOTL-Attacks-The-Stealthy-Threat-Within.mdx]]
- [[_COMMUNITY_8 Critical KPIs for Measuring Cybersecurity|8 Critical KPIs for Measuring Cybersecurity]]
- [[_COMMUNITY_The-Semantic-Attack-Surface-Defending-LLMs-Against-Prompt-Injection|The-Semantic-Attack-Surface-Defending-LLMs-Against-Prompt-Injection.mdx]]
- [[_COMMUNITY_The Modern CISO From Doer to Enabler|The Modern CISO: From Doer to Enabler]]
- [[_COMMUNITY_Why-You-Need-Implement-OWASP-SAMM-and-DSOMM|Why-You-Need-Implement-OWASP-SAMM-and-DSOMM.mdx]]
- [[_COMMUNITY_DefectDojo-Unified-DevSecOps-Security|DefectDojo-Unified-DevSecOps-Security.mdx]]
- [[_COMMUNITY_RSAC-2025-Key-Trends-and-Emerging-Niches|RSAC-2025-Key-Trends-and-Emerging-Niches.mdx]]
- [[_COMMUNITY_CISO-Assistant-Your-Open-Source-GRC-Powerhouse|CISO-Assistant-Your-Open-Source-GRC-Powerhouse.mdx]]
- [[_COMMUNITY_Top Open Source SIEM Tools in 2025|Top Open Source SIEM Tools in 2025]]
- [[_COMMUNITY_AGENTS|AGENTS.md]]
- [[_COMMUNITY_CISSP-Ethics-Dont-Let-Sleeping-Dogs-Lie|CISSP-Ethics-Dont-Let-Sleeping-Dogs-Lie.mdx]]
- [[_COMMUNITY_CISO Assistant Your Open Source GRC Powerhouse|CISO Assistant: Your Open Source GRC Powerhouse]]
- [[_COMMUNITY_CISSP Ethics Don't Let Sleeping Dogs Lie|CISSP Ethics: Don't Let Sleeping Dogs Lie]]
- [[_COMMUNITY_How to Measure Cybersecurity with KPIs|How to Measure Cybersecurity with KPIs]]
- [[_COMMUNITY_DefectDojo Unified DevSecOps Security|DefectDojo: Unified DevSecOps Security]]
- [[_COMMUNITY_Living Off The Land (LOTL) Attacks|Living Off The Land (LOTL) Attacks]]
- [[_COMMUNITY_Top Open Source SIEM Tools in 2025|Top Open Source SIEM Tools in 2025]]
- [[_COMMUNITY_Prowler The Essential Cloud Security Tool|Prowler: The Essential Cloud Security Tool]]
- [[_COMMUNITY_RSAC 2025 Key Trends and Emerging Niches|RSAC 2025: Key Trends and Emerging Niches]]
- [[_COMMUNITY_Why You Need Implement OWASP SAMM and DSOMM|Why You Need Implement OWASP SAMM and DSOMM]]
- [[_COMMUNITY_Automating Proxmox LXC Management with Ansible and Semaphore|Automating Proxmox LXC Management with Ansible and Semaphore]]
- [[_COMMUNITY_The Semantic Attack Surface Defending LLMs Against Prompt Injection|The Semantic Attack Surface: Defending LLMs Against Prompt Injection]]
- [[_COMMUNITY_Dmytro Vorotyntsev Avatar|Dmytro Vorotyntsev Avatar]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 55 edges
2. `compilerOptions` - 19 edges
3. `Section()` - 18 edges
4. `Member` - 15 edges
5. `generateScheduleData()` - 14 edges
6. `scripts` - 13 edges
7. `useLayout()` - 11 edges
8. `sectionBlockSchemaField` - 11 edges
9. `formatter` - 10 edges
10. `formatter` - 10 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `MermaidInner()` --calls--> `cn()`  [EXTRACTED]
  components/mermaid-renderer.tsx → lib/utils.ts
- `StatCard()` --calls--> `cn()`  [EXTRACTED]
  components/tools/security-audit/security-audit-component.tsx → lib/utils.ts
- `Button2()` --calls--> `buttonVariants`  [INFERRED]
  tina/__generated__/config.prebuild.jsx → components/ui/button.tsx
- `PostClientPage()` --calls--> `useLayout()`  [EXTRACTED]
  app/posts/[...urlSegments]/client-page.tsx → components/layout/layout-context.tsx

## Import Cycles
- 1-file cycle: `tina/__generated__/client.ts -> tina/__generated__/client.ts`

## Hyperedges (group relationships)
- **Cybersecurity Tooling Reviews** — content_posts_2025_ciso_assistant, content_posts_2025_defectdojo, content_posts_2025_prowler, content_posts_2025_open_source_siem [EXTRACTED 0.90]
- **CISO Leadership & Strategy** — content_posts_2025_modern_ciso, content_posts_2025_cybersecurity_kpis, content_posts_2026_owasp_samm_dsomm [EXTRACTED 0.85]

## Communities (78 total, 17 thin omitted)

### Community 0 - "Author Data Models"
Cohesion: 0.01
Nodes (249): Author, AuthorConnection, AuthorConnectionEdges, AuthorConnectionQuery, AuthorConnectionQueryVariables, AuthorFilter, AuthorMutation, AuthorPartsFragment (+241 more)

### Community 1 - "Page Section Components"
Cohesion: 0.08
Nodes (26): Content(), contentBlockSchema, defaultFeature, featureBlockSchema, Features(), Journey(), journeyBlockSchema, LatestPostsList() (+18 more)

### Community 2 - "Next.js Page Routing"
Cohesion: 0.08
Nodes (13): metadata, metadata, metadata, ClientPage(), ClientPageProps, Blocks(), ErrorBoundary, ErrorBoundaryProps (+5 more)

### Community 3 - "Calendar and Scheduling"
Cohesion: 0.06
Nodes (45): ClientPostProps, titleColorClasses, FeedbackForm(), Window, components, CalendarView(), CalendarViewProps, ListView() (+37 more)

### Community 4 - "Project Dependencies"
Cohesion: 0.04
Nodes (44): dependencies, class-variance-authority, clsx, date-fns, @headlessui/react, javascript-lp-solver, lucide-react, motion (+36 more)

### Community 5 - "Biome Formatter Configuration"
Cohesion: 0.07
Nodes (31): files, ignore, ignoreUnknown, maxSize, formatter, arrowParentheses, attributePosition, bracketSameLine (+23 more)

### Community 6 - "Hero and Animation Components"
Cohesion: 0.11
Nodes (22): Callout(), calloutBlockSchema, transitionVariants, Hero(), heroBlockSchema, transitionVariants, getBackgroundClass(), Section() (+14 more)

### Community 7 - "TinaCMS Generated Client"
Cohesion: 0.08
Nodes (26): AuthorConnectionDocument, AuthorDocument, AuthorPartsFragmentDoc, BlogPostQueryDocument, ContentQueryDocument, ExperimentalGetTinaClient(), generateRequester(), getSdk() (+18 more)

### Community 8 - "API Routes and Email"
Cohesion: 0.14
Nodes (12): createFeedbackEmail(), FEEDBACK_EMAIL_CONFIG, POST(), GET(), isValidPackageName(), EmailOptions, sendEmail(), LOG_LEVEL_NAMES (+4 more)

### Community 9 - "Linting and Code Quality"
Cohesion: 0.07
Nodes (27): noBannedTypes, noUselessTypeConstraint, noInvalidUseBeforeDeclaration, noPrecisionLoss, noUnusedVariables, useArrayLiterals, useExhaustiveDependencies, useHookAtTopLevel (+19 more)

### Community 10 - "TypeScript Configuration"
Cohesion: 0.09
Nodes (22): compilerOptions, allowJs, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules, jsx, lib (+14 more)

### Community 11 - "Content Schema Definitions"
Cohesion: 0.21
Nodes (8): nextConfig, Author, Global, Milestone, Page, Post, Tag, config

### Community 12 - "Development Dependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, @biomejs/biome, cross-env, @opennextjs/cloudflare, @playwright/test, postcss, postcss-import (+11 more)

### Community 13 - "UI Elements and Utilities"
Cohesion: 0.06
Nodes (34): NotFound(), NotFoundProps, PostClientPage(), Page(), CallToAction(), ctaBlockSchema, Icon(), iconColorClass (+26 more)

### Community 14 - "Project Structure Configuration"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 15 - "Feature Card Components"
Cohesion: 0.13
Nodes (18): FeaturedLink(), FeaturedLinkProps, ICON_MAP, InfiniteSlider(), InfiniteSliderProps, Card(), CardAction(), CardContent() (+10 more)

### Community 17 - "Video Dialog Providers"
Cohesion: 0.06
Nodes (35): abel, metadata, RootLayout(), sourceCodePro, ClientProviders(), GridPattern(), GridPatternProps, GRADIENT_ANGLES (+27 more)

### Community 18 - "Security Audit Components"
Cohesion: 0.06
Nodes (31): Advanced Reporting and Integration, Best Practices for Implementation, Compliance Auditing, Compliance Complexity, Compliance Framework Coverage, Comprehensive Security Checks, Conclusion, Configuration Drift and Human Error (+23 more)

### Community 19 - "Journey Roadmap Components"
Cohesion: 0.31
Nodes (6): getIcon(), JourneyMilestone(), JourneyMilestoneProps, JourneyPath(), JourneyPathProps, JourneyRoadmapProps

### Community 20 - "Prebuild Configuration"
Cohesion: 0.23
Nodes (5): Avatar(), AvatarFallback(), AvatarImage(), Button2(), cn()

### Community 21 - "Root Layout and Styling"
Cohesion: 0.17
Nodes (17): Mermaid(), mermaidBlockSchema, MermaidElement, TableOfContents(), tableOfContentsBlockSchema, TOCItem, Table(), TBody() (+9 more)

### Community 22 - "Post Client Logic"
Cohesion: 0.10
Nodes (19): 1. Fairness Redistribution, 2. The Solver Model, Core Philosophy, Hard Constraints (Must always be met), Key Concepts, Scheduler Algorithm: Constraint-Based Linear Optimization, Soft Constraints (Optimized for), Solver Strategy: The "Relaxation Waterfall" (+11 more)

### Community 23 - "Progressive Blur Effects"
Cohesion: 0.19
Nodes (12): ClientPostProps, ProcessedPost, Testimonial(), testimonialBlockSchema, Avatar(), AvatarFallback(), AvatarImage(), PageBlocksRecent (+4 more)

### Community 24 - "GraphQL Request SDK"
Cohesion: 0.83
Nodes (4): ExperimentalGetTinaClient(), generateRequester(), getSdk(), queries()

### Community 25 - "Infinite Slider Component"
Cohesion: 0.12
Nodes (15): 1. Generating SSH Key, 2. Bootstrapping the LXC Target, 3. Configuring Privilege Escalation (Sudoers), 4. Integrating with Semaphore UI, Access the Container, Adding to Semaphore Key Store, Authorize the ansible public key, Create the Dedicated 'ansible' User (+7 more)

### Community 34 - "Living-Off-The-Land-LOTL-Attacks-The-Stealthy-Threat-Within.mdx"
Cohesion: 0.13
Nodes (14): Building Effective LOTL Defenses: A Practical Implementation Guide, Conclusion, ✨Continuous Improvement: Testing and Intelligence Integration, ✨Detection Strategy: Multi-Layered Rule Development, ✨Foundation: Data Collection and Baseline Establishment, Introduction: The Art of Digital Camouflage, ✨Operational Excellence: Training and Process Integration, Real-World Examples of LOTL Attacks (+6 more)

### Community 35 - "8 Critical KPIs for Measuring Cybersecurity"
Cohesion: 0.15
Nodes (12): 1. Security Incidents and Attempts, 2. Reported Incidents, 3. Mean Time to Detect (MTTD), 4. Mean Time to Recover (MTTR), 5. Mean Time to Contain (MTTC), 6. Security Awareness Training Participation, 7. Cost Per Incident, 8. Analyst Workload (+4 more)

### Community 36 - "The-Semantic-Attack-Surface-Defending-LLMs-Against-Prompt-Injection.mdx"
Cohesion: 0.17
Nodes (11): Conclusions, Data Leakage, How We Defend the Endpoint, Major LLM API Threats, Prompt Injection, Prompt Sanitization, Quotas and Token Scoping, Rate Limiting Abuse & Billing Attacks (+3 more)

### Community 37 - "The Modern CISO: From Doer to Enabler"
Cohesion: 0.20
Nodes (9): Balancing the Transition, Conclusion, Metrics CISOs Can Enable, Risk and Incident Management, Strategic Influence, Team Empowerment, The Modern CISO: From Doer to Enabler, The Shift to Strategic Leadership (+1 more)

### Community 38 - "Why-You-Need-Implement-OWASP-SAMM-and-DSOMM.mdx"
Cohesion: 0.22
Nodes (8): A Practical Example: Secret Scanning, OWASP DSOMM: The Technical Roadmap, OWASP SAMM: The Strategic Blueprint, References, References, The DSOMM Approach: Technical Depth, The SAMM Approach: Governance and Process, Which One Should You Start With?

### Community 39 - "DefectDojo-Unified-DevSecOps-Security.mdx"
Cohesion: 0.25
Nodes (7): **Conclusion**, **Getting Started with DefectDojo**, **How DefectDojo Solves the Problem**, **Key Features**, **The Business Impact**, **The Problem**, **What is DefectDojo?**

### Community 40 - "RSAC-2025-Key-Trends-and-Emerging-Niches.mdx"
Cohesion: 0.25
Nodes (7): Autonomous Patch Management with Deep Visibility, Holistic Security and Context, Identity-Centric Security, Smarter Security Operations, The Browser as the New Endpoint, The Impact of AI on Threats, Third-Party and Supply Chain Risk

### Community 41 - "CISO-Assistant-Your-Open-Source-GRC-Powerhouse.mdx"
Cohesion: 0.29
Nodes (6): Conclusion, Get Started with CISO Assistant, How CISO Assistant Solves Business Problems, Key Features of CISO Assistant, What is CISO Assistant?, Who is CISO Assistant For?

### Community 42 - "Top Open Source SIEM Tools in 2025"
Cohesion: 0.29
Nodes (6): Challenges of Open Source SIEM Implementation, Conclusion, The Future, Top Open Source SIEM Tools in 2025, Top Open Source SIEM Tools in 2025, What Makes a Good SIEM Solution?

## Knowledge Gaps
- **622 isolated node(s):** `FEEDBACK_EMAIL_CONFIG`, `sourceCodePro`, `abel`, `metadata`, `NotFoundProps` (+617 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Project Dependencies` to `Root Layout and Styling`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `cn()` connect `Feature Card Components` to `Calendar and Scheduling`, `Hero and Animation Components`, `UI Elements and Utilities`, `Video Dialog Providers`, `Root Layout and Styling`, `Progressive Blur Effects`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `mermaid` connect `Root Layout and Styling` to `Project Dependencies`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **What connects `FEEDBACK_EMAIL_CONFIG`, `sourceCodePro`, `abel` to the rest of the system?**
  _622 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Author Data Models` be split into smaller, more focused modules?**
  _Cohesion score 0.00796812749003984 - nodes in this community are weakly interconnected._
- **Should `Page Section Components` be split into smaller, more focused modules?**
  _Cohesion score 0.08412698412698413 - nodes in this community are weakly interconnected._
- **Should `Next.js Page Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.0782051282051282 - nodes in this community are weakly interconnected._