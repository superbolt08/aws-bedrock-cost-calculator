import { MODELS, PROFILES, FALLBACK_RATES, calculate, calculateRange, convertUsd } from "./calculator.js";

const $ = (id) => document.getElementById(id);
const form = $("calculator");
const number = (id) => Math.max(0, Number($(id).value) || 0);
let exchangeRates = { ...FALLBACK_RATES };
let rateSource = "Using built-in reference exchange rates.";
const money = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: $("currency")?.value || "USD", maximumFractionDigits: n < 1 ? 4 : 2 }).format(n);
const whole = (n) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(n);
const rangeText = (lower, upper, format) => Math.abs(lower - upper) < 1e-12 ? format(lower) : `${format(Math.min(lower, upper))} - ${format(Math.max(lower, upper))}`;

function selectedValue(name) { return document.querySelector(`input[name="${name}"]:checked`).value; }
function applyModel() {
  const preset = MODELS[$("model").value];
  $("modelName").value = preset.name; $("region").value = preset.region;
  $("inputPrice").value = preset.inputPrice; $("outputPrice").value = preset.outputPrice;
}
function applyProfile() {
  const profile = selectedValue("profile");
  if (profile === "custom") return;
  const preset = PROFILES[profile];
  ["inputTokens", "outputTokens", "lowerInputTokens", "lowerOutputTokens", "upperInputTokens", "upperOutputTokens"].forEach((id) => { $(id).value = preset[id]; });
}
function values() {
  return {
    volumeMode: selectedValue("volumeMode"), tokenMode: selectedValue("tokenMode"), users: number("users"), chatsPerDay: number("chatsPerDay"), monthlyChats: number("monthlyChats"), days: number("days"), fallbackRate: number("fallbackRate"), inputTokens: number("inputTokens"), outputTokens: number("outputTokens"), lowerInputTokens: number("lowerInputTokens"), lowerOutputTokens: number("lowerOutputTokens"), upperInputTokens: number("upperInputTokens"), upperOutputTokens: number("upperOutputTokens"), inputPrice: number("inputPrice"), outputPrice: number("outputPrice")
  };
}
function render() {
  const v = values(); const single = calculate(v); const ranged = calculateRange(v);
  const isRange = v.tokenMode === "range"; const lower = isRange ? ranged.lower : single; const upper = isRange ? ranged.upper : single;
  const currency = $("currency").value; const rate = exchangeRates[currency] || 1; const convert = (amount) => convertUsd(amount, rate);
  $("userInputs").hidden = v.volumeMode === "chats"; $("monthlyChatsLabel").hidden = v.volumeMode !== "chats";
  $("singleTokens").hidden = isRange; $("rangeTokens").hidden = !isRange;
  $("modelSummary").textContent = $("modelName").value || "Custom model"; $("regionSummary").textContent = $("region").value || "Custom region";
  $("monthlyCost").textContent = rangeText(convert(lower.monthlyCost), convert(upper.monthlyCost), money);
  $("annualCost").textContent = rangeText(convert(lower.annualCost), convert(upper.annualCost), money);
  $("totalChats").textContent = whole(lower.totalChats); $("cloudChats").textContent = whole(lower.cloudChats);
  $("costPerChat").textContent = rangeText(convert(lower.costPerChat), convert(upper.costPerChat), money);
  $("totalTokens").textContent = rangeText(lower.totalTokens, upper.totalTokens, whole);
  $("formula").textContent = `${whole(lower.cloudChats)} AWS chats x ${rangeText(convert(lower.costPerChat), convert(upper.costPerChat), money)} per AWS chat = ${rangeText(convert(lower.monthlyCost), convert(upper.monthlyCost), money)} / month.`;
  const tokenSummary = isRange ? `${whole(lower.totalTokens)}-${whole(upper.totalTokens)} total tokens per AWS chat` : `${whole(single.totalTokens)} total tokens per AWS chat`;
  $("currencyNote").textContent = `Converted from USD model-token pricing at 1 USD = ${whole(rate)} ${currency}`;
  $("rateStatus").textContent = rateSource;
  $("copySummary").dataset.summary = `${$("modelName").value} (${$("region").value}): ${whole(lower.totalChats)} total chats/month, ${v.fallbackRate}% routed to AWS (${whole(lower.cloudChats)} chats), ${tokenSummary}. Estimated monthly Bedrock model cost: ${rangeText(convert(lower.monthlyCost), convert(upper.monthlyCost), money)}; annual: ${rangeText(convert(lower.annualCost), convert(upper.annualCost), money)}.`;
}

$("model").addEventListener("change", () => { applyModel(); render(); });
document.querySelectorAll('input[name="profile"]').forEach((el) => el.addEventListener("change", () => { applyProfile(); render(); }));
document.querySelectorAll('input[name="tokenMode"]').forEach((el) => el.addEventListener("change", render));
$("currency").addEventListener("change", render);
form.addEventListener("input", render); form.addEventListener("change", render);
$("summaryToggle").addEventListener("click", () => {
  const details = $("summaryDetails"); const hidden = details.hidden;
  details.hidden = !hidden; $("summaryToggle").setAttribute("aria-expanded", String(hidden));
  $("summaryToggle").textContent = hidden ? "Hide calculation summary" : "Show calculation summary";
});
$("copySummary").addEventListener("click", async () => { await navigator.clipboard.writeText($("copySummary").dataset.summary); $("copyStatus").textContent = "Calculation copied."; });

async function loadExchangeRates() {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    const payload = await response.json();
    if (payload.result !== "success" || !payload.rates?.CAD || !payload.rates?.AED) throw new Error("Rates unavailable");
    exchangeRates = { ...FALLBACK_RATES, ...payload.rates };
    rateSource = `Live USD exchange rates loaded (${new Date(payload.time_last_update_unix * 1000).toLocaleDateString()}).`;
  } catch {
    rateSource = "Live rates unavailable; using built-in reference exchange rates.";
  }
  render();
}

applyModel(); render(); loadExchangeRates();
