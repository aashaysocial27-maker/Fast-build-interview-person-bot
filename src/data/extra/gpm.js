// Product Manager (general) — additional real-world interview questions.
export default {
  add: {
    "gpm-m1": [
      {
        id: "gpm-m1-q4",
        q: "Design a product to help elderly people stay connected with their families.",
        tip: "Empathy for a less tech-savvy user is the core of this question — design for their constraints.",
        keyPoints: [
          "Deep empathy for elderly users' constraints (vision, dexterity, tech comfort)",
          "Considers both sides: elderly users and family members",
          "Simple, focused solution rather than many features",
          "Accessibility and setup handled by family",
          "Metrics on connection frequency and wellbeing",
        ],
        modelAnswer: `**Clarify:** elderly people living alone, connecting with children and grandchildren who live far away.

**Users:** (1) the elderly person — may have weaker eyesight, hearing or dexterity, and low comfort with apps; (2) family members — busy, want reassurance and easy ways to share.

**Pain points:** smartphones are confusing; video calls need too many steps; families forget to call; loneliness.

**Solution: a "family frame" tablet experience**
- **One-tap video calls** — big photo buttons for each family member, no menus.
- **Photo stream** — family share photos from their phones; they appear automatically, and grandparents can react with one tap.
- **Gentle nudges** to family: "You haven't called Grandma in 5 days."
- **Family-managed setup** — everything configured remotely by a family member; the device auto-updates.
- Accessibility: large text, high contrast, loud audio, voice commands.

**MVP:** one-tap calls + photo stream.

**Metrics:** calls per week per household, photos viewed and reacted to, 90-day retention, and a self-reported loneliness score in surveys.`,
      },
    ],
    "gpm-m2": [
      {
        id: "gpm-m2-q4",
        q: "Engineering says your feature will take 3 months instead of 1. What do you do?",
        tip: "Understand why, then trade scope, time and resources — and communicate.",
        keyPoints: [
          "Seeks to understand the estimate without pushing back blindly",
          "Revisits the problem and the must-have scope",
          "Explores options: cut scope, phase delivery, add resources, change approach",
          "Makes a decision based on business impact",
          "Communicates the trade-off to stakeholders",
        ],
        modelAnswer: `**1. Understand the estimate.** Sit with the engineering lead: what drives the extra two months? Hidden complexity, tech debt, dependencies or unclear requirements? Their estimate is information, not resistance.

**2. Revisit the goal.** What problem are we solving and what does the user minimally need? Often 20% of the scope delivers 80% of the value.

**3. Generate options:**
- **Cut scope** to an MVP that fits in 1 month.
- **Phase it:** ship the core in month 1, the rest later.
- **Change the approach:** use an existing service or a simpler design.
- **Add people** — only if the work can actually be parallelized.
- **Accept 3 months** if the full version is truly needed and worth more than other roadmap items.

**4. Decide on impact:** what does the delay cost (a deal, a seasonal window)? Compare with what else the team could do.

**5. Communicate:** explain the trade-off and new plan to stakeholders early, with the reasoning. Surprises damage trust more than delays.`,
      },
    ],
    "gpm-m3": [
      {
        id: "gpm-m3-q4",
        q: "Tell me about a time you made a decision with incomplete data.",
        tip: "STAR: show how you assessed risk, used available signals, and made the decision reversible.",
        keyPoints: [
          "Clear STAR structure",
          "Explains what data was missing and why waiting was costly",
          "Uses available signals and judgment",
          "Reduces risk (reversible decision, small test)",
          "Result and reflection",
        ],
        modelAnswer: `**Situation:** For our university's student-run food delivery service, we had to choose whether to add late-night delivery before exam season. We had only two weeks of order data.

**Task:** Decide quickly — exam season was 10 days away.

**Action:**
- Used the **signals we had**: 30% of app searches after 10pm returned "closed", and a quick poll of 120 students showed strong interest.
- Identified the main risk: not enough drivers late at night.
- Made it **reversible**: a two-week pilot on three nights per week, with volunteer drivers and a clear success bar (40+ orders per night).
- Set a review date in advance.

**Result:** We averaged 65 orders per night; late-night became permanent and grew weekly revenue by 25%.

**Learning:** When data is incomplete, make the decision small and reversible, define success upfront, and let the test generate the data.`,
      },
    ],
  },
  modules: [
    {
      id: "gpm-m4",
      title: "Strategy & Estimation",
      emoji: "🧮",
      summary: "Market sizing, market entry, monetization and competitive response.",
      questions: [
        {
          id: "gpm-m4-q1",
          q: "Estimate how many food-delivery orders are placed in your city per day.",
          tip: "State assumptions out loud, structure top-down or bottom-up, sanity-check the number.",
          keyPoints: [
            "Clarifies scope (city, platforms, what counts as an order)",
            "Clear structured approach (population → users → frequency)",
            "States reasonable assumptions explicitly",
            "Does the math clearly",
            "Sanity-checks with another angle",
          ],
          modelAnswer: `**Clarify:** all food-delivery apps, a typical weekday, a city of **~5 million people**.

**Top-down, demand side:**
1. Population: 5M.
2. People who use delivery apps (urban, ~15–55 years old, smartphone): about **40%** → 2M users.
3. Order frequency: heavy users ~2×/week, average users ~2×/month. Blended ≈ **4 orders per month** per user.
4. Orders per month: 2M × 4 = 8M → per day ≈ **265,000**.
5. Household adjustment: some orders serve several people, so I'll reduce by ~20% → **≈ 210,000 orders/day**.

**Sanity check, supply side:** ~6,000 restaurants on apps × ~35 orders/day each ≈ **210,000**. The two methods agree.

**Answer:** roughly **200,000–250,000 orders per day**, higher on weekends and in bad weather.

*Interviewers care about structure and clear assumptions more than the exact number — say each assumption out loud.*`,
        },
        {
          id: "gpm-m4-q2",
          q: "Should a ride-sharing company enter the grocery delivery market?",
          tip: "Use a market-entry framework: market, company fit, competition, economics, risks, recommendation.",
          keyPoints: [
            "Clarifies the company's goal for entering",
            "Assesses market size and growth",
            "Evaluates synergies: drivers, users, logistics, brand",
            "Analyzes competition and unit economics",
            "Gives a clear recommendation with a test plan",
          ],
          modelAnswer: `**Goal:** grow revenue per user and utilize drivers during off-peak hours.

**1. Market:** large and growing grocery spend, with online penetration still low in many cities — room to grow, but margins are thin.

**2. Company fit (synergies):**
- **Driver network** with idle time between rides.
- **Existing users and payment details** → low acquisition cost; cross-sell in the app.
- Logistics, routing and mapping expertise.
- Brand trust for fast delivery (if it already does food delivery, even more synergy).

**3. Competition:** dedicated grocery apps, supermarkets' own delivery, quick-commerce startups. Differentiation: bundling (rides + groceries in one membership) and speed.

**4. Economics:** grocery orders have large baskets but low margins; picking and packing is costly. Partnering with supermarkets (they pick, we deliver) avoids warehouse costs.

**5. Risks:** low margins, operational complexity (substitutions, freshness), distracting from the core.

**Recommendation:** **Yes, via partnerships, not dark stores** — launch in 2 dense cities, membership bundle, measure contribution margin per order and cross-sell rate; expand only if unit economics are positive within 6 months.`,
        },
        {
          id: "gpm-m4-q3",
          q: "How would you monetize a free messaging app with 2 billion users?",
          tip: "Consider users' trust. List options, evaluate them, and pick a strategy.",
          keyPoints: [
            "Considers user trust and privacy as constraints",
            "Lists several monetization models",
            "Evaluates options by revenue potential, user impact and fit",
            "Recommends a primary strategy with rationale",
            "Suggests metrics and a phased rollout",
          ],
          modelAnswer: `**Constraint:** the product's value is private, simple, ad-free messaging. Anything that damages trust can destroy the network effect.

**Options:**
1. **Ads in chats** — high revenue, but very high trust damage. ❌
2. **Business messaging** — companies pay to message customers (order updates, support), and for verified business accounts. ✅
3. **Payments** — fees on merchant transactions in markets where adoption is high.
4. **Premium features** — extra storage, multi-device features, custom themes for power users and small businesses.
5. **Ads in a separate surface** (status / channels tab), not in private chats.

**Evaluation:** business messaging has the best fit — users *want* to talk to businesses (delivery updates, support), businesses already pay for SMS, and it doesn't touch private chats.

**Recommendation:** lead with **paid business messaging + business tools**, test payments in strong markets, and keep private chats ad-free.

**Metrics:** businesses paying, paid conversations per business, revenue per conversation, and guardrails on user satisfaction, spam reports and blocks.`,
        },
        {
          id: "gpm-m4-q4",
          q: "A competitor launches a cheaper version of your product. How do you respond?",
          tip: "Don't reflexively cut prices. Understand who's at risk and where you're differentiated.",
          keyPoints: [
            "Understands the competitor's offer and target segment",
            "Assesses impact with data (churn, win/loss)",
            "Avoids a reflexive price war",
            "Strengthens differentiation and value communication",
            "Considers a targeted response such as a lighter tier",
          ],
          modelAnswer: `**1. Understand the threat.** What's cheaper and what's missing? Who are they targeting — price-sensitive small customers or our core segment?

**2. Measure impact.** Watch churn, win/loss reasons and trial conversion by segment. Often only the low end is affected.

**3. Avoid a reflexive price war.** It destroys margins and signals that we compete only on price.

**4. Respond by segment:**
- **Core customers:** reinforce value — features, reliability, support, integrations. Help sales show total cost of ownership, not just price.
- **Price-sensitive segment:** consider a **lighter tier** with limited features, so we capture them without discounting the main product.
- **Retention:** proactive outreach to at-risk accounts, annual plan incentives.

**5. Long-term:** invest in differentiation that is hard to copy (network effects, data, ecosystem).

**Example:** when a cheaper note-taking app launched, a basic plan for students protected market share without lowering the pro price.`,
        },
      ],
    },
    {
      id: "gpm-m5",
      title: "Analytical & Technical PM",
      emoji: "🔬",
      summary: "Trade-off decisions, technical communication, goal setting and metric traps.",
      questions: [
        {
          id: "gpm-m5-q1",
          q: "How would you decide whether a social app's feed should show more short videos or more posts from friends?",
          tip: "Clarify goals, identify competing metrics, test, and look at long-term health.",
          keyPoints: [
            "Clarifies company goals and user needs",
            "Recognizes the trade-off: engagement vs. connection",
            "Defines metrics for both, including long-term health",
            "Proposes experiments with segment analysis",
            "Makes a nuanced recommendation (personalized mix)",
          ],
          modelAnswer: `**1. Goals:** what does the company optimize for — time spent, meaningful connection, creator growth? The answer shapes the decision.

**2. The trade-off:** short videos usually increase **time spent**; friend posts drive **connection and retention**, and keep people posting (supply). Too much video can make the app feel like a different product and reduce posting.

**3. Metrics:**
- Engagement: time spent, sessions per day.
- Connection: comments and DMs between friends, posts created.
- Long-term health: 30/90-day retention, user sentiment ("I feel connected").

**4. Experiment:** A/B test several mixes (e.g., 20%, 35%, 50% video). Run long enough to see retention effects, and analyze by segment — teens vs. adults, heavy vs. light posters.

**5. Recommendation:** likely a **personalized mix** — more video for users who engage with it, more friend content for users whose friends post often — with a guardrail that posting and friend interactions don't decline.`,
        },
        {
          id: "gpm-m5-q2",
          q: "How would you explain what an API is to a non-technical stakeholder, and how do you work with engineers on technical decisions?",
          tip: "Use a simple analogy, then show technical credibility and respect for engineering ownership.",
          keyPoints: [
            "Clear, accurate analogy for an API",
            "Explains why it matters to the business",
            "Asks good questions and understands trade-offs",
            "Respects engineers' ownership of the how",
            "Brings user and business context to decisions",
          ],
          modelAnswer: `**Explaining an API:** "An API is like a restaurant's menu and waiter. You don't go into the kitchen — you order from the menu, and the waiter brings back your dish. Software uses APIs the same way: one system asks another for something in an agreed format and gets a response, without needing to know how the other works inside."

**Why it matters to the business:** APIs let us connect with partners, reuse functionality and build integrations customers pay for.

**Working with engineers on technical decisions:**
1. **I own the *what* and *why*; they own the *how*.** I bring the user problem, constraints and business priorities.
2. **I ask questions to understand trade-offs:** "What does option A make harder later? What's the risk?" — so I can weigh them against business needs.
3. **I learn enough to be credible** — system basics, data models, reading API docs.
4. **Make trade-offs explicit and documented** — e.g., a faster launch with tech debt that we schedule to pay back.
5. **Involve engineers early** in discovery so solutions are better and estimates realistic.`,
        },
        {
          id: "gpm-m5-q3",
          q: "How would you set goals (OKRs) for a new product team?",
          tip: "Connect company strategy → team objective → measurable key results; avoid output-only goals.",
          keyPoints: [
            "Aligns with company strategy",
            "Inspiring, qualitative objective",
            "Measurable outcome-based key results, not outputs",
            "Sets baselines and ambitious but realistic targets",
            "Regular check-ins and adjustment",
          ],
          modelAnswer: `**1. Start from company strategy.** E.g., the company wants to grow retention of new customers.

**2. Draft with the team** — goals people help write are goals they believe in.

**3. Objective:** qualitative and motivating — *"Make every new customer successful in their first week."*

**4. Key results — outcomes, not outputs:**
- Increase week-1 activation (completes core action) from **35% → 50%**.
- Reduce time-to-first-value from **3 days → 1 day**.
- Raise onboarding CSAT from **3.8 → 4.3**.

*Not* "launch a new onboarding flow" — that's an output; it goes in the plan, not the KR.

**5. Make them measurable:** baseline data, dashboards ready before the quarter starts. Targets ambitious enough that 70% achievement is a good result.

**6. Keep them alive:** weekly check-ins on progress, mid-quarter review to adjust initiatives (not usually the goals), and a retrospective at the end.`,
        },
        {
          id: "gpm-m5-q4",
          q: "Sign-ups are up 30% this quarter but revenue is flat. What's going on?",
          tip: "Walk the funnel from sign-up to revenue and look for mix and quality changes.",
          keyPoints: [
            "Breaks revenue into funnel stages",
            "Checks sign-up source and quality changes",
            "Looks at activation, conversion and retention",
            "Considers pricing and revenue mix changes",
            "Proposes how to verify and act",
          ],
          modelAnswer: `**Revenue = sign-ups × activation × paid conversion × revenue per customer × retention.** If sign-ups rose but revenue didn't, something downstream fell.

**Hypotheses to check:**
1. **Lower-quality sign-ups** — a new channel (viral campaign, giveaway, student promo) brought users unlikely to pay. Segment by acquisition source.
2. **Activation dropped** — onboarding broke or new users didn't reach the core value.
3. **Conversion lag** — new users may convert later; compare cohorts at the same age.
4. **Churn increased** among existing paying customers, offsetting new revenue.
5. **Revenue per customer fell** — discounts, more users on cheaper plans, or downgrades.
6. **Measurement** — sign-up definition or tracking changed.

**How to verify:** cohort analysis by sign-up month and channel through each funnel step; revenue bridge (new, expansion, contraction, churn).

**Action example:** if a promo channel brought non-buyers, shift budget to channels with higher paid conversion and fix onboarding for the new segment.`,
        },
      ],
    },
  ],
};
