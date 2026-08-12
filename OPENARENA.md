# OpenArena 2026 Submission Kit

This file contains paste-ready submission copy and the competition demo runbook for **City Afterimage / 城市潜像**.

## Form fields

**Project name**  
City Afterimage / 城市潜像

**Primary track**  
OPC / Super Individuals

**Category, if required**  
Agent

**Live demo**  
https://city-afterimage-lab.bigdraw123.chatgpt.site/

**90-second judge mode**  
https://city-afterimage-lab.bigdraw123.chatgpt.site/?judge=1

**Public repository**  
https://github.com/leinstein908/city-afterimage

**Short description**  
An explainable relocation decision agent that turns real-life constraints and the day a person wants to repeat into three Wuhan living-circle recommendations, then replans when the user disagrees.

**One-line positioning**  
City Afterimage turns the day you want to repeat into explainable neighborhood decisions.

## Longer project description

Moving to an unfamiliar city is not only a housing search. It is a decision about whether a repeatable weekday and weekend can fit around work, commute, food, quiet, people, and recovery.

City Afterimage lets a relocating user calibrate real constraints and choose between concrete life scenes instead of completing an abstract questionnaire. Before revealing any place name, it generates an editable lifestyle afterimage. It then connects that confirmed profile to route and facility evidence, recommends three Wuhan living circles with different decision roles, and simulates an ordinary weekday and weekend for each result.

The recommendation is designed to be challenged. When the user rejects evidence or tightens a constraint, the agent re-ranks the living circles, updates its evidence, and replans the day. Every result distinguishes live map data, open data, verified demo coordinates, and model estimates. It is an evidence-backed, explainable decision—not a claim to have found an objectively perfect home.

## Why it fits OPC / Super Individuals

City Afterimage gives one person starting a life in an unfamiliar city a research capability that would normally require a local guide, a relocation or rental agent, and a data analyst working together.

The product itself was built by one creator working with AI collaborators across product definition, interaction and visual design, structured recommendation logic, map integration, testing, documentation, and deployment. AI multiplied the creator’s ability to cross disciplines, but the outcome stays inspectable: the shipped agent exposes evidence and accepts disagreement instead of hiding decisions behind an unbounded chatbot.

## What makes it an agent

1. It observes real constraints and revealed lifestyle preferences.
2. It builds an intermediate lifestyle model before seeing place names.
3. It calls available city evidence and marks the provider/fallback state.
4. It selects three decision roles under different objectives.
5. It plans a feasible ordinary weekday and weekend from known facts.
6. It accepts user disagreement or a changed constraint.
7. It immediately re-ranks, updates evidence, and replans.

The current implementation favors deterministic, explainable orchestration over an uncontrolled LLM conversation. An optional narration boundary may polish confirmed facts, but it cannot invent places, routes, distances, facilities, or times.

## 90-second English demo script

### 0:00–0:12 — Frame the problem

> “Most relocation tools start with listings. City Afterimage starts with a smaller but more important question: after work on an ordinary Wednesday, can the rest of your day still happen?”

Open the preloaded [`?judge=1`](https://city-afterimage-lab.bigdraw123.chatgpt.site/?judge=1) path.

### 0:12–0:28 — Recognize before revealing

Show the lifestyle afterimage before any Wuhan neighborhood name appears.

> “The user does not write an ideal-city essay. They calibrate work and commute, then choose between concrete life scenes. We ask them to confirm whether the system has recognized their day before we reveal a place.”

Confirm the afterimage.

### 0:28–0:58 — Reveal evidence and a day

Show the three roles, map, evidence passport, recommendation reasons, trade-off, weekday, and weekend.

> “These are three different decisions: best overall fit, least daily friction, and a feasible place closer to the person they want to grow into. Every claim points back to user evidence, a route or estimate, facilities, and a transparent ranking model. We also show the compromise—no neighborhood is presented as perfect.”

### 0:58–1:20 — Replan on stage

Click **通勤再收紧 5 分钟 / Tighten commute by 5 minutes**.

> “Now the commute ceiling changes from 40 to 35 minutes. The recommendation role, its evidence, and the ordinary day replan together. The user can also reject individual evidence. This is not a score to accept; it is a decision to argue with.”

### 1:20–1:30 — Close

> “City Afterimage turns the day you want to repeat into an evidence-backed, explainable neighborhood decision—and gives one relocating person the power of a local guide, an agent, and a data analyst.”

## 3-minute pitch outline

- **0:00–0:25 — Problem:** relocation platforms optimize listings; people live ordinary days.
- **0:25–1:05 — Input:** real work constraints, forced scene choices, edited weekday/weekend.
- **1:05–1:35 — Recognition:** confirm an editable afterimage before any place-name anchoring.
- **1:35–2:15 — Decision:** map evidence, three distinct roles, explicit compromise, day simulation.
- **2:15–2:40 — Agent moment:** reject evidence or tighten commute and show the visible replan.
- **2:40–3:00 — OPC close:** one creator + AI collaborators; one relocating person gains a cross-disciplinary decision team.

## Honest claims checklist

Use:

- “evidence-backed, explainable decision”
- “living-circle recommendation for exploration”
- “Amap route when configured; model estimate when not”
- “Amap, OpenStreetMap, or clearly labelled demo facility evidence”
- “structured preference model and curated living-circle features”

Do not use:

- “scientifically proven perfect neighborhood”
- “real-time all-platform data”
- “live Dianping, Meituan, or Xiaohongshu integration”
- “guaranteed commute, rent, availability, safety, or satisfaction”
- “AI knows the user better than they know themselves”

## Maintainer submission checklist

- [ ] Public repository opens without authentication.
- [ ] Repository has an MIT license and contains no key, token, `.env.local`, exact private address, or personal profile.
- [ ] Fresh clone starts with the README commands.
- [ ] Public demo and `?judge=1` both load on desktop and 390 px mobile.
- [ ] The Guanggu case visibly replans after `40 → 35 min`.
- [ ] Huawei Wuhan Research Institute aliases still resolve toward Future Science and Technology City.
- [ ] Map/provider failures remain usable and visibly labelled.
- [ ] Share cover excludes the office’s exact address.
- [ ] Submission fields, links, and track are reviewed before the final **Submit** action.

## Post-deadline roadmap

### Personality and interests

- Treat MBTI as optional self-expression, not a direct ranking score. It may select one adaptive follow-up; the answer, not the label, changes the model.
- Replace age scoring with concrete life-stage constraints: living alone/with a partner, pets, childcare, care work, and accessibility.
- If zodiac appears, make it an explicitly non-scoring share-cover easter egg.
- Represent interests as `RecurringNeed`: activity, frequency, time of day, maximum travel time, solo/social mode, and necessity.

### City evidence

- Move from 22-circle coarse screening to 8 candidates, then query real routes/facilities and re-rank the final three.
- Introduce provider boundaries such as `MapProvider`, `ActivityProvider`, and a unified evidence snapshot.
- Start event evidence with official organizers/venues, dated human curation, and links deliberately supplied by users.
- Keep Dianping, Meituan, and Xiaohongshu as partner adapters unless authorized access exists; do not scrape their text, rankings, reviews, or popularity.
- Attach provider, timestamp, live/estimated state, and confidence to each evidence item, and reuse one evidence snapshot during feedback replanning.

### Explicitly out of the competition-day build

- Full MBTI assessment
- Age or zodiac scoring
- Unauthorized platform scraping
- Nationwide expansion
- A second rebuild in another no-code platform
- Full bilingual product flow
- An uncontrolled LLM chat added only to look more “agentic”
