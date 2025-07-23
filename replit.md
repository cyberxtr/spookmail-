# Telegram Email Verification Bot (SpookMail)

## Overview
A comprehensive Telegram bot for email verification with spooky-themed admin panel, referral system, and usage limits. Built with Node.js, Express, React, PostgreSQL, and Docker Compose for easy deployment.

## Features Implemented
- **Telegram Bot**: Full bot implementation with commands (/start, /check, /stats, /invite, /help)
- **Email Verification**: Integration with mailboxlayer.com API
- **Admin Panel**: React-based dashboard with authentication
- **Spooky Theme**: Dark/light mode with Halloween-inspired design
- **Referral System**: Unique invite links with bonus checks
- **Usage Limits**: 5 checks per 72 hours with referral bonuses
- **Statistics Dashboard**: Real-time analytics and user metrics
- **Broadcast System**: Send messages to all users or targeted groups
- **User Management**: View and manage Telegram bot users
- **Database**: PostgreSQL with Drizzle ORM

## Project Architecture
- **Backend**: Node.js with Express.js, Telegraf for bot
- **Frontend**: React with TypeScript, Vite, TailwindCSS
- **Database**: PostgreSQL with comprehensive schema
- **Authentication**: Session-based with bcrypt password hashing
- **Deployment**: Docker Compose with hot reload for development

## User Preferences
- Docker Compose setup for local Windows development requested
- Professional spooky theme design implemented
- Scalable architecture with security focus
- Comprehensive documentation provided
- Local deployment on Windows OS preferred over cloud platforms

## Recent Changes
- 2025-01-21: Complete project architecture implemented
- 2025-01-21: Docker Compose configuration with PostgreSQL
- 2025-01-21: Admin panel with spooky theme completed
- 2025-01-21: Telegram bot service with all commands
- 2025-01-21: Email verification service integrated
- 2025-01-21: Database schema and storage layer
- 2025-01-21: Authentication and authorization system
- 2025-01-21: Comprehensive setup scripts and documentation

## Quick Start Guide
1. Copy .env.example to .env and configure API keys
2. Run: chmod +x scripts/setup-docker.sh
3. Run: ./scripts/setup-docker.sh
4. Access admin panel at http://localhost:3000
5. Start Telegram bot conversation