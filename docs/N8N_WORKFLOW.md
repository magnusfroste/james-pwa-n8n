# N8N Workflow Documentation - James PWA

## Overview

This document describes the n8n workflow that powers the James PWA AI agent. Think of it as a modern, AI-powered version of Agent Cooper's dictaphone from Twin Peaks - recording conversations, learning from them, and using that knowledge to provide intelligent, context-aware responses.

The workflow handles both text and audio messages, provides intelligent responses using GPT-4o-mini, and maintains a knowledge base for conversation history.

## Workflow ID

`hs0ngDfgsgsYv06r`

## Webhook Configuration

- **Webhook Path**: `2dbd1bc0-8679-4315-9e7b-0a5b0137112e`
- **Webhook URL**: `https://agent.froste.eu/webhook/2dbd1bc0-8679-4315-9e7b-0a5b0137112e`
- **Method**: POST

## Request Format

### Text Message
```json
{
  "message": "Hello, how are you?",
  "session_id": "user_session_123",
  "message_type": "text"
}
```

### Audio Message
```json
{
  "audio": "base64_encoded_audio_data",
  "session_id": "user_session_123",
  "message_type": "audio"
}
```

## Workflow Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Webhook (Entry Point)                                   │
│  - Receives POST requests                                   │
│  - Extracts message_type (text/audio)                        │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│  2. If Condition (Check message_type)                       │
│  - Is message_type == "audio"?                              │
└──────┬──────────────────────────────┬───────────────────────┘
       │ YES                         │ NO
       ▼                             ▼
┌──────────────────────┐    ┌──────────────────────────────┐
│  3a. OpenAI (Whisper)│    │  3b. AI Agent (Direct)      │
│  - Transcribe audio  │    │  - Process text message      │
│  - Convert to text   │    └──────────────┬───────────────┘
└──────────┬───────────┘                   │
           │                               │
           ▼                               │
┌──────────────────────┐                  │
│  4. audio_text (Set) │                  │
│  - Extract text      │◄─────────────────┘
│  - Prepare message   │
└──────────┬───────────┘
           │
           └──────────┬────────────────────────────────────┐
                      ▼                                    │
           ┌──────────────────────────────────────┐       │
           │  5. AI Agent (Main Processing)        │◄──────┘
           │  - System: James persona               │
           │  - Model: GPT-4o-mini                  │
           │  - Memory: Session-based              │
           │  - Tools: knowledge_base, search_online│
           └──────────┬─────────────────────────────┘
                      │
                      ▼
           ┌──────────────────────────────────────┐
           │  6. Knowledge Base (Qdrant)          │
           │  - Retrieve conversation history      │
           │  - Collection: james_pwa             │
           │  - Reranker: Cohere (optional)      │
           └──────────┬─────────────────────────────┘
                      │
                      ▼
           ┌──────────────────────────────────────┐
           │  7. Search Online (Jina API)          │
           │  - Tool for web search                │
           │  - URL: https://s.jina.ai/{query}    │
           └──────────┬─────────────────────────────┘
                      │
                      ▼
           ┌──────────────────────────────────────┐
           │  8. q&a (Set Node)                   │
           │  - Prepare response                  │
           │  - Format output                     │
           └──────────┬─────────────────────────────┘
                      │
                      ▼
           ┌──────────────────────────────────────┐
           │  9. Respond to Webhook              │
           │  - Send response back to client      │
           │  - Format: text/plain               │
           └──────────────────────────────────────┘
```

## Nodes Configuration

### 1. Webhook
- **Type**: `n8n-nodes-base.webhook`
- **HTTP Method**: POST
- **Path**: `2dbd1bc0-8679-4315-9e7b-0a5b0137112e`
- **Response Mode**: responseNode

### 2. If Condition
- **Type**: `n8n-nodes-base.if`
- **Condition**: `message_type` contains "audio"
- **Combinator**: and

### 3a. OpenAI (Whisper)
- **Type**: `@n8n/n8n-nodes-langchain.openAi`
- **Operation**: transcribe
- **Resource**: audio
- **Binary Property**: audio
- **Credentials**: OpenAI API

### 4. audio_text (Set)
- **Type**: `n8n-nodes-base.set`
- **Assignment**: `body.message = transcribed_text`

### 5. AI Agent
- **Type**: `@n8n/n8n-nodes-langchain.agent`
- **Prompt Type**: define
- **System Message**:
```
You are a helpful assistant having access to company knowledge base.
Tell visitor that your name is James and you love to learn new stuff! While learning new stuff, your knowledge is saved to Wassching knowledge base.

# instruction
- ask questions and listen carefully
- dont drop the conversation
- use 'knowledge_base' to retreive your long terma knowledge
- use 'search_online' to get new knowledge or search in general.
- Before calling 'search_online' tell visitor that you will call the tool, because it takes some time.

# knowledge
- conversation vith visitor is stored in 'knowledge_base'
- use tool 'knowledge_base' to get visitor information
- always try to find info and inspire from older conversations
```

### 6. OpenAI Chat Model
- **Type**: `@n8n/n8n-nodes-langchain.lmChatOpenAi`
- **Model**: gpt-4o-mini
- **Credentials**: OpenAI API

### 7. Simple Memory
- **Type**: `@n8n/n8n-nodes-langchain.memoryBufferWindow`
- **Session ID Type**: customKey
- **Session Key**: `session_id` from request

### 8. knowledge_base (Tool)
- **Type**: `@n8n/n8n-nodes-langchain.vectorStoreQdrant`
- **Mode**: retrieve-as-tool
- **Tool Name**: knowledge_base
- **Tool Description**: "work with knowledge base and get info about visitor"
- **Qdrant Collection**: james_pwa
- **Use Reranker**: true
- **Credentials**: Qdrant Cloud

### 9. Reranker Cohere
- **Type**: `@n8n/n8n-nodes-langchain.rerankerCohere`
- **Credentials**: Cohere API

### 10. search_online (Tool)
- **Type**: `@n8n/n8n-nodes-langchain.toolHttpRequest`
- **Tool Description**: "Use to search online"
- **URL**: `https://s.jina.ai/{query}`
- **Authentication**: httpHeaderAuth (Jina)

### 11. Embeddings OpenAI
- **Type**: `@n8n/n8n-nodes-langchain.embeddingsOpenAi`
- **Credentials**: OpenAI API

### 12. Qdrant Vector Store
- **Type**: `@n8n/n8n-nodes-langchain.vectorStoreQdrant`
- **Mode**: insert
- **Qdrant Collection**: james_pwa
- **Credentials**: Qdrant Cloud

### 13. Default Data Loader
- **Type**: `@n8n/n8n-nodes-langchain.documentDefaultDataLoader`

### 14. Recursive Character Text Splitter
- **Type**: `@n8n/n8n-nodes-langchain.textSplitterRecursiveCharacterTextSplitter`

### 15. q&a (Set)
- **Type**: `n8n-nodes-base.set`
- **Assignments**:
  - `body.message`: `audio_text.message || If.message`
  - `output`: `AI Agent output`

### 16. Respond to Webhook
- **Type**: `n8n-nodes-base.respondToWebhook`
- **Response With**: text
- **Response Body**: `{{ $json.output }}`

## Tools Available to AI Agent

### knowledge_base
- **Purpose**: Retrieve conversation history and visitor information
- **Implementation**: Qdrant vector store with Cohere reranker
- **Collection**: james_pwa
- **Usage**: Called automatically when agent needs context

### search_online
- **Purpose**: Search the web for current information
- **Implementation**: Jina AI search API
- **URL**: `https://s.jina.ai/{query}`
- **Usage**: Called when agent needs information not in knowledge base

## Credentials Required

1. **OpenAI API** (SKYM5wHsET770ybx)
   - Used for: GPT-4o-mini model, Whisper transcription, Embeddings

2. **Qdrant Cloud** (X1sFRQtWD393qZhf)
   - Used for: Vector storage (james_pwa collection)

3. **Cohere API** (i8I5ywJu3ara3oP7)
   - Used for: Reranking search results

4. **Jina** (2fdfUqloiUIIBSjN)
   - Used for: Online search tool

## Memory Management

- **Type**: Buffer Window Memory
- **Session Key**: `session_id` from request
- **Purpose**: Maintains conversation history per session
- **Behavior**: Automatically stores/retrieves conversation context

## Knowledge Base

- **Vector Store**: Qdrant Cloud
- **Collection**: james_pwa
- **Embeddings**: OpenAI
- **Reranker**: Cohere (optional, improves retrieval quality)
- **Purpose**: Stores conversation history for long-term memory

## Response Format

### Success Response
```json
{
  "output": "AI response text here"
}
```

### Error Handling
- Errors are handled gracefully with `continueRegularOutput`
- Audio transcription failures don't block workflow
- Webhook always responds to prevent timeouts

## Performance Considerations

1. **Audio Transcription**: Whisper API can take 2-5 seconds
2. **Online Search**: Jina API typically responds in 1-2 seconds
3. **Knowledge Base**: Qdrant retrieval is fast (< 500ms)
4. **AI Generation**: GPT-4o-mini typically 1-3 seconds

## Monitoring & Debugging

### Key Metrics to Monitor
- Webhook response times
- Audio transcription success rate
- Knowledge base retrieval accuracy
- Tool usage frequency

### Common Issues

1. **Audio Transcription Fails**
   - Check OpenAI API credits
   - Verify audio format (WAV, MP3, M4A)

2. **Knowledge Base Empty**
   - Check Qdrant collection exists
   - Verify embeddings are being stored

3. **Online Search Fails**
   - Verify Jina API credentials
   - Check URL format

## Testing

### Test Text Message
```bash
curl -X POST https://agent.froste.eu/webhook/2dbd1bc0-8679-4315-9e7b-0a5b0137112e \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, my name is Alice",
    "session_id": "test_123",
    "message_type": "text"
  }'
```

### Test Audio Message
```bash
curl -X POST https://agent.froste.eu/webhook/2dbd1bc0-8679-4315-9e7b-0a5b0137112e \
  -H "Content-Type: application/json" \
  -d '{
    "audio": "base64_encoded_audio",
    "session_id": "test_123",
    "message_type": "audio"
  }'
```

## Deployment

### Environment Variables Required
- `OPENAI_API_KEY`: For GPT-4o-mini and Whisper
- `QDRANT_API_KEY`: For Qdrant Cloud
- `QDRANT_URL`: Qdrant instance URL
- `COHERE_API_KEY`: For reranking
- `JINA_API_KEY`: For online search

### Easypanel Deployment
1. Import workflow JSON into n8n
2. Configure credentials
3. Activate workflow
4. Test webhook endpoint

## Maintenance

### Regular Tasks
- Monitor API usage and costs
- Check knowledge base size
- Review error logs
- Update system message as needed

### Scaling Considerations
- Consider rate limiting for high traffic
- Implement caching for common queries
- Monitor Qdrant collection size
- Consider adding more rerankers for better retrieval

## Related Documentation

- [james-pwa-n8n PRD](PRD.md) - Product requirements
- [README.md](README.md) - Project overview
- [N8N Documentation](https://docs.n8n.io) - Official n8n docs

## Self-Hosting Guide

This guide shows you how to self-host your own James PWA (Private AI) with complete control over your data and infrastructure. You can run n8n in Easypanel or in the cloud, just like Supabase.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Private James PWA                    │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Frontend (React PWA)                                   │ │
│  │  - James PWA app (self-hosted)                          │ │
│  │  - Runs on Vercel, Netlify, or your own server          │ │
│  └───────────────────┬───────────────────────────────────┘ │
│                      │                                       │
│                      ▼                                       │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  n8n Workflow (AI Agent)                               │ │
│  │  - Option 1: Self-hosted in Easypanel                 │ │
│  │  - Option 2: Cloud-hosted on n8n.cloud                 │ │
│  └───────────────────┬───────────────────────────────────┘ │
│                      │                                       │
│                      ▼                                       │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  External Services (API Keys)                          │ │
│  │  - OpenAI (GPT-4o-mini, Whisper)                        │ │
│  │  - Qdrant (Vector Database)                             │ │
│  │  - Cohere (Reranker)                                    │ │
│  │  - Jina (Online Search)                                 │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Prerequisites

Before you begin, you'll need:

1. **Accounts**:
   - [OpenAI API](https://platform.openai.com/api-keys) - For GPT-4o-mini and Whisper
   - [Qdrant Cloud](https://cloud.qdrant.io/) - For vector database (or self-host Qdrant)
   - [Cohere API](https://cohere.com/) - For reranking (optional)
   - [Jina AI](https://jina.ai/) - For online search

2. **Hosting Options**:
   - **Easypanel**: Self-host n8n on your own server
   - **n8n.cloud**: Cloud-hosted n8n (easiest option)
   - **Docker**: Run n8n in Docker container

3. **Frontend Hosting**:
   - Vercel (recommended for PWA)
   - Netlify
   - Your own server

### Step 1: Get Your API Keys

#### OpenAI API
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Save it securely (you'll need it for n8n)

#### Qdrant Cloud
1. Go to [Qdrant Cloud](https://cloud.qdrant.io/)
2. Create a free account
3. Create a new cluster
4. Get your API key and cluster URL

#### Cohere API (Optional)
1. Go to [Cohere](https://cohere.com/)
2. Sign up and get your API key

#### Jina AI (Optional)
1. Go to [Jina AI](https://jina.ai/)
2. Get your API key

### Step 2: Deploy n8n

#### Option A: Self-Host n8n in Easypanel (Recommended)

1. **Create Easypanel Account**
   - Go to [easypanel.io](https://easypanel.io)
   - Create a new account

2. **Deploy n8n**
   - In Easypanel, create a new app
   - Select "n8n" from the template
   - Configure:
     - Name: `james-pwa-n8n`
     - Port: `5678`
     - Environment variables (see below)

3. **Configure Environment Variables**
   ```bash
   # n8n Configuration
   N8N_ENCRYPTION_KEY=your_encryption_key_here
   N8N_HOST=0.0.0.0
   N8N_PORT=5678
   WEBHOOK_URL=https://your-domain.com
   ```

4. **Access n8n**
   - Open `https://your-domain.com` in your browser
   - Login with your Easypanel credentials

#### Option B: Cloud-Hosted n8n (Easiest)

1. Go to [n8n.cloud](https://n8n.cloud)
2. Create a free account
3. Your n8n instance is ready immediately
4. No server management required

### Step 3: Import the James PWA Workflow

1. **Get the Workflow JSON**
   - Copy the workflow JSON from this repository
   - Or export from existing n8n instance

2. **Import to n8n**
   - In n8n, go to "Workflows"
   - Click "Import from File"
   - Paste the JSON
   - Click "Import"

3. **Activate the Workflow**
   - Click on the imported workflow
   - Click "Activate"
   - Copy the webhook URL

### Step 4: Configure Credentials in n8n

1. **OpenAI Credentials**
   - In n8n, go to "Credentials"
   - Click "New Credential"
   - Select "OpenAI API"
   - Enter your OpenAI API key
   - Name it: "OpenAI account"

2. **Qdrant Credentials**
   - In n8n, go to "Credentials"
   - Click "New Credential"
   - Select "Qdrant API"
   - Enter your Qdrant API key and URL
   - Name it: "Qdrant Cloud"

3. **Cohere Credentials** (Optional)
   - In n8n, go to "Credentials"
   - Click "New Credential"
   - Select "Cohere API"
   - Enter your Cohere API key
   - Name it: "CohereApi account"

4. **Jina Credentials** (Optional)
   - In n8n, go to "Credentials"
   - Click "New Credential"
   - Select "HTTP Header Auth"
   - Enter your Jina API key
   - Name it: "Jina"

### Step 5: Configure Qdrant Collection

1. **Create Collection**
   - Go to your Qdrant Cloud dashboard
   - Create a new collection named `james_pwa`
   - Configure vectors:
     - Size: 1536 (OpenAI embeddings)
     - Distance: Cosine

2. **Verify Collection**
   - Make sure the collection is created
   - Note the collection name for the workflow

### Step 6: Update Workflow Credentials

1. **Open the Workflow**
   - In n8n, click on the "James PWA" workflow

2. **Update Node Credentials**
   - **OpenAI Chat Model**: Select "OpenAI account"
   - **OpenAI (Whisper)**: Select "OpenAI account"
   - **Embeddings OpenAI**: Select "OpenAI account"
   - **knowledge_base**: Select "Qdrant Cloud"
   - **Reranker Cohere**: Select "CohereApi account"
   - **search_online**: Select "Jina"

3. **Update Qdrant Collection**
   - In the "knowledge_base" node, verify collection is `james_pwa`
   - In the "Qdrant Vector Store" node, verify collection is `james_pwa`

### Step 7: Test the Webhook

1. **Get Your Webhook URL**
   - In n8n, click on the "Webhook" node
   - Copy the production webhook URL
   - Format: `https://your-n8n-domain.com/webhook/2dbd1bc0-8679-4315-9e7b-0a5b0137112e`

2. **Test with Text Message**
   ```bash
   curl -X POST https://your-n8n-domain.com/webhook/2dbd1bc0-8679-4315-9e7b-0a5b0137112e \
     -H "Content-Type: application/json" \
     -d '{
       "message": "Hello, my name is Alice",
       "session_id": "test_123",
       "message_type": "text"
     }'
   ```

3. **Test with Audio Message**
   ```bash
   curl -X POST https://your-n8n-domain.com/webhook/2dbd1bc0-8679-4315-9e7b-0a5b0137112e \
     -H "Content-Type: application/json" \
     -d '{
       "audio": "base64_encoded_audio",
       "session_id": "test_123",
       "message_type": "audio"
     }'
   ```

### Step 8: Deploy the Frontend

#### Option A: Deploy to Vercel (Recommended)

1. **Clone the Repository**
   ```bash
   git clone https://github.com/magnusfroste/james-pwa-n8n.git
   cd james-pwa-n8n
   ```

2. **Configure Environment Variables**
   - Create `.env.local` file:
   ```env
   VITE_WEBHOOK_URL=https://your-n8n-domain.com/webhook/2dbd1bc0-8679-4315-9e7b-0a5b0137112e
   ```

3. **Deploy to Vercel**
   ```bash
   npm install
   npm run build
   vercel --prod
   ```

#### Option B: Deploy to Netlify

1. **Build the Project**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy to Netlify**
   ```bash
   netlify deploy --prod --dir=dist
   ```

### Step 9: Configure the Frontend

1. **Update Webhook URL**
   - In your frontend code, update the webhook URL
   - Use your production n8n webhook URL

2. **Test the Integration**
   - Open your deployed frontend
   - Send a test message
   - Verify you receive a response

### Step 10: Monitor and Maintain

#### Monitoring

1. **Check n8n Execution Logs**
   - In n8n, go to "Executions"
   - Review workflow executions
   - Check for errors

2. **Monitor API Usage**
   - Check OpenAI API usage
   - Monitor Qdrant storage
   - Review costs

#### Maintenance

1. **Regular Tasks**
   - Monitor API costs and usage
   - Check knowledge base size
   - Review error logs
   - Update credentials if needed

2. **Scaling Considerations**
   - Consider rate limiting for high traffic
   - Implement caching for common queries
   - Monitor Qdrant collection size
   - Consider adding more rerankers for better retrieval

### Security Best Practices

1. **API Key Security**
   - Never commit API keys to git
   - Use environment variables
   - Rotate keys regularly
   - Use credential management in n8n

2. **Webhook Security**
   - Use HTTPS for all webhooks
   - Implement authentication if needed
   - Rate limit webhook calls
   - Validate input data

3. **Data Privacy**
   - All conversations stored in your Qdrant instance
   - No data shared with third parties (except APIs you use)
   - You control your data completely

### Cost Breakdown

#### Free Tier Options
- **n8n Cloud**: Free tier available
- **Qdrant Cloud**: Free tier (1GB storage)
- **OpenAI**: Pay-as-you-go (GPT-4o-mini is cheap)
- **Vercel/Netlify**: Free tier for hosting

#### Estimated Monthly Costs (Low Usage)
- **OpenAI**: $1-5 (GPT-4o-mini + Whisper)
- **Qdrant**: $0 (free tier)
- **n8n Cloud**: $0 (free tier)
- **Vercel/Netlify**: $0 (free tier)
- **Total**: $1-5/month

#### Estimated Monthly Costs (High Usage)
- **OpenAI**: $20-50
- **Qdrant**: $10-20
- **n8n Cloud**: $20-50
- **Vercel/Netlify**: $0-20
- **Total**: $50-140/month

### Troubleshooting

#### Common Issues

1. **Webhook Not Responding**
   - Check if workflow is active
   - Verify webhook URL is correct
   - Check n8n execution logs

2. **OpenAI API Errors**
   - Verify API key is valid
   - Check API credits
   - Review rate limits

3. **Qdrant Connection Issues**
   - Verify Qdrant API key and URL
   - Check if collection exists
   - Test connection in n8n credentials

4. **Audio Transcription Fails**
   - Verify audio format (WAV, MP3, M4A)
   - Check file size limits
   - Review OpenAI Whisper status

#### Getting Help

1. **Check Logs**
   - n8n execution logs
   - Frontend console logs
   - API error messages

2. **Test Individual Components**
   - Test webhook with curl
   - Test OpenAI API directly
   - Test Qdrant connection

3. **Review Documentation**
   - n8n documentation
   - OpenAI API docs
   - Qdrant documentation

### Advanced Configuration

#### Custom System Message

You can customize James's personality by modifying the system message in the AI Agent node:

```
You are a helpful assistant having access to company knowledge base.
Tell visitor that your name is James and you love to learn new stuff!
```

#### Add More Tools

You can add additional tools to the AI Agent:
- Weather information
- Calendar integration
- Email handling
- Custom APIs

#### Multiple Agents

You can create multiple agents with different personalities:
- Support agent
- Sales agent
- Research agent
- Personal assistant

### Next Steps

1. **Deploy your James PWA** using this guide
2. **Test the integration** thoroughly
3. **Monitor usage** and optimize
4. **Expand functionality** as needed
5. **Share with others** and get feedback

### Resources

- [n8n Documentation](https://docs.n8n.io)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Qdrant Documentation](https://qdrant.tech/documentation)
- [Vercel Documentation](https://vercel.com/docs)
- [Easypanel Documentation](https://easypanel.io/docs)

### Support

For issues or questions:
1. Check this documentation
2. Review n8n execution logs
3. Test with curl commands
4. Check API service status

---

**Happy self-hosting! 🚀**

Remember: With James PWA, you have complete control over your data and infrastructure, just like Agent Cooper had with his dictaphone - but now with AI superpowers!
