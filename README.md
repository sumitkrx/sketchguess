# SketchGuess

Real-time multiplayer drawing & guessing game (skribbl.io-style).

## Stack
- **Frontend**: Next.js 16, TypeScript, Konva.js, Tailwind
- **Backend**: Node.js + Express + ws (WebSocket)
- **State**: Redis (room state, scores, current word)
- **Database**: PostgreSQL + Prisma
- **AI**: Ollama (planned)
- **Monorepo**: Turborepo + npm workspaces

## Status
🚧 In active development

## Structure
\`\`\`
sketchguess/
├── apps/
│   ├── web/         # Next.js frontend
│   └── server/      # WebSocket + REST API
└── packages/
    ├── shared-types/        # WS protocol types
    ├── typescript-config/   # Shared tsconfig presets
    └── eslint-config/       # Shared ESLint config
\`\`\`
