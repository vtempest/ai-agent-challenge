/**
 * RAG (Retrieval Augmented Generation) Knowledge Base
 * Contains comprehensive information about the refund process
 */

export const refundKnowledgeBase = {
  policies: {
    standard_window: {
      title: "Standard Refund Window",
      description: "Customers have 30 days from the order date to request a refund",
      details: [
        "Refund requests must be submitted within 30 days of delivery",
        "Refund window starts from the original order delivery date",
        "No exceptions for standard eligibility period",
      ],
    },
    loyalty_benefit: {
      title: "Loyalty Benefit - Extended Window",
      description: "Loyal customers with lifetime spending over $5,000 get 45 days",
      details: [
        "Loyalty status is based on total lifetime spending",
        "Must have spent $5,000 or more in total",
        "Extended 45-day window applies automatically",
        "Loyalty benefits also include 10% loyalty bonus on refund amounts",
      ],
    },
    eligible_reasons: {
      title: "Eligible Refund Reasons",
      description: "Only specific reasons qualify for refunds",
      reasons: [
        {
          reason: "Defective or Broken",
          description: "Product arrived damaged, broken, or non-functional",
          approval_rate: "100%",
          notes: "Always approved with full refund",
        },
        {
          reason: "Damaged in Shipping",
          description: "Product was damaged during the shipping process",
          approval_rate: "100%",
          notes: "Full refund approved with photographic evidence recommended",
        },
        {
          reason: "Wrong Item Received",
          description: "Received an incorrect or different product",
          approval_rate: "100%",
          notes: "Full refund approved, may require item return",
        },
        {
          reason: "Not as Described",
          description: "Product doesn't match the listing description",
          approval_rate: "95%",
          notes: "Approved if description mismatch is significant",
        },
        {
          reason: "Changed My Mind",
          description: "Customer changed their mind about the purchase",
          approval_rate: "0%",
          notes: "Not eligible for refund - personal preference",
        },
      ],
    },
    non_eligible: {
      title: "Non-Eligible Refund Reasons",
      description: "Reasons that do not qualify for refunds",
      reasons: [
        "Changed mind about purchase",
        "Found better price elsewhere",
        "Product too expensive",
        "Buyer's remorse",
        "No longer needed",
        "Color not preferred",
      ],
    },
    processing: {
      title: "Refund Processing",
      description: "How refunds are processed after approval",
      details: [
        "Refunds are processed within 3-5 business days after approval",
        "Refund amount is credited to original payment method",
        "For shipping damage, may require photographic evidence",
        "Some items may require return before refund is issued",
        "Refund amount for loyalty customers includes 10% bonus",
      ],
    },
  },

  faq: [
    {
      question: "How long do I have to request a refund?",
      answer:
        "You have 30 days from the delivery date to request a refund. If you're a loyalty customer (lifetime spending $5,000+), you get 45 days.",
    },
    {
      question: "What reasons qualify for a refund?",
      answer:
        "Refunds are approved for: Defective/Broken items, Damaged in Shipping, Wrong Item Received, and Not as Described. Refunds due to changed mind are not eligible.",
    },
    {
      question: "How long does it take to process a refund?",
      answer:
        "Once approved, refunds are processed within 3-5 business days. The refund will be credited to your original payment method.",
    },
    {
      question: "What is the loyalty benefit?",
      answer:
        "Customers with lifetime spending of $5,000 or more get an extended 45-day refund window and receive a 10% bonus on approved refund amounts.",
    },
    {
      question: "Do I need to return the item?",
      answer:
        "For most defective or damaged items, we may request photographic evidence. Return requirements depend on the specific case.",
    },
    {
      question: "Can I get a partial refund?",
      answer:
        "Refunds are typically full amount for eligible reasons. Special cases may be evaluated individually based on the situation.",
    },
    {
      question: "What if my refund request is denied?",
      answer:
        "You can contact our support team with additional details about your situation. We're here to help resolve any issues.",
    },
    {
      question: "How do I check my customer status?",
      answer:
        "Your customer status and loyalty benefits are shown in your account settings. You can view your lifetime spending and eligibility there.",
    },
  ],

  refund_process_steps: [
    {
      step: 1,
      title: "Submit Request",
      description: "Provide your Customer ID, Order ID, and reason for refund",
    },
    {
      step: 2,
      title: "AI Review",
      description: "Our AI agent reviews your request against policies",
    },
    {
      step: 3,
      title: "Verification",
      description: "We verify customer and order information",
    },
    {
      step: 4,
      title: "Policy Check",
      description: "Your request is checked against refund eligibility rules",
    },
    {
      step: 5,
      title: "Decision",
      description: "Refund is approved or denied with explanation",
    },
    {
      step: 6,
      title: "Processing",
      description: "Approved refunds are processed in 3-5 business days",
    },
  ],

  important_notes: [
    "Refund requests are reviewed fairly and consistently by our AI system",
    "Decisions are based on objective criteria, not subjective judgments",
    "All decisions include clear reasoning and policy references",
    "Customers can appeal denials by contacting support",
    "Your data is protected with enterprise-grade security",
  ],
};

export const sampleQuestions = [
  {
    text: "What's your refund policy?",
    category: "policy",
    icon: "HelpCircle",
  },
  {
    text: "I need to return an item",
    category: "refund",
    icon: "Package",
  },
  {
    text: "How long does processing take?",
    category: "timeline",
    icon: "Clock",
  },
  {
    text: "What if my item was damaged?",
    category: "issue",
    icon: "AlertTriangle",
  },
  {
    text: "Am I eligible for refund?",
    category: "eligibility",
    icon: "CheckCircle",
  },
  {
    text: "What's the loyalty benefit?",
    category: "loyalty",
    icon: "Star",
  },
];

export function getRAGContext(userMessage: string): string {
  const message = userMessage.toLowerCase();

  // Determine which knowledge base sections are relevant
  const relevantSections: string[] = [];

  if (
    message.includes("policy") ||
    message.includes("refund") ||
    message.includes("eligible") ||
    message.includes("can i")
  ) {
    relevantSections.push(formatSection("Refund Policy", refundKnowledgeBase.policies));
  }

  if (message.includes("how long") || message.includes("timeline") || message.includes("process")) {
    relevantSections.push(formatSection("Refund Timeline", refundKnowledgeBase.policies.processing));
  }

  if (message.includes("loyalty") || message.includes("$5000") || message.includes("bonus")) {
    relevantSections.push(formatSection("Loyalty Benefits", refundKnowledgeBase.policies.loyalty_benefit));
  }

  if (message.includes("damaged") || message.includes("broken") || message.includes("defective")) {
    relevantSections.push(
      formatSection(
        "Damage & Defect Policy",
        refundKnowledgeBase.policies.eligible_reasons.reasons.find((r) => r.reason.includes("Defective"))
      )
    );
  }

  if (message.includes("wrong") || message.includes("incorrect")) {
    relevantSections.push(
      formatSection(
        "Wrong Item Policy",
        refundKnowledgeBase.policies.eligible_reasons.reasons.find((r) => r.reason.includes("Wrong"))
      )
    );
  }

  // Default to general policy if nothing matched
  if (relevantSections.length === 0) {
    relevantSections.push(formatSection("Refund Policy Overview", refundKnowledgeBase.policies.standard_window));
  }

  return `
Use the following refund policy information when responding to the customer:

${relevantSections.join("\n---\n")}

IMPORTANT: When using this information:
- Be helpful and friendly
- Reference specific policy details when relevant
- Always mention the 30-day standard window or 45-day for loyalty customers
- Explain eligibility clearly
- Offer to help with the refund process
`;
}

function formatSection(title: string, content: any): string {
  if (!content) return "";

  let formatted = `## ${title}\n`;

  if (typeof content === "string") {
    formatted += content;
  } else if (Array.isArray(content)) {
    formatted += content.map((item) => `- ${typeof item === "string" ? item : JSON.stringify(item)}`).join("\n");
  } else if (typeof content === "object") {
    formatted += Object.entries(content)
      .map(([key, value]) => {
        if (typeof value === "string") {
          return `**${key}**: ${value}`;
        }
        return `**${key}**: ${JSON.stringify(value)}`;
      })
      .join("\n");
  }

  return formatted;
}
