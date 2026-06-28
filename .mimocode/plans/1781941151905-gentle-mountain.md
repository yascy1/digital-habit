# Plan: Fix layout profil — banner di atas, avatar di bawah

## Problem
1. Posisi terbalik — avatar di atas banner, harusnya banner di atas
2. Banner kurang gede

## Fix
Layout baru (standard social media profile):
```
┌─────────────────────────────┐
│ ██████ Banner ██████████████│  ← banner besar di atas
│ ████████████████████████████│
│ [Avatar] Nama + Joined      │  ← avatar overlap sedikit di bawah banner
│                     [Edit]  │
└─────────────────────────────┘
```

- Banner height: `h-20` → `h-36` (lebih gede)
- Avatar posisi: `-mt-12` overlap ke banner (standard profile layout)
- Hapus `overflow-hidden` dari Card supaya avatar bisa overlap

## File
`app/profil/page.tsx` — fix header layout
