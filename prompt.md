# Comprehensive Prompt for AI Text Completion POC

Build a **full-stack AI Text Completion application** with Angular 20 frontend and .NET 9 backend API.

---

## **Frontend Requirements (Angular 20)**

### **Component: `ai-text-completion`**

Create a modern, responsive AI chat interface with the following structure:

#### **UI Layout**
- **Centered card** with:
  - Title: "AI Text Completion"
  - Subtitle: "Ask any question and get AI-powered answers"
  - Small badge/note: "Powered by google/gemma-2-9b-it" (update dynamically based on selected model)

#### **Form Fields**
1. **Your Question*** (required)
   - Multi-line textarea
   - Placeholder: "What would you like to know? Ask anything…"
   - Min height: 100px, auto-expand as user types

2. **Context (Optional)**
   - Multi-line textarea
   - Placeholder: "Provide additional context to help generate a better answer…"
   - Collapsible or always visible

3. **AI Model** (dropdown)
   - Options: `gemma-2-9b-it`, `openai/gpt-oss-20b:groq`, `gpt-4`, `llama-3-70b`, `mistral-large`
   - Default: `openai/gpt-oss-20b:groq`

4. **Advanced Options** (collapsible section, toggled by button)
   - **Temperature** (slider: 0.0 - 2.0, default 0.7)
   - **Max Tokens** (number input: 100-4000, default 1024)
   - **Top P** (slider: 0.0 - 1.0, default 0.9) - optional

5. **Action Buttons**
   - **Show/Hide Advanced Options** toggle button
   - **Generate Answer** button (purple gradient: `bg-gradient-to-r from-purple-600 to-indigo-600`)

#### **Response Display Area**
- Show loading spinner while waiting for API response
- Display the AI-generated answer in a styled card below the form
- Include:
  - Response text (with markdown rendering support if possible)
  - Token usage stats (prompt tokens, completion tokens, total time)
  - Copy button to copy response to clipboard
  - Regenerate button to retry with same inputs

#### **Styling & Animations**
- Use **Tailwind CSS** for all styling
- Implement **Angular Animations** for:
  - Smooth fade-in on component load
  - Slide-down animation for advanced options
  - Pulse/loading animation for Generate button during API call
- Responsive design (mobile-first approach)
- Dark mode support (optional but recommended)

#### **TypeScript Interfaces**
```typescript
export interface ChatRequest {
  messages: ChatMessage[];
  model: string;
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatChoice[];
  usage: Usage;
  usage_breakdown: any | null;
  system_fingerprint: string;
  x_groq: XGroq;
  service_tier: string;
}

export interface ChatChoice {
  index: number;
  message: ChatMessage;
  logprobs: any | null;
  finish_reason: string;
}

export interface Usage {
  queue_time: number;
  prompt_tokens: number;
  prompt_time: number;
  completion_tokens: number;
  completion_time: number;
  total_tokens: number;
  total_time: number;
}

export interface XGroq {
  id: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
}
```

#### **Service: `chat.service.ts`**
- Create an Angular service to handle HTTP requests to the .NET backend
- Method: `generateCompletion(request: ChatRequest): Observable<ChatResponse>`
- Handle errors gracefully with user-friendly messages
- Add loading state management

---

## **Backend Requirements (.NET 9 Web API)**

### **API Endpoint**
- **POST** `/api/chat/completions`
- Accepts `ChatRequest` from frontend
- Calls HuggingFace Router API: `https://router.huggingface.co/v1/chat/completions`
- Returns `ChatResponse` to frontend

### **C# Models**
```csharp
public class ChatRequest
{
    public List<ChatMessage> Messages { get; set; } = new();
    public string Model { get; set; } = "openai/gpt-oss-20b:groq";
    public bool Stream { get; set; } = false;
    public double? Temperature { get; set; }
    public int? MaxTokens { get; set; }
}

public class ChatMessage
{
    public string Role { get; set; } = string.Empty; // "user", "assistant", "system"
    public string Content { get; set; } = string.Empty;
}

// ChatResponse, ChatChoice, Usage, XGroq classes matching the TypeScript interfaces
```

### **Controller: `ChatController.cs`**
- Validate incoming requests (required fields, valid model names)
- Transform frontend request to HuggingFace API format:
  - If user provides "Context", prepend it as a system message
  - User's question becomes a user message
- Use `HttpClient` to call HuggingFace API
- Handle API errors (rate limits, network issues, invalid responses)
- Return structured response or appropriate error codes

### **Configuration**
- Store HuggingFace API URL in `appsettings.json`
- Add CORS policy to allow Angular frontend (e.g., `http://localhost:4200`)
- Optional: Add API key authentication if HuggingFace requires it in the future

### **Error Handling**
- Return 400 for invalid requests
- Return 502 for HuggingFace API failures
- Return 500 for unexpected server errors
- Include clear error messages in response

---

## **Integration & Testing**

1. **Console Logging**: Before API integration, log the form data to console when "Generate Answer" is clicked
2. **API Connection**: Wire up Angular service to .NET backend
3. **Response Display**: Show the AI response in the UI with proper formatting
4. **Error States**: Display error messages if API fails
5. **Loading States**: Show spinner/disable button during API call

---

## **Deliverables**

1. **Angular Component** (`ai-text-completion.component.ts`, `.html`, `.css`)
2. **Angular Service** (`chat.service.ts`)
3. **TypeScript Interfaces** (models file)
4. **.NET Controller** (`ChatController.cs`)
5. **.NET Models** (C# classes)
6. **README** with setup instructions for both frontend and backend

---

## **Bonus Features (Optional)**

- Chat history (store previous Q&A pairs in session)
- Export conversation as text/JSON
- Real-time streaming support (update UI as tokens arrive)
- Model comparison mode (generate answers from multiple models side-by-side)
- Rate limiting/usage tracking UI
