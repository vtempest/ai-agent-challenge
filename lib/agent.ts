import { generateObject } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';
import { customers, orders, refundRequests } from './data';
import { ToolCall } from './types';

const RefundDecisionSchema = z.object({
  approved: z.boolean(),
  amount: z.number(),
  reason: z.string(),
});

interface AgentState {
  customerId: string;
  orderId: string;
  requestReason: string;
  toolCalls: ToolCall[];
}

// Tool implementations
function lookupCustomer(customerId: string): string {
  const customer = customers.find(c => c.id === customerId);
  if (!customer) {
    return JSON.stringify({ error: 'Customer not found', id: customerId });
  }
  return JSON.stringify({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    joinDate: customer.joinDate,
    totalSpent: customer.totalSpent,
  });
}

function lookupOrder(orderId: string): string {
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return JSON.stringify({ error: 'Order not found', id: orderId });
  }
  return JSON.stringify({
    id: order.id,
    customerId: order.customerId,
    amount: order.amount,
    date: order.date,
    description: order.description,
    status: order.status,
  });
}

function checkPolicy(
  customerId: string,
  orderId: string,
  reason: string,
  daysAgo: number,
): string {
  const customer = customers.find(c => c.id === customerId);
  const order = orders.find(o => o.id === orderId);

  if (!customer || !order) {
    return JSON.stringify({
      eligible: false,
      reason: 'Invalid customer or order',
    });
  }

  const isLoyalCustomer = customer.totalSpent >= 5000;
  const maxDays = isLoyalCustomer ? 45 : 30;

  if (daysAgo > maxDays) {
    return JSON.stringify({
      eligible: false,
      reason: `Outside refund window (${maxDays} days)`,
      daysElapsed: daysAgo,
    });
  }

  const validReasons = ['defective', 'damaged_in_shipping', 'wrong_item', 'not_as_described'];
  const nonEligibleReasons = ['changed_mind'];
  const lowerReason = reason.toLowerCase();

  if (nonEligibleReasons.includes(lowerReason)) {
    return JSON.stringify({
      eligible: false,
      reason: 'Refund reason not eligible per policy (changed mind / buyer\'s remorse)',
    });
  }

  if (!validReasons.includes(lowerReason)) {
    return JSON.stringify({
      eligible: false,
      reason: 'Invalid refund reason',
      validReasons,
    });
  }

  const refundMultiplier = isLoyalCustomer ? 1.1 : 1.0;
  const refundableAmount = order.amount * refundMultiplier;

  return JSON.stringify({
    eligible: true,
    reason: 'Customer meets all policy requirements',
    daysAgo,
    maxDays,
    isLoyalCustomer,
    refundMultiplier,
    baseAmount: order.amount,
    refundableAmount: Math.round(refundableAmount * 100) / 100,
  });
}

function processRefund(
  customerId: string,
  orderId: string,
  amount: number,
): string {
  // Check for duplicate refunds
  const existingRefund = refundRequests.find(
    r => r.customerId === customerId && r.orderId === orderId && r.status === 'approved',
  );

  if (existingRefund) {
    return JSON.stringify({
      success: false,
      reason: 'Refund already processed for this order',
      existingRefund: existingRefund.id,
    });
  }

  // Create refund ID
  const refundId = `REF${Date.now().toString().slice(-8)}`;
  return JSON.stringify({
    success: true,
    refundId,
    customerId,
    orderId,
    amount: Math.round(amount * 100) / 100,
    status: 'approved',
    processingTime: '3-5 business days',
  });
}

async function executeAgentLoop(
  customerId: string,
  orderId: string,
  requestReason: string,
  currentDate: Date = new Date(),
): Promise<{ decision: any; toolCalls: ToolCall[] }> {
  const state: AgentState = {
    customerId,
    orderId,
    requestReason,
    toolCalls: [],
  };

  const order = orders.find(o => o.id === orderId);
  const orderDate = order ? new Date(order.date) : null;
  const daysAgo = orderDate ? Math.floor((currentDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;

  // Step 1: Look up customer
  const customerResult = lookupCustomer(customerId);
  state.toolCalls.push({
    name: 'lookup_customer',
    input: { customerId },
    output: customerResult,
    timestamp: new Date().toISOString(),
  });

  // Step 2: Look up order
  const orderResult = lookupOrder(orderId);
  state.toolCalls.push({
    name: 'lookup_order',
    input: { orderId },
    output: orderResult,
    timestamp: new Date().toISOString(),
  });

  // Step 3: Check policy
  const policyResult = checkPolicy(customerId, orderId, requestReason, daysAgo);
  state.toolCalls.push({
    name: 'check_policy',
    input: { customerId, orderId, reason: requestReason, daysAgo },
    output: policyResult,
    timestamp: new Date().toISOString(),
  });

  // Build context for Claude
  const context = `
You are a customer support refund agent. Based on the following information, make a refund decision.

Customer Information:
${customerResult}

Order Information:
${orderResult}

Policy Check:
${policyResult}

Refund Request Reason: ${requestReason}

Make a final decision on whether to approve or deny the refund. If approved, calculate the appropriate refund amount.
Return your decision in JSON format with fields: approved (boolean), amount (number), reason (string).
`;

  // Use Groq model to make the decision (with fallback to mock mode)
  let result;
  if (!process.env.GROQ_API_KEY) {
    // Mock mode for demo when API key not available
    const policyData = JSON.parse(policyResult);
    result = {
      object: {
        approved: policyData.eligible === true,
        amount: policyData.eligible ? Math.round(policyData.refundableAmount * 100) / 100 : 0,
        reason: policyData.eligible
          ? `Refund approved per policy: ${policyData.reason}`
          : `Refund denied: ${policyData.reason}`,
      },
    };
  } else {
    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });
    result = await generateObject({
      model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
      schema: RefundDecisionSchema,
      prompt: context,
    });
  }

  // Step 4: Process refund if approved
  if (result.object.approved) {
    const processResult = processRefund(customerId, orderId, result.object.amount);
    state.toolCalls.push({
      name: 'process_refund',
      input: { customerId, orderId, amount: result.object.amount },
      output: processResult,
      timestamp: new Date().toISOString(),
    });
  }

  return {
    decision: result.object,
    toolCalls: state.toolCalls,
  };
}

export { executeAgentLoop, lookupCustomer, lookupOrder, checkPolicy, processRefund };
