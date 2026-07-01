# Graph Report - /root/www-vorote-ch  (2026-07-01)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 864 nodes · 1326 edges · 34 communities (29 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.7)
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
- [[_COMMUNITY_Blog Post Content|Blog Post Content]]
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
- [[_COMMUNITY_Home Page Metadata|Home Page Metadata]]
- [[_COMMUNITY_Visual Assets|Visual Assets]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 55 edges
2. `compilerOptions` - 19 edges
3. `Section()` - 18 edges
4. `Member` - 15 edges
5. `generateScheduleData()` - 14 edges
6. `Dmytro Vorotyntsev` - 14 edges
7. `scripts` - 13 edges
8. `useLayout()` - 11 edges
9. `sectionBlockSchemaField` - 11 edges
10. `formatter` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Dmytro Vorotyntsev` --references--> `Dmytro Vorotyntsev Avatar`  [EXTRACTED]
  content/authors/Dmytro.md → public/uploads/authors/1749114494959.jpeg
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `MermaidInner()` --calls--> `cn()`  [EXTRACTED]
  components/mermaid-renderer.tsx → lib/utils.ts
- `InfiniteSlider()` --calls--> `cn()`  [EXTRACTED]
  components/motion-primitives/infinite-slider.tsx → lib/utils.ts
- `StatCard()` --calls--> `cn()`  [EXTRACTED]
  components/tools/security-audit/security-audit-component.tsx → lib/utils.ts

## Import Cycles
- 1-file cycle: `tina/__generated__/client.ts -> tina/__generated__/client.ts`

## Hyperedges (group relationships)
- **Cybersecurity Tooling Reviews** — content_posts_2025_ciso_assistant, content_posts_2025_defectdojo, content_posts_2025_prowler, content_posts_2025_open_source_siem [EXTRACTED 0.90]
- **CISO Leadership & Strategy** — content_posts_2025_modern_ciso, content_posts_2025_cybersecurity_kpis, content_posts_2026_owasp_samm_dsomm [EXTRACTED 0.85]

## Communities (34 total, 5 thin omitted)

### Community 0 - "Author Data Models"
Cohesion: 0.01
Nodes (249): Author, AuthorConnection, AuthorConnectionEdges, AuthorConnectionQuery, AuthorConnectionQueryVariables, AuthorFilter, AuthorMutation, AuthorPartsFragment (+241 more)

### Community 1 - "Page Section Components"
Cohesion: 0.06
Nodes (61): ClientPostProps, CallToAction(), ctaBlockSchema, Callout(), calloutBlockSchema, transitionVariants, Content(), contentBlockSchema (+53 more)

### Community 2 - "Next.js Page Routing"
Cohesion: 0.05
Nodes (32): NotFound(), PostClientPage(), metadata, metadata, metadata, ClientPage(), ClientPageProps, Page() (+24 more)

### Community 3 - "Calendar and Scheduling"
Cohesion: 0.07
Nodes (42): FeedbackForm(), Window, CalendarView(), CalendarViewProps, ListView(), ListViewProps, LoadDistributionAnalysis(), LoadDistributionAnalysisProps (+34 more)

### Community 4 - "Project Dependencies"
Cohesion: 0.04
Nodes (44): dependencies, class-variance-authority, clsx, date-fns, @headlessui/react, javascript-lp-solver, lucide-react, motion (+36 more)

### Community 5 - "Biome Formatter Configuration"
Cohesion: 0.06
Nodes (33): files, ignore, ignoreUnknown, maxSize, formatter, arrowParentheses, attributePosition, bracketSameLine (+25 more)

### Community 6 - "Hero and Animation Components"
Cohesion: 0.09
Nodes (25): Hero(), heroBlockSchema, transitionVariants, Meteors(), MeteorsProps, addDefaultVariants(), AnimatedGroup(), AnimatedGroupProps (+17 more)

### Community 7 - "TinaCMS Generated Client"
Cohesion: 0.08
Nodes (26): AuthorConnectionDocument, AuthorDocument, AuthorPartsFragmentDoc, BlogPostQueryDocument, ContentQueryDocument, ExperimentalGetTinaClient(), generateRequester(), getSdk() (+18 more)

### Community 8 - "API Routes and Email"
Cohesion: 0.14
Nodes (12): createFeedbackEmail(), FEEDBACK_EMAIL_CONFIG, POST(), GET(), isValidPackageName(), EmailOptions, sendEmail(), LOG_LEVEL_NAMES (+4 more)

### Community 9 - "Linting and Code Quality"
Cohesion: 0.08
Nodes (25): noBannedTypes, noUselessTypeConstraint, noInvalidUseBeforeDeclaration, noPrecisionLoss, noUnusedVariables, useArrayLiterals, useExhaustiveDependencies, useHookAtTopLevel (+17 more)

### Community 10 - "TypeScript Configuration"
Cohesion: 0.09
Nodes (22): compilerOptions, allowJs, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules, jsx, lib (+14 more)

### Community 11 - "Content Schema Definitions"
Cohesion: 0.14
Nodes (12): nextConfig, Author, Global, Milestone, Page, Post, Tag, config (+4 more)

### Community 12 - "Development Dependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, @biomejs/biome, cross-env, @opennextjs/cloudflare, @playwright/test, postcss, postcss-import (+11 more)

### Community 13 - "UI Elements and Utilities"
Cohesion: 0.14
Nodes (11): NotFoundProps, scriptCopyBlockSchema, ScriptCopyBtn(), ScriptCopyBtnProps, MermaidElement, MermaidInner(), MermaidProps, Button() (+3 more)

### Community 14 - "Project Structure Configuration"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 15 - "Feature Card Components"
Cohesion: 0.18
Nodes (13): FeaturedLinkProps, ICON_MAP, defaultFeature, Card(), CardAction(), CardContent(), CardDescription(), CardFooter() (+5 more)

### Community 16 - "Blog Post Content"
Cohesion: 0.13
Nodes (15): Dmytro Vorotyntsev, About Me Page, CISO Assistant: Your Open Source GRC Powerhouse, CISSP Ethics: Don't Let Sleeping Dogs Lie, How to Measure Cybersecurity with KPIs, DefectDojo: Unified DevSecOps Security, Living Off The Land (LOTL) Attacks, The Modern CISO: From Doer to Enabler (+7 more)

### Community 17 - "Video Dialog Providers"
Cohesion: 0.26
Nodes (8): ClientProviders(), HeroVideoDialog(), HeroVideoProps, VideoDialog(), useVideoDialog(), VideoDialogContext, VideoDialogContextProps, VideoDialogProvider()

### Community 18 - "Security Audit Components"
Cohesion: 0.18
Nodes (8): GRADIENT_ANGLES, ProgressiveBlur(), ProgressiveBlurProps, AuditResult, CWE_DICTIONARY, SEVERITY_COLORS, StatCard(), Vulnerability

### Community 19 - "Journey Roadmap Components"
Cohesion: 0.27
Nodes (7): getIcon(), JourneyMilestone(), JourneyMilestoneProps, JourneyPath(), JourneyPathProps, JourneyRoadmap(), JourneyRoadmapProps

### Community 20 - "Prebuild Configuration"
Cohesion: 0.25
Nodes (5): Avatar(), AvatarFallback(), AvatarImage(), Button2(), cn()

### Community 21 - "Root Layout and Styling"
Cohesion: 0.24
Nodes (7): abel, metadata, RootLayout(), sourceCodePro, GridPattern(), GridPatternProps, TailwindIndicator()

### Community 22 - "Post Client Logic"
Cohesion: 0.24
Nodes (7): ClientPostProps, titleColorClasses, components, InfiniteSlider(), InfiniteSliderProps, calculateReadingTime(), PostQuery

### Community 23 - "Progressive Blur Effects"
Cohesion: 0.50
Nodes (3): GRADIENT_ANGLES, ProgressiveBlur(), ProgressiveBlurProps

### Community 24 - "GraphQL Request SDK"
Cohesion: 0.83
Nodes (4): ExperimentalGetTinaClient(), generateRequester(), getSdk(), queries()

## Knowledge Gaps
- **503 isolated node(s):** `FEEDBACK_EMAIL_CONFIG`, `sourceCodePro`, `abel`, `metadata`, `NotFoundProps` (+498 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Feature Card Components` to `Page Section Components`, `Next.js Page Routing`, `Calendar and Scheduling`, `Hero and Animation Components`, `UI Elements and Utilities`, `Video Dialog Providers`, `Security Audit Components`, `Root Layout and Styling`, `Post Client Logic`, `Progressive Blur Effects`, `Infinite Slider Component`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Project Dependencies` to `Page Section Components`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `mermaid` connect `Page Section Components` to `Project Dependencies`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **What connects `FEEDBACK_EMAIL_CONFIG`, `sourceCodePro`, `abel` to the rest of the system?**
  _503 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Author Data Models` be split into smaller, more focused modules?**
  _Cohesion score 0.00796812749003984 - nodes in this community are weakly interconnected._
- **Should `Page Section Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05583308845136644 - nodes in this community are weakly interconnected._
- **Should `Next.js Page Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.05096153846153846 - nodes in this community are weakly interconnected._