# Syncdoc-tool
AI document summrization tool

# SyncDoc – AI-Powered Collaborative Workspace

## 🚀 Project Overview

SyncDoc is a real-time collaborative document editor that allows multiple users to edit, chat, and share files simultaneously. This project demonstrates complex state management, WebSockets, data concurrency, and Role-Based Access Control (RBAC).

## ✨ Features

- **Real-time Editing:** Multiple users can edit documents simultaneously
- **Collaborative Chat:** WebSocket-powered team chat panel
- **AI Integration:** Google Gemini SDK for document summarization
- **RBAC:** Middleware-enforced roles (Admin, Editor, Viewer)
- **State Management:** Zustand for global UI state
- **Optimistic Updates:** Last-write-wins concurrency strategy

- Component

Technology

Frontend

Next.js 14 + TypeScript + Tailwind CSS

Backend

Node.js + Express + Socket.io

Database

MongoDB (Atlas or Local)

AI

Google Gemini SDK

Editor

Tiptap (Headless Editor)

State

Zustand

syncdoc/
├── client/                    # Frontend (Next.js)
│   ├── app/
│   │   ├── page.tsx          # Main workspace
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── .env.local            # Environment variables
│   ├── package.json          # Dependencies
│   ├── tailwind.config.js    # Tailwind config
│   └── tsconfig.json         # TypeScript config
├── server/                    # Backend (Express)
│   ├── index.js              # Main server file
│   ├── .env                  # Environment variables
│   └── package.json          # Dependencies
└── README.md                  
Deployment

Vercel (Frontend) + Render/Railway (Backend)
