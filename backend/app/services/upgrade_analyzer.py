"""AI-powered aftermarket upgrade impact analyzer using Claude."""

import json
import logging
from typing import Any

import anthropic

from app.config import settings

logger = logging.getLogger(__name__)

# Stock specs per generation for context
CORVETTE_STOCK_SPECS: dict[str, dict[str, Any]] = {
    "c3": {
        "engine": "350ci Small-Block V8",
        "horsepower": 300,
        "torque": 300,
        "zero_to_sixty": 5.8,
        "weight": 3400,
        "transmission": "Muncie M21 4-Speed Manual",
        "layout": "Front-engine RWD",
    },
    "c4": {
        "engine": "5.7L L98 V8",
        "horsepower": 245,
        "torque": 340,
        "zero_to_sixty": 5.4,
        "weight": 3300,
        "transmission": "4+3 Manual / 4L60 Auto",
        "layout": "Front-engine RWD",
    },
    "c5": {
        "engine": "5.7L LS1 V8",
        "horsepower": 345,
        "torque": 350,
        "zero_to_sixty": 4.7,
        "weight": 3250,
        "transmission": "6-Speed Manual / 4L60E Auto",
        "layout": "Front-engine RWD",
    },
    "c6": {
        "engine": "6.2L LS3 V8",
        "horsepower": 430,
        "torque": 424,
        "zero_to_sixty": 4.0,
        "weight": 3210,
        "transmission": "6-Speed Manual / 6L80 Auto",
        "layout": "Front-engine RWD",
    },
    "c7": {
        "engine": "6.2L LT1 V8",
        "horsepower": 455,
        "torque": 460,
        "zero_to_sixty": 3.7,
        "weight": 3360,
        "transmission": "7-Speed Manual / 8L90 Auto",
        "layout": "Front-engine RWD",
    },
    "c8": {
        "engine": "6.2L LT2 V8",
        "horsepower": 495,
        "torque": 470,
        "zero_to_sixty": 2.9,
        "weight": 3535,
        "transmission": "8-speed DCT",
        "layout": "Mid-engine RWD",
    },
}


async def analyze_upgrade(
    generation: str,
    part_category: str,
    product_name: str,
    product_description: str = "",
    product_price: str | None = None,
) -> dict[str, Any]:
    """Analyze the impact of an aftermarket upgrade using Claude.

    Returns a dict with estimated performance changes, pros/cons, etc.
    Returns an error dict on failure.
    """
    if not settings.anthropic_api_key:
        logger.warning("No ANTHROPIC_API_KEY set; skipping upgrade analysis")
        return {"error": "AI analysis not configured"}

    stock = CORVETTE_STOCK_SPECS.get(generation.lower(), CORVETTE_STOCK_SPECS["c8"])
    gen_label = generation.upper()

    price_info = f"\nProduct price: {product_price}" if product_price else ""
    desc_info = f"\nProduct description: {product_description}" if product_description else ""

    prompt = f"""You are an expert Corvette performance tuner and automotive engineer. Analyze the following aftermarket upgrade for a Corvette {gen_label}.

STOCK CAR SPECS:
- Engine: {stock['engine']}
- Horsepower: {stock['horsepower']} HP
- Torque: {stock['torque']} lb-ft
- 0-60 mph: {stock['zero_to_sixty']}s
- Weight: {stock['weight']} lbs
- Transmission: {stock['transmission']}
- Layout: {stock['layout']}

UPGRADE PRODUCT:
- Part category: {part_category}
- Product name: {product_name}{desc_info}{price_info}

Respond with ONLY a JSON object (no markdown, no code fences) with these exact fields:
{{
  "estimated_hp_gain": [min, max],
  "estimated_torque_gain": [min, max],
  "estimated_weight_change": [min, max],
  "estimated_zero_to_sixty_change": [min, max],
  "confidence": "high" | "medium" | "low",
  "summary": "1-2 sentence impact summary",
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2"],
  "difficulty": "bolt-on" | "moderate" | "advanced" | "professional",
  "install_time": "estimated time string like '2-4 hours'",
  "compatibility_notes": "any generation-specific notes"
}}

Rules:
- HP/torque gains are positive numbers for increases
- Weight change: negative = lighter, positive = heavier
- 0-60 change: negative = faster, positive = slower
- Be realistic — don't overestimate gains
- Consider the specific generation's architecture and limitations
- If the product is unclear, use typical values for that category on that generation"""

    try:
        client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

        logger.info("AI upgrade analysis for %s %s: %s", gen_label, part_category, product_name)

        message = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=512,
            messages=[{"role": "user", "content": prompt}],
        )

        response_text = message.content[0].text.strip()

        # Strip code fences if present
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            response_text = "\n".join(lines)

        result = json.loads(response_text)
        logger.info("AI upgrade analysis complete: %s", result.get("summary", ""))
        return result

    except json.JSONDecodeError as exc:
        logger.warning("AI analysis returned invalid JSON: %s", exc)
        return {"error": "AI returned invalid response"}
    except Exception as exc:
        logger.exception("AI upgrade analysis failed: %s", exc)
        return {"error": f"Analysis failed: {str(exc)}"}
