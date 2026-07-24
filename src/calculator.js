export const MODELS = {
  "llama3-ca": { name: "Meta Llama 3 70B Instruct", region: "Canada Central", inputPrice: 3.05, outputPrice: 4.03 },
  "llama33-us": { name: "Meta Llama 3.3 70B Instruct", region: "US regions", inputPrice: 0.72, outputPrice: 0.72 },
  custom: { name: "Custom model", region: "Custom region", inputPrice: 0, outputPrice: 0 },
};

export const PROFILES = {
  ordinary: { inputTokens: 2750, outputTokens: 525 },
  rag: { inputTokens: 8000, outputTokens: 525 },
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
