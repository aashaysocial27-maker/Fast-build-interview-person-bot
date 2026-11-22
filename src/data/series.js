// Structured question series: each role has modules, each module has ordered questions
// with a written model answer and the key points an evaluator should look for.
// IDs must stay stable — practice history is stored against them.

export const SERIES = {
  /* ===================== AI PRODUCT MANAGER ===================== */
  pm: [
    {
      id: "pm-m1",
      title: "AI Product Sense",
      emoji: "💡",
      summary: "Deciding when AI is the right tool and designing AI features users trust.",
      questions: [
        {
          id: "pm-m1-q1",
          q: "How would you decide whether a product problem should be solved with an LLM, classical ML, or plain rules?",
          tip: "Start from the problem's properties, not the technology. Use a simple decision framework.",
          keyPoints: [
            "Start from the user problem and required accuracy",
            "Rules when logic is known, stable and must be exact",
            "Classical ML for structured data and narrow prediction with labels",
            "LLMs for unstructured language, open-ended or generative tasks",
            "Consider cost, latency, explainability and error tolerance",
            "Prototype cheaply and validate with evals before committing",
          ],
          modelAnswer: `**Framework: problem first, then the cheapest tool that meets the quality bar.**

1. **Clarify the problem** — inputs, outputs, how often it runs, and the cost of a wrong answer.
2. **Rules** if the logic is known, stable and must be exact (tax calculation, eligibility checks). Cheap, explainable, testable.
3. **Classical ML** if it's a narrow prediction on structured data and we have labels (churn, fraud, ranking). Fast and cheap at scale.
4. **LLMs** if the input is unstructured language or the output is open-ended (summarize tickets, draft replies, extract fields from messy documents) — or if we need to ship before we have training data.

**Then check constraints:** error tolerance (can a human review?), latency, cost per request at our volume, privacy, and explainability needs.

**Often it's hybrid:** an LLM extracts structure, rules enforce policy, and ML ranks results.

I'd prototype the simplest option in a week, build a small eval set of ~100 real examples, and only move up in complexity if the simpler approach misses the bar.`,
        },
        {
          id: "pm-m1-q2",
          q: "Design an AI study assistant for university students. Who are the users, what are the key features, and how do you measure success?",
          tip: "Use a product design structure: users → pain points → prioritized solutions → MVP → metrics → risks.",
          keyPoints: [
            "Segments users and picks one to focus on",
            "Identifies concrete pain points",
            "Prioritizes features into an MVP",
            "Grounds answers in course material to limit hallucination",
            "Defines a north-star metric tied to learning outcomes",
            "Addresses academic integrity and privacy risks",
          ],
          modelAnswer: `**Goal:** help students learn faster and better — not just finish homework.

**Users:** first-year STEM students (high volume, struggle with fundamentals), exam crammers, and international students studying in a second language. I'd focus on **first-years**.

**Pain points:** lectures move fast, office hours are limited, notes are scattered, they don't know what they don't know.

**Features (prioritized):**
1. **Ask-your-course** — upload slides/notes; answers are *grounded* in that material with citations (limits hallucination).
2. **Auto-generated practice quizzes** with explanations (active recall).
3. **Socratic mode** — hints instead of answers, to protect learning and academic integrity.
4. Later: spaced-repetition review and study plans.

**MVP:** 1 + 2 for a single course, piloted with one department.

**Metrics:** North star = **weekly active learners who complete a practice session**. Supporting: quiz-score improvement over time, grounded-answer accuracy (evals), retention week-over-week. Guardrail: % of answers flagged wrong, reported misuse.

**Risks:** cheating → Socratic default and instructor controls; privacy → no training on student data; wrong answers → citations and a "report" button.`,
        },
        {
          id: "pm-m1-q3",
          q: "How do you handle hallucinations in a customer-facing AI product?",
          tip: "Cover prevention, detection, UX mitigation and measurement.",
          keyPoints: [
            "Defines hallucination risk relative to the use case",
            "Grounding / RAG with citations",
            "Constraining scope and allowing 'I don't know'",
            "Evals and monitoring to measure the rate",
            "UX: show sources, human review for high stakes, feedback loop",
          ],
          modelAnswer: `Hallucinations can't be eliminated, so I **manage them by risk level**.

**1. Assess the stakes.** A creative writing tool can tolerate errors; a medical or billing answer can't. This decides how strict we are.

**2. Prevent**
- **Ground answers** in trusted data (RAG) and require citations.
- **Narrow the scope** in the system prompt and let the model say "I don't know".
- Use **structured outputs** and tools (e.g., call the order API instead of guessing an order status).

**3. Detect**
- Offline **eval set** of real questions with known answers; track a hallucination rate before every model or prompt change.
- Online: user thumbs-down, citation-click checks, sampled human review.

**4. Mitigate in the UX**
- Show sources inline, signal uncertainty, make it easy to escalate to a human.
- For high-stakes actions, require **human confirmation**.

**5. Close the loop:** flagged failures go back into the eval set so regressions are caught.`,
        },
      ],
    },
    {
      id: "pm-m2",
      title: "Metrics & Evals",
      emoji: "📏",
      summary: "Measuring whether an AI feature is actually good — before and after launch.",
      questions: [
        {
          id: "pm-m2-q1",
          q: "How would you build an evaluation plan before launching a generative AI feature?",
          tip: "Think: define quality → collect examples → grade → set launch bars → monitor.",
          keyPoints: [
            "Defines what 'good' means with clear criteria",
            "Builds a representative eval dataset including edge cases",
            "Mix of automated checks, LLM-as-judge and human review",
            "Sets launch thresholds including safety guardrails",
            "Plans online monitoring and A/B testing after launch",
          ],
          modelAnswer: `**1. Define quality.** Write down 3–5 criteria with the team: e.g., *correct, grounded, helpful, safe, on-brand*. Turn each into a rubric with examples of pass/fail.

**2. Build the dataset.** 100–300 real or realistic inputs: common cases, edge cases, adversarial prompts (jailbreaks, sensitive topics), and different user segments.

**3. Grade.**
- **Code checks** for anything deterministic (format, length, required fields).
- **LLM-as-judge** for rubric criteria — calibrated against human labels first.
- **Human review** on a sample, especially for safety.

**4. Set launch bars.** e.g., ≥90% correctness, 0 critical safety failures, p95 latency < 4s, cost per task < $0.02. Compare against the current experience as a baseline.

**5. After launch.** A/B test on business metrics (task completion, retention, CSAT), monitor thumbs-down rate and flagged outputs, and add every new failure to the eval set so the suite grows with the product.`,
        },
        {
          id: "pm-m2-q2",
          q: "What online and offline metrics would you track for an AI code-completion product?",
          tip: "Separate model quality (offline) from user value (online) and add guardrails.",
          keyPoints: [
            "Offline: benchmark accuracy such as pass@k or exact match",
            "Online: acceptance rate and retained code after N minutes",
            "Productivity outcomes like time to complete tasks",
            "Latency as a core quality metric",
            "Guardrails: security issues, cost, bugs introduced",
          ],
          modelAnswer: `**Offline (model quality, before shipping):**
- **pass@k** on unit-test based benchmarks; exact match / edit similarity on held-out repos.
- Latency per suggestion and cost per 1K suggestions.

**Online (user value):**
- **Acceptance rate** — % of shown suggestions accepted. Easy to game, so pair it with:
- **Retention of accepted code** — % still present after 30 minutes / at commit.
- **Characters or % of code written by AI** per active user.
- **Weekly active developers** and retention.
- Outcome metrics: time to complete tasks, PR cycle time (via studies or opt-in telemetry).

**Guardrails:**
- p95 latency (suggestions arriving late are useless — target < 300 ms for inline).
- Security: % of suggestions with known vulnerable patterns or secrets.
- Bugs or reverts linked to AI-written code.

**North star:** *retained AI-written code per active developer per week* — it captures both usage and real usefulness.`,
        },
        {
          id: "pm-m2-q3",
          q: "Your LLM-powered support bot has high usage but CSAT dropped 8%. How do you investigate?",
          tip: "Clarify → segment → form hypotheses → read transcripts → fix and measure.",
          keyPoints: [
            "Clarifies timeframe, measurement changes and baseline",
            "Segments by intent, channel, user type and resolution",
            "Reads actual transcripts of low-CSAT conversations",
            "Hypotheses: wrong answers, no escalation, loops, tone",
            "Proposes fixes and measures resolution rate, not just usage",
          ],
          modelAnswer: `**1. Validate the drop.** When did it start? Did the survey, sampling or traffic mix change? Is the drop in bot conversations only, or overall?

**2. Segment.** By intent (billing vs. technical), channel, new vs. existing customers, language, and **resolved vs. escalated**. Usually the drop is concentrated somewhere.

**3. Read transcripts.** Pull 50 low-CSAT conversations from the worst segment. Typical root causes:
- **Wrong or made-up answers** (hallucination, stale knowledge base).
- **No path to a human** — users stuck in loops.
- **Deflection ≠ resolution** — high usage because people retry.
- Tone or verbosity issues; a recent prompt or model change.

**4. Quantify the top causes** by tagging conversations (an LLM classifier works well here).

**5. Fix and measure.** e.g., update the knowledge base, add an "escalate after 2 failed turns" rule, add evals for the failing intents. Track **resolution rate, escalation rate and CSAT by segment** — usage alone is a vanity metric for support bots.`,
        },
      ],
    },
    {
      id: "pm-m3",
      title: "AI Strategy & Trade-offs",
      emoji: "♟️",
      summary: "Model choice, build vs. buy, and the economics of AI features.",
      questions: [
        {
          id: "pm-m3-q1",
          q: "A cheaper model is 40% less expensive but 5% worse on your evals. Do you switch? Walk me through the decision.",
          tip: "It depends — show *what* it depends on and how you'd test it.",
          keyPoints: [
            "Asks where the 5% drop happens and how severe the failures are",
            "Quantifies cost savings vs. impact on user and business metrics",
            "Considers routing: cheap model for easy tasks, strong model for hard",
            "Runs an A/B test before deciding",
            "Mentions latency and other non-cost benefits",
          ],
          modelAnswer: `**It depends on where the 5% comes from and what it costs us.**

1. **Inspect the failures.** Is the drop spread evenly or concentrated in critical cases (e.g., safety, high-value customers)? 5% worse on formatting is not the same as 5% more wrong answers.
2. **Size the savings.** 40% of what? If AI spend is $500k/yr, that's $200k — meaningful. If it's $5k, it isn't worth the risk.
3. **Translate quality into business impact.** Does the drop change task completion, CSAT, or churn? Run an **A/B test** on a slice of traffic.
4. **Consider routing** — use the cheap model for easy/high-volume requests and the stronger model for hard ones. Often you capture most of the savings with no quality loss.
5. **Other factors:** the cheaper model may be faster (better UX), and prompt tuning might close part of the gap.

**My default:** don't switch blindly; test routing first, and switch only if online metrics hold within an agreed threshold.`,
        },
        {
          id: "pm-m3-q2",
          q: "Should we fine-tune our own model, use RAG, or just prompt a frontier model? How do you decide?",
          tip: "Match each approach to the problem it solves: knowledge vs. behavior vs. cost.",
          keyPoints: [
            "Start with prompting as the baseline",
            "RAG when the model needs fresh or proprietary knowledge",
            "Fine-tuning for consistent behavior, format or style, or to cut cost",
            "Considers data availability, maintenance and time to market",
            "Decision driven by evals",
          ],
          modelAnswer: `**Start simple and escalate only when evals show a gap.**

| Approach | Solves | Cost/effort |
|---|---|---|
| **Prompting** | Most tasks, fast iteration | Lowest |
| **RAG** | Model lacks *knowledge* — private, large or changing data | Medium (retrieval infra) |
| **Fine-tuning** | Model lacks *behavior* — consistent format, tone, a narrow task at lower cost/latency | Highest (data, training, upkeep) |

**Decision process:**
1. Prompt a frontier model with good instructions and examples; measure on an eval set.
2. If errors come from **missing facts** → add RAG.
3. If errors come from **inconsistent behavior** at high volume, or cost/latency is too high → consider fine-tuning a smaller model, *if* we have thousands of quality examples.

**Also weigh:** time to market, team skills, and maintenance — fine-tuned models need retraining when base models improve. In practice most products ship with **prompting + RAG**.`,
        },
        {
          id: "pm-m3-q3",
          q: "How would you price an AI feature whose cost scales with tokens used?",
          tip: "Connect cost structure, customer value and predictability.",
          keyPoints: [
            "Understands unit economics and cost per user distribution",
            "Value-based pricing rather than pure cost-plus",
            "Options: seats, usage/credits, tiers, hybrid",
            "Protects margins with limits, fair-use or caching",
            "Predictability for customers and testing prices",
          ],
          modelAnswer: `**1. Understand unit economics.** Cost per task and the *distribution* of usage — usually a few power users drive most cost. Model gross margin at the 50th and 95th percentile user.

**2. Price on value, not tokens.** What is the outcome worth? (e.g., an hour of analyst time saved.) Customers rarely understand tokens.

**3. Choose a model:**
- **Included in plan / per seat** — simple, drives adoption; needs fair-use limits.
- **Usage-based / credits** — aligns cost and revenue; less predictable for buyers.
- **Hybrid** (most common): seats with an included allowance, plus paid add-on credits or a premium tier.

**4. Protect margin:** rate limits, routing easy tasks to cheaper models, prompt caching, and monitoring heavy users.

**5. Test:** pilot price points with a segment, watch conversion and margins, and revisit as model costs fall (they drop quickly — leave room to improve margins rather than lowering price immediately).`,
        },
      ],
    },
  ],

  /* ===================== PRODUCT MANAGER (general) ===================== */
  gpm: [
    {
      id: "gpm-m1",
      title: "Product Sense & Design",
      emoji: "🎨",
      summary: "Classic product design questions: users, pain points, solutions and prioritization.",
      questions: [
        {
          id: "gpm-m1-q1",
          q: "Design a product to help college students find internships.",
          tip: "Clarify goal → pick a user segment → pain points → brainstorm → prioritize → MVP → metrics.",
          keyPoints: [
            "Clarifies the goal and constraints",
            "Segments users and chooses one with a reason",
            "Lists specific pain points",
            "Brainstorms solutions and prioritizes by impact vs. effort",
            "Defines an MVP and success metrics",
          ],
          modelAnswer: `**Clarify:** Are we a startup or an existing platform? I'll assume a new mobile-first product, goal = more students landing relevant internships.

**Users:** (a) first/second-years with no experience, (b) final-years seeking return offers, (c) employers. I'll focus on **(a)** — the most underserved; they don't know where to start.

**Pain points:**
1. Don't know which roles fit their skills.
2. Résumés with little experience get filtered out.
3. Applications disappear into a black hole — no feedback.

**Solutions:**
- Skill-based **role matching quiz** → personalized list of roles.
- **Résumé builder** that turns class projects into experience bullets.
- **Application tracker** with reminders and status updates.
- Alumni referral connections.

**Prioritize (impact × effort):** role matching + application tracker for the MVP; referrals later (needs network effects).

**Metrics:** North star = **students who get at least one interview per month**. Supporting: applications per active user, response rate, D30 retention.`,
        },
        {
          id: "gpm-m1-q2",
          q: "What's your favorite product, and how would you improve it?",
          tip: "Pick something you know deeply. Explain *why* it works, then a targeted improvement for a specific user.",
          keyPoints: [
            "Explains who the product is for and why it succeeds",
            "Uses specific, insightful observations",
            "Identifies a real gap for a specific user segment",
            "Proposes a focused improvement with a rationale",
            "Defines how to measure the improvement",
          ],
          modelAnswer: `**Example: Spotify.**

**Why it works:** For casual listeners the core job is "play something I'll like without effort." Spotify nails this with personalization (Discover Weekly, Daily Mixes), a huge catalog and seamless cross-device playback. The free tier builds habit, then converts users to premium.

**Gap:** Users who listen with friends or family (shared cars, parties) get a messy experience — one person's mix pollutes their recommendations, and group listening is hidden.

**Improvement:** **"Group Mode"** — tap to start a session; everyone nearby can add songs; the algorithm blends tastes; listening during the session doesn't affect anyone's personal recommendations.

**Why it matters:** protects recommendation quality (core value), increases social discovery and invites non-users into the app.

**Metrics:** sessions started per week, % of sessions with 2+ contributors, new sign-ups from session invites, and a guardrail on personal-recommendation satisfaction.

*Tip: structure — user → why it wins → gap → solution → metrics.*`,
        },
        {
          id: "gpm-m1-q3",
          q: "How do you prioritize a roadmap when everything seems important?",
          tip: "Show a framework, but emphasize strategy alignment and stakeholder communication.",
          keyPoints: [
            "Anchors on company and product goals",
            "Uses a framework like RICE or impact vs. effort",
            "Balances quick wins, big bets and tech debt",
            "Validates with data and customer evidence",
            "Communicates trade-offs transparently to stakeholders",
          ],
          modelAnswer: `**1. Anchor on goals.** Start with this quarter's company objective (e.g., improve retention). Anything that doesn't move it gets deprioritized, however loud the request.

**2. Score consistently.** I use **RICE** — Reach × Impact × Confidence ÷ Effort — so debates become about inputs, not opinions. Confidence forces honesty about evidence.

**3. Balance the portfolio.** Roughly: most effort on core goals, some on quick wins, and a fixed slice for tech debt and bets — otherwise velocity decays.

**4. Validate.** Use data (funnel drop-offs), customer interviews and support tickets. Cheap experiments can raise confidence before committing a big build.

**5. Communicate.** Publish the ranked list with the reasoning, say clearly what we are *not* doing and why, and revisit monthly as we learn.

**Example:** at a club app I ranked 12 requests with RICE; a notification fix scored highest (high reach, low effort) and lifted weekly retention 6%, while a requested redesign was moved to next quarter with stakeholder agreement.`,
        },
      ],
    },
    {
      id: "gpm-m2",
      title: "Execution & Metrics",
      emoji: "📊",
      summary: "Defining success, diagnosing metric changes and making launch decisions.",
      questions: [
        {
          id: "gpm-m2-q1",
          q: "How would you define success metrics for a new 'Save for later' feature in a shopping app?",
          tip: "Goal → user actions → north star → supporting metrics → guardrails.",
          keyPoints: [
            "States the feature's goal for users and the business",
            "Picks a primary metric tied to the goal",
            "Adds adoption, engagement and conversion metrics",
            "Includes guardrails against cannibalization",
            "Explains how to measure (A/B test)",
          ],
          modelAnswer: `**Goal:** users who aren't ready to buy can keep items without cluttering the cart — so they **come back and purchase later**.

**Primary metric:** **purchase conversion from saved items within 30 days.**

**Supporting metrics:**
- *Adoption:* % of weekly active users who save at least one item.
- *Engagement:* return visits to the saved list per user.
- *Outcome:* overall revenue per user and 30-day retention for savers vs. non-savers.

**Guardrails:**
- Immediate checkout conversion shouldn't drop (users "saving" instead of buying now).
- Cart abandonment rate, app performance.

**How to measure:** A/B test with 50/50 split for 4 weeks; compare revenue per user and retention, not just feature usage. Watch for novelty effects in week one.`,
        },
        {
          id: "gpm-m2-q2",
          q: "Daily active users dropped 10% week-over-week. How do you diagnose it?",
          tip: "External vs. internal, then segment. Don't jump to conclusions.",
          keyPoints: [
            "Checks data validity and tracking issues first",
            "Considers external factors such as seasonality or competitors",
            "Considers internal changes such as releases or outages",
            "Segments by platform, region, user type and funnel step",
            "Forms and tests hypotheses, then proposes an action",
          ],
          modelAnswer: `**1. Is it real?** Check logging changes, dashboard definitions, and data pipeline delays. Many "drops" are tracking bugs.

**2. Sudden or gradual?** Sudden → release, outage, tracking. Gradual → product or market trend.

**3. External factors:** seasonality (holidays, exam periods), competitor launch, news, app store changes.

**4. Internal factors:** recent releases, experiments, notification or email changes, performance regressions, outages.

**5. Segment** to localize the drop: platform (iOS/Android/web), app version, country, new vs. returning users, acquisition channel, and funnel step (opens → logins → core action).

**Example:** if the drop is only Android on the latest version, it's likely a bug in that release → roll back or hotfix.

**6. Act and confirm:** fix, then monitor recovery by segment, and add an alert so we catch it faster next time.`,
        },
        {
          id: "gpm-m2-q3",
          q: "Your A/B test shows +5% conversion but −3% retention. Do you launch?",
          tip: "Weigh long-term vs. short-term, check significance, dig into why.",
          keyPoints: [
            "Checks statistical significance and test validity",
            "Understands why the metrics moved in opposite directions",
            "Weighs long-term value (LTV) over short-term gains",
            "Considers segment-level results",
            "Proposes a next step: iterate, partial rollout or more testing",
          ],
          modelAnswer: `**Not yet — first understand the trade-off.**

1. **Validate:** are both results statistically significant? Was the test long enough to capture retention (at least 2–4 weeks)? Any sample-ratio mismatch?
2. **Understand why:** maybe a more aggressive prompt converts users who aren't a good fit, and they churn. Read qualitative feedback and segment results.
3. **Translate to value:** model **lifetime value** — +5% conversion × lower retention. If LTV goes down, it's a net loss even though the headline looks good.
4. **Segment:** maybe the change works for one segment (e.g., returning users) and hurts another (new users). Launch only where it's positive.
5. **Iterate:** keep the part that drives conversion, fix what causes churn, and re-test.

**Default:** I wouldn't trade long-term retention for short-term conversion — retention compounds.`,
        },
      ],
    },
    {
      id: "gpm-m3",
      title: "Behavioral & Leadership",
      emoji: "🤝",
      summary: "STAR stories: influence, conflict, failure and ownership.",
      questions: [
        {
          id: "gpm-m3-q1",
          q: "Tell me about a time you influenced a decision without having authority.",
          tip: "Use STAR: Situation, Task, Action, Result. Spend most of your time on Actions; quantify the Result.",
          keyPoints: [
            "Clear STAR structure",
            "Explains the stakeholders and their incentives",
            "Uses data, empathy and collaboration rather than pressure",
            "Concrete, measurable result",
            "Reflects on what they learned",
          ],
          modelAnswer: `**Situation:** In my university project team, we were building a campus events app. The developers wanted to add a chat feature; I believed users' real problem was finding events at all.

**Task:** Convince the team to prioritize discovery — without being the official lead.

**Action:**
- Ran **10 quick user interviews** and a 40-person survey: 70% said they missed events because they didn't know about them; 8% wanted chat.
- Shared the findings visually and **acknowledged the devs' reasons** (chat was technically interesting) — proposed chat as a stretch goal.
- Suggested a one-week experiment: a simple personalized events feed.

**Result:** The team agreed. The feed got **300 weekly users** in the first month, and the project won the department showcase.

**Learning:** Data plus empathy for others' motivations persuades better than opinions.`,
        },
        {
          id: "gpm-m3-q2",
          q: "Tell me about a conflict with an engineering lead and how you resolved it.",
          tip: "Show respect for the other side, focus on shared goals, and a constructive resolution.",
          keyPoints: [
            "Describes the conflict fairly without blaming",
            "Seeks to understand the other person's concerns",
            "Finds a shared goal and options",
            "Reaches a resolution with a clear outcome",
            "Shows what changed in how they work",
          ],
          modelAnswer: `**Situation:** During an internship, I pushed for a feature to ship in the next sprint; the engineering lead said it would add tech debt and refused.

**Task:** Ship value for customers without damaging the team relationship or the codebase.

**Action:**
- Met 1:1 and **asked what worried him most** — the quick version would duplicate a payment flow that was already fragile.
- Agreed on the shared goal: reduce customer drop-off *and* keep payments stable.
- Explored options together: we cut scope to the **part that solved 80% of the customer problem** and scheduled the refactor first in the following sprint.

**Result:** We shipped the smaller version on time; checkout drop-off fell 4%, and the refactor landed two weeks later.

**Learning:** Most conflicts are about different risks, not different goals. I now involve engineering in scoping before committing dates.`,
        },
        {
          id: "gpm-m3-q3",
          q: "Tell me about a product or project that failed. What did you learn?",
          tip: "Own the failure, be specific about your role, and show concrete changes afterward.",
          keyPoints: [
            "Takes ownership without excuses",
            "Explains the root cause honestly",
            "Shows what was done to limit the damage",
            "Specific lesson learned",
            "Evidence of applying the lesson later",
          ],
          modelAnswer: `**Situation:** I led a student team building a textbook-swap marketplace. We spent two months building features before launch.

**What happened:** At launch only 15 books were listed and almost no trades happened — we had a classic **cold-start problem**.

**My role:** I owned the plan and assumed people would list books once the app existed. I didn't validate supply first.

**What I did:** We paused new features, manually seeded 200 listings by running a booth in the library, and switched to a simple Google Form + group chat to test demand.

**Result:** Trades picked up modestly, but the semester ended before we reached critical mass.

**Lesson:** Validate the riskiest assumption first with the cheapest test. In my next project, I ran a landing-page test before writing any code — it saved us from building the wrong thing.`,
        },
      ],
    },
  ],

  /* ===================== AI FORWARD DEPLOYED ENGINEER ===================== */
  fde: [
    {
      id: "fde-m1",
      title: "Customer Discovery & Scoping",
      emoji: "🔎",
      summary: "Turning a fuzzy customer request into a scoped, valuable AI solution.",
      questions: [
        {
          id: "fde-m1-q1",
          q: "A bank wants 'an AI assistant for their analysts'. Walk me through your first two weeks on site.",
          tip: "Discovery → pick a workflow → data and constraints → quick prototype → success criteria.",
          keyPoints: [
            "Interviews and shadows real users",
            "Picks one high-value, feasible workflow",
            "Assesses data access, security and compliance early",
            "Builds a quick prototype on real data",
            "Agrees measurable success criteria with stakeholders",
          ],
          modelAnswer: `**Week 1 — Discovery**
- Meet the **sponsor** to understand the business goal (e.g., cut research time, more coverage).
- **Shadow 4–6 analysts**: what tasks eat their time? (e.g., reading earnings calls, summarizing filings, writing memos.)
- Map **data sources** (internal research, filings, market data) and **constraints**: data residency, model approval, PII, audit logs.
- Pick **one workflow** that is frequent, painful, and low-risk — e.g., *"summarize a company's quarterly filings into a first-draft memo with citations."*

**Week 2 — Prove it**
- Build a **thin prototype** on real (approved) documents with citations back to the source.
- Create a **20–50 example eval set** with analysts: what does a good memo look like?
- Demo to analysts, collect feedback, iterate daily.
- Agree **success criteria** with the sponsor: e.g., memo drafting time 3h → 1h, ≥90% factual accuracy on evals, security sign-off.

**Output:** a scoped proposal for a pilot, risks and a timeline.`,
        },
        {
          id: "fde-m1-q2",
          q: "How do you decide what to build in a 2-week proof of concept vs. what to leave out?",
          tip: "A POC exists to retire the biggest risk and prove value — not to be production-ready.",
          keyPoints: [
            "Defines the POC's goal: prove value and retire key risks",
            "Includes the core workflow on real data",
            "Leaves out production concerns like scale, full UI and SSO",
            "Clear success criteria agreed upfront",
            "Documents the path to production",
          ],
          modelAnswer: `**A POC answers one question: "Will this work for *us*, on *our* data?"**

**Include:**
- The **single core workflow** end-to-end (input → AI → useful output).
- **Real customer data** (or a faithful sample) — demo data proves nothing.
- The **riskiest technical assumption**: e.g., can we extract fields from their scanned PDFs accurately?
- A small **eval set** and agreed success criteria so the outcome is objective.

**Leave out (document as "for production"):**
- Scale, high availability, full SSO/RBAC integration.
- Polished UI — a simple web page or notebook is fine.
- Secondary features and edge-case automation.

**Process:** agree scope and success criteria in writing on day 1, show progress every 2–3 days, and end with a demo plus a short write-up: results vs. criteria, known gaps, and what production would need (timeline, team, costs).`,
        },
        {
          id: "fde-m1-q3",
          q: "How do you say no to a customer request without damaging the relationship?",
          tip: "Understand the need behind the request, offer alternatives, and be transparent.",
          keyPoints: [
            "Seeks the underlying need behind the request",
            "Explains the reason transparently (risk, scope, timeline)",
            "Offers alternatives or a phased approach",
            "Involves the right internal stakeholders",
            "Follows up and maintains trust",
          ],
          modelAnswer: `**1. Understand the "why".** Ask what problem the request solves. Often the specific ask ("add a chatbot to every page") hides a simpler need ("users can't find policies").

**2. Be transparent.** Explain the reason plainly — it would jeopardize the agreed launch date, introduces security risk, or doesn't meet the goal. Customers respect honesty more than vague delays.

**3. Offer options:**
- A smaller version that covers the core need now.
- A **phased plan**: "after the pilot hits its success criteria, this is the next item."
- A workaround using existing features.

**4. Loop in the right people** — the account team or product team if it's a roadmap request, so it's tracked rather than lost.

**5. Follow up** in writing with the agreed next steps.

**Example framing:** *"I want to make sure the pilot succeeds on the 15th. Adding X now would put that at risk. Can we deliver Y now, which covers most of the need, and plan X for phase 2?"*`,
        },
      ],
    },
    {
      id: "fde-m2",
      title: "Solution Architecture",
      emoji: "🏗️",
      summary: "Designing RAG systems, agents and deployments that work inside real enterprises.",
      questions: [
        {
          id: "fde-m2-q1",
          q: "Design a RAG system over 2 million internal PDFs with strict document-level permissions.",
          tip: "Ingestion → chunking/embedding → permission-aware retrieval → generation with citations → evals.",
          keyPoints: [
            "Ingestion pipeline with parsing/OCR and incremental updates",
            "Chunking with metadata including ACLs",
            "Permission filtering at retrieval time, not after generation",
            "Hybrid search plus reranking",
            "Citations, evals and monitoring",
          ],
          modelAnswer: `**1. Ingestion**
- Parse PDFs (text extraction + **OCR** for scans, table handling). Run as a queue-based pipeline with **incremental sync** — only re-process changed docs.
- Pull each document's **ACL** (users/groups) from the source system (e.g., SharePoint).

**2. Indexing**
- Chunk by structure (sections/headings), ~500–800 tokens with overlap.
- Store embeddings + metadata: doc ID, title, page, date, **allowed groups**.
- Use a vector DB that supports **metadata filtering** and keyword search (hybrid).

**3. Retrieval (permission-aware)**
- Resolve the user's groups from the identity provider at query time.
- **Filter by ACL inside the search query** — never retrieve then filter after generation (leak risk).
- Hybrid search (BM25 + vectors) → **rerank** top 50 → top 5–10 to the LLM.

**4. Generation:** answer only from retrieved context, with **citations** (doc + page); say "I don't know" otherwise.

**5. Ops:** permission-sync lag monitoring, eval set for retrieval recall and answer accuracy, audit logs of who saw what.`,
        },
        {
          id: "fde-m2-q2",
          q: "A customer wants an agent that automates invoice processing end-to-end. How would you architect it and keep a human in the loop?",
          tip: "Break into steps, decide which need an LLM, define confidence thresholds and approvals.",
          keyPoints: [
            "Breaks the process into clear steps",
            "Uses structured extraction with validation",
            "Deterministic business rules for matching and policy",
            "Confidence thresholds route to human review",
            "Human approval for payments, audit trail and metrics",
          ],
          modelAnswer: `**Prefer a workflow with LLM steps over a fully autonomous agent** — invoices are a well-defined process with financial risk.

**Pipeline:**
1. **Intake:** invoices arrive via email/portal → stored and queued.
2. **Extraction:** LLM (vision for scans) extracts vendor, amounts, line items, PO number into a **strict JSON schema**.
3. **Validation:** deterministic checks — totals add up, vendor exists, tax rules, duplicates.
4. **Matching:** match to purchase order and goods receipt via ERP APIs (tools).
5. **Decision:** if all checks pass and confidence is high → **queue for one-click approval**; else → **exception queue** with the reason highlighted.
6. **Posting:** approved invoices posted to the ERP; payment stays behind human approval or existing controls.

**Human in the loop:** reviewers see the document side-by-side with extracted fields; their corrections are logged and fed into evals.

**Measure:** straight-through-processing rate, extraction accuracy per field, exception rate, time per invoice, and zero incorrect payments. Increase automation only as accuracy is proven.`,
        },
        {
          id: "fde-m2-q3",
          q: "How would you deploy an LLM application in a customer's VPC with no internet egress?",
          tip: "Options for the model, packaging, dependencies, and operations without internet.",
          keyPoints: [
            "Model options: cloud provider private endpoints or self-hosted open models",
            "Private networking such as PrivateLink and VPC endpoints",
            "Packaging with containers and mirrored dependencies",
            "Infrastructure as code and their approval processes",
            "Observability, updates and support without internet access",
          ],
          modelAnswer: `**1. Choose the model path**
- **Managed model via private networking:** many clouds offer frontier models through their own platform (e.g., Bedrock, Vertex AI, Azure) reachable over **private endpoints** — traffic never touches the public internet.
- **Self-hosted open-weight model** on GPU nodes inside the VPC (e.g., served with vLLM) when data can't leave even to the cloud provider's model service.

**2. Package everything**
- Containers pushed to the customer's **private registry**; pip/npm dependencies vendored or mirrored.
- Embedding model and vector DB also run inside the VPC.

**3. Deploy with their process**
- **Terraform/Helm** templates parameterized for their environment; go through their change-approval and security scanning.

**4. Operate**
- Logs and metrics to *their* observability stack; no phone-home telemetry.
- Plan versioned, signed release bundles for updates.
- Runbooks so their team can troubleshoot, plus a support process (screen-share, log export).`,
        },
      ],
    },
    {
      id: "fde-m3",
      title: "Debugging & Production",
      emoji: "🛠️",
      summary: "Making deployed AI reliable: debugging quality, latency and security reviews.",
      questions: [
        {
          id: "fde-m3-q1",
          q: "The customer says 'the model gives wrong answers'. How do you debug that systematically?",
          tip: "Get concrete examples, then isolate: input → retrieval → prompt → model → output.",
          keyPoints: [
            "Collects specific failing examples",
            "Defines what 'correct' means with the customer",
            "Isolates the failing stage: data, retrieval, prompt, model",
            "Builds an eval set to measure fixes",
            "Communicates findings and fixes back",
          ],
          modelAnswer: `**1. Get specifics.** Ask for 10–20 concrete examples with the expected answer. "Wrong" might mean outdated, incomplete, wrong format or truly incorrect.

**2. Reproduce and trace** each example through the pipeline using logs/traces:
- **Input:** was the question ambiguous or out of scope?
- **Retrieval:** did the right documents get retrieved? (Most RAG "model errors" are actually retrieval errors.)
- **Data:** is the source content outdated, duplicated or badly parsed (tables, scans)?
- **Prompt:** conflicting instructions, missing context, too much irrelevant context?
- **Model:** right documents present but still wrong → reasoning limit → try a stronger model or break the task down.

**3. Categorize** failures and fix the largest bucket first.

**4. Turn the examples into an eval set** so we can prove the fix and prevent regressions.

**5. Report back:** root causes, what was fixed, before/after accuracy, and any data issues the customer must fix on their side.`,
        },
        {
          id: "fde-m3-q2",
          q: "Latency of your deployed assistant jumped from 3s to 15s. What do you check?",
          tip: "Find where the time goes with tracing before changing anything.",
          keyPoints: [
            "Checks what changed: deploy, traffic, data, model",
            "Uses tracing to break down latency per step",
            "Looks at model provider latency, rate limits and retries",
            "Checks retrieval, context size and output length",
            "Proposes fixes: streaming, caching, smaller context, parallel calls",
          ],
          modelAnswer: `**1. What changed?** Recent deploys, prompt changes, model version, traffic spike, document volume growth. Is it all requests or some (p50 vs. p95)?

**2. Trace one slow request** and break the 15s down: auth → retrieval → reranking → LLM call(s) → post-processing.

**3. Usual suspects:**
- **LLM provider:** slower model, regional issue, **rate limits causing retries** with backoff.
- **More tokens:** prompt grew (more retrieved chunks, longer chat history) or outputs got longer — latency scales with output tokens.
- **Retrieval:** vector DB index too big for memory, missing index, cold starts.
- **Sequential calls:** an agent now makes 4 calls in a row.
- **Infra:** CPU throttling, network/proxy changes, connection pool exhaustion.

**4. Fix based on the cause:** roll back if a deploy caused it, trim context, cap output length, stream tokens for perceived speed, use **prompt caching**, parallelize independent calls, or route simple queries to a faster model.

**5. Add latency alerts per step** so it's caught earlier.`,
        },
        {
          id: "fde-m3-q3",
          q: "What do you bring to a customer's security review for an LLM deployment?",
          tip: "Think like their CISO: data flow, storage, access, model risks, compliance.",
          keyPoints: [
            "Clear data-flow diagram",
            "Data retention, training use and residency answers",
            "Authentication, authorization and audit logging",
            "LLM-specific risks: prompt injection, data leakage",
            "Compliance documentation such as SOC 2 and pen tests",
          ],
          modelAnswer: `**1. Architecture & data-flow diagram** — every hop data takes: user → app → retrieval → model provider → logs. Mark trust boundaries and encryption (TLS in transit, AES-256 at rest).

**2. Data handling answers**
- What's sent to the model, **retention period**, and confirmation it's **not used for training**.
- Data residency/region, and PII handling (redaction if needed).

**3. Access control** — SSO/SAML, role-based access, document-level permissions in retrieval, **audit logs** of queries and access.

**4. LLM-specific risks & mitigations**
- **Prompt injection** (from user input or retrieved documents) → limited tool permissions, human approval for actions, input/output filtering.
- **Data leakage** across users → permission-aware retrieval, no shared memory.
- Harmful or incorrect output → evals, guardrails, human review.

**5. Compliance pack** — SOC 2 / ISO 27001 reports, pen-test summary, subprocessor list, DPA, incident-response process.

Bringing this proactively often cuts weeks off the review.`,
        },
      ],
    },
  ],

  /* ===================== AI ENGINEER ===================== */
  eng: [
    {
      id: "eng-m1",
      title: "LLM Fundamentals",
      emoji: "🧬",
      summary: "Transformers, tokens and sampling — the concepts every AI engineer must explain clearly.",
      questions: [
        {
          id: "eng-m1-q1",
          q: "Explain self-attention to a new grad. Why does it scale quadratically with sequence length?",
          tip: "Intuition first (tokens looking at each other), then Q/K/V, then the n×n matrix.",
          keyPoints: [
            "Intuition: each token gathers information from other tokens",
            "Queries, keys and values and the dot-product similarity",
            "Softmax over scores produces weights for a weighted sum of values",
            "The n×n score matrix causes O(n²) compute and memory",
            "Mentions multi-head attention or mitigations like FlashAttention",
          ],
          modelAnswer: `**Intuition:** In "The animal didn't cross the street because *it* was tired", the model must figure out that *it* refers to *animal*. Self-attention lets every token **look at every other token** and pull in the information it needs.

**Mechanics:**
1. Each token embedding is projected into a **Query** (what am I looking for?), **Key** (what do I contain?) and **Value** (what do I pass on?).
2. Score = **Q · Kᵀ / √d** for every pair of tokens.
3. **Softmax** turns scores into weights; the output for each token is the weighted sum of the Values.
4. **Multi-head** attention runs this several times in parallel so different heads capture different relationships (syntax, coreference…).

**Why quadratic:** for *n* tokens, we compute a score for every pair → an **n × n matrix**. Doubling the context quadruples compute and memory for that matrix.

**Mitigations:** FlashAttention (memory-efficient exact attention), KV caching during generation, sparse/sliding-window attention.`,
        },
        {
          id: "eng-m1-q2",
          q: "What is tokenization and how does it affect cost, latency and model behavior?",
          tip: "Define it, give an example, then connect to the practical consequences.",
          keyPoints: [
            "Text is split into subword tokens (e.g., BPE)",
            "Pricing and context limits are in tokens",
            "Latency scales with output tokens",
            "Behavior quirks: character counting, numbers, non-English languages",
            "Practical tips such as measuring with a token counter",
          ],
          modelAnswer: `**What it is:** models don't read characters or words — they read **tokens**, subword units learned by algorithms like **BPE**. "unbelievable" might be \`un\` + \`believ\` + \`able\`. In English, 1 token ≈ ¾ of a word.

**Cost:** APIs charge per input and output token, and context windows are measured in tokens. Verbose prompts and long retrieved context cost real money at scale.

**Latency:** output is generated **one token at a time**, so latency grows with output length. Input tokens are processed in parallel and are cheaper per token time-wise.

**Behavior:**
- Models struggle with character-level tasks ("how many r's in strawberry?") because they don't see letters.
- Numbers may be split oddly, hurting arithmetic.
- **Non-English languages** often need more tokens for the same text → higher cost and less effective context.
- Code and whitespace formatting can be token-hungry.

**In practice:** measure prompts with the provider's token counter, trim unnecessary context, and cap output length.`,
        },
        {
          id: "eng-m1-q3",
          q: "Explain temperature, top-p and top-k sampling. When would you change them?",
          tip: "Explain what each does to the probability distribution, then give use cases.",
          keyPoints: [
            "The model outputs a probability distribution over next tokens",
            "Temperature sharpens or flattens the distribution",
            "Top-k keeps the k most likely tokens",
            "Top-p keeps the smallest set whose probability sums to p",
            "Low randomness for extraction, higher for creative tasks; some newer models fix these",
          ],
          modelAnswer: `At each step the model produces a **probability distribution** over the next token. Sampling settings decide how we pick from it.

- **Temperature** divides the logits before softmax. **Low (≈0)** → sharper, near-greedy, deterministic. **High (>1)** → flatter, more diverse and more random.
- **Top-k** keeps only the **k most likely** tokens, then samples among them.
- **Top-p (nucleus)** keeps the **smallest set of tokens whose probabilities sum to p** (e.g., 0.9). Adapts to the model's confidence — few candidates when sure, more when unsure.

**When to change:**
- **Extraction, classification, code, factual Q&A:** low temperature for consistency.
- **Brainstorming, creative writing:** higher temperature or top-p for variety.
- Generally tune **one** of temperature/top-p, not both.

**Note:** some newer reasoning models fix these values and expose other controls (like reasoning effort) instead — check the API docs.`,
        },
      ],
    },
    {
      id: "eng-m2",
      title: "RAG & Agents",
      emoji: "🧩",
      summary: "Retrieval pipelines, tool use and when to build agents.",
      questions: [
        {
          id: "eng-m2-q1",
          q: "Design a retrieval-augmented generation pipeline. How do you choose chunk size and evaluate retrieval quality?",
          tip: "Walk the pipeline, then make chunking and evaluation concrete.",
          keyPoints: [
            "Pipeline: ingest, chunk, embed, index, retrieve, rerank, generate",
            "Chunk size trade-off: precision vs. context",
            "Structure-aware chunking with overlap and metadata",
            "Retrieval metrics: recall@k, MRR or nDCG with a labeled set",
            "End-to-end answer evaluation: faithfulness and correctness",
          ],
          modelAnswer: `**Pipeline:** ingest & clean → **chunk** → embed → index (vector + keyword) → retrieve top-k → **rerank** → stuff into prompt → generate with citations.

**Chunk size trade-off:**
- **Small chunks** (100–300 tokens): precise matches, but may lose context.
- **Large chunks** (800–1500): more context, but noisier embeddings and more tokens.
- Start ~**400–800 tokens with 10–20% overlap**, split on **document structure** (headings, paragraphs), and attach metadata (title, section). Tricks: prepend the doc title/section to each chunk, or retrieve small chunks but pass the parent section.
- **Choose empirically** — run evals on 2–3 sizes.

**Evaluate retrieval separately from generation:**
- Build a labeled set: question → relevant chunk(s) (can bootstrap by having an LLM write questions from chunks, then review).
- Metrics: **recall@k** (is the right chunk in top k?), **MRR / nDCG** (is it ranked high?).

**Evaluate end-to-end:** answer **faithfulness** (supported by context) and **correctness** vs. reference answers, using human review plus a calibrated LLM judge.`,
        },
        {
          id: "eng-m2-q2",
          q: "What's the difference between a workflow and an agent? When should you use each?",
          tip: "Who decides the control flow — your code or the model?",
          keyPoints: [
            "Workflow: predefined code paths orchestrate LLM calls",
            "Agent: the model dynamically decides steps and tool use in a loop",
            "Workflows are more predictable, cheaper and easier to test",
            "Agents suit open-ended tasks with unpredictable steps",
            "Start simple; add autonomy only when needed, with guardrails",
          ],
          modelAnswer: `**Workflow:** *your code* defines the control flow; LLMs are called at fixed steps. Patterns: prompt chaining, routing, parallelization, evaluator-optimizer.
*Example:* classify a ticket → route to a template → draft reply → check tone.

**Agent:** *the model* decides what to do next in a loop — choose a tool, observe the result, decide again — until the goal is met.
*Example:* "fix this failing test" — the number of files to read and edits needed isn't known in advance.

| | Workflow | Agent |
|---|---|---|
| Predictability | High | Lower |
| Cost / latency | Lower | Higher (many steps) |
| Testing | Easy | Harder |
| Best for | Well-defined tasks | Open-ended, multi-step tasks |

**Guidance:** start with the **simplest thing that works** — often a single LLM call with good retrieval. Use workflows for known processes. Use agents when steps truly can't be predicted, and add guardrails: limited tools, step/budget limits, sandboxing and human approval for risky actions.`,
        },
        {
          id: "eng-m2-q3",
          q: "How does tool use / function calling work under the hood?",
          tip: "Describe the loop between your app and the model step by step.",
          keyPoints: [
            "Tools are described to the model with names, descriptions and JSON schemas",
            "The model outputs a structured tool-call request instead of text",
            "The application executes the tool, not the model",
            "The result is sent back and the model continues",
            "Loop until a final answer; validation, errors and security",
          ],
          modelAnswer: `**1. Define tools.** You send the model a list of tools: **name, description, and a JSON schema** for the inputs (e.g., \`get_weather(city: string)\`). These are injected into the model's context.

**2. Model decides.** The model was trained to emit a **structured tool call** when useful — e.g., \`{"name": "get_weather", "input": {"city": "Paris"}}\` — and stops generating.

**3. Your app executes.** The model never runs code itself. Your application parses the call, **validates** the arguments, and runs the real function/API.

**4. Return the result.** You append a **tool result** message and call the model again.

**5. Loop** until the model returns a normal answer (stop reason is no longer "tool use"). Models can request several tools in parallel.

**Engineering concerns:** clear tool descriptions (they're prompts!), schema validation, handling errors by returning them as results, timeouts, limiting iterations, and **security** — treat tool inputs as untrusted (prompt injection) and require confirmation for risky actions.`,
        },
      ],
    },
    {
      id: "eng-m3",
      title: "Production, Evals & Fine-tuning",
      emoji: "⚙️",
      summary: "Shipping LLM systems that are fast, affordable, measurable and well-adapted.",
      questions: [
        {
          id: "eng-m3-q1",
          q: "How would you reduce latency and cost for a high-traffic LLM endpoint?",
          tip: "Measure first, then go through levers from cheapest to most effort.",
          keyPoints: [
            "Measures where time and tokens go first",
            "Prompt caching and response caching",
            "Reduces input and output tokens",
            "Model routing: smaller models for easy requests",
            "Streaming, batching for offline work, and parallelism",
          ],
          modelAnswer: `**First, measure:** tokens in/out per request, latency breakdown (time-to-first-token vs. generation), and which request types dominate cost.

**Levers (cheapest first):**
1. **Prompt caching** — keep the static part of the prompt (system prompt, tools, documents) first so the provider can cache it; big savings on cost and time-to-first-token.
2. **Response caching** for repeated identical (or semantically similar) queries.
3. **Trim tokens** — shorter prompts, fewer retrieved chunks, cap output length; output tokens dominate latency.
4. **Model routing** — a small, fast model handles easy requests; escalate hard ones.
5. **Streaming** — doesn't cut total time but makes it *feel* much faster.
6. **Parallelize** independent calls; avoid unnecessary sequential agent steps.
7. **Batch API** for anything not real-time (often ~50% cheaper).
8. For self-hosted models: quantization, continuous batching (vLLM), speculative decoding.

**Guardrail:** run the eval suite after each change so savings don't silently cost quality.`,
        },
        {
          id: "eng-m3-q2",
          q: "How do you build an evaluation suite for an LLM feature? Discuss LLM-as-judge pitfalls.",
          tip: "Dataset → graders → process; then give specific judge pitfalls and mitigations.",
          keyPoints: [
            "Representative dataset from real usage including edge cases",
            "Choose graders: code-based, LLM-as-judge, human",
            "Run in CI on every prompt or model change",
            "Judge pitfalls: position, verbosity and self-preference bias",
            "Mitigations: calibrate against humans, clear rubrics, binary criteria",
          ],
          modelAnswer: `**1. Dataset:** start with 50–200 examples from **real usage** (logs, user reports), plus edge cases and adversarial inputs. Store expected answers or criteria per example. Keep growing it from production failures.

**2. Graders (prefer the simplest that works):**
- **Code-based:** exact match, JSON validity, regex, unit tests for code.
- **LLM-as-judge:** for open-ended quality (helpfulness, faithfulness).
- **Humans:** to create gold labels and audit the judge.

**3. Process:** run evals in CI on every prompt/model change; track scores over time; review failures, not just averages.

**LLM-as-judge pitfalls:**
- **Position bias** (prefers the first option in pairwise) → swap order and average.
- **Verbosity bias** (prefers longer answers) → rubric that rewards concision.
- **Self-preference** → use a different model family as judge where possible.
- **Vague rubrics** → use specific, ideally **binary** pass/fail criteria with examples.
- **Uncalibrated scores** → measure agreement with human labels before trusting it.`,
        },
        {
          id: "eng-m3-q3",
          q: "When would you fine-tune (full or LoRA) instead of using prompting or RAG?",
          tip: "Fine-tuning changes behavior, RAG adds knowledge. Mention data needs and LoRA's benefits.",
          keyPoints: [
            "Fine-tuning teaches behavior, style or format; RAG supplies knowledge",
            "Good for narrow, high-volume tasks to cut cost and latency",
            "Needs high-quality labeled examples",
            "LoRA trains small adapters: cheaper, less memory, swappable",
            "Try prompting first and compare with evals; maintenance cost",
          ],
          modelAnswer: `**Fine-tune when the problem is *behavior*, not *knowledge*:**
- Consistent **format or style** that prompting can't reliably achieve.
- A **narrow, high-volume task** (classification, extraction) where a small fine-tuned model can match a large model's quality at a fraction of the **cost and latency**.
- Domain language the base model handles poorly.

**Don't fine-tune** to add facts that change — use **RAG** instead; fine-tuned knowledge goes stale and is hard to update or cite.

**Full fine-tuning vs. LoRA:**
- **Full:** updates all weights — expensive, needs lots of GPU memory, risk of forgetting general skills.
- **LoRA:** freezes the base model and trains small **low-rank adapter matrices** — far cheaper, fits on smaller GPUs, and adapters can be swapped per task. Usually the first choice.

**Requirements:** hundreds to thousands of **high-quality examples**, a held-out eval set, and a plan to retrain when base models improve.

**Process:** prompting baseline → RAG if knowledge is missing → fine-tune only if evals show a remaining behavior gap worth the cost.`,
        },
      ],
    },
  ],
};

// Merge the additional real-interview questions and modules.
import extraPm from "./extra/pm.js";
import extraGpm from "./extra/gpm.js";
import extraFde from "./extra/fde.js";
import extraEng from "./extra/eng.js";

for (const [roleId, extra] of Object.entries({ pm: extraPm, gpm: extraGpm, fde: extraFde, eng: extraEng })) {
  for (const [moduleId, qs] of Object.entries(extra.add)) {
    SERIES[roleId].find((m) => m.id === moduleId).questions.push(...qs);
  }
  SERIES[roleId].push(...extra.modules);
}

export const seriesFor = (roleId) => SERIES[roleId] || [];

export function findSeriesQuestion(questionId) {
  for (const modules of Object.values(SERIES)) {
    for (const m of modules) {
      const q = m.questions.find((x) => x.id === questionId);
      if (q) return { module: m, question: q };
    }
  }
  return null;
}
