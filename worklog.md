---
Task ID: 1
Agent: Main Agent
Task: Build SpecMatch MVP - AI Blueprint Specification Extractor

Work Log:
- Initialized fullstack project environment
- Installed @anthropic-ai/sdk package
- Created .env.local with ANTHROPIC_API_KEY placeholder
- Created API route at src/app/api/process-pdf/route.ts with Anthropic Claude 3.5 Sonnet integration using document block type for PDF processing
- Updated src/app/layout.tsx with SpecMatch branding
- Created src/app/page.tsx with full drag-and-drop upload, processing state, and results table
- Ran ESLint - all checks passed
- Verified dev server is running and API route responds correctly

Stage Summary:
- SpecMatch MVP is fully functional with clean SaaS design (white background, #2563eb blue accent)
- Frontend: drag-and-drop PDF upload zone, file preview with remove button, animated spinner during processing, styled results table with sticky header and striped rows
- Backend: POST /api/process-pdf route that accepts base64 PDF, sends it to Anthropic API using document block type with exact system prompt, parses returned Markdown table into structured data
- Error handling for: missing file, invalid file type, unconfigured API key, API rate limits, overloaded service, and unparseable responses
- All code passes lint checks and dev server is running successfully
