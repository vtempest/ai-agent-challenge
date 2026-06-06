import { NextRequest, NextResponse } from 'next/server';
import { executeAgentLoop } from '@/lib/agent';
import { addRefundRequest } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';

interface RefundRequestBody {
  customerId: string;
  orderId: string;
  reason: string;
}

// In-memory storage for refund decisions and logs
const refundLogs = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body: RefundRequestBody = await request.json();
    const { customerId, orderId, reason } = body;

    if (!customerId || !orderId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, orderId, reason' },
        { status: 400 }
      );
    }

    console.log(`Processing refund request - Customer: ${customerId}, Order: ${orderId}, Reason: ${reason}`);

    // Execute agent loop
    const { decision, toolCalls } = await executeAgentLoop(customerId, orderId, reason);

    console.log(`Agent decision:`, decision);
    console.log(`Tool calls made:`, toolCalls.length);

    // Store refund request
    const requestId = uuidv4();
    const refundRequest = {
      id: requestId,
      customerId,
      orderId,
      reason,
      requestedAmount: 0,
      status: decision.approved ? 'approved' : 'denied',
      timestamp: new Date().toISOString(),
      decision,
      toolCalls,
    };

    addRefundRequest({
      id: requestId,
      customerId,
      orderId,
      reason,
      requestedAmount: 0,
      status: decision.approved ? 'approved' : 'denied',
      timestamp: new Date().toISOString(),
    });

    refundLogs.set(requestId, refundRequest);

    return NextResponse.json({
      requestId,
      approved: decision.approved,
      amount: decision.amount,
      reason: decision.reason,
      toolCalls,
      processingTime: decision.approved ? '3-5 business days' : 'N/A',
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { error: 'Failed to process refund request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const requestId = request.nextUrl.searchParams.get('requestId');

  if (!requestId) {
    // Return all refund logs
    return NextResponse.json(Array.from(refundLogs.values()));
  }

  const log = refundLogs.get(requestId);
  if (!log) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  return NextResponse.json(log);
}
