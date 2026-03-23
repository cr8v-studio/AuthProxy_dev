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

---

## 9. SECURITY

### Headline
**Enterprise Security Without Enterprise Complexity**

---

## 10. PWA OPTIMIZATION

### Headline
**3 KB First Load. Works on 3G.**

---

## 11. MCP INTEGRATION (AI-NATIVE)

### Headline
**Your Application is AI-Ready From Day One**

---

## 12. FEDERATION

### Headline
**Multi-Node Deployment & Partner Networks**

---

## 13. TECHNICAL SPECIFICATIONS

### Headline
**Production Stack and Operational Model**

---

## 14. INTEGRATION

### Headline
**Works With Any Backend**

---

## 15. FORM CUSTOMIZATION

### Headline
**Three Levels of Login Form Customization**

---

## 16. PRICING / AVAILABILITY

### Headline
**Included in Every ItBuild Tier**

---

## 17. QUICK START

### Headline
**Running in 15 Minutes**

---

## 18. FAQ

### Headline
**Common Implementation Questions**

---

## 19. SOCIAL PROOF

### Headline
**Production Deployments and Quality Metrics**

---

## 20. CLOSING CTA

### Headline
**Stop Building Auth Infrastructure. Start Building Your Product.**
