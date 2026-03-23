# AuthProxy — Landing Page Content

> Content guide for authproxy.itbuild.app landing page.
> Sections are ordered by priority. Each section includes headline, copy, and supporting data.

---

## 1. HERO SECTION

### Headline
**Authentication, Routing & Files — One Module, Zero Dependencies**

### Subheadline
AuthProxy is a production-grade web server that handles authentication, reverse proxy, file management, and real-time notifications for PWA applications. 11 auth methods, in-memory sessions, rate limiting — all embedded in a single process.

### Key Stats Bar
| 11 Auth Methods | 13 Admin Pages | 221 Unit Tests | 3 KB First Load |
|---|---|---|---|

### Primary CTA
**Start Building →** (links to docs/quickstart)

### Secondary CTA
**View Admin Demo →** (links to live demo)

---

## 2. THE PROBLEM

### Headline
**You're Assembling Auth Infrastructure From 5 Different Services**

### Copy
Building a modern web application? You need:
- An identity provider (Auth0, Keycloak, Firebase)
- A reverse proxy (nginx, Traefik)
- A file storage service (S3, MinIO)
- A notification system (Firebase, OneSignal)
- An admin panel (custom build or Retool)

That's 5 vendors, 5 failure points, 5 learning curves, and weeks of integration work.

**AuthProxy replaces all five.** Single ASP.NET process. No external dependencies. Production-ready from day one.

---

## 3. HOW IT WORKS

### Headline
**One Process. Five Capabilities.**

### Diagram Description
```
Internet → AuthProxy (port 443)
              ├── 🔐 Authentication (11 methods)
              ├── 🔀 Reverse Proxy (dynamic routing)
              ├── 📁 File Service (upload/download/images)
              ├── 📡 Notifications (SSE, Webhooks, Push)
              └── ⚙️ Admin Panel (13 pages)
                     ↓
              Backend Services (your Core, TrexWallet, Chat, CRM)
```

### Copy
AuthProxy sits at the edge of your application. Every request passes through it. Authentication is verified, headers are injected (X-Crm, X-Scopes, X-Project), and requests are forwarded to your backend services. Your services never see unauthenticated traffic.

---

## 4. AUTHENTICATION — 11 METHODS

### Headline
**Every Auth Method Your Users Need. Already Built.**

### Feature Grid

#### Cryptographic (Strongest)
| Method | How It Works | Best For |
|--------|-------------|----------|
| **PassKey** | Ed25519 challenge-response, SHA256(phone+password+domain) | Default login for most users |
| **FIDO2/WebAuthn** | Hardware keys with sign-count anti-cloning | Enterprise, high-security accounts |
| **UserKey** | Imported Ed25519 hex private key | Automation, power users |

#### One-Time Passwords
| Method | How It Works | Best For |
|--------|-------------|----------|
| **Phone OTP** | SMS/Messenger delivery, optional account creation | Mobile-first onboarding |
| **Email OTP** | Email with MX validation + Magic Link option | Desktop users, enterprise |

#### Social / OAuth
| Method | How It Works | Best For |
|--------|-------------|----------|
| **Google** | JWT validation with ID tokens | Global audience |
| **Telegram** | HMAC-SHA256 bot-based login | CIS/crypto communities |
| **Discord** | Code exchange + account linking | Gaming, communities |
| **Facebook** | Graph API v21.0 | Consumer apps |
| **GitHub** | Code exchange | Developer tools |
| **VK** | JWT validation | Russian market |
| **Apple** | JWT + nonce verification | iOS requirement |

#### AI / Machine
| Method | How It Works | Best For |
|--------|-------------|----------|
| **MCP Basic** | Public key headers, read-only | AI monitoring agents |
| **MCP Verified** | Ed25519 timestamp signing | AI trading bots, automation |
| **MCP App** | Delegated third-party access | Third-party AI integrations |

### Key Technical Details
- **Challenge-Response Protocol**: No passwords stored. Server generates random challenge → client signs with Ed25519 → server verifies. Replay attacks impossible (2-minute TTL).
- **In-Memory Sessions**: ConcurrentDictionary, O(1) lookup, instant revocation. No Redis, no DB queries on every request.
- **Domain Salting**: Password hash includes domain — stolen credentials don't work on other sites.
- **Timing Protection**: Random 50-150ms delay on all auth attempts prevents timing attacks.

---

## 5. REVERSE PROXY

### Headline
**Dynamic Routing. Zero-Downtime Config Changes.**

### Copy
Routes are stored in the `route_map` database table and reloaded every 100 seconds. Add, remove, or modify routes without restarting the server.

### Feature List
- **Three route types**: SPA/PWA pages, API proxy to backends, internal AuthProxy APIs
- **Priority-based matching**: First URL segment determines route, priorities handle conflicts
- **Security flags per route**: ScopeCheck, WhiteListIPCheck, GeoIP enrichment, NoRateLimit, AppAuthAndCORS
- **Injected headers**: Every proxied request gets X-Crm, X-Scopes, X-Project, X-KeyType, X-Country
- **Rate limiting**: Per-session buffer (20 requests, replenish 1/sec) — built-in DDoS protection
- **IP restriction**: `/private/*` APIs accessible only from internal networks (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)

### Comparison Box
| Feature | nginx + Auth0 | AuthProxy |
|---------|---------------|-----------|
| Config changes | Reload required | Live (100s auto-reload) |
| Auth + Proxy | Two processes | Single process |
| Per-session rate limit | Custom implementation | Built-in |
| Header injection | Custom Lua/config | Automatic |
| Admin UI for routes | None | Built-in (RouteMap page) |
| GeoIP enrichment | Extra module | Built-in flag |

---

## 6. FILE SERVICE

### Headline
**Secure File Upload, Download & Image Processing**

### Feature List
- Upload files with ownership tracking (tied to user CRM ID)
- Automatic image processing and optimization
- CRC32 checksums for data integrity
- In-memory caching of PWA static assets (all wwwroot/ loaded at startup)
- Admin file management: search by owner, filename, size; preview thumbnails; cleanup orphans

---

## 7. REAL-TIME NOTIFICATIONS

### Headline
**SSE, Webhooks & Push — All From One Event System**

### Architecture
```
Module Events → AuthProxy EventHub (in-memory)
                  ├── SSE → Browser clients (real-time updates)
                  ├── Webhooks → External apps (HTTP callbacks)
                  └── Push → Mobile devices
```

### Feature List
- **SSE (Server-Sent Events)**: Real-time browser push with reconnection support and event cache
- **Webhooks**: HTTP callbacks to external apps with delivery status tracking and health monitoring
- **Push Notifications**: Mobile push via system integrations
- **Cross-module events**: TrexWallet, Chat, CRM publish events → AuthProxy distributes
- **Event Monitor admin page**: Real-time visibility into SSE connections, webhook delivery status
- **Email, SMS, Telegram**: Configurable notification channels

---

## 8. ADMIN PANEL — 13 PAGES

### Headline
**Full Operational Visibility. Not a Black Box.**

### Page Overview

| Page | What You Can Do |
|------|----------------|
| **Dashboard** | Active users, sessions, logins by method, system health (uptime, memory, CPU) |
| **Users** | Create, edit, block/unblock, assign scopes, view login history |
| **LoginLog** | Filter by date/method/IP/location, export to Excel, suspicious activity highlighting |
| **UserKeys** | Revoke/restore Ed25519/FIDO2 keys, last-used tracking, sign count |
| **UserApps** | OAuth app registration and management |
| **AppAccess** | OAuth grants tracking |
| **RouteMap** | CRUD for proxy rules, flag checkboxes, route tester |
| **Settings** | 18 setting types with per-node configuration |
| **SignLog** | Ed25519 signature verification audit trail |
| **Sessions** | View all active sessions, kill suspicious ones |
| **Events** | SSE/Webhook monitoring, delivery health |
| **MCP** | AI agent session tracking and management |
| **Federation** | Partner node management |

### Tech Stack
- Bootstrap 5.3.8 + DataTables 2.3.7 (sorting, search, pagination, Excel export)
- PostCore (`postcore.js`) — unified AJAX with AntiForgery, loading overlay, error handling
- All resources local — no CDN dependencies

---

## 9. SECURITY

### Headline
**Enterprise Security Without Enterprise Complexity**

### Security Grid

| Layer | Protection | How |
|-------|-----------|-----|
| **Transport** | MITM prevention | HTTPS + Let's Encrypt auto-renewal |
| **Authentication** | Credential theft | Ed25519 challenge-response (no passwords stored) |
| **Sessions** | Session hijacking | In-memory + HttpOnly + SameSite=Strict cookies |
| **Authorization** | Unauthorized access | Scope-based permissions, per-route enforcement |
| **API** | API abuse | Per-session rate limiting (20 req buffer, 1/sec replenish) |
| **Internal** | Module isolation | X-API-Key + IP whitelist for /private/ APIs |
| **Audit** | Compliance | 100% login attempt logging with GeoIP |
| **DDoS** | Volume attacks | Client rate limiting + IP blacklisting |

### Compliance
- **GDPR**: Audit logging, soft delete, data export capability
- **FIDO2/WebAuthn**: Standards-compliant hardware key support
- **CSP**: Content Security Policy configurable via settings

---

## 10. PWA OPTIMIZATION

### Headline
**3 KB First Load. Works on 3G.**

### The Three-Stage Load
1. **Stage 1** (3 KB): CSS animation displays instantly — user sees branded loading screen
2. **Stage 2** (180 KB): AuthProxy gateway PWA loads from in-memory cache
3. **Stage 3**: Full application loads after authentication

### Performance Features
- In-memory file serving (all wwwroot/ loaded into RAM at startup)
- Preload headers for parallel resource loading
- Offline capability via Service Worker
- Automatic gzip/brotli compression
- Cache busting with proper headers

---

## 11. MCP INTEGRATION (AI-NATIVE)

### Headline
**Your Application is AI-Ready From Day One**

### Copy
AuthProxy includes a built-in MCP (Model Context Protocol) server at `/auth/v1/mcp`. AI agents can authenticate, query data, and execute operations through 8 AuthProxy tools + tools from connected modules (51 total across the platform).

### Three Security Levels
| Level | Access | Use Case |
|-------|--------|----------|
| **McpBasic** | Read-only, public key headers | Monitoring dashboards, reporting |
| **McpVerified** | Full access, Ed25519 timestamp signing | Trading bots, payment automation |
| **McpApp** | Delegated third-party access | Third-party AI integrations |

### AuthProxy MCP Tools
`auth_register`, `auth_login`, `auth_logout`, `user_get`, `user_list`, `user_update`, `file_upload`, `file_download`, `file_list`, `session_info`, `user_key_create`, `user_key_delete`

---

## 12. FEDERATION

### Headline
**Multi-Node Deployment & Partner Networks**

### Feature List
- Partner trust system with public key exchange
- Handshake protocol (`/hello` endpoint) for partner verification
- Up to 10 parallel instances (node IDs 10-19) for horizontal scaling
- Per-node configuration via settings table
- Federation admin page for partner management

---

## 13. TECHNICAL SPECIFICATIONS

### Technology Stack
| Component | Technology |
|-----------|-----------|
| Runtime | ASP.NET Core 8+ (C#) |
| Database | MS SQL Server (Express — free) |
| Login PWA | Preact 10.25 (3 KB) |
| Admin UI | Bootstrap 5.3.8, DataTables 2.3.7, jQuery 3.7.1 |
| Real-Time | SSE + in-process EventHub |
| Crypto | Ed25519, SHA256, HMAC-SHA256 |
| Deployment | Docker container |

### Database Tables
| Table | Purpose |
|-------|---------|
| `apguser` | User accounts with scopes, flags, profile data |
| `user_key` | Ed25519/FIDO2 keys per user |
| `login_log` | Authentication audit trail with GeoIP |
| `sign_log` | Signature verification records |
| `route_map` | Dynamic proxy routing rules |
| `settings` | Runtime configuration (18 types) |
| `files` | File metadata with CRC32 checksums |
| `user_app` | OAuth application registrations |
| `app_access` | OAuth grant records |

### Configuration Levels
| Level | Source | Restart Required? |
|-------|--------|-------------------|
| Static | `appsettings.json` | Yes |
| Dynamic | `settings` DB table | No (auto-reload 100s) |
| Frontend | `authproxy-settings.js` | Build-time only |

---

## 14. INTEGRATION

### Headline
**Works With Any Backend**

### Copy
AuthProxy doesn't care what language your backend is written in. It proxies HTTP requests and injects auth headers. Your service receives verified user identity in every request.

### Supported Integrations
- **Platform modules**: TrexWallet, Chat, CRM (REST API)
- **Custom Core**: Any HTTP backend (.NET, Node.js, Python, Go, Java)
- **OAuth providers**: Google, Discord, Facebook, GitHub, Telegram, VK, Apple
- **Email/SMS**: Configurable SMTP + SMS providers
- **AI agents**: MCP protocol (Claude, GPT, custom)
- **External apps**: Webhooks + AppLogin (OAuth-like flow)

---

## 15. FORM CUSTOMIZATION

### Headline
**Three Levels of Login Form Customization**

| Level | Effort | What You Change |
|-------|--------|----------------|
| **Config** | 5 minutes | Set DEFAULT_LOGIN_FORM_ID in settings |
| **CSS Theme** | 1 hour | Override --color-active, --border-radius, --shadow-md |
| **Custom HTML** | 1 day | Create your own login.html with full brand design |

### Pre-Built Forms
PassKey, FIDO2, Phone OTP, Email OTP, UserKey, All Methods selector, Telegram, Google, Discord, Facebook

---

## 16. PRICING / AVAILABILITY

### Copy
AuthProxy is the **required foundation module** of the ItBuild platform. It's included in every project tier:

| Tier | Cost | Includes |
|------|------|----------|
| **Free** | $0 | Full module, all auth methods, community support |
| **Business** | From $500/mo | Priority support, included hosting |
| **Enterprise** | Custom | Dedicated engineer, SLA, custom features |

### What's Free Forever
- All 11 authentication methods
- Reverse proxy with dynamic routing
- File service
- SSE + Webhooks
- Admin panel (13 pages)
- MCP integration

---

## 17. QUICK START

### Headline
**Running in 15 Minutes**

### Steps
1. **Pull Docker image** → `docker pull itbuild/authproxy`
2. **Configure database** → Point to SQL Server (Express is free)
3. **Set domain** → Configure rpId for cookie binding
4. **Enable auth methods** → Toggle in settings table
5. **Add routes** → Map your backend services in route_map
6. **Deploy** → Your PWA is live with full auth

---

## 18. FAQ

**Q: Do I need Redis for sessions?**
A: No. Sessions are in-memory (ConcurrentDictionary). Faster than Redis, zero infrastructure. Lost on restart — acceptable for PWA (users re-login).

**Q: Can I use my own identity provider instead?**
A: AuthProxy IS your identity provider. No external IdP needed. But you can integrate via OAuth if you want social login alongside native auth.

**Q: What happens if AuthProxy goes down?**
A: All requests stop (it's the gateway). For high availability, run up to 10 instances with sticky sessions.

**Q: Is it really more secure than JWT?**
A: Challenge-response means no token to steal. Sessions are revoked instantly (in-memory). No "valid JWT with revoked user" window. Domain-salted passwords prevent cross-site reuse.

**Q: Can I use AuthProxy without other ItBuild modules?**
A: Yes. AuthProxy + your custom backend is the minimal setup. TrexWallet, Chat, CRM are all optional.

---

## 19. SOCIAL PROOF

### Production Deployments
- **Gekkard** (gekkard.com) — EU-regulated fintech, Malta FSA license (EMI C55146)
- **GekWallet** (web.gekwallet.com) — Live crypto wallet
- **TeleStore** (tele.store) — Game app marketplace

### Quality Metrics
- 221 unit tests
- 13 pre-built admin pages
- 12+ years fintech experience behind the architecture

---

## 20. CLOSING CTA

### Headline
**Stop Building Auth Infrastructure. Start Building Your Product.**

### Copy
AuthProxy handles authentication, routing, files, and notifications so you can focus on what makes your application unique. Production-ready, battle-tested, zero external dependencies.

### CTA Buttons
- **Start Free →** (primary)
- **Read Documentation →** (secondary)
- **View Live Demo →** (tertiary)
