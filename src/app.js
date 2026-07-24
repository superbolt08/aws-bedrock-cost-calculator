import { MODELS, PROFILES, calculate } from "./calculator.js";

const $ = (id) => document.getElementById(id);
const form = $("calculator");
const fields = ["modelName", "region", "inputPrice", "outputPrice", "users", "chatsPerDay", "monthlyChats", "days", "fallbackRate", "inputTokens", "outputTokens"];
const number = (id) => Math.max(0, Number($(id).value) || 0);
const money = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n < 1 ? 4 : 2 }).format(n);
const whole = (n) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(n);

function selectedValue(name) { return document.querySelector(`input[name="${name}"]:checked`).value; }
function applyModel() {
  const preset = MODELS[$("model").value];
  $("modelName").value = preset.name; $("region").value = preset.region;
  $("inputPrice").value = preset.inputPrice; $("outputPrice").value = preset.outputPrice;
}
function applyProfile() {
  const profile = selectedValue("profile");
  if (profile === "custom") return;
  $("inputTokens").value = PROFILES[profile].inputTokens;
  $("outputTokens").value = PROFILES[profile].outputTokens;
}
function values() {
  return { volumeMode: selectedValue("volumeMode"), users: number("users"), chatsPerDay: number("chatsPerDay"), monthlyChats: number("monthlyChats"), days: number("days"), fallbackRate: number("fallbackRate"), inputTokens: number("inputTokens"), outputTokens: number("outputTokens"), inputPrice: number("inputPrice"), outputPrice: number("outputPrice") };
}
function render() {
  const v = values(); const r = calculate(v);
  $("userInputs").hidden = v.volumeMode === "chats"; $("monthlyChatsLabel").hidden = v.volumeMode !== "chats";
  $("modelSummary").textContent = $("modelName").value || "Custom model"; $("regionSummary").textContent = $("region").value || "Custom region";
  $("monthlyCost").textContent = money(r.monthlyCost); $("annualCost").textContent = money(r.annualCost);
  $("totalChats").textContent = whole(r.totalChats); $("cloudChats").textContent = whole(r.cloudChats);
  $("costPerChat").textContent = money(r.costPerChat); $("totalTokens").textContent = whole(r.totalTokens);
  $("formula").textContent = `${whole(r.cloudChats)} AWS chats × ${money(r.costPerChat)} per AWS chat = ${money(r.monthlyCost)} / month.`;
  $("copySummary").dataset.summary = `${$("modelName").value} (${ $("region").value }): ${whole(r.totalChats)} total chats/month, ${v.fallbackRate}% routed to AWS (${whole(r.cloudChats)} chats), ${whole(v.inputTokens)} input + ${whole(v.outputTokens)} output tokens per AWS chat. Estimated monthly Bedrock model cost: ${money(r.monthlyCost)}; annual: ${money(r.annualCost)}.`;
}

$("model").addEventListener("change", () => { applyModel(); render(); });
document.querySelectorAll('input[name="profile"]').forEach((el) => el.addEventListener("change", () => { applyProfile(); render(); }));
form.addEventListener("input", render); form.addEventListener("change", render);
$("copySummary").addEventListener("click", async () => { await navigator.clipboard.writeText($("copySummary").dataset.summary); $("copyStatus").textContent = "Calculation copied."; });
applyModel(); render();
