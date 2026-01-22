# image-generator

A simple and powerful image generator powered by **Google Gemini** and **Bun**. This project provides both a Command Line Interface (CLI) and a modern Web UI to generate high-quality images from text prompts.

## Features

- **Fast Generation**: Powered by the Gemini 2.0 generative engine.
- **Dual Interface**: Use it via terminal or through a sleek, minimalist Web UI.
- **Responsive Design**: Web UI supports both Light and Dark modes automatically.
- **Modern Tech Stack**: Built with Bun for high performance.

## Model

This project uses the **`nano-banana-pro-preview`** model (part of the Gemini 2.0 Pro series), specifically optimized for high-fidelity image generation.

## Prerequisites

- [Bun](https://bun.sh/) installed on your machine.
- A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/).

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Configure Environment

Create a `.env` file and add your API key:

```env
GOOGLE_API_KEY=your_api_key_here
```

### 3. Run the application

#### Web UI (Recommended)

Launch the web interface at `http://localhost:3000`:

```bash
bun dev
```

#### CLI

Generate an image directly from the terminal:

```bash
bun generate "A futuristic city in the style of cyberpunk"
```

---

This project was created using `bun init` in bun v1.3.1. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
