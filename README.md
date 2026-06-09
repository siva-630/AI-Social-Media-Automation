# 🌟 AI Social Media Scheduler & Automation Tool

> A powerful, AI-driven social media management platform that helps you create, schedule, and publish content seamlessly across multiple social networks.
## Live Demo
[AI Social Media Automation](https://ai-social-media-automation-git-main-siva-630s-projects.vercel.app/)
## 📸 Screenshots

| Dashboard | AI Content Composer |
| :---: | :---: |
| ![Dashboard](./readmeimages/Screenshot%202026-06-06%20072506.png) | ![AI Composer](./readmeimages/Screenshot%202026-06-06%20072518.png) |

| Account Management | Scheduled Posts & Overview |
| :---: | :---: |
| ![Accounts](./readmeimages/Screenshot%202026-06-06%20072529.png) | ![Overview](./readmeimages/Screenshot%202026-06-06%20072544.png) |

## 🚀 High-Level Overview

This application is a complete full-stack, AI-powered social media automation platform designed for individuals, creators, and businesses to streamline their online presence. By leveraging advanced generative AI models (Google Gemini & Hugging Face) and robust OAuth integrations (Zernio API), the platform allows users to automatically compose high-quality posts, generate engaging media, and seamlessly distribute them across connected social media accounts.

Built with modern software architecture, performance, and security in mind, it provides a highly interactive and visually stunning user experience powered by the latest version of React, Tailwind CSS, and a robust scalable MERN stack backend.

## 🛠️ Technologies & Tools

### Frontend (Client)
- **React 19 & React Router DOM**: Core frontend framework for building a responsive, component-based user interface with dynamic routing.
- **Vite**: Ultra-fast build tool and development server, ensuring rapid HMR (Hot Module Replacement) and optimized production builds.
- **Tailwind CSS v4**: Utility-first CSS framework for rapid, highly customizable styling and modern UI design (utilizing glassmorphism, responsive grids, and vibrant aesthetics).
- **Lucide React & React Simple Icons**: Sleek, modern icons utilized for rich visual feedback and intuitive navigation.
- **React Toastify**: Elegant and responsive toast notifications for real-time user feedback during critical operations (e.g., successful AI generation, account connection updates).
- **TypeScript**: Adds strong static typing to JavaScript, greatly reducing runtime errors and improving developer experience and code maintainability.

### Backend (Server)
- **Node.js & Express 5**: Fast, minimalist web framework for building the RESTful API and handling asynchronous database/API requests efficiently.
- **MongoDB & Mongoose**: NoSQL database for flexible data storage, managing user accounts, scheduled posts metadata, and connected social platform tokens.
- **Zernio Node SDK (`@zernio/node`)**: Enterprise-grade OAuth authentication and unified API wrapper for securely connecting and communicating with multiple social media platforms without the hassle of individual platform SDKs.
- **Google Generative AI (`@google/generative-ai`)**: Powers the core "AI Composer," generating highly engaging context-aware captions, hashtags, and social media text content.
- **Hugging Face Inference (`@huggingface/inference`)**: Integrated for specialized AI tasks, acting as the engine for AI image generation and text-to-image workflows.
- **Cloudinary**: Cloud-based media management solution for securely storing, optimizing, and delivering generated or user-uploaded media assets.
- **Authentication (JWT & Bcrypt)**: Robust security implementation utilizing JSON Web Tokens for stateless secure sessions and Bcrypt for strong password hashing.
- **TypeScript**: Ensures end-to-end type safety, making API response shapes predictable across the full stack.

## ✨ Key Features
1. **Intelligent AI Composer**: Instantly generate context-aware posts, captions, and creative media using integrated Google Gemini and Hugging Face models.
2. **Unified Social Integration**: Connect multiple social media accounts securely via Zernio OAuth, managing Facebook, Twitter, Instagram, LinkedIn, and more from a single dashboard.
3. **Automated Scheduling**: Plan your content calendar, schedule posts for optimal times, and let the reliable backend chron-jobs handle automated publishing.
4. **Secure Architecture**: JWT-based authentication combined with secure environment variable management ensures all user data, credentials, and OAuth access tokens remain strictly protected.
5. **Premium UI/UX Design**: Designed with a vibrant, professional aesthetic focusing on smooth micro-animations, comprehensive form validation, error states, and a fully responsive grid system.


## 📦 Production Deployment
The application is structured and configured for modern continuous deployment workflows:
- **Frontend (Client)**: Optimized for seamless deployment on **Vercel** with fully typed build scripts.
- **Backend (Server)**: Configured for deployment on **Render**, utilizing robust error handling, reliable database connections, and secure API gateways.

---
*Built to showcase professional-grade MERN stack development seamlessly integrated with modern Generative AI tooling.*
