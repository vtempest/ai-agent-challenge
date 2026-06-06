# AI Customer Support Refund Agent

An intelligent refund processing system powered by Groq's Llama 4 Scout model, demonstrating AI agent capabilities, policy compliance, and explainable decision-making.

## Features

- **Intelligent Agent**: Uses Groq's Llama 4 Scout model to make refund decisions with full reasoning
- **Policy Enforcement**: 30-day refund window (45 days for loyal customers), specific refund reasons, duplicate prevention
- **Transparent Decision Making**: Complete reasoning trail showing all 4 agent tool calls with JSON output
- **Customer Chat Interface**: Easy-to-use refund request submission flow
- **Admin Dashboard**: Real-time monitoring of requests with decision analysis
- **Edge Case Handling**: Validates customer IDs, refund reasons, time windows, and loyalty status

## Architecture

### Backend
- **Framework**: Next.js 16 with App Router
- **AI Model**: Groq's `meta-llama/llama-4-scout-17b-16e-instruct`
- **AI SDK**: Vercel AI SDK v6 with @ai-sdk/groq
- **Tools**: 4 agent tools executed in sequence
  1. `lookup_customer` - Retrieve customer profile and lifetime spending
  2. `lookup_order` - Get order details and status
  3. `check_policy` - Validate against refund policy rules
  4. `process_refund` - Execute the refund transaction

### Frontend
- **Customer Page** (`/`): Chat interface for submitting refund requests
- **Admin Dashboard** (`/admin`): Real-time request monitoring with decision logs
- **Components**: Dark theme UI with Tailwind CSS and shadcn/ui

### Data
- 15 synthetic customer profiles with order history
- In-memory data storage (easily swappable with databases)
- Refund policy: 30/45-day window, 4 eligible reasons, loyalty bonus (10% for high-value customers)

## Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Environment Variables
Add your Groq API key to your project:
```
GROQ_API_KEY=your_groq_api_key_here
```

Get a free API key at: https://console.groq.com

### 3. Run Development Server
```bash
pnpm dev
```

The app will be available at:
- **Customer Chat**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin

## Test Cases

### Approval Scenario
```bash
curl -X POST http://localhost:3000/api/refund/process \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST001",
    "orderId": "ORD001",
    "reason": "defective"
  }'
```

### Denial (Outside Window)
```bash
curl -X POST http://localhost:3000/api/refund/process \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST007",
    "orderId": "ORD010",
    "reason": "changed_mind"
  }'
```

### Invalid Customer
```bash
curl -X POST http://localhost:3000/api/refund/process \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "INVALID999",
    "orderId": "ORD001",
    "reason": "defective"
  }'
```

## Response Format

```json
{
  "requestId": "a71c9b71-c6c7-4071-929f-11ef75441eae",
  "approved": true,
  "amount": 799.99,
  "reason": "The customer received a delivered order that was not as described, meeting the policy requirements for a refund.",
  "processingTime": "3-5 business days",
  "toolCalls": [
    {
      "name": "lookup_customer",
      "input": { "customerId": "CUST004" },
      "output": "{ ... customer data ... }",
      "timestamp": "2026-06-06T00:19:23.099Z"
    },
    // ... 3 more tool calls
  ]
}
```

## Policy Rules

### Refund Window
- **Standard customers**: 30 days from purchase
- **Loyal customers** (>$5,000 lifetime spend): 45 days from purchase

### Valid Refund Reasons
- `defective` - Product arrived defective or broken
- `damaged_in_shipping` - Arrived damaged from shipping
- `not_as_described` - Item doesn't match product description
- `changed_mind` - Customer changed their mind (within policy)

### Loyalty Bonus
- Customers with >$5,000 lifetime spend receive 10% bonus on refund amount

### Duplicate Prevention
- Cannot refund the same order twice

## Key Files

```
/app
  /api/refund
    /chat/route.ts      - Chat message handling
    /process/route.ts   - Refund processing with agent
  /admin/page.tsx       - Admin dashboard
  /page.tsx             - Customer chat interface
  /layout.tsx           - Root layout with dark theme
  /globals.css          - Theme colors and styles
/lib
  /agent.ts             - Agent logic with Groq integration
  /data.ts              - Synthetic customer and order data
  /types.ts             - TypeScript type definitions
/components
  /chat-messages.tsx    - Message display component
  /refund-form.tsx      - Refund request form
```

## Interview Showcase Points

1. **AI Agent Architecture**: Demonstrates tool calling, structured decision-making, and reasoning chain
2. **Policy Compliance**: Shows how to enforce business rules within an AI system
3. **Explainability**: Full transparency of agent decisions with reasoning trail visible in admin dashboard
4. **Edge Cases**: Handles invalid inputs, duplicates, time windows, and special customer tiers
5. **Full Stack**: Complete system from customer-facing chat to admin monitoring
6. **Production Patterns**: Error handling, type safety, clean architecture, proper logging

## Troubleshooting

### "GROQ_API_KEY is not set"
Add your Groq API key to your project environment variables.

### Chat not responding
Ensure the dev server is running and check browser console for errors.

### Admin dashboard empty
Refund requests are stored in memory. Restart the server to reset the request history.

## Future Enhancements

- Database persistence (Neon/Supabase)
- Webhook notifications
- Advanced analytics and reporting
- Multi-language support
- Real payment integration
- Machine learning for policy optimization
