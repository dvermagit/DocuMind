# Documind

Documind is a SaaS application that combines document management with conversational AI, powered by generative AI models like GPT-3.5. It enables organizations to create searchable knowledge bases from their documentation and allows users to interact with documents using natural language queries.

## Table of Contents

- [Features](#features)
- [How Documind Works](#how-documind-works)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Usage Example](#usage-example)
- [Deployment](#deployment)
- [Acknowledgments](#acknowledgments)
- [License](#license)
- [Contributing](#contributing)

---

## Features

- Document crawling and ingestion
- Vector embedding creation and storage (Pinecone)
- Conversational search powered by generative AI (GPT-3.5 and others)
- Real-time chat interface
- PDF viewing and file upload
- Subscription management (Stripe integration)
- Secure authentication (sign-in/sign-up)
- Modular and scalable Next.js architecture

---

## How Documind Works

1. **Crawling Documentation Website**
   - Documind crawls the provided documentation URLs to collect content.
2. **Creating Knowledge Base**
   - Extracted content is converted into vector embeddings.
   - Embeddings are stored in Pinecone for fast similarity search.
3. **Search Process**
   - User queries are embedded and compared against the knowledge base.
   - Relevant context is retrieved and passed to generative AI models (e.g., GPT-3.5).
   - The AI generates conversational answers based on the documentation.

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm, yarn, or pnpm
- Pinecone account (for vector database)
- OpenAI API key (for generative AI)
- Stripe account (for subscriptions, if needed)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/documind.git
   cd documind
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Create a `.env.local` file and add your API keys:
   ```
   PINECONE_API_KEY=your-pinecone-api-key
   PINECONE_INDEX_NAME=your-pinecone-index
   PINECONE_ENVIRONMENT=your-pinecone-environment
   OPENAI_API_KEY=your-openai-api-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   ```
4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Configuration

To create a knowledge base, provide:

- **Documentation Website URL**  
  Example: `https://nextjs.org/docs`
- **Documentation Website URL Match**  
  Example: `https://nextjs.org/docs/**`  
  Use `**` as a wildcard for URL patterns.
- **CSS Selector for Main Text Content**  
  Example: `.main-content`  
  Helps extract relevant content from documentation pages.
- **Pinecone Details**
  - API Key
  - Index Name
  - Environment
- **OpenAI API Key**  
  Used for generating conversational responses.

---

## Project Structure

```
components.json
public/
	file.svg
	globe.svg
	next.svg
	vercel.svg
	window.svg
src/
	middleware.ts
	app/
		favicon.ico
		globals.css
		layout.tsx
		page.tsx
		api/
			chat/
				route.ts
			create-chat/
				route.ts
			get-messages/
				route.ts
			stripe/
				route.ts
			webhook/
				route.ts
		chat/
			[chatId]/
				page.tsx
		sign-in/
			[[...sign-in]]/
				page.tsx
		sign-up/
			[[...sign-up]]/
				page.tsx
		success/
			page.tsx
	components/
		ChatComponent.tsx
		ChatSidebar.tsx
		FileUpload.tsx
		MessagesList.tsx
		PDFViewer.tsx
		Providers.tsx
		SubscriptionButton.tsx
		ui/
			button.tsx
			input.tsx
	lib/
		context.ts
		embeddings.ts
		pinecone.ts
		s3-server.ts
		s3.ts
		stripe.ts
		subscription.ts
		utils.ts
		db/
			index.ts
			schema.ts
```

---

## Usage Example

```javascript
import { Documind } from "documind";

const documind = new Documind({
  documind_key: "your-documind-key",
});

const { answer, message, error } = await documind.search(searchQuery);
```

---

## Deployment

Documind is designed for deployment on [Vercel](https://vercel.com) or similar platforms.

1. Push your code to a GitHub repository.
2. Connect your repository to Vercel.
3. Set environment variables in Vercel dashboard.
4. Deploy and access your app online.

---

## Acknowledgments

Documind draws inspiration from [BuilderIO/gpt-crawler](https://github.com/BuilderIO/gpt-crawler), which focuses on crawling documentation websites to generate knowledge files for OpenAI assistants. Documind extends this by integrating conversational search directly into documentation sites using generative AI.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for improvements or new features.
