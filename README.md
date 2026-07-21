# AXION Command Center

Portfólio de **Vanderson Carlos Andrade Lindoso** — identidade AXION com Next.js, React Three Fiber e sync GitHub/Vercel.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS 4
- Motion + Lenis
- Three.js / React Three Fiber / Drei / postprocessing
- Upstash Redis (curtidas/views)
- Proxy GitHub (`/api/github`)

## Desenvolvimento

```bash
npm install
npm run dev
```

## Variáveis de ambiente

Veja [`.env.example`](.env.example):

- `KV_REST_API_URL` / `KV_REST_API_TOKEN` — Redis
- `GITHUB_TOKEN` — opcional, evita rate limit

## Conteúdo

JSON em [`content/`](content/) — projects, skills, profile, experience.

Projetos com deploy na Vercel entram automaticamente (exceto o próprio `portifolio`).
