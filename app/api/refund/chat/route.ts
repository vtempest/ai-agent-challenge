import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ChatSession, Message } from '@/lib/types';
import { getRAGContext } from '@/lib/knowledge-base';

// In-memory storage for chat sessions
const sessions = new Map<string, ChatSession>();

export async function POST(request: NextRequest) {
  const { sessionId, message, customerId } = await request.json();

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
  }

  // Get or create session
  let session = sessions.get(sessionId);
  if (!session) {
    session = {
      id: sessionId || uuidv4(),
      customerId,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sessions.set(session.id, session);
  }

  // Add user message
  const userMessage: Message = {
    id: uuidv4(),
    role: 'user',
    content: message,
    timestamp: new Date().toISOString(),
  };
  session.messages.push(userMessage);

  // Generate assistant response using RAG context
  const ragContext = getRAGContext(message);
  let assistantContent = '';

  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('refund') || lowerMessage.includes('return')) {
    assistantContent = `I'd be happy to help you with your refund request! Here's what I need:

1. **Customer ID** (e.g., CUST001)
2. **Order ID** (e.g., ORD001)
3. **Reason for refund** - Here are your eligible reasons:
   - ✓ Defective or Broken
   - ✓ Damaged in Shipping
   - ✓ Wrong Item Received
   - ✓ Not as Described

Once you provide these details, I'll instantly check your eligibility.

${ragContext}`;
  } else if (lowerMessage.includes('policy') || lowerMessage.includes('eligible') || lowerMessage.includes('qualify')) {
    assistantContent = `Here's our refund policy:

**Standard Eligibility:**
- 30 days from delivery date
- Valid reasons: Defective, Damaged in Shipping, Wrong Item, Not as Described

**Loyalty Benefits:**
- Customers with $5,000+ lifetime spending get:
  - 45-day refund window (instead of 30)
  - 10% bonus on approved refunds

**Processing Timeline:**
- Decision: Instant AI review
- Credit: 3-5 business days to original payment method

**Invalid Reasons (No Refund):**
- Changed mind
- Found better price
- Buyer's remorse

Ready to submit a refund request? Just provide your Customer ID, Order ID, and reason!

${ragContext}`;
  } else if (lowerMessage.includes('loyalty') || lowerMessage.includes('$5000') || lowerMessage.includes('benefit')) {
    assistantContent = `Great question about loyalty benefits!

**Loyalty Program Details:**
- Automatically applied if you've spent $5,000+ with us
- **Extended Window:** Get 45 days instead of 30 days
- **Refund Bonus:** Approved refunds get 10% extra credit

For example: If an eligible item costs $100, loyal customers get $110 refunded!

Check your account to see your loyalty status and lifetime spending. Need help with a refund? I'm ready to process it for you!

${ragContext}`;
  } else if (lowerMessage.includes('how long') || lowerMessage.includes('timeline') || lowerMessage.includes('process')) {
    assistantContent = `Here's the refund timeline:

**Submission & Review:**
- Instant AI analysis of your request

**Decision:**
- Immediate based on policy check
- You get instant approval or denial with explanation

**Processing:**
- 3-5 business days after approval
- Refund goes to original payment method

**Your Part:**
- 30 days to request (45 if loyalty member)
- Provide Customer ID, Order ID, and reason

The entire process is handled by our AI system for speed and fairness. Ready to start? I can help!

${ragContext}`;
  } else if (lowerMessage.includes('damage') || lowerMessage.includes('broken') || lowerMessage.includes('defective')) {
    assistantContent = `I'm sorry to hear about the damage! Here's the good news:

**Damaged/Defective Items:**
- ✓ 100% approval rate
- ✓ Full refund always approved
- ✓ Available within 30 days (45 for loyalty members)

**What to Do:**
1. Provide your Customer ID and Order ID
2. Describe the damage/defect
3. We may request photos (optional)

Once I verify, the refund will be processed in 3-5 business days.

Please click "I need to return an item" or let me know your Customer ID and Order ID to get started!

${ragContext}`;
  } else if (lowerMessage.includes('wrong') || lowerMessage.includes('incorrect')) {
    assistantContent = `Received the wrong item? That's on us!

**Wrong Item Policy:**
- ✓ 100% approval rate
- ✓ Full refund approved
- ✓ No questions asked

**Next Steps:**
1. Provide Customer ID and Order ID
2. Confirm what you received vs. what you ordered
3. We'll process your refund

Refund will be completed in 3-5 business days. Let's get this fixed for you!

${ragContext}`;
  } else {
    assistantContent = `Hi there! I'm your AI refund assistant. I can help you with:

**Common Questions:**
- What's your refund policy?
- I need to return an item
- How long does processing take?
- What if my item was damaged?
- Am I eligible for a refund?
- What's the loyalty benefit?

Or you can directly submit a refund request. What can I help with?

${ragContext}`;
  }

  const assistantMessage: Message = {
    id: uuidv4(),
    role: 'assistant',
    content: assistantContent,
    timestamp: new Date().toISOString(),
  };
  session.messages.push(assistantMessage);
  session.updatedAt = new Date().toISOString();

  return NextResponse.json({
    sessionId: session.id,
    message: assistantMessage,
    messages: session.messages,
  });
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json(session);
}
