# 🎵 VibeCheck

[![Music Battle Game](https://img.shields.io/badge/Game-Music_Battle-purple)](https://github.com/razvangolan/VibeCheck)
[![SignalR](https://img.shields.io/badge/Realtime-SignalR-blue)](https://dotnet.microsoft.com/apps/aspnet/signalr)
[![Deezer API](https://img.shields.io/badge/Music-Deezer_API-red)](https://developers.deezer.com/)

## 🎮 Battle with Music, Win with Taste!

VibeCheck is a fun, interactive song voting game where players compete to find the best song for a given theme or situation. Each round, a theme is presented, and players select a song that they believe best fits it. At the end of the round, everyone votes on which song is the most fitting, and points are awarded based on votes. The player with the highest score at the end wins!

## ✨ How To Play

### 1. 👥 Rally Your Crew
Create a game room and invite your friends to join using a unique code, invite link, or QR code.

### 2. 🎧 Pick Your Songs
For each round, choose the perfect track that matches the round's theme from Deezer's vast music library.

### 3. 🗳️ Vote for the Best
Listen to everyone's song choices and vote for the track that best fits the theme. Points are awarded based on votes!

## 🚀 Features

- **🔗 Easy Invitation System**: Generate invite links or QR codes to bring friends into your game room
- **🎵 Deezer Integration**: Search and select from millions of songs using the Deezer API
- **⏱️ Real-time Updates**: Experience seamless gameplay with SignalR WebSockets
- **🔒 Secure Game Lobbies**: Private rooms with code-based access control
- **🔐 User Authentication**: Session-based JWT authentication
- **📊 Live Leaderboards**: Track points and see who's winning in real-time
- **🎨 Custom Themes**: Create your own themes or use provided theme categories

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, CSS3
- **Backend**: ASP.NET Core, Entity Framework Core
- **Database**: PostgreSQL
- **Real-time Communication**: SignalR
- **Music API**: Deezer
- **Authentication**: JWT token-based auth

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- .NET 8 SDK
- PostgreSQL
- Docker

### Running the App Locally

1. Clone the repository
2. Start the backend via docker compose:
   ```bash
   docker compose up --build
   ```
3. Start the frontend:
   ```bash
   cd vibecheck-frontend
   npm install
   npm start
   ```
4. Open your browser to `http://localhost:3000`

## 🔗 Links

- [Deployed Project Link](https://vibe-check-tawny.vercel.app/)
- [Design Prototype](https://www.figma.com/proto/heYJwVHTkM7zAVfW6Tx1mk/ViveCheck?node-id=0-1&p=f&t=iVGE3SUR9dQdy1J5-0&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=3%3A152)
