export const MODELS = {
  "llama3-ca": { name: "Meta Llama 3 70B Instruct", region: "Canada Central", inputPrice: 3.05, outputPrice: 4.03 },
  "llama33-us": { name: "Meta Llama 3.3 70B Instruct", region: "US regions", inputPrice: 0.72, outputPrice: 0.72 },
  mistral7b: { name: "Mistral 7B", region: "In-region (verify AWS region)", inputPrice: 0.17, outputPrice: 0.23 },
  mixtral8x7b: { name: "Mixtral 8x7B", region: "In-region (verify AWS region)", inputPrice: 0.52, outputPrice: 0.81 },
  mistralLarge2402: { name: "Mistral Large (24.02)", region: "In-region (verify AWS region)", inputPrice: 4.60, outputPrice: 13.80 },
  custom: { name: "Custom model", region: "Custom region", inputPrice: 0, outputPrice: 0 },
};

export const PROFILES = {
  ordinary: { inputTokens: 2750, outputTokens: 525, lowerInputTokens: 1500, lowerOutputTokens: 250, upperInputTokens: 4000, upperOutputTokens: 800 },
  rag: { inputTokens: 8000, outputTokens: 525, lowerInputTokens: 5000, lowerOutputTokens: 250, upperInputTokens: 11000, upperOutputTokens: 800 },
};

export function calculate(values) {
  const totalChats = values.volumeMode === "chats"
    ? values.monthlyChats
    : values.users * values.chatsPerDay * values.days;
  const cloudChats = totalChats * (values.fallbackRate / 100);
  const inputCost = (values.inputTokens / 1_000_000) * values.inputPrice;
  const outputCost = (values.outputTokens / 1_000_000) * values.outputPrice;
  const costPerChat = inputCost + outputCost;
  const monthlyCost = cloudChats * costPerChat;
  return { totalChats, cloudChats, costPerChat, monthlyCost, annualCost: monthlyCost * 12, totalTokens: values.inputTokens + values.outputTokens };
}

export function calculateRange(values) {
  const lower = calculate({ ...values, inputTokens: values.lowerInputTokens, outputTokens: values.lowerOutputTokens });
  const upper = calculate({ ...values, inputTokens: values.upperInputTokens, outputTokens: values.upperOutputTokens });
  return { lower, upper };
}
