export const MODELS = {
  "llama3-ca": { name: "Meta Llama 3 70B Instruct", region: "Canada Central", inputPrice: 3.05, outputPrice: 4.03 },
  "llama33-us": { name: "Meta Llama 3.3 70B Instruct", region: "US regions", inputPrice: 0.72, outputPrice: 0.72 },
  mistral7b: { name: "Mistral 7B", region: "In-region (verify AWS region)", inputPrice: 0.17, outputPrice: 0.23 },
  mixtral8x7b: { name: "Mixtral 8x7B", region: "In-region (verify AWS region)", inputPrice: 0.52, outputPrice: 0.81 },
  mistralLarge2402: { name: "Mistral Large (24.02)", region: "In-region (verify AWS region)", inputPrice: 4.60, outputPrice: 13.80 },
  devstral2: { name: "Devstral 2 123B", region: "US East / Ohio / West", inputPrice: 0.40, outputPrice: 2.00 },
  magistralSmall: { name: "Magistral Small 1.2", region: "US East / Ohio / West", inputPrice: 0.50, outputPrice: 1.50 },
  voxtralMini: { name: "Voxtral Mini 1.0", region: "US East / Ohio / West", inputPrice: 0.04, outputPrice: 0.04 },
  voxtralSmall: { name: "Voxtral Small 1.0", region: "US East / Ohio / West", inputPrice: 0.10, outputPrice: 0.30 },
  ministral3b: { name: "Ministral 3B 3.0", region: "US East / Ohio / West", inputPrice: 0.10, outputPrice: 0.10 },
  ministral8b: { name: "Ministral 8B 3.0", region: "US East / Ohio / West", inputPrice: 0.15, outputPrice: 0.15 },
  ministral14b: { name: "Ministral 14B 3.0", region: "US East / Ohio / West", inputPrice: 0.20, outputPrice: 0.20 },
  mistralLarge3: { name: "Mistral Large 3", region: "US East / Ohio / West", inputPrice: 0.50, outputPrice: 1.50 },
  nemotronNano2: { name: "NVIDIA Nemotron Nano 2", region: "US East / Ohio / West", inputPrice: 0.06, outputPrice: 0.23 },
  nemotronSuper: { name: "NVIDIA Nemotron 3 Super 120B", region: "US East / Ohio / West", inputPrice: 0.15, outputPrice: 0.65 },
  custom: { name: "Custom model", region: "Custom region", inputPrice: 0, outputPrice: 0 },
};

export const PROFILES = {
  ordinary: { inputTokens: 2750, outputTokens: 525, lowerInputTokens: 1500, lowerOutputTokens: 250, upperInputTokens: 4000, upperOutputTokens: 800 },
  rag: { inputTokens: 8000, outputTokens: 525, lowerInputTokens: 5000, lowerOutputTokens: 250, upperInputTokens: 11000, upperOutputTokens: 800 },
};

export const FALLBACK_RATES = {
  USD: 1, CAD: 1.40815, AED: 3.6725, EUR: 0.878195, GBP: 0.750346,
  AUD: 1.433751, NZD: 1.731447, JPY: 163.692064, INR: 96.723524, CNY: 6.783033,
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

export function convertUsd(amount, rate) { return amount * rate; }
