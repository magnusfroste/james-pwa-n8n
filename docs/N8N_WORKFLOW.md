# N8N Workflow Documentation - James PWA

## Overview

This document describes the n8n workflow that powers the James PWA AI agent. The workflow handles both text and audio messages, provides intelligent responses using GPT-4o-mini, and maintains a knowledge base for conversation history.

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

## Support

For issues or questions:
1. Check n8n execution logs
2. Verify credentials are valid
3. Test individual nodes
4. Review workflow connections

---

**Last Updated**: February 2026  
**Version**: 1.0
