# 🚚 Makhan Move 
**Moving made as smooth as butter. Zero negotiations. Zero hidden fees.**

Makhan Move is an AI-powered logistics platform that eliminates the traditional hassles of relocating. Instead of negotiating with dozens of movers and facing hidden charges (which often inflate costs by 1.25x to 2x during unloading), Makhan Move automates discovery, negotiation, and risk analysis to secure the best, transparent deal for the user.

---

## 🛑 The Problem
Users looking to relocate face a fragmented market:
- Negotiating with multiple service providers is exhausting and time-consuming.
- High risk of hidden fees, unexpected taxes, and upcharging during the unloading phase.
- Lack of transparent, real-time tracking during the move.

## 💡 The Solution
Makhan Move requires only 4 basic details: **Pickup Location, Dropoff Location, Pickup Time, and Date**. Our system handles the rest by deploying AI agents to negotiate on your behalf, analyzing the best options using Machine Learning, and handling all tracking via WhatsApp.

---

## ⚙️ How It Works (System Architecture)

1. **User Input:** User enters basic relocation details on the Makhan Move web interface.
2. **Mover Discovery:** Integrates with **Google APIs** to find the top 10 movers within a 10km radius of the pickup location.
3. **AI Negotiation:** - An **AI Agent** calls the movers via **Twilio**.
   - The agent negotiates the price and confirms that there are no hidden fees.
   - The conversation is summarized and parsed into a structured `JSON` format.
4. **Risk Analysis:** A **PyTorch ML model** processes the JSON summaries to perform risk analysis (evaluating reliability, price consistency, and historical data) to select the absolute best mover.
5. **Confirmation & Payment:** - The selected mover confirms the deal via **WhatsApp** (powered by Twilio).
   - The user completes the payment, and the mover is officially "Active".
6. **Real-time Tracking:** The mover provides status updates via WhatsApp, which are instantly reflected on the user's **Dashboard**.

---

## 🛠️ Tech Stack

* **Frontend:** [Insert your frontend framework, e.g., React.js / Next.js]
* **Backend:** [Insert your backend, e.g., Node.js / Python FastAPI]
* **AI & Machine Learning:** * PyTorch (Risk Analysis Model)
  * LLM/AI Voice Agent (For automated calling & JSON summarization)
* **APIs & Integrations:**
  * **Google Maps/Places API:** Geolocation and mover discovery
  * **Twilio:** Voice calls, OTPs, and WhatsApp Business API integrations
* **Database:** [Insert your DB, e.g., PostgreSQL / MongoDB]

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- Python 3.9+ (For PyTorch & AI Agent)
- Node.js & npm (For web dashboard)
- Accounts/API Keys for: Google Cloud Platform, Twilio, and your AI provider.

### Environment Variables
Create a `.env` file in the root directory and add your API keys:

```env
# Google API
GOOGLE_MAPS_API_KEY=your_google_api_key

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=your_whatsapp_number
TWILIO_PHONE_NUMBER=your_caller_number

# AI / ML
GEMINI_KEY=your_llm_api_key  # Or relevant AI agent API
MODEL_PATH=./models/pytorch_risk_model.pth

# Database
DATABASE_URL=your_database_connection_string
