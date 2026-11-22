// AI Forward Deployed Engineer — additional real-world interview questions.
export default {
  add: {
    "fde-m1": [
      {
        id: "fde-m1-q4",
        q: "How do you explain what an LLM can and can't do to a non-technical executive?",
        tip: "Plain language, concrete examples from their business, and honest limitations.",
        keyPoints: [
          "Simple, accurate mental model of an LLM",
          "Strengths with examples relevant to their business",
          "Clear limitations: errors, no live data, no guaranteed accuracy",
          "How limitations are managed (grounding, review)",
          "Ties back to business value and next steps",
        ],
        modelAnswer: `**Mental model:** "Think of it as a very well-read new analyst. It writes, summarizes and reasons over text fast, but it can be confidently wrong and doesn't know your company until we give it your documents."

**What it's great at (with their examples):**
- Summarizing long documents — contracts, reports, call transcripts.
- Drafting — emails, proposals, first versions of reports.
- Extracting information from messy text into structured fields.
- Answering questions over your own knowledge base.

**What it can't do reliably:**
- Guarantee accuracy — it can **make things up**.
- Know recent or private facts unless we connect it to your data.
- Do precise calculations or follow rules perfectly every time on its own.

**How we manage that:** ground answers in your documents with citations, keep humans reviewing high-stakes outputs, use regular code for exact rules and math, and measure accuracy with tests before launch.

**Close with value:** "Here's where it would save your team the most time, and here's how we'd prove it in a two-week pilot."`,
      },
    ],
    "fde-m2": [
      {
        id: "fde-m2-q4",
        q: "Design a customer-support copilot that drafts replies for agents inside the customer's helpdesk tool.",
        tip: "Integration, retrieval, drafting, human review, and measuring impact.",
        keyPoints: [
          "Integrates with the helpdesk via its APIs or an app/plugin",
          "Retrieval over knowledge base, past tickets and customer data",
          "Drafts with citations; agent edits and sends",
          "Guardrails: tone, policies, PII, escalation",
          "Metrics: handle time, edit rate, CSAT",
        ],
        modelAnswer: `**Architecture**
1. **Integration:** a sidebar app inside the helpdesk using its app framework and APIs; reads the ticket thread and customer info; writes the draft into the reply box.
2. **Context retrieval:** help-center articles, internal macros and policies, and **similar resolved tickets** (vector + keyword search). Pull order or account status via APIs as tools.
3. **Drafting:** the LLM writes a reply in the company's tone with **citations** to the sources used, plus a short "why" summary for the agent.
4. **Human in the loop:** the agent edits and sends — the copilot never sends on its own at first.
5. **Feedback:** capture edits and thumbs up/down; feed into evals.

**Guardrails:** policy rules enforced in code (refund limits), PII redaction in logs, refusal on legal/medical topics, auto-escalation flags for angry or high-value customers.

**Rollout:** pilot with one team, compare with a control group.

**Metrics:** average handle time, % of drafts sent with minimal edits, first-contact resolution, CSAT, and agent satisfaction.`,
      },
    ],
    "fde-m3": [
      {
        id: "fde-m3-q4",
        q: "A customer reports that the assistant showed information from another department's confidential documents. Walk through your response.",
        tip: "Incident response: contain, assess, root-cause, fix, communicate, prevent.",
        keyPoints: [
          "Contain immediately (disable feature or restrict access)",
          "Assess scope with logs: who saw what",
          "Find root cause (permission sync, retrieval filtering, caching)",
          "Fix and verify with tests",
          "Transparent communication and prevention measures",
        ],
        modelAnswer: `**1. Contain (first hour).** Treat it as a security incident. Disable the assistant or the affected data source for that customer, and follow the customer's and our incident-response process (notify security, legal).

**2. Assess scope.** Use audit logs: which users received which documents, when, and through which queries. Determine whether other tenants or departments are affected.

**3. Root cause — common culprits:**
- **Permission sync lag** — access was removed in the source system but not in our index.
- **Filtering after retrieval** instead of inside the search query.
- **Missing ACL metadata** on some documents (e.g., a new connector).
- **Shared cache or conversation memory** across users.

**4. Fix and verify.** Enforce ACL filtering at query time, re-sync permissions, add automated tests where a user must *not* retrieve restricted docs, and re-enable gradually.

**5. Communicate** clearly with the customer: timeline, impact, root cause, fixes. Provide a written post-mortem.

**6. Prevent:** permission tests in CI, monitoring for sync lag, periodic access audits.`,
      },
    ],
  },
  modules: [
    {
      id: "fde-m4",
      title: "Hands-on Building (Technical Screen)",
      emoji: "💻",
      summary: "Practical coding and build questions from FDE technical rounds.",
      questions: [
        {
          id: "fde-m4-q1",
          q: "Write a function that calls an LLM API with retries, timeouts and validated JSON output.",
          tip: "Talk through failure modes as you code: transient errors, bad JSON, timeouts.",
          keyPoints: [
            "Timeout on each request",
            "Retries with exponential backoff and jitter on transient errors only",
            "Parses and validates JSON against a schema",
            "Re-asks or fails clearly on invalid output",
            "Logs and limits attempts",
          ],
          modelAnswer: `**Approach:** retry only *transient* failures (timeouts, 429, 5xx), validate the output, and fail loudly after a limit.

\`\`\`python
import json, random, time
from pydantic import BaseModel, ValidationError

class Invoice(BaseModel):
    vendor: str
    total: float
    currency: str

TRANSIENT = {408, 429, 500, 502, 503, 504}

def extract_invoice(client, text, max_attempts=4, timeout=30):
    prompt = f"Return ONLY JSON with vendor, total, currency.\\n\\n{text}"
    for attempt in range(1, max_attempts + 1):
        try:
            raw = client.complete(prompt, timeout=timeout)  # provider SDK call
            return Invoice.model_validate(json.loads(raw))
        except (json.JSONDecodeError, ValidationError) as e:
            prompt += f"\\n\\nYour last reply was invalid ({e}). Reply with valid JSON only."
        except ApiError as e:
            if e.status not in TRANSIENT:
                raise                      # 400/401: retrying won't help
        except TimeoutError:
            pass
        time.sleep(min(2 ** attempt, 20) + random.random())  # backoff + jitter
    raise RuntimeError("LLM extraction failed after retries")
\`\`\`

**Points to mention:** many SDKs already retry 429/5xx — don't double-retry. Prefer the provider's **structured output / JSON schema mode** when available. Log attempts and token usage, and make the operation idempotent.`,
        },
        {
          id: "fde-m4-q2",
          q: "How would you reliably extract structured data from 10,000 messy scanned contracts?",
          tip: "Pipeline thinking: ingestion → OCR → extraction → validation → human review → evaluation.",
          keyPoints: [
            "Good OCR / vision-based parsing for scans",
            "Clear schema and per-field extraction instructions",
            "Validation rules and confidence scores",
            "Human review for low confidence or high-value fields",
            "Eval set to measure field accuracy; batch processing for cost",
          ],
          modelAnswer: `**1. Define the schema with legal experts:** parties, dates, value, renewal terms, termination clause, governing law — with precise definitions and examples.

**2. Ingestion & parsing:** OCR or a vision-capable model for scanned pages; keep page numbers for citations. Detect language and document type first.

**3. Extraction:** an LLM extracts fields into a **strict JSON schema**, quoting the supporting text and page for each field. Long contracts: locate relevant sections first, then extract.

**4. Validation:** code checks — dates are valid, end date after start date, currency amounts parse, required fields present. Cross-check duplicates.

**5. Confidence & human review:** route documents with missing fields, failed checks, or low-confidence answers to a review UI showing the source text side by side.

**6. Evaluate:** experts label **100–200 contracts** as a gold set; measure accuracy **per field** and iterate on prompts before running the full batch.

**7. Scale:** use a batch API for lower cost, process in parallel, make the pipeline resumable, and track cost per document.`,
        },
        {
          id: "fde-m4-q3",
          q: "How do you choose which model or provider to use for a customer's use case?",
          tip: "Requirements first, then evaluate candidates on the customer's own data.",
          keyPoints: [
            "Gathers requirements: quality, latency, cost, volume",
            "Considers deployment constraints: data residency, cloud, security",
            "Evaluates candidates on the customer's own eval set",
            "Considers routing between models",
            "Plans for change (model-agnostic design)",
          ],
          modelAnswer: `**1. Requirements**
- **Quality bar** for the task (reasoning-heavy vs. simple extraction).
- **Latency** (interactive chat vs. overnight batch).
- **Volume and budget** → cost per task.
- **Constraints:** data residency, which cloud they're on, compliance, on-prem needs, context length, multimodal input.

**2. Shortlist** 2–4 candidates: a frontier model, a smaller fast model, and if required an open-weight self-hostable model.

**3. Evaluate on *their* data.** Build an eval set of 50–200 real examples and score quality, latency (p50/p95) and cost per task. Public benchmarks are only a starting point.

**4. Consider routing:** a small model for easy requests, a frontier model for hard ones — often the best cost/quality balance.

**5. Design for change:** a thin abstraction layer and the eval suite make switching models a measured decision when new models arrive.

**Present the trade-off** to the customer in a simple table and let business priorities decide.`,
        },
        {
          id: "fde-m4-q4",
          q: "How would you evaluate an AI agent that takes multi-step actions in a CRM system?",
          tip: "Evaluate outcomes and the path; use a sandbox; measure safety separately.",
          keyPoints: [
            "Realistic task set with defined end states",
            "Sandbox environment to run safely",
            "Outcome-based grading of final CRM state",
            "Trajectory checks: efficiency, wrong or risky actions",
            "Safety tests and production monitoring",
          ],
          modelAnswer: `**1. Task set:** 50–100 realistic tasks ("log this call and create a follow-up task for Friday", "merge these duplicate contacts"), including ambiguous and adversarial ones.

**2. Sandbox:** a copy of the CRM with seeded test data so the agent can act freely; reset between runs.

**3. Grade outcomes:** compare the **final CRM state** with the expected state — right records created or updated, correct fields, nothing else changed. Outcome checks are mostly code, which is reliable.

**4. Grade the trajectory:**
- Number of steps and tool calls (efficiency, cost).
- **Unnecessary or risky actions** (deletes, bulk updates, emailing customers).
- Did it ask for clarification when the task was ambiguous?

**5. Safety tests:** prompt injection in CRM notes, permission boundaries, destructive requests requiring confirmation.

**6. Run repeatedly:** agents are non-deterministic — run each task several times and report success rates.

**7. In production:** human approval for risky actions, audit logs, and sampling real sessions for review. New failures become new eval tasks.`,
        },
      ],
    },
    {
      id: "fde-m5",
      title: "Customer Communication & Behavioral",
      emoji: "🤝",
      summary: "Bad news, adoption problems, custom vs. product — and why FDE.",
      questions: [
        {
          id: "fde-m5-q1",
          q: "Tell me about a time you had to deliver bad news to a customer or stakeholder.",
          tip: "STAR. Show you communicated early, honestly, with a plan.",
          keyPoints: [
            "Clear STAR structure",
            "Communicated early rather than hiding the problem",
            "Honest about cause and impact",
            "Came with options and a plan",
            "Maintained or improved the relationship",
          ],
          modelAnswer: `**Situation:** During my internship I was building a data dashboard for an internal sales team. A week before the demo, I discovered the data source updated only weekly, not daily as promised.

**Task:** Tell the sales manager — who had already announced "daily numbers" to their team.

**Action:**
- Told them **the same day** instead of hoping for a fix.
- Explained the cause simply and owned my part (I hadn't verified the refresh schedule early).
- Came with **options**: launch on time with weekly data and a clear label; or delay two weeks for a daily pipeline I had scoped with the data team.
- Followed up in writing with the plan and timeline.

**Result:** They chose to launch with weekly data and upgrade later. The daily pipeline shipped 10 days later, and the manager asked me to support their next project.

**Learning:** Bad news doesn't get better with age. Early, honest and with options keeps trust.`,
        },
        {
          id: "fde-m5-q2",
          q: "Your pilot works technically, but users aren't adopting it. What do you do?",
          tip: "Adoption is a product and change-management problem. Go talk to users.",
          keyPoints: [
            "Uses data to find where users drop off",
            "Talks to and observes non-adopting users",
            "Identifies root causes: workflow fit, trust, awareness, incentives",
            "Fixes workflow integration and trust issues",
            "Works with champions and leadership on change management",
          ],
          modelAnswer: `**1. Look at the data.** Who tried it once and stopped? Where do they drop off — finding it, first use, or repeat use?

**2. Talk to users and watch them work.** Usually the reasons are:
- **Workflow fit** — it's in a separate tool; using it adds steps.
- **Trust** — one bad answer early and they stopped.
- **Awareness and training** — they don't know when it helps.
- **Incentives** — managers measure them on something else, or they fear being replaced.

**3. Fix the biggest blocker:**
- Embed it where they already work (CRM, email, chat).
- Improve the first experience; show sources to build trust.
- Short training with real examples from *their* job.

**4. Change management:** find **champions** in the team, share early wins and time-saved stories, and ask leadership to set expectations.

**5. Measure** weekly active users, repeat usage and task completion, and report progress against the pilot's success criteria. Technical success without adoption isn't success.`,
        },
        {
          id: "fde-m5-q3",
          q: "How do you balance building custom solutions for one customer versus generalizable product features?",
          tip: "Show you think beyond one deal: patterns, product feedback, and pragmatic customization.",
          keyPoints: [
            "Understands the FDE's role as a bridge to product",
            "Builds on platform primitives where possible",
            "Recognizes patterns across customers",
            "Feeds learnings back to the product team",
            "Pragmatic: custom work when it unlocks value, with maintenance in mind",
          ],
          modelAnswer: `**The FDE's job is to make one customer successful *and* make the product better for the next ten.**

**My approach:**
1. **Build on the platform first.** Use existing product features and APIs; custom code only for the true gaps.
2. **Keep custom work thin and configurable** — connectors, prompts, configuration rather than forks of the core product.
3. **Look for patterns.** If I've built a similar thing for two or three customers, it's a product feature candidate. I write it up with evidence (customers, deal value, usage).
4. **Close the loop with product and engineering** — regular feedback sessions; sometimes the custom version becomes the prototype for the product feature.
5. **Be pragmatic.** Some custom work is worth it to win a strategic customer — but agree upfront on who maintains it.

**Example:** after building document-permission connectors for three customers, I proposed a generic connector framework, which the product team adopted and which cut setup time for new customers from weeks to days.`,
        },
        {
          id: "fde-m5-q4",
          q: "Why do you want to be a forward deployed engineer, and what makes a great FDE?",
          tip: "Show motivation for both engineering depth and customer impact.",
          keyPoints: [
            "Genuine motivation: building and customer impact",
            "Comfort with ambiguity and context switching",
            "Strong engineering fundamentals",
            "Communication and empathy with customers",
            "Ownership of outcomes, not just code",
          ],
          modelAnswer: `**Why FDE:** I enjoy building, but I'm most motivated when I can see the person whose problem I'm solving. FDE combines both: real engineering — integrations, data pipelines, LLM systems — with direct impact on a customer's work. AI makes this especially exciting, because the gap between what the technology *can* do and what companies actually use is huge, and FDEs close that gap.

**What makes a great FDE:**
1. **Engineering depth** — can build production-quality code quickly, and debug across unfamiliar systems.
2. **Customer empathy and communication** — can talk to an executive about value and to an engineer about APIs in the same day.
3. **Comfort with ambiguity** — turns a fuzzy request into a scoped plan.
4. **Ownership of outcomes** — success means the customer uses it and gets value, not "I shipped the code."
5. **Product sense** — spots patterns and brings them back to the product team.

**My evidence:** in my capstone I built a data tool for a local nonprofit — I scoped it with staff, built it in four weeks, trained them, and it's still in use.

*Tip: replace with your own story.*`,
        },
      ],
    },
  ],
};
