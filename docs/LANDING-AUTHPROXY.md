# LANDING-AUTHPROXY (Canonical Source)

> Единый source of truth для структуры и контента одностраничного сайта AuthProxy.
> Любые изменения copy/иерархии секций сначала вносятся в этот файл, затем в `index.html`.

---

## META

**Product Name:** AuthProxy  
**Product Type:** Self-hosted application gateway  
**Docs:** https://docs.authproxy.tech/docs/intro  
**Current Site:** https://authproxy.tech/  
**Reference Direction:** https://vercel.com/home

**Core Positioning:**  
AuthProxy is a self-hosted application gateway that unifies authentication, reverse proxying, file handling, notifications, and operational control in a single process.

**Primary Audience:**
- product teams
- backend developers
- platform engineers
- PWA builders
- AI-native / MCP-integrated applications

**Core Message:**  
Stop assembling infrastructure from multiple services. Run authentication, routing, files, and real-time events through one gateway.

---

## TOP NAVIGATION

Why AuthProxy · How It Works · Capabilities · Security · Developers · Operations · Pricing · FAQ

---

## GLOBAL CTA

**Primary CTA Label:** Start Building  
**Primary CTA Link:** https://docs.authproxy.tech/docs/intro

**Secondary CTA Label:** View Docs  
**Secondary CTA Link:** https://docs.authproxy.tech/docs/intro

**Optional CTA Label:** View Admin Demo  
**Optional CTA Link:** https://authproxy.tech/

---

## SECTION 01 — HERO

**Purpose:**  
Instantly position AuthProxy as a unified infrastructure gateway, not a single-purpose auth tool.

**Kicker:**  
Self-Hosted Infrastructure Gateway

**Headline:**  
One Gateway for Authentication, Routing, and Application Control

**Subheadline:**  
AuthProxy is a self-hosted application gateway that replaces authentication, reverse proxy, file storage, and real-time events in a single process with zero external dependencies.

**Stats:**
- 11 Auth Methods
- 13 Admin Pages
- 221 Unit Tests
- 3 KB First Load

**Hero System Nodes (visual labels):**
- Edge Authentication
- Traffic & Route Control
- File Delivery
- Realtime Notifications

**Primary CTA:** Start Building  
**Secondary CTA:** View Docs

**Notes:**
- Keep headline and subheadline concise
- Keep stats in one scannable row
- Avoid deep technical detail in hero

---

## SECTION 02 — PROBLEM / SOLUTION

**Purpose:**  
Show cost of fragmented infrastructure and contrast it with one gateway model.

**Headline:**  
You’re Building Infrastructure Instead of Product

**Body:**  
Modern applications usually depend on separate systems for authentication, routing, file handling, notifications, and admin operations. Every new service adds integration overhead, security surface, and operational complexity.

**Problem Points:**
- Authentication requires a separate provider
- Reverse proxying adds routing and security overhead
- File storage needs its own service and policies
- Notifications add additional channels and integrations
- Admin tooling becomes internal maintenance burden

**Solution Card Headline:**  
AuthProxy Replaces All Five

**Solution Card Items:**
- Authentication
- Reverse Proxy
- File Service
- Notifications
- Admin Panel

**Solution Card Footer:**  
One process. Full control. Production-ready.

---

## SECTION 03 — HOW IT WORKS

**Purpose:**  
Build a simple mental model: all traffic flows through a controlled edge gateway.

**Headline:**  
One Gateway Between Users and Your Services

**Diagram:**  
Client → AuthProxy → Services

**Body:**  
AuthProxy sits at the edge of your application. Requests are authenticated, access policies are enforced, service context is injected, and traffic is routed to the correct backend.

**Supporting Points:**
- Authenticate requests before they reach your backend
- Enforce access control at the edge
- Inject useful context headers for downstream services
- Route traffic through one controlled entry point

**Proof Points (short):**
- Header injection support (`X-Crm`, `X-Scopes`, `X-Project`)
- Route policies can be managed centrally

**Docs Link Label:** Learn more  
**Docs Link URL:** https://docs.authproxy.tech/docs/overview/architecture

---

## SECTION 04 — CAPABILITIES

**Purpose:**  
Present built-in platform modules with clarity, without turning landing into documentation.

**Headline:**  
Everything Your Application Needs — Built In

**Intro:**  
AuthProxy combines core infrastructure capabilities into one gateway so teams can ship faster with less operational complexity.

### TAB 01 — Authentication
**Title:** Authentication  
**Text:** Support modern login flows with built-in methods including PassKey, OTP, OAuth, and AI-facing access patterns.

**Bullets:**
- 11 built-in auth methods
- Cryptographic verification by default
- In-memory sessions and instant revocation
- Deep implementation docs available

### TAB 02 — Reverse Proxy
**Title:** Reverse Proxy  
**Text:** Route requests through one edge layer with policy enforcement, header injection, and dynamic route control.

**Bullets:**
- Dynamic routing
- Zero-downtime config updates
- Built-in rate limiting
- Route-level security flags

### TAB 03 — File Service
**Title:** File Service  
**Text:** Handle uploads, downloads, and media delivery without adding separate storage control infrastructure.

**Bullets:**
- Secure uploads
- Ownership-aware file handling
- Integrity and optimization support
- Optimized asset delivery

### TAB 04 — Notifications
**Title:** Notifications  
**Text:** Deliver real-time updates across browser, mobile, and external systems from one event architecture.

**Bullets:**
- Server-Sent Events
- Webhooks
- Push notifications
- Unified event distribution

### TAB 05 — Admin Panel
**Title:** Admin Panel  
**Text:** Operate users, sessions, routes, and event visibility from one operational interface.

**Bullets:**
- User and session control
- Route management
- Event monitoring
- Operational visibility

**Docs Link URL:** https://docs.authproxy.tech/docs/overview/key-features

---

## SECTION 05 — SECURITY & PERFORMANCE

**Purpose:**  
Build trust through concise, technical, verifiable security/performance positioning.

**Headline:**  
Secure by Design. Fast by Default.

**Intro:**  
AuthProxy protects the edge of your system while keeping architecture lean and predictable.

**Security Points:**
- Challenge-response authentication with no password storage
- In-memory sessions with instant revocation
- Built-in rate limiting and request controls
- Scope-based route access control
- No direct exposure of backend services

**Performance Points:**
- 3 KB first load
- PWA-optimized delivery
- Minimal dependency chain
- Single-process architecture

**Docs Link Label:** View technical details  
**Docs Link URL:** https://docs.authproxy.tech/docs/security/encryption

---

## SECTION 06 — DEVELOPERS

**Purpose:**  
Show developer-first value and flexibility with minimal copy weight.

**Headline:**  
Built for Developers, Not Infrastructure Teams

**Body:**  
AuthProxy gives product and backend teams a clean way to add authentication, routing, and operational control without assembling multiple vendors and custom internal tooling.

**Developer Highlights:**
- API-first architecture
- Works with any backend
- Customizable auth flows
- PWA-optimized delivery
- AI-native / MCP integration
- Federation-ready architecture

**Supporting Line:**  
Ship faster with less code, fewer dependencies, and a clearer operational model.

**Docs Link Label:** Explore docs  
**Docs Link URL:** https://docs.authproxy.tech/docs/integration/mcp-protocol

---

## SECTION 07 — OPERATIONS

**Purpose:**  
Reassure teams about deployment, monitoring, and change management.

**Headline:**  
Run, Monitor, and Upgrade with Confidence

**Body:**  
Deploy AuthProxy with a predictable operational model and maintain visibility across health, telemetry, and version updates.

**Points:**
- Docker-first deployment workflow
- Built-in monitoring and diagnostics
- OpenTelemetry integration
- Clear versioning and release tracking
- Documented limitations and upgrade path

**Docs Link Label:** See deployment docs  
**Docs Link URL:** https://docs.authproxy.tech/docs/deployment/docker-deployment

---

## SECTION 08 — PRICING

**Purpose:**  
Provide clear commercial framing before final conversion CTA.

**Headline:**  
Choose the Plan That Fits Your Stage

**Body:**  
Start with free access, then scale to business tiers with expanded operational and support capabilities.

**Pricing Cards:**
- Free version — 0$
- Business subscribe — 54$/month
- Business version — 3000$/month
- Business version+ — 10000$/month

**Pricing Note:**  
Pricing values follow the current public site presentation and should be validated before production launch.

---

## SECTION 09 — FAQ + DOCS

**Purpose:**  
Resolve key objections and provide a direct path to implementation details.

**Headline:**  
Frequently Asked Questions and Documentation

**Body:**  
Key implementation questions answered with direct links to technical docs for deeper detail.

**FAQ Items (accordion):**
- How quickly can we deploy AuthProxy in production?
- Can we keep our existing backend services and auth flows?
- How does AuthProxy handle performance and rate limiting?
- Does AuthProxy support AI/MCP integrations securely?

**FAQ Content (Q/A):**
- **Q:** How quickly can we deploy AuthProxy in production?  
  **A:** Most teams can launch with Docker in under an hour. Start with the quick start flow, then add route and security policies incrementally.
- **Q:** Can we keep our existing backend services and auth flows?  
  **A:** Yes. AuthProxy sits in front of existing services as an edge gateway, so you can keep current backends and migrate auth/routing policies progressively.
- **Q:** How does AuthProxy handle performance and rate limiting?  
  **A:** AuthProxy uses a lightweight single-process model with PWA-optimized delivery and built-in request controls, including rate limiting at the gateway layer.
- **Q:** Does AuthProxy support AI/MCP integrations securely?  
  **A:** Yes. AuthProxy includes MCP-oriented integration patterns with edge authentication, scoped access, and centralized policy enforcement for AI-connected flows.

**Default Expanded Answer:**  
Most teams can launch with Docker in under an hour. Start with quick start, then apply security and routing policies progressively.

**Docs Panel Links:**
- Quick Start → https://docs.authproxy.tech/docs/getting-started/quick-start
- Architecture → https://docs.authproxy.tech/docs/overview/architecture
- Security → https://docs.authproxy.tech/docs/security/encryption
- Deployment → https://docs.authproxy.tech/docs/deployment/docker-deployment
- MCP Protocol → https://docs.authproxy.tech/docs/integration/mcp-protocol

---

## SECTION 10 — FINAL CTA

**Purpose:**  
Close with a focused conversion block.

**Headline:**  
Stop Building Infrastructure. Start Building Your Product.

**Body:**  
AuthProxy gives you one gateway for authentication, routing, file handling, notifications, and operational control so your team can focus on product delivery.

**Primary CTA:** Start Building  
**Secondary CTA:** View Docs

**Primary CTA Link:** https://docs.authproxy.tech/docs/intro  
**Secondary CTA Link:** https://docs.authproxy.tech/docs/intro

---

## FOOTER

**Column: Product**
- Features
- Security
- Deployment

**Column: Developers**
- Docs
- Quick Start
- API Reference

**Column: Resources**
- Changelog
- MCP Protocol
- Webhooks

**Column: Company**
- Contact
- License
- Privacy

**Footer Note:**  
AuthProxy — self-hosted gateway for secure, scalable application delivery.

---

## CONTENT RULES

- Keep landing copy concise and product-focused
- Keep deep technical details in docs
- Avoid large technical tables on landing
- Keep section order stable unless strategy changes
- Keep claims verifiable and consistent across sections
- If a metric is uncertain, remove it until validated

---

## CLAIM POLICY

- Prefer stable claims (architecture, module coverage, model)
- Validate numeric claims (`11`, `13`, `221`, `3 KB`) before release
- Do not duplicate contradictory metrics across sections
- Keep compliance/security wording precise and non-legalistic
