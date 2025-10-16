<p align="center">
  <img src="./assets/otter_scaled.png" alt="Otter Logo" width="140"/>
</p>

<h1 align="center">Otter API 🦦</h1>
<p align="center">
  <em>Backend de <strong>Otter</strong>, una réplica minimalista de Twitter.<br>
  Construido con Node.js, MariaDB y arquitectura RESTful.</em>
</p>

---

## 🚀 Descripción

**Otter API** es el motor que gestiona usuarios, tweets, likes, retweets y follows.  
Diseñado para ser escalable, limpio y modular. Backend para la aplicación móvil de Otter en Android.

---

## 🗃️ Modelo de Datos

### Diagrama Relacional
<p align="center">
  <img src="./assets/relational.png" alt="Modelo relacional" width="700"/>
</p>

---

## 🧩 Arquitectura

```mermaid
flowchart LR
  subgraph Internet
    A[Android App]
  end

  subgraph Firebase
    FAuth[(Firebase Auth)]
    FStore[(Firebase Storage)]
  end

  subgraph DMZ["DMZ / Edge"]
    WAF[WAF/CDN]
    RP[Reverse Proxy<br/>Nginx/Caddy :443→:80]
  end

  subgraph Private["Red Privada / Backend"]
    API[Otter API Fastify Node.js]
    DB[(MariaDB 10.x<br/>:3306)]
    OBS[Observability<br/>Logs • Metrics • Traces]
    SEC[Secrets<br/>Vault / .env]
  end

  A -- "Login con proveedor → FAuth" --> FAuth
  FAuth -- "ID Token (OIDC/JWT)" --> A

  A -- "REST JSON HTTPS 443 Auth: Bearer <JWT>" --> WAF
  WAF -- "proxy HTTPS" --> RP
  RP -- "HTTP 80 → API" --> API

  API -- "Validate JWT (FAuth) / token introspection" --> FAuth
  API -- "Media upload/download SDK • signed URLs" --> FStore
  API -- "SQL queries TCP 3306" --> DB

  API -- "Logs/metrics/traces" --> OBS
  API -- "Secrets at runtime" --> SEC
```
---

## 🧠 Stack Técnico

- **Node.js** + **Express/Fastify**
- **MariaDB**
- **Firebase Authentication** + **Cloud Storage**

---

## 🎬 Demo

[![Ver demo en YouTube](https://img.youtube.com/vi/4XEFY-8eKEA/hqdefault.jpg)](https://www.youtube.com/watch?v=4XEFY-8eKEA)