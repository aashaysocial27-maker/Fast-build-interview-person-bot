// AI Product Manager — additional real-world interview questions.
export default {
  add: {
    "pm-m1": [
      {
        id: "pm-m1-q4",
        q: "How would you design the UX of an AI feature when the model is sometimes wrong — for example, AI-drafted email replies?",
        tip: "Design for uncertainty: keep the user in control, make errors cheap to fix, and build trust gradually.",
        keyPoints: [
          "Keeps the human in control (suggest, don't auto-send)",
          "Makes errors cheap to spot and fix",
          "Communicates uncertainty and sets expectations",
          "Collects feedback to improve the model",
          "Gradually increases automation as trust grows",
        ],
        modelAnswer: `**Principle: the cost of a mistake decides how much autonomy the AI gets.** A wrong email to your boss is costly, so the AI should *suggest*, not *send*.

**Design choices:**
1. **Draft, don't act.** Show the reply as an editable draft; the user always presses send.
2. **Make errors cheap.** Short drafts that are easy to scan, one-click "shorter / more formal / regenerate", easy undo.
3. **Show why.** Highlight facts pulled from the thread (dates, names) so users can verify them quickly.
4. **Set expectations.** Light-touch labelling ("AI draft — review before sending") and a clear way to turn it off.
5. **Learn from behavior.** Track accept / edit / discard and the edit distance — these are both product metrics and training signal.
6. **Earn autonomy.** Only after drafts are consistently accepted unchanged would I offer opt-in automation, such as auto-replying to scheduling emails.

**Metrics:** draft acceptance rate, % sent with light edits, time saved per email, and a guardrail on "sent then regretted" (undo-send rate).`,
      },
    ],
    "pm-m2": [
      {
        id: "pm-m2-q4",
        q: "How would you measure the quality of AI-generated answers in a search product (like AI overviews at the top of search results)?",
        tip: "Split into answer quality (offline) and user impact (online), with safety guardrails.",
        keyPoints: [
          "Defines quality dimensions: accuracy, groundedness, helpfulness, safety",
          "Offline evaluation with human raters and a rubric",
          "Online metrics: engagement, reformulation, click-through to sources",
          "Ecosystem effects on publishers and trust",
          "Guardrails for harmful or embarrassing answers",
        ],
        modelAnswer: `**1. Define quality dimensions:**
- **Accuracy** — is it factually correct?
- **Groundedness** — is every claim supported by the cited sources?
- **Helpfulness** — does it actually answer the query, at the right length?
- **Safety** — no harmful advice on health, finance or legal queries.

**2. Offline evaluation**
- A stratified query set (head, torso and long-tail queries; sensitive categories).
- Trained human raters score answers on a rubric; an LLM judge calibrated against raters scales this up.
- Track a **"bad answer rate"** for high-risk categories separately.

**3. Online metrics**
- **Query reformulation rate** and "pogo-sticking" — signs the answer failed.
- Time to satisfaction, thumbs up/down, follow-up queries.
- **Click-through to sources** — matters for trust and the publisher ecosystem.

**4. Guardrails:** viral-screenshot risk — monitor social reports, have a fast kill-switch per query category, and suppress AI answers where confidence is low.

**Decision rule:** ship to a category only when its bad-answer rate is below an agreed threshold.`,
      },
    ],
    "pm-m3": [
      {
        id: "pm-m3-q4",
        q: "A frontier AI lab just launched a feature that overlaps with your product. What do you do?",
        tip: "Stay calm, assess the real overlap, and double down on what a general model can't easily copy.",
        keyPoints: [
          "Assesses real overlap with customers' jobs to be done",
          "Talks to customers before reacting",
          "Identifies defensible moats: data, workflow, distribution, trust",
          "Considers partnering or building on top of the platform",
          "Adjusts roadmap and messaging deliberately",
        ],
        modelAnswer: `**1. Don't panic — assess the overlap.** Use the feature myself and map it against our customers' jobs-to-be-done. A general feature rarely covers a specialized workflow end to end.

**2. Talk to customers this week.** Would they switch? What do they value that the new feature lacks — integrations, compliance, domain accuracy, support?

**3. Double down on moats a general model can't copy quickly:**
- **Proprietary data** and feedback loops from our users.
- **Workflow integration** — living inside the tools customers already use.
- **Domain depth** — evals, templates and guardrails for one industry.
- **Trust** — security certifications, admin controls, reliability.

**4. Consider partnering.** Can we build *on* their model and benefit from it getting better? Being model-agnostic is a strength.

**5. Act deliberately:** reprioritize the roadmap toward differentiation, update positioning and sales enablement, and track win/loss and churn reasons for early warning.

Commoditization of the model layer is expected — the value moves to the product built around it.`,
      },
    ],
  },
  modules: [
    {
      id: "pm-m4",
      title: "AI Product Design Cases",
      emoji: "🧪",
      summary: "Real AI PM case questions: design an AI product end to end.",
      questions: [
        {
          id: "pm-m4-q1",
          q: "Design an AI meeting assistant for sales teams.",
          tip: "Users → jobs → pain points → features → AI risks → metrics. Keep it specific to sales.",
          keyPoints: [
            "Identifies users: reps, managers, revenue operations",
            "Focuses on concrete jobs like CRM updates and follow-ups",
            "Prioritized MVP with a wedge feature",
            "Handles AI risks: accuracy, consent and privacy",
            "Metrics tied to rep time saved and revenue outcomes",
          ],
          modelAnswer: `**Users:** sales reps (save time), sales managers (coach and forecast), RevOps (clean CRM data). Focus: **reps** — adoption starts with them.

**Pain points:** reps spend hours on notes and CRM updates, forget follow-ups, and managers can't listen to every call.

**Features (prioritized):**
1. **Auto-summary + CRM update** — after each call, extract next steps, objections, budget, timeline and pre-fill CRM fields for one-click approval. *This is the wedge.*
2. **Follow-up email draft** with the agreed next steps.
3. **Manager insights** — talk ratio, common objections, deal risk signals.
4. Later: live in-call hints (higher risk, needs high accuracy and low latency).

**AI risks:** transcription errors on names and numbers → human confirmation before CRM writes; **recording consent** laws → clear notices; privacy → admin controls and data retention settings.

**Metrics:** north star = **hours saved per rep per week**. Supporting: % of calls with CRM updated within 1 hour, follow-up sent rate, weekly active reps. Business outcome: win rate and sales-cycle length (longer-term).`,
        },
        {
          id: "pm-m4-q2",
          q: "How would you improve an AI chat assistant (like ChatGPT or Claude) for students?",
          tip: "Pick a student segment and a concrete learning problem — not just 'add features'.",
          keyPoints: [
            "Segments students and picks a focus",
            "Grounds improvements in a real learning pain point",
            "Balances helpfulness with academic integrity",
            "Concrete feature proposals with prioritization",
            "Measures learning outcomes, not just usage",
          ],
          modelAnswer: `**Goal:** help students *learn*, not just get answers.

**Segment:** high-school and university students studying STEM subjects for exams.

**Pain points:**
1. Getting the answer without understanding → poor exam performance.
2. No memory of what they've struggled with.
3. Hard to turn class material into practice.

**Improvements:**
1. **Learning mode** — Socratic hints, checks for understanding, and reveals the full solution only on request.
2. **Course workspace** — upload syllabus and slides; answers grounded in *their* course.
3. **Auto-generated practice** — quizzes and flashcards from weak topics, with spaced repetition.
4. **Progress view** — topics mastered vs. shaky.

**Priority:** learning mode first — it addresses the biggest risk (shallow learning and cheating concerns that make schools block the tool) and differentiates.

**Metrics:** quiz-score improvement over time, % of sessions in learning mode, D30 retention, and educator adoption. Guardrail: student satisfaction shouldn't drop because hints feel slower.`,
        },
        {
          id: "pm-m4-q3",
          q: "Design an AI agent that books business travel for employees. What could go wrong, and how do you build trust?",
          tip: "Agents take actions — focus on failure modes, guardrails and progressive autonomy.",
          keyPoints: [
            "Defines scope and the policy constraints",
            "Lists failure modes: wrong booking, cost, prompt injection, privacy",
            "Human confirmation before payment",
            "Progressive autonomy and clear audit trail",
            "Metrics: booking accuracy, time saved, policy compliance",
          ],
          modelAnswer: `**Scope:** employee says "Book me to Berlin for the Tuesday client meeting." The agent finds flights and hotels within **company policy**, then books.

**Flow:** understand request → check calendar and preferences → search options → apply policy (budget, class, preferred vendors) → present **2–3 options** → user confirms → book → add to calendar and expense system.

**What could go wrong:**
- **Wrong booking** (dates, airport, time zone) → expensive changes.
- **Policy violations** or overspending.
- **Prompt injection** from web content or emails.
- **Privacy** — passport and payment data.
- Partial failure: flight booked but hotel failed.

**Building trust:**
1. **Confirm before paying** — always, at first.
2. Clear summaries with the key details highlighted (dates, times, total cost).
3. **Policy enforced in code**, not only in the prompt.
4. Full audit trail and easy cancellation.
5. **Progressive autonomy** — after users accept many proposals unchanged, offer auto-booking for routine trips under a cost limit.

**Metrics:** task success without human help, booking error rate, time saved per trip, policy compliance and user trust (CSAT).`,
        },
        {
          id: "pm-m4-q4",
          q: "Should a music streaming app build an AI DJ that talks to listeners? How would you decide and launch it?",
          tip: "Start with the user problem and strategy, then validate cheaply and launch in phases.",
          keyPoints: [
            "Ties the idea to a user problem and company strategy",
            "Identifies risks: annoyance, cost, artist relations",
            "Validates with cheap experiments first",
            "Phased launch with clear metrics",
            "Defines success and kill criteria",
          ],
          modelAnswer: `**1. Why would we build it?** User problem: listeners get stuck in repetitive loops and passive "lean-back" listening lacks discovery and personality. Strategic fit: differentiation, engagement and a premium feature.

**2. Hypothesis:** a DJ that mixes familiar favorites with new picks — and explains *why* in a short spoken intro — increases discovery and listening time.

**3. Risks:**
- Some users find talking annoying → easy to skip, adjustable frequency.
- Cost of voice generation at scale → pre-generate segments, cache common ones.
- Wrong or awkward commentary → constrained templates plus LLM; safety review.
- Artist and label relations → transparent use of metadata.

**4. Validate cheaply:** a prototype with scripted intros for a small panel; survey and listening data.

**5. Launch in phases:** one market, opt-in entry point on the home screen → measure → expand.

**Metrics:** north star = **minutes listened per DAU** among DJ users; supporting: new artists discovered, skip rate, 7-day return to DJ, premium conversion. **Kill criteria:** if skip rate is high and listening time doesn't improve after iteration, we stop.`,
        },
      ],
    },
    {
      id: "pm-m5",
      title: "Responsible AI & Behavioral",
      emoji: "🛡️",
      summary: "Bias, working with ML teams, ambiguity — and why AI PM.",
      questions: [
        {
          id: "pm-m5-q1",
          q: "After launch, you learn your AI feature performs worse for certain user groups. What do you do?",
          tip: "Act quickly to limit harm, investigate root cause, fix, and put monitoring in place.",
          keyPoints: [
            "Treats it as urgent and assesses severity and harm",
            "Mitigates immediately (rollback, restrict, human review)",
            "Investigates root cause: data, evaluation gaps",
            "Fixes with representative data and sliced evals",
            "Ongoing monitoring by segment and transparent communication",
          ],
          modelAnswer: `**1. Assess severity fast.** Which groups, how big is the gap, and what's the harm? A worse recommendation is different from a denied loan.

**2. Mitigate immediately.** Depending on harm: roll back, restrict the feature for affected cases, add human review, or show clearer disclaimers.

**3. Find the root cause:**
- **Data** — the group is under-represented in training or eval data.
- **Evaluation gap** — we only measured averages, not slices.
- **Proxy features** — inputs correlated with group membership.
- **UX** — the feature works poorly with certain languages, accents or devices.

**4. Fix:** collect representative data, add **sliced evals** with fairness metrics per group, adjust prompts/models, and re-test with affected users.

**5. Prevent:** make per-segment evals a launch requirement, monitor by segment in production, and involve legal/responsible AI reviewers.

**6. Communicate** openly with stakeholders and, where appropriate, users. Owning the problem builds more trust than hiding it.`,
        },
        {
          id: "pm-m5-q2",
          q: "How do you work with ML engineers and researchers when timelines are uncertain?",
          tip: "Show you understand research uncertainty and can still plan and communicate.",
          keyPoints: [
            "Accepts uncertainty and plans in experiments and milestones",
            "Defines clear success criteria and evals upfront",
            "Time-boxes exploration with decision points",
            "Has fallback plans to ship value incrementally",
            "Communicates confidence levels to stakeholders",
          ],
          modelAnswer: `**ML work is uncertain by nature — you can't promise a model will reach 95% accuracy by a date.** So I plan differently:

1. **Agree on success criteria first.** A shared eval set and a target ("90% field accuracy on these 500 documents") so everyone knows what "done" means.
2. **Plan in time-boxed experiments,** not features. "Two weeks to see if fine-tuning beats prompting; then we decide."
3. **Decision points:** at each checkpoint we continue, pivot or stop based on eval results.
4. **Fallback plans:** what can we ship if the model only reaches 80%? Often a human-in-the-loop version delivers value now.
5. **Protect the team's focus:** I handle stakeholder pressure and keep requirements stable.
6. **Communicate with confidence levels:** "70% confident we launch in Q3; here's what would change that."

**Example:** on a classification project, we time-boxed a model approach to three weeks; it reached 85%, so we launched with human review on low-confidence cases and improved automation over time.`,
        },
        {
          id: "pm-m5-q3",
          q: "Tell me about a time you shipped something with very ambiguous requirements.",
          tip: "STAR format. Show how you created clarity: research, hypotheses, small bets.",
          keyPoints: [
            "Clear STAR structure",
            "Shows how they reduced ambiguity (users, data, prototypes)",
            "Made decisions and documented assumptions",
            "Iterated based on feedback",
            "Quantified result and lesson",
          ],
          modelAnswer: `**Situation:** In a hackathon-turned-club project, our faculty sponsor asked us to "use AI to help students with mental wellbeing" — no requirements, four weeks.

**Task:** As the product lead, turn this into something useful and safe.

**Action:**
- Ran **12 student interviews**; the clearest pain was stress before exams and not knowing which campus resources existed.
- Wrote a **one-page brief** with assumptions, a narrow scope (a resource finder and study-break planner — *not* therapy) and safety rules (crisis keywords route to real counselors).
- Built a clickable prototype in week one, tested it with 8 students, and cut two features nobody used.
- Reviewed the safety approach with the counseling center.

**Result:** Launched to 300 students during exams; 40% used it more than once, and the counseling center adopted the resource list.

**Learning:** Ambiguity shrinks fastest when you write down assumptions and test them with users early.`,
        },
        {
          id: "pm-m5-q4",
          q: "Why do you want to be an AI product manager, and which AI product do you admire most?",
          tip: "Be genuine and specific. Show product thinking in why you admire the product.",
          keyPoints: [
            "Genuine, specific motivation",
            "Connects background and skills to the role",
            "Names a specific AI product",
            "Explains why it works using product thinking",
            "Mentions an improvement or insight",
          ],
          modelAnswer: `**Why AI PM:** I love the intersection of technology and people. AI is changing what software can do faster than any shift I've seen, and the hard problems are product problems: *what* should the AI do, how do users trust it, and how do we measure quality when outputs aren't deterministic. My computer science background lets me talk credibly with engineers, and running user research for our student projects showed me I enjoy turning ambiguity into decisions.

**Product I admire: GitHub Copilot.**
- **Right workflow:** it lives inside the editor, so there's zero context switching.
- **Low cost of error:** suggestions are ghost text — ignore them and nothing happens, which makes imperfect AI still useful.
- **Fast feedback loop:** accept/reject data continuously improves the product.
- **Clear value:** developers *feel* the time saved, which drove bottom-up adoption.

**What I'd improve:** better explanations of *why* a suggestion was made for learners, so it teaches rather than just completes.

*Tip: replace these with your own story and a product you truly use.*`,
        },
      ],
    },
  ],
};
