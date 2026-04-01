# MyVette Deep Research Prompt — Moddable Sub-Components by Generation

Copy everything below the line into a Deep Research session.

---

## Project Context

I'm building **MyVette**, a Corvette-only 3D configurator web app. This is NOT a generic car parts finder — it's a premium tool for Corvette owners that combines:

- **3D visualization**: Interactive 3D models of each Corvette generation (C3 through C8) with Normal and X-Ray views, plus isolated part mesh viewing
- **RPG-style stat system**: Every part shows HP gain, weight change, and 0-60 impact as visual stat bars against stock baselines
- **Aftermarket marketplace**: Real product listings from actual retailers (Summit Racing, Paragon Performance, Zip Corvette, Corvette Central, eBay, etc.) with live pricing
- **AI upgrade analysis**: Claude-powered analysis of each specific product — what it does to the car, install difficulty, pros/cons, compatibility notes
- **Competitor price comparison**: Side-by-side pricing across retailers for the same part

The app has 12 main part categories (Engine, Transmission, Exhaust, Intake, Suspension, Brakes, Cooling, Fuel System, Wheels, Steering, Interior, Electrical/ECU) displayed as tabs. **The critical next feature is sub-tabs** — when a user clicks "Engine," they should see specific moddable sub-components like Camshaft, Headers, Throttle Body, etc. Each sub-component then drives a targeted product search that returns individual purchasable items with real prices.

**The depth of this data IS the product.** Anyone can Google "Corvette C8 mods." The value is knowing that a C8 LT2 needs a specific cam package vs a C6 LS3, that C3 leaf springs are a completely different mod path than C5 transverse composites, and being able to search for the exact right part with the exact right keywords on the exact right retailers.

## What I Need

I need an exhaustive, generation-specific breakdown of every aftermarket-moddable sub-component for each of the 12 main part categories, across all 6 Corvette generations. Not generic categories — the actual individual parts a Corvette owner would search for and buy.

## The 6 Generations

1. **C3 Stingray (1968-1982)** — 350ci Small-Block V8, Muncie M21 4-Speed Manual, leaf spring rear, drum/disc brakes
2. **C4 (1984-1996)** — 5.7L L98/LT1 V8, Doug Nash 4+3 / 6-speed manual / 4L60E auto, transverse leaf springs, Delco-Bilstein shocks
3. **C5 (1997-2004)** — 5.7L LS1 V8, T56 6-speed manual / 4L60E auto, hydroformed frame, transverse leaf springs
4. **C6 (2005-2013)** — 6.0L LS2 / 6.2L LS3 V8 (base), 7.0L LS7 (Z06), T56 / TR6060 6-speed / 6L80 auto, aluminum frame
5. **C7 Stingray (2014-2019)** — 6.2L LT1 V8 (base), 6.2L LT4 supercharged (Z06), 7-speed manual / 8L90 8-speed auto, magnetic ride, carbon fiber options
6. **C8 Stingray (2020-present)** — 6.2L LT2 V8 (mid-engine), 8-speed Tremec DCT only, dry-sump oiling, electronic LSD, completely new platform

## The 12 Main Part Categories

For EACH generation, I need every specific moddable sub-component under these categories:

### 1. Engine
Not just "engine upgrades" — I need every individual bolt-on and internal mod. Think: camshaft, headers (long tube vs shorty), cold air intake, throttle body, intake manifold, spark plugs/wires, valve springs, rocker arms, pushrods, lifters, oil pump, water pump, harmonic balancer, engine mounts, catch cans, oil cooler, etc. What's specific to each generation's engine architecture?

### 2. Transmission
Clutch kits (single vs twin disc vs triple disc), flywheel (steel vs aluminum), short throw shifter, transmission mount, shift cables, torque converter (for autos), TCM tune, paddle shifter upgrades (C8), transmission cooler, etc.

### 3. Exhaust
Headers (shorty vs long tube), mid-pipes, X-pipes vs H-pipes, axle-back, cat-back, muffler deletes, resonator deletes, exhaust tips, catalytic converters (high-flow), exhaust manifold gaskets, O2 sensor extensions, specific brand options per generation (Corsa, Borla, Kooks, etc.)

### 4. Intake
Cold air intake, ram air, intake manifold (ported vs aftermarket), throttle body (ported vs larger), air filter, MAF sensor housing, intake tube/piping, velocity stacks — what's unique per generation?

### 5. Suspension
Coilovers, lowering springs, sway bars (front + rear), end links, control arms, bushings (poly vs solid), trailing arms, tie rods, shock absorbers, strut tower braces, subframe connectors, camber/caster plates, bump steer kits, leaf springs (C3-C5 specific), magnetic ride shocks (C6+), etc.

### 6. Brakes
Rotors (drilled vs slotted vs 2-piece), brake pads (street vs track compound), big brake kits (BBK), calipers, stainless brake lines, brake fluid, master cylinder, brake ducts/cooling, parking brake shoes/cables, ABS module, proportioning valve, etc.

### 7. Cooling
Radiator (aluminum vs stock), electric fan conversion (C3/C4), fan controller, thermostat, coolant hoses (silicone), overflow tank, oil cooler, transmission cooler, intercooler (if forced induction), coolant reroute (LS engines), water pump (mechanical vs electric), etc.

### 8. Fuel System
Fuel injectors, fuel pump, fuel rails, fuel pressure regulator, fuel filter, fuel lines (AN fittings), E85 conversion kits, flex fuel sensor, fuel cell/tank upgrade, returnless fuel system conversion, etc.

### 9. Wheels & Tires
Wheel sizes per generation (what fits without rubbing), offset ranges, hub-centric rings, lug nuts, wheel spacers, tire sizes (staggered setups), tire compounds (summer vs all-season vs drag radials), TPMS sensors, center caps, wheel locks, drag wheel/tire packages, etc.

### 10. Steering
Steering rack, power steering pump, steering shaft, quick ratio adapter, steering wheel (flat bottom, carbon fiber, D-shape), steering column, tie rod ends, steering dampener, electric power steering conversion (C3/C4), rack bushings, etc.

### 11. Interior
Seats (racing buckets, heated/cooled upgrades), seat brackets/rails, harness bar, roll bar/cage, shift knob, pedal covers, dashboard trim, gauge cluster (aftermarket gauges), head unit / infotainment, speakers/subwoofer, interior LED kit, floor mats (custom), steering wheel (leather/alcantara/carbon), door sill plates, etc.

### 12. Electrical / ECU
ECU tune (HP Tuners, EFI Live), performance chip, spark plug wires, ignition coils, battery (lightweight lithium), alternator (high output), wiring harness, fuse box upgrade, LED headlight/taillight conversion, underbody lighting, dash cam hardwire, aftermarket gauge wiring, O2 sensor simulators, speed sensor, etc.

## What I Need in the Response

For each generation + each part category, give me:

1. **Sub-component list**: Every specific moddable part (not vague categories — actual parts someone would search for on Summit Racing, Zip Corvette, Paragon Performance, or eBay)
2. **Generation-specific notes**: What's unique about this generation's architecture that affects modding? (e.g., C3 has points ignition vs C4 has TPI vs C5+ has LS-based architecture, C8 is mid-engine so headers are different)
3. **Compatibility warnings**: What doesn't cross between generations? What requires supporting mods?
4. **Search keywords**: For each sub-component, what would someone actually type into a parts site to find the right product? (e.g., not "C5 engine mod" but "LS1 cam package 228/232 .585 lift")

Format as a structured table or nested list per generation. Be exhaustive — if a Corvette owner could buy it and bolt it on (or have a shop install it), I want it listed.

This data will power sub-tabs in my app's parts panel, where each main category (Engine, Transmission, etc.) expands into specific sub-components, and each sub-component links to real purchasable products. The depth of this data IS the product — anyone can Google "Corvette C8 mods." I need the data that makes someone say "this app actually knows my car."

## 5. Retailer & Pricing Landscape

For each generation, identify:
- **Primary retailers**: Who are the go-to stores for this generation? (e.g., Zip Corvette for C3, Paragon Performance for C7/C8, Summit Racing for all, etc.)
- **Price ranges**: For each sub-component, what's the typical price range? (budget vs mid vs premium tiers)
- **Brand leaders**: Who makes the best-known version of each part? (e.g., Kooks headers, Corsa exhaust, Bilstein shocks, AP Racing brakes)
- **Price comparison opportunity**: Which parts have the biggest price variance across retailers? (This is where our competitive pricing feature adds the most value)

I want to build a system where a user clicks "C8 > Engine > Long Tube Headers" and sees:
- Kooks 1-7/8" LT Headers — $1,899 @ Summit, $1,849 @ Paragon, $1,925 @ eBay
- American Racing Headers LT2 — $2,100 @ Summit, $1,995 @ direct
- Stainless Works C8 Headers — $1,750 @ Summit, $1,699 @ Paragon

That level of specificity. Not "here are some engine parts." Real products, real prices, real comparison shopping. The research should identify which sub-components have the most active aftermarket (most brands competing = most value for price comparison) and which are niche (1-2 options, less price variance).
