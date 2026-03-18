# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Supabase Setup

The Server Room Simulation dashboard reads live data from Supabase table `lab1_sensor_logs`.

1. Create a local environment file in the frontend root (`.env`)
2. Add the required keys:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

On load, the dashboard fetches:

- The latest sensor row (`ORDER BY created_at DESC LIMIT 1`)
- The 10 most recent logs (`ORDER BY created_at DESC LIMIT 10`)

It also subscribes to Supabase Realtime `INSERT` events on `lab1_sensor_logs` and updates cards, status banner, threshold meter, and Recent Logs without refresh.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
