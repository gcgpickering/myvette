import type { PartSlug } from '../types'
import type { GenerationCode } from './corvette-generations'

export interface PartImpact {
  slug: PartSlug
  name: string
  category: 'powertrain' | 'chassis' | 'electrical'
  /** Stock specs for this part on this generation */
  stock: {
    name: string
    weight?: number // lbs
  }
  /** Typical upgrade impact ranges */
  upgradeImpact: {
    hpGain: [number, number] // [min, max] HP gain from typical upgrades
    weightChange: [number, number] // [min, max] lbs (negative = lighter)
    zeroToSixtyChange: [number, number] // [min, max] seconds (negative = faster)
  }
  /** Brief description of what upgrading this part does */
  upgradeDescription: string
}

// ---------------------------------------------------------------------------
// Per-generation part impact data
// ---------------------------------------------------------------------------

const PART_IMPACTS: Record<GenerationCode, PartImpact[]> = {
  // =======================================================================
  // C3 Stingray (1968-1982) — 350ci small-block, drum/disc mix, leaf springs
  // Older platform = huge potential from modern parts
  // =======================================================================
  c3: [
    {
      slug: 'engine',
      name: 'Engine',
      category: 'powertrain',
      stock: { name: '350ci Small-Block V8', weight: 575 },
      upgradeImpact: {
        hpGain: [30, 150],
        weightChange: [-20, 0],
        zeroToSixtyChange: [-0.8, -0.2],
      },
      upgradeDescription:
        'Headers, a mild cam, and an intake swap can wake up the 350ci significantly. A full rebuild with forged internals and a roller cam pushes well past 400hp.',
    },
    {
      slug: 'transmission',
      name: 'Transmission',
      category: 'powertrain',
      stock: { name: 'Muncie M21 4-Speed Manual', weight: 95 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-10, 15],
        zeroToSixtyChange: [-0.4, -0.1],
      },
      upgradeDescription:
        'Swapping to a Tremec T56 or TKX gives a modern 6-speed with overdrive, improving highway cruising and closer gear ratios for faster acceleration.',
    },
    {
      slug: 'exhaust',
      name: 'Exhaust System',
      category: 'powertrain',
      stock: { name: 'Cast Iron Manifolds & 2.0" Pipes', weight: 85 },
      upgradeImpact: {
        hpGain: [15, 40],
        weightChange: [-25, -10],
        zeroToSixtyChange: [-0.3, -0.1],
      },
      upgradeDescription:
        'Long-tube headers with a true dual exhaust and free-flowing mufflers release trapped power. Restrictive factory manifolds and single exhaust are the biggest bottleneck on stock C3s.',
    },
    {
      slug: 'suspension',
      name: 'Suspension',
      category: 'chassis',
      stock: { name: 'Independent Rear / Front Wishbone, Leaf Springs', weight: 210 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-15, -5],
        zeroToSixtyChange: [-0.4, -0.1],
      },
      upgradeDescription:
        'Modern coilover conversion kits replace the heavy leaf spring rear and worn rubber bushings. Dramatically improves launch traction and cornering, taking seconds off autocross times.',
    },
    {
      slug: 'brakes',
      name: 'Brakes',
      category: 'chassis',
      stock: { name: '4-Wheel Disc Brakes (11.75" rotors)', weight: 120 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-15, -5],
        zeroToSixtyChange: [0, 0],
      },
      upgradeDescription:
        'Wilwood or Baer big-brake kits with modern calipers and slotted rotors dramatically improve stopping power and reduce fade. Essential for any C3 seeing spirited driving.',
    },
    {
      slug: 'steering',
      name: 'Steering',
      category: 'chassis',
      stock: { name: 'Recirculating Ball Power Steering', weight: 45 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-5, 5],
        zeroToSixtyChange: [0, 0],
      },
      upgradeDescription:
        'A rack-and-pinion conversion or modern steering box tightens up the vague factory steering. Electric power steering conversions free up a few HP from the belt-driven pump.',
    },
    {
      slug: 'cooling-system',
      name: 'Cooling System',
      category: 'powertrain',
      stock: { name: '3-Core Copper/Brass Radiator', weight: 30 },
      upgradeImpact: {
        hpGain: [0, 5],
        weightChange: [-8, -3],
        zeroToSixtyChange: [0, 0],
      },
      upgradeDescription:
        'An aluminum 2-row radiator with electric fans replaces the heavy copper unit and engine-driven fan. Better cooling lets you run more timing advance and prevents heat soak.',
    },
    {
      slug: 'fuel-system',
      name: 'Fuel System',
      category: 'powertrain',
      stock: { name: 'Rochester Quadrajet 4bbl Carburetor', weight: 22 },
      upgradeImpact: {
        hpGain: [10, 40],
        weightChange: [-2, 5],
        zeroToSixtyChange: [-0.3, -0.1],
      },
      upgradeDescription:
        'A Holley 4150-style carb or a modern EFI retrofit (like Holley Sniper) improves fuel atomization, cold start, and throttle response. EFI also adds self-tuning capability.',
    },
    {
      slug: 'air-intake',
      name: 'Air Intake',
      category: 'powertrain',
      stock: { name: 'Stock Air Cleaner Assembly', weight: 12 },
      upgradeImpact: {
        hpGain: [5, 20],
        weightChange: [-4, -1],
        zeroToSixtyChange: [-0.1, 0],
      },
      upgradeDescription:
        'An open-element air cleaner or cold-air intake funnels cooler, denser air to the carb or throttle body. Bigger gains when combined with a larger carb or intake manifold.',
    },
    {
      slug: 'ecu-electronics',
      name: 'ECU & Electronics',
      category: 'electrical',
      stock: { name: 'Points Ignition / HEI Distributor', weight: 8 },
      upgradeImpact: {
        hpGain: [5, 25],
        weightChange: [-2, 2],
        zeroToSixtyChange: [-0.2, -0.1],
      },
      upgradeDescription:
        'Upgrading to an MSD ignition box, electronic distributor, or a full standalone EFI/ECU adds precise timing control. Eliminates misfires at high RPM and enables data logging.',
    },
    {
      slug: 'tires-wheels',
      name: 'Tires & Wheels',
      category: 'chassis',
      stock: { name: '15x8" Rally Wheels, 225/70R15 Tires', weight: 95 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-20, -5],
        zeroToSixtyChange: [-0.5, -0.2],
      },
      upgradeDescription:
        'Modern 17" lightweight wheels with 275-width performance tires transform grip levels. The single biggest improvement for 0-60, cornering, and braking on any C3.',
    },
    {
      slug: 'turbo-supercharger',
      name: 'Turbo / Supercharger',
      category: 'powertrain',
      stock: { name: 'Naturally Aspirated (no forced induction)', weight: 0 },
      upgradeImpact: {
        hpGain: [80, 250],
        weightChange: [40, 70],
        zeroToSixtyChange: [-1.5, -0.5],
      },
      upgradeDescription:
        'A centrifugal supercharger (Procharger/Vortech) or a turbo kit adds massive power to the small-block. Requires supporting fuel system and engine upgrades for reliability above 450hp.',
    },
  ],

  // =======================================================================
  // C4 Corvette (1984-1996) — L98/LT1, transverse leaf springs, digital dash
  // =======================================================================
  c4: [
    {
      slug: 'engine',
      name: 'Engine',
      category: 'powertrain',
      stock: { name: '350ci L98 TPI V8', weight: 550 },
      upgradeImpact: {
        hpGain: [25, 120],
        weightChange: [-15, 0],
        zeroToSixtyChange: [-0.7, -0.2],
      },
      upgradeDescription:
        'The TPI responds well to a cam swap, ported heads, and headers. An LS swap is increasingly popular and can double the factory output while dropping weight.',
    },
    {
      slug: 'transmission',
      name: 'Transmission',
      category: 'powertrain',
      stock: { name: 'Doug Nash 4+3 Manual', weight: 105 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-10, 10],
        zeroToSixtyChange: [-0.3, -0.1],
      },
      upgradeDescription:
        'The troublesome 4+3 overdrive unit is commonly replaced with a Tremec T56 6-speed. Stronger, more reliable, and better gear ratios for both street and track.',
    },
    {
      slug: 'exhaust',
      name: 'Exhaust System',
      category: 'powertrain',
      stock: { name: 'Cast Manifolds & Catalytic Converters', weight: 80 },
      upgradeImpact: {
        hpGain: [12, 35],
        weightChange: [-20, -8],
        zeroToSixtyChange: [-0.2, -0.1],
      },
      upgradeDescription:
        'Long-tube headers and a cat-back exhaust free up significant power from the restricted factory system. Stainless steel systems also shed weight versus the cast iron originals.',
    },
    {
      slug: 'suspension',
      name: 'Suspension',
      category: 'chassis',
      stock: { name: 'Transverse Fiberglass Leaf Springs, Z51 Option', weight: 185 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-10, 0],
        zeroToSixtyChange: [-0.3, -0.1],
      },
      upgradeDescription:
        'Adjustable Koni or Bilstein shocks with stiffer leaf springs and polyurethane bushings sharpen the already-capable C4 chassis. Coilover conversions are available for full adjustability.',
    },
    {
      slug: 'brakes',
      name: 'Brakes',
      category: 'chassis',
      stock: { name: '4-Wheel Disc (12" front, 11.5" rear)', weight: 110 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-10, -3],
        zeroToSixtyChange: [0, 0],
      },
      upgradeDescription:
        'C5 caliper swap is a popular bolt-on upgrade providing better clamping force. Stainless lines and performance pads reduce fade during extended track sessions.',
    },
    {
      slug: 'steering',
      name: 'Steering',
      category: 'chassis',
      stock: { name: 'Rack and Pinion Power Steering', weight: 38 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-3, 3],
        zeroToSixtyChange: [0, 0],
      },
      upgradeDescription:
        'The C4 already has rack-and-pinion. Upgrades focus on a quicker-ratio steering rack, stiffer bushings, and an electric power steering conversion to free up belt-driven parasitic loss.',
    },
    {
      slug: 'cooling-system',
      name: 'Cooling System',
      category: 'powertrain',
      stock: { name: 'Single-Row Aluminum Radiator', weight: 25 },
      upgradeImpact: {
        hpGain: [0, 3],
        weightChange: [-5, 0],
        zeroToSixtyChange: [0, 0],
      },
      upgradeDescription:
        'A dual-row aluminum radiator and twin electric fans improve cooling capacity. Important for track use or cars with forced induction upgrades.',
    },
    {
      slug: 'fuel-system',
      name: 'Fuel System',
      category: 'powertrain',
      stock: { name: 'Tuned Port Injection (TPI)', weight: 35 },
      upgradeImpact: {
        hpGain: [8, 30],
        weightChange: [-3, 3],
        zeroToSixtyChange: [-0.2, -0.1],
      },
      upgradeDescription:
        'Larger fuel injectors, an adjustable fuel pressure regulator, and a higher-flow pump support increased power. A ported TPI intake or swap to an LT1 intake opens up the top-end.',
    },
    {
      slug: 'air-intake',
      name: 'Air Intake',
      category: 'powertrain',
      stock: { name: 'TPI Air Box & MAF Sensor', weight: 14 },
      upgradeImpact: {
        hpGain: [5, 15],
        weightChange: [-3, 0],
        zeroToSixtyChange: [-0.1, 0],
      },
      upgradeDescription:
        'A cold-air intake box or open-element filter with a larger MAF sensor reduces restriction. The TPI system is sensitive to intake temperature, so cold air makes a real difference.',
    },
    {
      slug: 'ecu-electronics',
      name: 'ECU & Electronics',
      category: 'electrical',
      stock: { name: 'GM ECM (1227730 / 16198259)', weight: 5 },
      upgradeImpact: {
        hpGain: [10, 30],
        weightChange: [0, 1],
        zeroToSixtyChange: [-0.2, -0.1],
      },
      upgradeDescription:
        'A custom chip burn or TunerPro calibration optimizes fuel and spark maps. Removing the VATS security system delay and adjusting shift points (auto) are popular complementary mods.',
    },
    {
      slug: 'tires-wheels',
      name: 'Tires & Wheels',
      category: 'chassis',
      stock: { name: '16x8.5" Wheels, 255/50ZR16 Tires', weight: 100 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-15, -5],
        zeroToSixtyChange: [-0.4, -0.2],
      },
      upgradeDescription:
        'Modern 17x9.5" wheels with 275/40R17 tires dramatically improve grip. Lighter wheels also reduce unsprung weight, sharpening turn-in and acceleration.',
    },
    {
      slug: 'turbo-supercharger',
      name: 'Turbo / Supercharger',
      category: 'powertrain',
      stock: { name: 'Naturally Aspirated (no forced induction)', weight: 0 },
      upgradeImpact: {
        hpGain: [70, 200],
        weightChange: [35, 65],
        zeroToSixtyChange: [-1.2, -0.4],
      },
      upgradeDescription:
        'A centrifugal supercharger or SBC turbo kit on the L98 can easily push 350-450hp. The TPI intake responds well to moderate boost with proper tuning and supporting mods.',
    },
  ],

  // =======================================================================
  // C5 Corvette (1997-2004) — LS1/LS6, hydroformed frame, rear transaxle
  // =======================================================================
  c5: [
    {
      slug: 'engine',
      name: 'Engine',
      category: 'powertrain',
      stock: { name: '5.7L LS1 V8', weight: 460 },
      upgradeImpact: {
        hpGain: [25, 100],
        weightChange: [-5, 0],
        zeroToSixtyChange: [-0.5, -0.2],
      },
      upgradeDescription:
        'The LS1 is one of the most tunable engines ever made. A cam, headers, and tune combo ("cam-headers-tune") is the classic recipe, yielding 400-440hp reliably.',
    },
    {
      slug: 'transmission',
      name: 'Transmission',
      category: 'powertrain',
      stock: { name: 'Tremec T56 6-Speed Manual', weight: 100 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-5, 5],
        zeroToSixtyChange: [-0.2, -0.1],
      },
      upgradeDescription:
        'The T56 is already stout. A short-throw shifter and upgraded synchros improve shift feel. For high-power builds, a T56 Magnum handles over 700 lb-ft. Lightweight flywheel aids rev matching.',
    },
    {
      slug: 'exhaust',
      name: 'Exhaust System',
      category: 'powertrain',
      stock: { name: 'Stainless Manifolds & Dual Cat-Back', weight: 65 },
      upgradeImpact: {
        hpGain: [10, 30],
        weightChange: [-15, -5],
        zeroToSixtyChange: [-0.2, -0.1],
      },
      upgradeDescription:
        'Long-tube headers (like Kooks or American Racing) with an X-pipe and cat-back are the go-to. Adds great sound and real power, especially paired with a tune.',
    },
    {
      slug: 'suspension',
      name: 'Suspension',
      category: 'chassis',
      stock: { name: 'SLA Front / Transverse Leaf Rear', weight: 175 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-15, -5],
        zeroToSixtyChange: [-0.3, -0.1],
      },
      upgradeDescription:
        'Coilovers (Penske, Ohlins, or budget Koni/Bilstein) with adjustable end links transform the C5 into a track weapon. Lowering also improves aerodynamics and center of gravity.',
    },
    {
      slug: 'brakes',
      name: 'Brakes',
      category: 'chassis',
      stock: { name: '4-Wheel Disc (12.8" front, 12" rear)', weight: 105 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-8, -2],
        zeroToSixtyChange: [0, 0],
      },
      upgradeDescription:
        'Hawk or Carbotech pads with slotted rotors and stainless lines are the popular track setup. C6 Z06 caliper swap is a bolt-on upgrade for more clamping force.',
    },
    {
      slug: 'steering',
      name: 'Steering',
      category: 'chassis',
      stock: { name: 'Speed-Sensitive Rack and Pinion', weight: 35 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-2, 2],
        zeroToSixtyChange: [0, 0],
      },
      upgradeDescription:
        'A quicker-ratio steering rack and stiffer tie rod ends improve responsiveness. Electric power steering conversions eliminate the belt-driven pump for cleaner engine bay packaging.',
    },
    {
      slug: 'cooling-system',
      name: 'Cooling System',
      category: 'powertrain',
      stock: { name: 'Dual-Row Aluminum Radiator', weight: 22 },
      upgradeImpact: {
        hpGain: [0, 3],
        weightChange: [-3, 0],
        zeroToSixtyChange: [0, 0],
      },
      upgradeDescription:
        'A DeWitts or BeCool high-capacity radiator keeps temps stable on track. An oil cooler is a common addition for sustained high-RPM use. Stock cooling is adequate for street duty.',
    },
    {
      slug: 'fuel-system',
      name: 'Fuel System',
      category: 'powertrain',
      stock: { name: 'Sequential Fuel Injection, Returnless', weight: 18 },
      upgradeImpact: {
        hpGain: [5, 20],
        weightChange: [-1, 2],
        zeroToSixtyChange: [-0.1, 0],
      },
      upgradeDescription:
        'Larger injectors (36lb+) and a return-style fuel system conversion support higher-power builds. Stock fuel system is adequate up to about 425hp on the LS1.',
    },
    {
      slug: 'air-intake',
      name: 'Air Intake',
      category: 'powertrain',
      stock: { name: 'MAF-Based Intake with Airbox', weight: 10 },
      upgradeImpact: {
        hpGain: [5, 15],
        weightChange: [-3, 0],
        zeroToSixtyChange: [-0.1, 0],
      },
      upgradeDescription:
        'A Vararam or SLP cold-air intake feeds cooler air to the LS1. Modest gains on their own but they support bigger gains when combined with heads, cam, and a tune.',
    },
    {
      slug: 'ecu-electronics',
      name: 'ECU & Electronics',
      category: 'electrical',
      stock: { name: 'GM PCM (LS1 OBD-II)', weight: 4 },
      upgradeImpact: {
        hpGain: [8, 25],
        weightChange: [0, 0],
        zeroToSixtyChange: [-0.2, -0.1],
      },
      upgradeDescription:
        'HP Tuners or EFILive custom tunes optimize fuel, spark, and transmission shift points. Removing torque management alone frees up noticeable throttle response. Essential with any bolt-on mods.',
    },
    {
      slug: 'tires-wheels',
      name: 'Tires & Wheels',
      category: 'chassis',
      stock: { name: '17x8.5" Front / 18x9.5" Rear Wheels', weight: 92 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-18, -5],
        zeroToSixtyChange: [-0.4, -0.1],
      },
      upgradeDescription:
        'Lightweight forged wheels (CCW, Forgeline) with sticky tires (Michelin PS4S, NT555 RII) are the most impactful single upgrade for acceleration and handling.',
    },
    {
      slug: 'turbo-supercharger',
      name: 'Turbo / Supercharger',
      category: 'powertrain',
      stock: { name: 'Naturally Aspirated (no forced induction)', weight: 0 },
      upgradeImpact: {
        hpGain: [100, 250],
        weightChange: [35, 60],
        zeroToSixtyChange: [-1.3, -0.5],
      },
      upgradeDescription:
        'A Procharger P-1SC or turbo kit on a stock-bottom-end LS1 can safely make 500-600hp. The LS1 bottom end handles 550hp with good tuning. Beyond that, forged internals are needed.',
    },
  ],

  // =======================================================================
  // C6 Corvette (2005-2013) — LS3/LS9, fixed headlights, refined chassis
  // Using base LS3 as the stock reference (Z06/ZR1 are specialized trims)
  // =======================================================================
  c6: [
    {
      slug: 'engine',
      name: 'Engine',
      category: 'powertrain',
      stock: { name: '6.2L LS3 V8', weight: 450 },
      upgradeImpact: {
        hpGain: [25, 90],
        weightChange: [-5, 0],
        zeroToSixtyChange: [-0.4, -0.2],
      },
      upgradeDescription:
        'The LS3 makes 430hp stock and responds well to a cam-headers-tune combo. Ported LS3 heads flow incredibly well. Fully built LS3s regularly exceed 550hp naturally aspirated.',
    },
    {
      slug: 'transmission',
      name: 'Transmission',
      category: 'powertrain',
      stock: { name: 'Tremec TR6060 6-Speed Manual', weight: 110 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-3, 5],
        zeroToSixtyChange: [-0.2, -0.1],
      },
      upgradeDescription:
        'The TR6060 handles big power. A short-throw shifter and lightweight flywheel/clutch combo improve shift speed. MGW shifters eliminate the notchy factory feel.',
    },
    {
      slug: 'exhaust',
      name: 'Exhaust System',
      category: 'powertrain',
      stock: { name: 'Tubular Manifolds & Dual-Mode Cat-Back', weight: 55 },
      upgradeImpact: {
        hpGain: [10, 30],
        weightChange: [-12, -5],
        zeroToSixtyChange: [-0.2, -0.1],
      },
      upgradeDescription:
        'Kooks long-tube headers with an X-pipe and Corsa/Borla cat-back are the gold standard. The NPP bi-mode exhaust is already decent, but headers are where the real gains are.',
    },
    {
      slug: 'suspension',
      name: 'Suspension',
      category: 'chassis',
      stock: { name: 'SLA Front / Transverse Leaf Rear, Magnetic Ride (Z51)', weight: 165 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-10, -3],
        zeroToSixtyChange: [-0.2, -0.1],
      },
      upgradeDescription:
        'Coilovers, adjustable sway bars, and spherical end links dial in the already-excellent C6 chassis. Pfadt and aFe are go-to brands. Stock Magnetic Ride is surprisingly good.',
    },
    {
      slug: 'brakes',
      name: 'Brakes',
      category: 'chassis',
      stock: { name: '4-Piston Front / 4-Piston Rear Disc (13.4" / 13")', weight: 100 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-8, -2],
        zeroToSixtyChange: [0, 0],
      },
      upgradeDescription:
        'Z06 or ZR1 brake swap is the most popular upgrade. High-temp pads (PFC, Carbotech) and 2-piece rotors reduce unsprung weight and improve fade resistance on track.',
    },
    {
      slug: 'steering',
      name: 'Steering',
      category: 'chassis',
      stock: { name: 'Speed-Sensitive Power Rack and Pinion', weight: 34 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-2, 2],
        zeroToSixtyChange: [0, 0],
      },
      upgradeDescription:
        'Stiffer bushings, upgraded tie rod ends, and an electric power steering conversion are the main options. Most C6 owners find the stock steering feel acceptable.',
    },
    {
      slug: 'cooling-system',
      name: 'Cooling System',
      category: 'powertrain',
      stock: { name: 'Aluminum Radiator with Electric Fans', weight: 20 },
      upgradeImpact: {
        hpGain: [0, 3],
        weightChange: [-2, 0],
        zeroToSixtyChange: [0, 0],
      },
      upgradeDescription:
        'A high-capacity radiator and oil cooler keep temps in check during HPDE events. A heat exchanger upgrade is essential for supercharged builds.',
    },
    {
      slug: 'fuel-system',
      name: 'Fuel System',
      category: 'powertrain',
      stock: { name: 'Sequential MPI, Returnless', weight: 16 },
      upgradeImpact: {
        hpGain: [3, 15],
        weightChange: [0, 2],
        zeroToSixtyChange: [-0.1, 0],
      },
      upgradeDescription:
        'The stock fuel system supports about 500hp. Higher-flow injectors and a return-style conversion are needed for supercharged or big-cam builds above that threshold.',
    },
    {
      slug: 'air-intake',
      name: 'Air Intake',
      category: 'powertrain',
      stock: { name: 'Cold Air Intake with MAF', weight: 9 },
      upgradeImpact: {
        hpGain: [5, 12],
        weightChange: [-2, 0],
        zeroToSixtyChange: [-0.1, 0],
      },
      upgradeDescription:
        'A Halltech or Vararam intake improves airflow to the LS3. Gains are modest as the factory intake is already well-designed. Bigger gains come with a ported throttle body.',
    },
    {
      slug: 'ecu-electronics',
      name: 'ECU & Electronics',
      category: 'electrical',
      stock: { name: 'GM E38 ECM (LS3 OBD-II)', weight: 3 },
      upgradeImpact: {
        hpGain: [8, 20],
        weightChange: [0, 0],
        zeroToSixtyChange: [-0.2, -0.1],
      },
      upgradeDescription:
        'HP Tuners or EFILive tune removes torque management, optimizes spark advance, and adjusts shift firmness (auto). The LS3 leaves some power on the table from the factory.',
    },
    {
      slug: 'tires-wheels',
      name: 'Tires & Wheels',
      category: 'chassis',
      stock: { name: '18x8.5" Front / 19x10" Rear Wheels', weight: 88 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-15, -5],
        zeroToSixtyChange: [-0.3, -0.1],
      },
      upgradeDescription:
        'Lightweight forged wheels with wider tires (305+ rear) on Michelin PS4S or Toyo R888R tires maximize grip. A staggered 18/19 setup maintains ride quality while adding traction.',
    },
    {
      slug: 'turbo-supercharger',
      name: 'Turbo / Supercharger',
      category: 'powertrain',
      stock: { name: 'Naturally Aspirated (no forced induction)', weight: 0 },
      upgradeImpact: {
        hpGain: [100, 250],
        weightChange: [35, 60],
        zeroToSixtyChange: [-1.0, -0.4],
      },
      upgradeDescription:
        'An A&A Corvette supercharger or ECS twin-turbo kit on the LS3 can make 600-700hp on the stock bottom end. The LS3 bottom end is good to about 650hp with proper tuning.',
    },
  ],

  // =======================================================================
  // C7 Stingray (2014-2019) — LT1, advanced chassis, already very fast
  // =======================================================================
  c7: [
    {
      slug: 'engine',
      name: 'Engine',
      category: 'powertrain',
      stock: { name: '6.2L LT1 V8 (Direct Injection)', weight: 465 },
      upgradeImpact: {
        hpGain: [20, 80],
        weightChange: [-3, 0],
        zeroToSixtyChange: [-0.4, -0.1],
      },
      upgradeDescription:
        'The LT1 is already highly optimized at 455hp. A cam swap with long-tube headers and a custom tune is the proven combo, pushing 500-530hp NA. Ported heads add more up top.',
    },
    {
      slug: 'transmission',
      name: 'Transmission',
      category: 'powertrain',
      stock: { name: 'Tremec TR6060 7-Speed Manual', weight: 115 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-3, 3],
        zeroToSixtyChange: [-0.1, 0],
      },
      upgradeDescription:
        'The 7-speed is already excellent. Short-throw shifter and lightweight flywheel are the main upgrades. The 8-speed auto (8L90) benefits from a shift kit and calibration.',
    },
    {
      slug: 'exhaust',
      name: 'Exhaust System',
      category: 'powertrain',
      stock: { name: 'Active Exhaust (NPP Bi-Mode)', weight: 45 },
      upgradeImpact: {
        hpGain: [10, 25],
        weightChange: [-12, -5],
        zeroToSixtyChange: [-0.1, -0.05],
      },
      upgradeDescription:
        'Kooks or American Racing long-tube headers with high-flow cats and a Corsa cat-back provide the best gains. The factory NPP exhaust is already quite good for a stock system.',
    },
    {
      slug: 'suspension',
      name: 'Suspension',
      category: 'chassis',
      stock: { name: 'SLA Front / Transverse Leaf Rear, Magnetic Ride (Z51)', weight: 155 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-8, -2],
        zeroToSixtyChange: [-0.2, -0.1],
      },
      upgradeDescription:
        'Ohlins or Penske coilovers with adjustable sway bars elevate the already-brilliant C7 chassis. Most owners on Z51 find the stock setup sufficient for street and light track use.',
    },
    {
      slug: 'brakes',
      name: 'Brakes',
      category: 'chassis',
      stock: { name: 'Brembo 4-Piston Front / Rear (13.6" / 13.3")', weight: 95 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-6, -2],
        zeroToSixtyChange: [0, 0],
      },
      upgradeDescription:
        'The stock Brembos are excellent. Upgrades focus on track-compound pads, 2-piece rotors to save unsprung weight, and braided stainless lines for better pedal feel.',
    },
    {
      slug: 'steering',
      name: 'Steering',
      category: 'chassis',
      stock: { name: 'Electric Power Steering Rack', weight: 28 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [0, 0],
        zeroToSixtyChange: [0, 0],
      },
      upgradeDescription:
        'The C7 electric steering is already well-calibrated. Aftermarket adjustable outer tie rods improve alignment precision for track use. No major power or weight gains here.',
    },
    {
      slug: 'cooling-system',
      name: 'Cooling System',
      category: 'powertrain',
      stock: { name: 'Aluminum Radiator with Dual Electric Fans', weight: 18 },
      upgradeImpact: {
        hpGain: [0, 2],
        weightChange: [-2, 0],
        zeroToSixtyChange: [0, 0],
      },
      upgradeDescription:
        'A heat exchanger upgrade and oil cooler are mainly for track warriors and supercharged builds. The stock cooling system handles street use and occasional track days well.',
    },
    {
      slug: 'fuel-system',
      name: 'Fuel System',
      category: 'powertrain',
      stock: { name: 'Direct Injection + Port Injection Capable', weight: 15 },
      upgradeImpact: {
        hpGain: [3, 10],
        weightChange: [0, 2],
        zeroToSixtyChange: [-0.1, 0],
      },
      upgradeDescription:
        'The LT1 direct injection system is robust. Higher-flow injectors and a return-style line are mainly needed for forced-induction builds above 600hp.',
    },
    {
      slug: 'air-intake',
      name: 'Air Intake',
      category: 'powertrain',
      stock: { name: 'Direct Cold Air Intake with MAF', weight: 8 },
      upgradeImpact: {
        hpGain: [3, 10],
        weightChange: [-2, 0],
        zeroToSixtyChange: [-0.05, 0],
      },
      upgradeDescription:
        'A Halltech Beehive or K&N intake adds marginal gains. The factory intake is already very efficient. Most gains come from pairing with a custom tune.',
    },
    {
      slug: 'ecu-electronics',
      name: 'ECU & Electronics',
      category: 'electrical',
      stock: { name: 'GM E92 ECM (LT1, OBD-II)', weight: 3 },
      upgradeImpact: {
        hpGain: [10, 25],
        weightChange: [0, 0],
        zeroToSixtyChange: [-0.2, -0.1],
      },
      upgradeDescription:
        'HP Tuners calibration removes torque management, raises rev limiter, and optimizes spark tables. One of the best bang-for-buck mods on the C7, especially for the 8L90 auto.',
    },
    {
      slug: 'tires-wheels',
      name: 'Tires & Wheels',
      category: 'chassis',
      stock: { name: '18x8.5" Front / 19x10" Rear (Z51)', weight: 85 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-12, -4],
        zeroToSixtyChange: [-0.3, -0.1],
      },
      upgradeDescription:
        'Forgeline or HRE wheels with 305+ rear tires on Michelin Cup 2 or PS4S rubber are transformative. Wider front tires also improve braking and turn-in significantly.',
    },
    {
      slug: 'turbo-supercharger',
      name: 'Turbo / Supercharger',
      category: 'powertrain',
      stock: { name: 'Naturally Aspirated (no forced induction)', weight: 0 },
      upgradeImpact: {
        hpGain: [120, 280],
        weightChange: [35, 55],
        zeroToSixtyChange: [-1.0, -0.4],
      },
      upgradeDescription:
        'An East Coast Supercharging or ProCharger kit on the LT1 can push 650-750hp. The LT1 bottom end holds up well to around 700hp with proper tuning. A true supercar killer.',
    },
  ],

  // =======================================================================
  // C8 Stingray (2020-present) — LT2, mid-engine DCT, already near-supercar
  // Gains are smallest here because the platform is so optimized from factory
  // =======================================================================
  c8: [
    {
      slug: 'engine',
      name: 'Engine',
      category: 'powertrain',
      stock: { name: '6.2L LT2 V8', weight: 470 },
      upgradeImpact: {
        hpGain: [15, 70],
        weightChange: [-2, 0],
        zeroToSixtyChange: [-0.3, -0.1],
      },
      upgradeDescription:
        'The LT2 makes 495hp stock and is tightly engineered. Long-tube headers with a tune are the primary bolt-on path, reaching 530-560hp NA. Cam swaps are emerging but complex on the mid-engine layout.',
    },
    {
      slug: 'transmission',
      name: 'Transmission',
      category: 'powertrain',
      stock: { name: 'Tremec 8-Speed Dual-Clutch (DCT)', weight: 175 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [0, 0],
        zeroToSixtyChange: [-0.1, 0],
      },
      upgradeDescription:
        'The DCT is already lightning-fast. TCM calibration can improve shift aggression and launch control behavior. Aftermarket clutch packs support higher torque on forced-induction builds.',
    },
    {
      slug: 'exhaust',
      name: 'Exhaust System',
      category: 'powertrain',
      stock: { name: 'Active Valve Exhaust (NPP)', weight: 40 },
      upgradeImpact: {
        hpGain: [8, 20],
        weightChange: [-10, -4],
        zeroToSixtyChange: [-0.1, -0.05],
      },
      upgradeDescription:
        'Corsa or Borla cat-back systems with Kooks long-tube headers are the top choice. The mid-engine layout makes header access difficult, increasing install time and cost.',
    },
    {
      slug: 'suspension',
      name: 'Suspension',
      category: 'chassis',
      stock: { name: 'SLA Front & Rear, Magnetic Ride Control', weight: 150 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-5, -1],
        zeroToSixtyChange: [-0.15, -0.05],
      },
      upgradeDescription:
        'The MRC system is exceptional from the factory. Coilovers from Ohlins or MCS offer track-tunable damping, while lowering springs on Z51 cars close the gap to the Z06 stance.',
    },
    {
      slug: 'brakes',
      name: 'Brakes',
      category: 'chassis',
      stock: { name: 'Brembo 4-Piston (13.8" front / 13.3" rear)', weight: 90 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-5, -1],
        zeroToSixtyChange: [0, 0],
      },
      upgradeDescription:
        'The stock Brembos handle street and moderate track use well. AP Racing or Essex big-brake kits with 2-piece rotors reduce unsprung weight and handle repeated hard stops better.',
    },
    {
      slug: 'steering',
      name: 'Steering',
      category: 'chassis',
      stock: { name: 'Variable-Ratio Electric Power Steering', weight: 26 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [0, 0],
        zeroToSixtyChange: [0, 0],
      },
      upgradeDescription:
        'The C8 EPS system is well-tuned for the mid-engine layout. There are no common steering upgrades — the system provides excellent feedback and precision from the factory.',
    },
    {
      slug: 'cooling-system',
      name: 'Cooling System',
      category: 'powertrain',
      stock: { name: 'Front-Mounted Radiator with Mid-Engine Ducting', weight: 22 },
      upgradeImpact: {
        hpGain: [0, 2],
        weightChange: [-1, 0],
        zeroToSixtyChange: [0, 0],
      },
      upgradeDescription:
        'The factory cooling is designed for the mid-engine thermal challenges. Upgraded heat exchangers and oil coolers are mainly needed for supercharged builds or sustained track sessions.',
    },
    {
      slug: 'fuel-system',
      name: 'Fuel System',
      category: 'powertrain',
      stock: { name: 'Direct Injection (high-pressure)', weight: 14 },
      upgradeImpact: {
        hpGain: [2, 8],
        weightChange: [0, 1],
        zeroToSixtyChange: [-0.05, 0],
      },
      upgradeDescription:
        'The stock DI system is robust for naturally aspirated use. Upgraded high-pressure fuel pumps and larger injectors are required for forced-induction builds targeting 700hp+.',
    },
    {
      slug: 'air-intake',
      name: 'Air Intake',
      category: 'powertrain',
      stock: { name: 'Rear-Mounted Cold Air Intake', weight: 7 },
      upgradeImpact: {
        hpGain: [3, 8],
        weightChange: [-1, 0],
        zeroToSixtyChange: [-0.05, 0],
      },
      upgradeDescription:
        'Vararam or aFe intakes offer modest gains. The mid-engine layout already provides cool air to the engine. Biggest benefit is paired with headers and a tune.',
    },
    {
      slug: 'ecu-electronics',
      name: 'ECU & Electronics',
      category: 'electrical',
      stock: { name: 'GM E92 ECM + TCM (LT2, OBD-II)', weight: 3 },
      upgradeImpact: {
        hpGain: [10, 20],
        weightChange: [0, 0],
        zeroToSixtyChange: [-0.15, -0.05],
      },
      upgradeDescription:
        'HP Tuners calibration removes torque management, optimizes shift strategy, and raises the rev limiter. Essential to unlock gains from any other bolt-on mod on the C8.',
    },
    {
      slug: 'tires-wheels',
      name: 'Tires & Wheels',
      category: 'chassis',
      stock: { name: '19x8.5" Front / 20x11" Rear (Z51)', weight: 82 },
      upgradeImpact: {
        hpGain: [0, 0],
        weightChange: [-10, -3],
        zeroToSixtyChange: [-0.2, -0.1],
      },
      upgradeDescription:
        'Forgeline or BC Forged wheels with Michelin Cup 2 or Toyo R888R tires maximize grip. The stock Z51 Michelin PS4S tires are already very capable for street use.',
    },
    {
      slug: 'turbo-supercharger',
      name: 'Turbo / Supercharger',
      category: 'powertrain',
      stock: { name: 'Naturally Aspirated (no forced induction)', weight: 0 },
      upgradeImpact: {
        hpGain: [150, 300],
        weightChange: [40, 60],
        zeroToSixtyChange: [-0.8, -0.3],
      },
      upgradeDescription:
        'ProCharger and ECS twin-turbo kits are available for the C8. The LT2 bottom end handles around 700hp, and with the DCT, these builds run deep into the 10s in the quarter mile.',
    },
  ],
}

// ---------------------------------------------------------------------------
// Lookup functions
// ---------------------------------------------------------------------------

/**
 * Get all part impacts for a given Corvette generation.
 */
export function getPartImpacts(generation: GenerationCode): PartImpact[] {
  return PART_IMPACTS[generation] ?? []
}

/**
 * Get the impact data for a specific part on a specific generation.
 */
export function getPartImpact(
  generation: GenerationCode,
  slug: PartSlug,
): PartImpact | undefined {
  return PART_IMPACTS[generation]?.find((p) => p.slug === slug)
}
