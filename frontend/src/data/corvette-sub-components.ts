import type { PartSlug } from '../types'
import type { GenerationCode } from './corvette-generations'

export interface SubComponent {
  id: string
  name: string
  keywords: string[]
  notes?: string
}

export interface SubComponentGroup {
  name: string
  subComponents: SubComponent[]
}

// ---------------------------------------------------------------------------
// Master taxonomy data keyed by PartSlug
// Each entry contains L2 groups with sub-components.
// Generation applicability is encoded in the `gens` set on each sub-component
// (internal only -- stripped before public API returns).
// ---------------------------------------------------------------------------

type Gen = GenerationCode
const ALL: Gen[] = ['c3', 'c4', 'c5', 'c6', 'c7', 'c8']
const LS_ERA: Gen[] = ['c5', 'c6', 'c7', 'c8']
const MODERN: Gen[] = ['c6', 'c7', 'c8']
const LT_ERA: Gen[] = ['c7', 'c8']

interface InternalSubComponent extends SubComponent {
  gens: Gen[]
}

interface InternalGroup {
  name: string
  subComponents: InternalSubComponent[]
}

type Registry = Record<PartSlug, InternalGroup[]>

// Helper to build a sub-component entry
function sc(
  id: string,
  name: string,
  keywords: string[],
  gens: Gen[] = ALL,
  notes?: string,
): InternalSubComponent {
  return { id, name, keywords, gens, ...(notes ? { notes } : {}) }
}

const REGISTRY: Registry = {
  // =========================================================================
  // ENGINE
  // =========================================================================
  engine: [
    {
      name: 'Cylinder Heads & Valvetrain',
      subComponents: [
        sc('trunnion-upgrade-kits', 'Trunnion Upgrade Kits', [
          'CHE trunnion upgrade',
          'trunnion bearing upgrade kit',
          'LS7 trunnion kit',
        ], ['c5', 'c6', 'c7'], 'LS-series rocker arm trunnion bearings are failure-prone on C5-C7'),
        sc('dual-valve-springs', 'Dual Valve Springs', [
          'dual valve springs',
          'BTR platinum spring kit',
          'beehive valve springs',
          'LS valve spring upgrade',
        ], LS_ERA),
        sc('hydraulic-roller-lifters', 'Hydraulic Roller Lifters', [
          'hydraulic roller lifters',
          'LS lifter kit',
          'AFM DOD delete lifters',
          'Johnson lifters',
        ], LS_ERA),
        sc('rocker-arms', 'Rocker Arms', [
          'rocker arms',
          'roller rocker arms',
          '1.7 ratio rockers',
          'stainless steel rockers',
        ]),
        sc('pushrods', 'Pushrods', [
          'chromoly pushrods',
          'hardened pushrods',
          'pushrod length checker',
        ]),
        sc('valve-guides', 'Valve Guides', [
          'valve guides',
          'bronze valve guides',
          'valve guide seals',
        ]),
      ],
    },
    {
      name: 'Engine Block & Internals',
      subComponents: [
        sc('harmonic-balancers', 'Harmonic Balancers', [
          'harmonic balancer',
          'SFI rated dampener',
          'PowerBond balancer',
          'ATI underdrive pulley',
        ]),
        sc('underdrive-pulleys', 'Underdrive Pulleys', [
          'underdrive pulley kit',
          'lightweight crank pulley',
          'ATI underdrive pulley',
        ], LS_ERA),
        sc('crank-pinning-kits', 'Crank Pinning Kits', [
          'crank pinning kit',
          'LS1 crank pin',
          'balancer retention pin',
        ], ['c5', 'c6'], 'LS1/LS6 balancer bolt is known to back out -- pinning prevents catastrophic failure'),
        sc('oil-pumps', 'Oil Pumps', [
          'oil pump',
          'high-volume oil pump',
          'oil pump pickup tube',
        ]),
        sc('engine-mounts', 'Engine Mounts', [
          'engine mounts',
          'polyurethane engine mounts',
          'solid motor mounts',
        ]),
        sc('sfi-harmonic-balancer', 'SFI Harmonic Balancer Replacement', [
          'SFI rated dampener',
          'PowerBond balancer',
          'ATI underdrive pulley',
          'crank pinning kit',
        ], ['c5'], 'C5-specific SFI balancer upgrade to prevent crank walk'),
      ],
    },
    {
      name: 'Camshafts & Timing',
      subComponents: [
        sc('cam-packages', 'Cam Packages', [
          'cam package',
          'camshaft kit',
          'BTR stage 2 cam',
          'Texas Speed cam',
          'LS3 heads and cam package',
        ], LS_ERA),
        sc('timing-chains', 'Timing Chains', [
          'timing chain',
          'double roller timing chain',
          'timing chain tensioner',
        ]),
        sc('cam-bolts', 'Cam Bolts', [
          'cam bolt',
          'cam retainer plate',
          'LS cam bolt upgrade',
        ], LS_ERA),
        sc('phaser-limiters', 'Phaser Limiters', [
          'phaser limiter',
          'VVT phaser lockout',
          'cam phaser delete',
        ], LT_ERA, 'VVT phaser rattle is common on LT1/LT2 engines'),
      ],
    },
    {
      name: 'Accessory Drive',
      subComponents: [
        sc('serpentine-belts', 'Serpentine Belts', [
          'serpentine belt',
          'Gates belt',
          'Continental belt',
        ]),
        sc('tensioners', 'Tensioners', [
          'belt tensioner',
          'automatic tensioner',
          'idler tensioner assembly',
        ]),
        sc('idler-pulleys', 'Idler Pulleys', [
          'idler pulley',
          'smooth idler pulley',
          'grooved idler pulley',
        ]),
        sc('emissions-delete-kits', 'Emissions Delete Kits', [
          'emissions delete kit',
          'smog pump eliminator',
          'AIR pump delete',
          'EGR delete',
        ], ['c3', 'c4', 'c5']),
      ],
    },
    {
      name: 'Generation-Specific Engine',
      subComponents: [
        sc('frisbee-delete', 'Frisbee Delete & Emissions Kits', [
          'Frisbee delete',
          'smog pump eliminator',
          'AIR pump delete',
          'accessory bracket kits',
        ], ['c4'], 'C4-specific: the "frisbee" is the opti-spark distributor cover -- NOT applicable to C3'),
        sc('tb-coolant-bypass', 'Throttle Body Coolant Bypass', [
          'TB coolant bypass kit',
          'L98 bypass hose',
          'throttle body airfoil',
        ], ['c4'], 'Eliminates coolant flow through L98/LT1 throttle body to reduce intake temps'),
        sc('c6-trunnion-cam', 'Rocker Arm Trunnion Upgrades', [
          'CHE trunnion upgrade',
          'BTR platinum spring kit',
          'LS3 heads and cam package',
        ], ['c6'], 'C6 LS3/LS7 trunnion bearings are a known weak point'),
      ],
    },
  ],

  // =========================================================================
  // EXHAUST
  // =========================================================================
  exhaust: [
    {
      name: 'Exhaust Manifolds & Headers',
      subComponents: [
        sc('long-tube-headers', 'Long Tube Headers', [
          '1-7/8" long tube headers',
          '2" primary headers',
          'long tube stainless headers',
          'merge collectors',
          'scavenger spikes',
        ], LS_ERA),
        sc('shorty-headers', 'Shorty Headers', [
          'shorty headers',
          'block hugger headers',
          'cast iron exhaust manifold upgrade',
        ]),
        sc('header-extension-harnesses', 'Header Extension Harnesses', [
          'header extension harness',
          'O2 extension harness',
          'O2 sensor extension',
        ], LS_ERA),
        sc('o2-sensor-extensions', 'O2 Sensor Extensions', [
          'O2 sensor extension',
          'O2 bung extension',
          'wideband O2 adapter',
        ], LS_ERA),
        sc('side-exit-exhaust', 'Side-Exit Exhaust Systems', [
          'Side pipes',
          'side-mount headers',
          'Hooker headers',
          'fiberglass side pipe covers',
        ], ['c3'], 'Classic C3 side pipe setup -- period correct and aggressive'),
        sc('c6-lt-headers', 'Long Tube Stainless Headers', [
          '1-7/8" long tube headers',
          '2" primary headers',
          'merge collectors',
          'scavenger spikes',
          'O2 extension harness',
        ], ['c6'], 'C6 specific header fitment with O2 extension harnesses'),
      ],
    },
    {
      name: 'Mid-Pipes & Catalytic Converters',
      subComponents: [
        sc('x-pipes', 'Off-Road X-Pipes', [
          'off-road X-pipe',
          'catless X-pipe',
          'stainless X-pipe',
        ], LS_ERA),
        sc('h-pipes', 'H-Pipes', [
          'H-pipe',
          'balance pipe',
          'crossover pipe',
        ]),
        sc('high-flow-cats', 'High-Flow Metallic Cats', [
          'high-flow catalytic converter',
          'metallic substrate cats',
          '200 cell cats',
        ], LS_ERA),
        sc('switchfire-pipes', 'SwitchFire Pipes', [
          'SwitchFire X-pipe',
          'electronic exhaust cutout',
          'vacuum actuated X-pipe',
        ], ['c6', 'c7'], 'Electronically switchable open/closed mid-pipe'),
        sc('test-pipes', 'Test Pipes', [
          'test pipe',
          'cat delete test pipe',
          'pre-cat removal',
          'straight-through exhaust',
        ]),
        sc('c4-test-pipes', 'Test Pipes and Pre-Cat Deletes', [
          'Cat delete test pipe',
          'pre-cat removal',
          'straight-through exhaust',
        ], ['c4'], 'C4-specific pre-cat delete for L98/LT1'),
      ],
    },
    {
      name: 'Mufflers & Tailpipes',
      subComponents: [
        sc('valved-axle-backs', 'Valved Axle-Backs', [
          'valved axle-back exhaust',
          'bi-mode mufflers',
          'vacuum actuated mufflers',
        ], MODERN),
        sc('cat-back-systems', 'Cat-Back Systems', [
          'cat-back exhaust system',
          'full cat-back',
          'Borla cat-back',
          'Corsa cat-back',
        ]),
        sc('npp-compatible-exhausts', 'NPP Compatible Exhausts', [
          'NPP compatible exhaust',
          'factory valve compatible',
          'dual-mode exhaust',
        ], ['c6', 'c7', 'c8'], 'Retains factory NPP bi-modal valve functionality'),
        sc('muffler-eliminators', 'Muffler Eliminators', [
          'muffler eliminator',
          'muffler delete',
          'straight pipe muffler',
        ]),
        sc('exhaust-tips', 'Exhaust Tips', [
          'exhaust tips',
          'stainless exhaust tips',
          'carbon fiber exhaust tips',
          'black chrome tips',
        ]),
        sc('atak-cat-back', 'Acoustically Tuned Valved Exhausts', [
          'ATAK cat-back',
          'SwitchFire X-pipe',
          'NPP compatible',
          'AFM valve simulators',
          'multi-mode exhaust',
        ], ['c7'], 'C7 multi-mode exhaust systems with acoustic tuning'),
      ],
    },
    {
      name: 'Thermal Management',
      subComponents: [
        sc('thermal-blankets', 'Thermal Insulation Blankets', [
          'Cat blankets',
          'catalytic converter heat shields',
          'header wrap',
          'thermal protection',
        ], ['c8'], 'C8 mid-engine layout traps heat -- thermal blankets are essential'),
      ],
    },
  ],

  // =========================================================================
  // TRANSMISSION
  // =========================================================================
  transmission: [
    {
      name: 'Manual Transmission',
      subComponents: [
        sc('short-throw-shifters', 'Short Throw Shifters', [
          'short throw shifter',
          'MGW flat stick',
          'Hurst short throw',
        ], ['c3', 'c4', 'c5', 'c6', 'c7']),
        sc('billet-shifter-boxes', 'Billet Shifter Boxes', [
          'billet shifter box',
          'MGW shifter',
          'aluminum shifter housing',
        ], ['c5', 'c6', 'c7']),
        sc('anti-venom-washers', 'Anti-Venom Washers', [
          'Anti-venom mod',
          'transmission detent washer',
          'anti-venom washer',
        ], ['c5'], 'C5 T56 transmission detent fix -- eliminates missed 1-2 and 3-4 shifts'),
        sc('clutch-kits', 'Clutch Kits', [
          'clutch kit',
          'performance clutch',
          'twin disc clutch',
          'Mantic clutch',
        ], ['c3', 'c4', 'c5', 'c6', 'c7']),
        sc('flywheels', 'Flywheels', [
          'lightweight flywheel',
          'aluminum flywheel',
          'billet steel flywheel',
        ], ['c3', 'c4', 'c5', 'c6', 'c7']),
        sc('c5-shifter-upgrades', 'Anti-Venom Mod & Shifter Upgrades', [
          'Anti-venom mod',
          'transmission detent washer',
          'MGW flat stick',
          'C6 shifter upgrade for C5',
        ], ['c5'], 'Comprehensive C5 T56 shift quality upgrade path'),
      ],
    },
    {
      name: 'Automatic / DCT',
      subComponents: [
        sc('deep-transmission-pans', 'Deep Transmission Pans', [
          'deep transmission pan',
          'aluminum trans pan',
          'billet transmission pan',
        ], ['c4', 'c5', 'c6', 'c7', 'c8']),
        sc('torque-converters', 'Torque Converters', [
          'torque converter',
          'high-stall converter',
          'lock-up torque converter',
        ], ['c4', 'c5', 'c6', 'c7']),
        sc('dct-filter-covers', 'DCT Filter Covers', [
          'DCT filter cover',
          'transmission filter cover',
          'Dodson filter cover',
        ], ['c8'], 'C8 Tremec 8-speed DCT specific'),
        sc('clutch-pressure-modules', 'Clutch Pressure Modules', [
          'clutch pressure control module',
          'DCT clutch module',
          'Dodson clutch upgrade',
        ], ['c8'], 'Increases clamping force on C8 DCT clutch packs'),
        sc('shift-paddles', 'Shift Paddles', [
          'shift paddles',
          'magnetic shift paddle set',
          'extended shift paddles',
          'carbon fiber paddles',
        ], ['c7', 'c8']),
        sc('c8-dct-components', 'DCT Components', [
          'Dodson clutch upgrade',
          'deep transmission pan',
          'DCT filter cover',
          'clutch pressure control module',
          'magnetic shift paddle set',
          'DCT park release tool',
        ], ['c8'], 'Complete C8 DCT upgrade ecosystem'),
      ],
    },
    {
      name: 'Driveline',
      subComponents: [
        sc('torque-tubes', 'Torque Tubes', [
          'torque tube',
          'carbon fiber torque tube',
          'torque tube bearing',
        ], ['c5', 'c6', 'c7'], 'Transaxle generations use torque tube to connect engine to rear trans'),
        sc('half-shafts', 'Half Shafts', [
          'half shafts',
          'axle shafts',
          'CV axle upgrade',
          'GForce axles',
        ]),
        sc('differential-covers', 'Differential Covers', [
          'differential cover',
          'billet diff cover',
          'finned differential cover',
        ]),
        sc('transmission-mounts', 'Transmission Mounts', [
          'transmission mount',
          'polyurethane trans mount',
          'billet trans mount',
        ]),
        sc('trans-coolers', 'Trans Coolers', [
          'transmission cooler',
          'external trans cooler',
          'stacked plate trans cooler',
        ]),
      ],
    },
  ],

  // =========================================================================
  // AIR INTAKE
  // =========================================================================
  'air-intake': [
    {
      name: 'Intake Manifolds & Throttle Bodies',
      subComponents: [
        sc('intake-manifolds', 'Intake Manifolds', [
          'intake manifold',
          'polymer intake manifold',
          'carbon intake manifold',
          'FAST LSXr 102 intake',
          'Hi-Ram intake',
          'carbon pTR manifold',
        ], LS_ERA),
        sc('ported-throttle-bodies', 'Ported Throttle Bodies', [
          'ported throttle body',
          'enlarged throttle body',
          'CNC ported TB',
        ], LS_ERA),
        sc('102mm-tb-adapters', '102mm TB Adapters', [
          '102mm throttle body adapter',
          '102mm TB swap',
          'LS2 to 102mm adapter',
        ], ['c5', 'c6']),
        sc('velocity-stacks', 'Velocity Stacks', [
          'velocity stacks',
          'trumpet stacks',
          'individual throttle bodies',
        ], LS_ERA),
        sc('c6-polymer-intake', 'High-Flow Polymer Intake Manifolds', [
          'FAST LSXr 102 intake',
          '102mm throttle body',
          'Hi-Ram intake',
          'carbon pTR manifold',
        ], ['c6'], 'C6 LS2/LS3 specific high-flow manifold options'),
      ],
    },
    {
      name: 'Air Induction',
      subComponents: [
        sc('cold-air-intakes', 'Cold Air Intakes', [
          'cold air intake',
          'CAI kit',
          'K&N cold air intake',
          'aFe cold air intake',
        ]),
        sc('carbon-fiber-intake-tubes', 'Carbon Fiber Intake Tubes', [
          'carbon fiber intake tube',
          'carbon fiber air duct',
          'Track Series carbon fiber intake',
        ], MODERN),
        sc('ram-air-systems', 'Ram Air Systems', [
          'ram air system',
          'ram air hood scoop',
          'forced air induction scoop',
        ], ['c3', 'c4', 'c5', 'c6']),
        sc('high-flow-air-filters', 'High-Flow Air Filters', [
          'high-flow air filter',
          'K&N air filter',
          'dry nano air filter',
          'Pro 5R filter media',
          'oiled cotton filter',
        ]),
        sc('c7-carbon-induction', 'Carbon Fiber Air Induction Systems', [
          'Track Series carbon fiber intake',
          'dry nano air filter',
          'Pro 5R filter media',
        ], ['c7'], 'C7 specific carbon fiber intake systems'),
      ],
    },
    {
      name: 'Fuel Injection',
      subComponents: [
        sc('fuel-injectors', 'Fuel Injectors', [
          'fuel injectors',
          'high-flow injectors',
          'Bosch injectors',
          'ID1050x injectors',
        ], LS_ERA),
        sc('fuel-rails', 'Fuel Rails', [
          'fuel rails',
          'billet fuel rails',
          'high-flow fuel rail kit',
        ], LS_ERA),
        sc('flex-fuel-sensors-intake', 'Flex Fuel Sensors', [
          'flex fuel sensor',
          'E85 sensor kit',
          'ethanol content analyzer',
        ], MODERN),
      ],
    },
  ],

  // =========================================================================
  // SUSPENSION
  // =========================================================================
  suspension: [
    {
      name: 'Springs & Shocks',
      subComponents: [
        sc('coilovers', 'Coilovers', [
          'coilover kit',
          'adjustable coilovers',
          'Penske coilovers',
          'Ohlins coilovers',
        ]),
        sc('lowering-springs', 'Lowering Springs', [
          'lowering springs',
          'sport springs',
          'Eibach lowering springs',
          'H&R springs',
        ]),
        sc('front-lift-lowering-collars', 'Front Lift Lowering Collars', [
          'Front lift lowering collars',
          'front axle lift collar',
          'ride height adjustment collar',
        ], ['c7', 'c8'], 'Allows fine-tuning of front lift system ride height'),
        sc('magride-compatible-shocks', 'MagRide Compatible Shocks', [
          'MagRide compatible shocks',
          'magnetic ride control shocks',
          'MRC upgrade shocks',
        ], ['c5', 'c6', 'c7', 'c8']),
        sc('composite-leaf-springs', 'Composite Leaf Springs', [
          'composite leaf spring',
          'transverse leaf spring',
          'fiberglass leaf spring',
        ], ['c4', 'c5', 'c6', 'c7'], 'Corvette-unique transverse composite leaf spring design'),
        sc('c8-ride-height', 'Ride Height Adjustment Hardware', [
          'Front lift lowering collars',
          'Z51 lowering springs',
          'MagRide compatible springs',
          'coilover spanner wrench',
          '20mm wheel spacers',
        ], ['c8'], 'C8 specific ride height and stance adjustment'),
      ],
    },
    {
      name: 'Linkages & Control Arms',
      subComponents: [
        sc('polyurethane-bushings', 'Polyurethane Bushings', [
          'polyurethane bushings',
          'Energy Suspension bushings',
          'poly bushing kit',
        ]),
        sc('delrin-bushings', 'Delrin Bushings', [
          'Delrin bushings',
          'solid bushings',
          'race bushings',
        ], LS_ERA),
        sc('sway-bar-end-links', 'Sway Bar End Links', [
          'sway bar end links',
          'adjustable end links',
          'heavy duty end links',
        ]),
        sc('tie-rod-ends-susp', 'Tie Rod Ends', [
          'tie rod ends',
          'heavy duty tie rod ends',
          'bump steer spacers',
        ]),
        sc('control-arms', 'Control Arms', [
          'control arms',
          'tubular control arms',
          'billet control arms',
          'adjustable control arms',
        ]),
      ],
    },
    {
      name: 'Chassis Reinforcement',
      subComponents: [
        sc('subframe-connectors', 'Subframe Connectors', [
          'subframe connectors',
          'frame brace',
          'chassis stiffener',
        ], ['c3', 'c4', 'c5']),
        sc('strut-tower-braces', 'Strut Tower Braces', [
          'strut tower brace',
          'shock tower brace',
          'billet strut tower bar',
        ]),
        sc('harness-bars', 'Harness Bars', [
          'harness bar',
          'safety harness bar',
          'roll bar',
        ]),
        sc('tunnel-braces', 'Tunnel Braces', [
          'tunnel brace',
          'transmission tunnel brace',
          'center tunnel stiffener',
        ], ['c5', 'c6', 'c7']),
      ],
    },
  ],

  // =========================================================================
  // BRAKES
  // =========================================================================
  brakes: [
    {
      name: 'Rotors & Pads',
      subComponents: [
        sc('two-piece-slotted-rotors', 'Two-Piece Slotted Rotors', [
          'two-piece slotted rotors',
          'floating rotor hat',
          'StopTech slotted rotors',
        ]),
        sc('drilled-rotors', 'Drilled Rotors', [
          'drilled rotors',
          'cross-drilled rotors',
          'drilled and slotted rotors',
        ]),
        sc('low-dust-ceramic-pads', 'Low-Dust Ceramic Pads', [
          'low-dust ceramic pads',
          'ceramic brake pads',
          'Hawk ceramic pads',
        ]),
        sc('carbon-ceramic-replacements', 'Carbon Ceramic Replacements', [
          'carbon ceramic brake rotors',
          'CCM rotor replacement',
          'carbon ceramic conversion',
        ], ['c6', 'c7', 'c8'], 'Factory carbon ceramic option replacement/upgrade'),
        sc('track-compounds', 'Track Compounds', [
          'track brake pads',
          'Hawk DTC-70',
          'Ferodo DS2500',
          'Pagid RSL29',
          'race compound pads',
        ]),
      ],
    },
    {
      name: 'Calipers & Lines',
      subComponents: [
        sc('big-brake-kits', 'Big Brake Kits (BBK)', [
          'big brake kit',
          'BBK',
          'Brembo BBK',
          'AP Racing BBK',
          '6-piston caliper kit',
        ]),
        sc('multi-piston-calipers', 'Multi-Piston Calipers', [
          'multi-piston calipers',
          '4-piston calipers',
          '6-piston calipers',
          'monoblock calipers',
        ]),
        sc('stainless-brake-lines', 'Stainless Steel Brake Lines', [
          'stainless steel brake lines',
          'braided brake lines',
          'Goodridge brake lines',
        ]),
        sc('caliper-covers', 'Caliper Covers', [
          'caliper covers',
          'MGP caliper covers',
          'painted calipers',
        ]),
      ],
    },
    {
      name: 'Brake Cooling',
      subComponents: [
        sc('brake-ducts', 'Brake Ducts', [
          'brake ducts',
          'brake cooling ducts',
          'air deflectors',
          'backing plate ducts',
        ]),
        sc('backing-plates', 'Backing Plates', [
          'backing plates',
          'dust shields',
          'brake splash guards',
        ]),
        sc('brake-fluid', 'Brake Fluid', [
          'brake fluid',
          'DOT4 brake fluid',
          'DOT 5.1 brake fluid',
          'Motul RBF 600',
          'ATE Super Blue',
        ]),
      ],
    },
  ],

  // =========================================================================
  // COOLING SYSTEM
  // =========================================================================
  'cooling-system': [
    {
      name: 'Radiators & Fans',
      subComponents: [
        sc('aluminum-radiators', 'Aluminum Radiators', [
          'aluminum radiator',
          'DeWitts radiator',
          'Champion radiator',
          'dual-pass radiator',
        ]),
        sc('electric-fan-conversions', 'Electric Fan Conversions', [
          'electric fan conversion',
          'dual electric fan kit',
          'fan relay kit',
        ], ['c3', 'c4']),
        sc('spal-fan-upgrades', 'SPAL Fan Upgrades', [
          'SPAL fan upgrade',
          'high-CFM electric fan',
          'SPAL puller fan',
        ]),
        sc('fan-controllers', 'Fan Controllers', [
          'fan controller',
          'PWM fan controller',
          'adjustable fan thermostat',
          'Derale fan controller',
        ]),
        sc('c5-dewitts-radiator', 'DeWitts Cut-Down Radiator', [
          'DeWitts radiator',
          'SPAL fan upgrade',
          'flapper valve shroud',
          '160-degree thermostat',
        ], ['c5'], 'C5-specific DeWitts cut-down radiator with integrated fan shroud'),
      ],
    },
    {
      name: 'Coolant System',
      subComponents: [
        sc('silicone-hoses', 'Silicone Hoses', [
          'silicone coolant hoses',
          'silicone radiator hoses',
          'Mishimoto silicone hose kit',
        ]),
        sc('thermostats', 'Thermostats', [
          'thermostat',
          '160-degree thermostat',
          '180-degree thermostat',
          'low-temp thermostat',
        ]),
        sc('water-pumps', 'Water Pumps', [
          'water pump',
          'high-flow water pump',
          'Edelbrock water pump',
          'electric water pump',
        ]),
        sc('coolant-reroutes', 'Coolant Reroutes', [
          'coolant reroute',
          'LS coolant crossover delete',
          'steam vent reroute',
        ], LS_ERA, 'LS steam vent reroute prevents air pockets in cooling system'),
        sc('overflow-tanks', 'Overflow Tanks', [
          'overflow tank',
          'coolant expansion tank',
          'billet overflow tank',
        ]),
      ],
    },
    {
      name: 'Forced Induction Cooling',
      subComponents: [
        sc('heat-exchangers', 'Heat Exchangers', [
          'heat exchanger',
          'LT4 heat exchanger upgrade',
          'air-to-water intercooler',
          'supercharger heat exchanger',
        ], ['c6', 'c7', 'c8'], 'For supercharged models: C6 ZR1, C7 Z06, C8 ZR1'),
        sc('intercooler-sprayers', 'Intercooler Sprayers', [
          'intercooler sprayer',
          'water methanol injection',
          'intercooler spray kit',
        ], ['c6', 'c7', 'c8']),
        sc('sc-expansion-tanks', 'Expansion Tanks', [
          'supercharger expansion tank',
          'coolant reservoir upgrade',
          'LT4 expansion tank',
        ], ['c7', 'c8'], 'Larger expansion tanks for supercharged C7 Z06 and C8 ZR1'),
        sc('c7-heat-exchangers', 'High-Capacity Heat Exchangers', [
          'LT4 heat exchanger upgrade',
          'supercharger expansion tank',
          'air-to-water intercooler',
        ], ['c7'], 'C7 Z06 LT4 specific heat exchanger upgrades'),
      ],
    },
  ],

  // =========================================================================
  // FUEL SYSTEM
  // =========================================================================
  'fuel-system': [
    {
      name: 'Fuel Pumps & Regulators',
      subComponents: [
        sc('high-flow-fuel-pumps', 'High-Flow Fuel Pumps', [
          'high-flow fuel pump',
          'Walbro 255 pump',
          'DW300 fuel pump',
          'Aeromotive fuel pump',
        ]),
        sc('fuel-pressure-regulators', 'Fuel Pressure Regulators', [
          'fuel pressure regulator',
          'adjustable fuel regulator',
          'Aeromotive regulator',
        ]),
        sc('returnless-fuel-retrofits', 'Returnless Fuel System Retrofits', [
          'returnless fuel system retrofit',
          'return-style fuel system conversion',
          'fuel pressure dampener',
        ], ['c3', 'c4']),
        sc('c5-fuel-filter-regulator', 'Corvette-Style Fuel Filter/Regulator', [
          'Corvette style fuel filter regulator',
          '58 PSI fixed pressure',
          'LS swap fuel regulator',
          'Walbro 255 pump',
        ], ['c5'], 'C5 integrated fuel filter/regulator -- popular for LS swap sourcing too'),
      ],
    },
    {
      name: 'Fuel Lines & Fittings',
      subComponents: [
        sc('an-fuel-lines', 'AN Fuel Lines', [
          'AN fuel lines',
          '-6 AN fuel line',
          '-8 AN fuel line',
          'braided fuel hose',
        ]),
        sc('quick-connect-adapters', 'Quick-Connect Adapters', [
          'quick-connect fuel adapter',
          'push-lock fuel fitting',
          'EFI fuel line adapter',
        ], LS_ERA),
        sc('e85-conversion-kits', 'E85 Conversion Kits', [
          'E85 conversion kit',
          'flex fuel kit',
          'E85 fuel system upgrade',
        ], MODERN),
        sc('flex-fuel-sensors', 'Flex Fuel Sensors', [
          'flex fuel sensor',
          'ethanol content sensor',
          'Continental flex fuel sensor',
        ], MODERN),
      ],
    },
    {
      name: 'Fuel Tanks',
      subComponents: [
        sc('fuel-cells', 'Fuel Cells', [
          'fuel cell',
          'racing fuel cell',
          'ATL fuel cell',
          'FIA fuel bladder',
        ]),
        sc('surge-tanks', 'Surge Tanks', [
          'surge tank',
          'swirl pot',
          'fuel surge tank',
          'Radium surge tank',
        ], LS_ERA),
        sc('fuel-level-senders', 'Fuel Level Senders', [
          'fuel level sender',
          'fuel sending unit',
          'fuel gauge sender',
        ]),
      ],
    },
  ],

  // =========================================================================
  // TIRES & WHEELS
  // =========================================================================
  'tires-wheels': [
    {
      name: 'Wheels',
      subComponents: [
        sc('forged-monoblock-wheels', 'Forged Monoblock Wheels', [
          'forged monoblock wheels',
          'one-piece forged wheels',
          'Forgeline wheels',
          'HRE wheels',
          'Vossen forged',
        ]),
        sc('replica-wheels', 'Replica Wheels', [
          'replica wheels',
          'OEM style wheels',
          'factory replica wheels',
        ]),
        sc('drag-wheels', 'Drag Wheels', [
          'drag wheels',
          'Weld drag wheels',
          'lightweight drag wheel',
          'beadlock drag wheel',
        ]),
        sc('wheel-spacers', 'Wheel Spacers', [
          '20mm hub-centric wheel spacers',
          'wheel spacers',
          'hub-centric spacer',
          'bolt-on wheel spacer',
        ]),
      ],
    },
    {
      name: 'Tires',
      subComponents: [
        sc('summer-performance', 'Summer Performance Tires', [
          'summer performance tires',
          'Michelin Pilot Sport 4S',
          'Continental ExtremeContact Sport',
          'max performance summer',
        ]),
        sc('drag-radials', 'Drag Radials', [
          'drag radials',
          'Nitto NT555R',
          'Mickey Thompson ET Street R',
          'Toyo Proxes RR',
        ]),
        sc('all-season-tires', 'All-Season Tires', [
          'all-season tires',
          'Michelin Pilot Sport A/S',
          'Continental DWS06',
        ]),
        sc('staggered-setups', 'Staggered Setups', [
          'staggered tire setup',
          'staggered wheel fitment',
          'wider rear tires',
          '275/305 staggered',
          '285/335 staggered',
        ]),
      ],
    },
    {
      name: 'Hardware',
      subComponents: [
        sc('titanium-lug-nuts', 'Titanium Lug Nuts', [
          'titanium lug nuts',
          'lightweight lug nuts',
          'Gorilla titanium lugs',
        ]),
        sc('tpms-sensor-kits', 'TPMS Sensor Kits', [
          'TPMS sensor kit',
          'tire pressure sensor',
          'TPMS rebuild kit',
        ], ['c5', 'c6', 'c7', 'c8']),
        sc('hub-centric-rings', 'Hub-Centric Rings', [
          'hub-centric rings',
          'hubcentric ring set',
          'centering rings',
        ]),
        sc('wheel-locks', 'Wheel Locks', [
          'wheel locks',
          'locking lug nuts',
          'McGard wheel locks',
        ]),
      ],
    },
  ],

  // =========================================================================
  // STEERING
  // =========================================================================
  steering: [
    {
      name: 'Steering Systems',
      subComponents: [
        sc('ps-box-conversions', 'Power Steering Box Conversions', [
          'Borgeson steering box',
          'power steering box conversion',
          'rag joint',
          'steering hose kit',
          'reinforcement plate',
        ], ['c3'], 'Borgeson power steering box conversion is the gold standard for C3'),
        sc('rack-bushings', 'Rack Bushings', [
          'rack bushings',
          'steering rack bushings',
          'polyurethane rack mount',
        ], LS_ERA),
        sc('quick-ratio-adapters', 'Quick Ratio Adapters', [
          'quick ratio steering adapter',
          'quick ratio box',
          'faster steering ratio',
        ], ['c3', 'c4']),
        sc('electric-ps-conversions', 'Electric PS Conversions', [
          'electric power steering conversion',
          'EPAS conversion',
          'electric steering kit',
        ], ['c3', 'c4']),
      ],
    },
    {
      name: 'Steering Wheel',
      subComponents: [
        sc('flat-bottom-wheels', 'Flat Bottom Wheels', [
          'flat bottom steering wheel',
          'D-shape steering wheel',
          'sport steering wheel',
        ], MODERN),
        sc('carbon-fiber-steering', 'Carbon Fiber Wheels', [
          'carbon fiber steering wheel',
          'carbon fiber wheel trim',
          'carbon steering wheel cover',
        ], MODERN),
        sc('alcantara-wraps', 'Alcantara Wraps', [
          'Alcantara steering wheel wrap',
          'suede steering wheel',
          'Alcantara rewrap',
        ]),
        sc('d-shape-wheels', 'D-Shape Wheels', [
          'D-shape steering wheel',
          'racing steering wheel',
          'Grant steering wheel',
        ]),
      ],
    },
    {
      name: 'Linkage',
      subComponents: [
        sc('tie-rod-ends', 'Tie Rod Ends', [
          'tie rod ends',
          'inner tie rod',
          'outer tie rod end',
        ]),
        sc('steering-shafts', 'Steering Shafts', [
          'steering shaft',
          'telescoping steering shaft',
          'stainless steering shaft',
        ]),
        sc('rag-joints', 'Rag Joints', [
          'rag joint',
          'steering rag joint',
          'vibration dampener joint',
        ], ['c3', 'c4']),
        sc('steering-dampeners', 'Steering Dampeners', [
          'steering dampener',
          'steering stabilizer',
          'hydraulic steering dampener',
        ], ['c3', 'c4', 'c5']),
      ],
    },
  ],

  // =========================================================================
  // BODY / SHELL (also covers interior and some exterior)
  // =========================================================================
  'body-shell': [
    {
      name: 'Seats & Safety',
      subComponents: [
        sc('racing-seats', 'Racing Seats', [
          'racing seats',
          'Recaro seats',
          'Sparco seats',
          'FIA approved seat',
        ]),
        sc('seat-lowering-brackets', 'Seat Lowering Brackets', [
          'seat lowering brackets',
          'seat rail lowering kit',
          'planted seat bracket',
        ]),
        sc('harness-bars-interior', 'Harness Bars', [
          'harness bar',
          'harness mount bar',
          'bolt-in harness bar',
        ]),
        sc('5-point-harnesses', '5-Point Harnesses', [
          '5-point harness',
          'racing harness',
          'Schroth harness',
          'SFI harness',
        ]),
        sc('fire-extinguisher-mounts', 'Fire Extinguisher Mounts', [
          'fire extinguisher mount',
          'Halotron extinguisher',
          'roll bar mount extinguisher',
        ]),
      ],
    },
    {
      name: 'Electronics',
      subComponents: [
        sc('radar-detector-mounts', 'Radar Detector Mounts', [
          'BlendMount radar detector mount',
          'mirror mount bracket',
          'radar detector hardwire',
        ], MODERN),
        sc('dash-cams', 'Dash Cams', [
          'dash cam',
          'front and rear dash cam',
          'mirror tap kit',
        ]),
        sc('phone-mounts', 'Phone Mounts', [
          'phone mount',
          'ProClip phone mount',
          'magnetic phone mount',
          'vent mount',
        ]),
        sc('mirror-tap-kits', 'Mirror Tap Kits', [
          'mirror tap kit',
          'mirror tap hardwire kit',
          'fuse tap adapter',
        ], MODERN),
        sc('c7-mirror-mounts', 'Mirror Device Mounting Brackets', [
          'BlendMount radar detector mount',
          'mirror tap hardwire kit',
          'ProClip phone mount',
        ], ['c7'], 'C7 specific BlendMount and ProClip bracket fitments'),
      ],
    },
    {
      name: 'Trim & Controls',
      subComponents: [
        sc('shift-knobs', 'Shift Knobs', [
          'shift knob',
          'billet shift knob',
          'weighted shift knob',
        ], ['c3', 'c4', 'c5', 'c6', 'c7']),
        sc('pedal-covers', 'Pedal Covers', [
          'pedal covers',
          'billet pedal covers',
          'aluminum pedal pads',
        ]),
        sc('carbon-fiber-trim', 'Carbon Fiber Trim', [
          'carbon fiber trim',
          'carbon fiber interior panels',
          'carbon fiber dash trim',
        ], MODERN),
        sc('door-sill-plates', 'Door Sill Plates', [
          'door sill plates',
          'illuminated sill plates',
          'carbon fiber sill plates',
        ]),
        sc('floor-mats', 'Floor Mats', [
          'floor mats',
          'all-weather floor mats',
          'Lloyd embroidered mats',
          'WeatherTech floor mats',
        ]),
        sc('c8-engine-covers', 'Clear Engine Covers & Billet Caps', [
          'Clear engine bay cover (HTC)',
          'carbon fiber frunk cover',
          'billet coolant trim ring',
          'vented engine glass',
          'billet strut tower bars',
        ], ['c8'], 'C8 mid-engine display covers and billet dress-up'),
      ],
    },
    {
      name: 'Gauges & Displays',
      subComponents: [
        sc('digital-dash-bezels', 'Digital Dash Bezels', [
          'Digital dash conversion',
          'Holley 12.3" dash mount',
          'AutoMeter gauge conversion',
          '3D printed dash pod',
        ], ['c4'], 'C4 digital dash retrofit and modernization'),
        sc('aftermarket-gauge-pods', 'Aftermarket Gauge Pods', [
          'gauge pod',
          'A-pillar gauge pod',
          'triple gauge pod',
          'boost gauge pod',
        ]),
        sc('heads-up-display', 'Heads-Up Display', [
          'heads-up display',
          'HUD unit',
          'aftermarket HUD',
        ], ['c5', 'c6', 'c7', 'c8']),
      ],
    },
    {
      name: 'Exterior Protection',
      subComponents: [
        sc('jacking-pucks', 'Jacking Pucks & Lift Pads', [
          'Jack pucks',
          'lift pads',
          'jack point pads',
          'polyurethane jack pads',
        ], ['c7', 'c8']),
        sc('grill-guards', 'Grill Guards & Intake Guards', [
          'front radiator mesh grill guards',
          'side air intake guards',
          'radiator rock guard',
          'bumper mesh screen',
        ], ['c8'], 'C8 radiator and side intake rock guards'),
      ],
    },
  ],

  // =========================================================================
  // ECU / ELECTRONICS
  // =========================================================================
  'ecu-electronics': [
    {
      name: 'Engine Management',
      subComponents: [
        sc('ecu-tuning', 'ECU Tuning', [
          'ECU tuning',
          'HP Tuners',
          'EFI Live',
          'custom tune',
          'flash tuner',
        ], LS_ERA),
        sc('throttle-controllers', 'Throttle Controllers', [
          'throttle controller',
          'Soler Performance throttle controller',
          'pedal commander',
          'DLX Bluetooth controller',
          'drive-by-wire module',
        ], ['c5', 'c6', 'c7', 'c8']),
        sc('performance-chips', 'Performance Chips', [
          'performance chip',
          'power programmer',
          'Hypertech programmer',
        ]),
        sc('c7-throttle-controllers', 'Electronic Throttle Controllers', [
          'Soler Performance throttle controller',
          'pedal commander',
          'DLX Bluetooth controller',
          'drive-by-wire module',
        ], ['c7'], 'C7 specific drive-by-wire throttle response tuning'),
      ],
    },
    {
      name: 'Ignition',
      subComponents: [
        sc('spark-plugs', 'Spark Plugs', [
          'spark plugs',
          'iridium spark plugs',
          'NGK spark plugs',
          'one-step-colder plugs',
        ]),
        sc('ignition-coils', 'Ignition Coils', [
          'ignition coils',
          'high-output coils',
          'Accel coil packs',
        ], LS_ERA),
        sc('msd-ignition-boxes', 'MSD Ignition Boxes', [
          'MSD ignition box',
          'MSD 6AL box',
          'MSD digital ignition',
        ], ['c3', 'c4']),
        sc('hei-distributors', 'HEI Distributors', [
          'HEI distributor upgrade',
          'MSD 6AL box',
          'electronic ignition conversion',
          'tachometer filter',
        ], ['c3'], 'C3 points-to-HEI conversion is one of the best bang-for-buck mods'),
        sc('plug-wires', 'Plug Wires', [
          'plug wires',
          'spark plug wires',
          'MSD plug wires',
          'Taylor plug wires',
        ], ['c3', 'c4']),
      ],
    },
    {
      name: 'Battery & Charging',
      subComponents: [
        sc('lithium-batteries', 'Lightweight Lithium Batteries', [
          'lightweight lithium battery',
          'Antigravity battery',
          'Braille battery',
          'lithium iron phosphate',
        ]),
        sc('high-output-alternators', 'High-Output Alternators', [
          'high-output alternator',
          'Mechman alternator',
          '200 amp alternator',
        ]),
        sc('battery-relocations', 'Battery Relocations', [
          'battery relocation kit',
          'trunk battery mount',
          'battery cable extension',
        ], ['c3', 'c4', 'c5']),
      ],
    },
    {
      name: 'Lighting',
      subComponents: [
        sc('led-headlight-conversions', 'LED Headlight Conversions', [
          'LED headlight conversion',
          'LED headlight bulbs',
          'projector headlight kit',
        ]),
        sc('led-taillight-kits', 'LED Taillight Kits', [
          'LED taillight kit',
          'sequential LED taillights',
          'LED tail lamp conversion',
        ]),
        sc('underbody-lighting', 'Underbody Lighting', [
          'underbody lighting',
          'LED underglow kit',
          'rock lights',
        ]),
        sc('interior-led-kits', 'Interior LED Kits', [
          'interior LED kit',
          'LED dome light',
          'LED footwell lights',
        ]),
        sc('electric-headlight-actuators', 'Electric Headlight Actuator Kits', [
          'Electric headlight conversion',
          'vacuum delete',
          'headlight actuator motors',
          'Detroit Speed headlight kit',
        ], ['c3'], 'Replaces failure-prone C3 vacuum headlight system with electric motors'),
      ],
    },
    {
      name: 'Security & Modules',
      subComponents: [
        sc('column-lock-bypass', 'Column Lock Bypass', [
          'LMC5 module',
          'column lock bypass',
          'pull key wait 10 seconds fix',
          '2 MPH fuel cut-off fix',
          'brown wire mod',
        ], ['c5'], 'C5 column lock is a notorious failure point -- LMC5 module is the permanent fix'),
        sc('bcm-simulators', 'BCM Simulators', [
          'BCM simulator',
          'body control module bypass',
          'BCM delete module',
        ], LS_ERA),
        sc('o2-sensor-simulators', 'O2 Sensor Simulators', [
          'O2 sensor simulator',
          'MIL eliminator',
          'oxygen sensor simulator',
          'check engine light delete',
        ], LS_ERA),
        sc('tpms-bypass', 'TPMS Bypass', [
          'TPMS bypass',
          'TPMS delete module',
          'tire pressure monitor bypass',
        ], ['c5', 'c6', 'c7', 'c8']),
      ],
    },
  ],

  // =========================================================================
  // INTERIOR (dedicated slug)
  // =========================================================================
  interior: [
    {
      name: 'Seats & Safety',
      subComponents: [
        sc('int-racing-seats', 'Racing Seats', [
          'racing seats',
          'Recaro seats',
          'Sparco seats',
          'FIA approved seat',
        ]),
        sc('int-seat-lowering-brackets', 'Seat Lowering Brackets', [
          'seat lowering brackets',
          'seat rail lowering kit',
          'planted seat bracket',
        ]),
        sc('int-harness-bars', 'Harness Bars', [
          'harness bar',
          'harness mount bar',
          'bolt-in harness bar',
        ]),
        sc('int-5-point-harnesses', '5-Point Harnesses', [
          '5-point harness',
          'racing harness',
          'Schroth harness',
          'SFI harness',
        ]),
        sc('int-fire-extinguisher-mounts', 'Fire Extinguisher Mounts', [
          'fire extinguisher mount',
          'Halotron extinguisher',
          'roll bar mount extinguisher',
        ]),
      ],
    },
    {
      name: 'Electronics',
      subComponents: [
        sc('int-radar-detector-mounts', 'Radar Detector Mounts', [
          'BlendMount radar detector mount',
          'mirror mount bracket',
          'radar detector hardwire',
        ], MODERN),
        sc('int-dash-cams', 'Dash Cams', [
          'dash cam',
          'front and rear dash cam',
          'mirror tap kit',
        ]),
        sc('int-phone-mounts', 'Phone Mounts', [
          'phone mount',
          'ProClip phone mount',
          'magnetic phone mount',
          'vent mount',
        ]),
        sc('int-mirror-tap-kits', 'Mirror Tap Kits', [
          'mirror tap kit',
          'mirror tap hardwire kit',
          'fuse tap adapter',
        ], MODERN),
      ],
    },
    {
      name: 'Trim & Controls',
      subComponents: [
        sc('int-shift-knobs', 'Shift Knobs', [
          'shift knob',
          'billet shift knob',
          'weighted shift knob',
        ], ['c3', 'c4', 'c5', 'c6', 'c7']),
        sc('int-pedal-covers', 'Pedal Covers', [
          'pedal covers',
          'billet pedal covers',
          'aluminum pedal pads',
        ]),
        sc('int-carbon-fiber-trim', 'Carbon Fiber Trim', [
          'carbon fiber trim',
          'carbon fiber interior panels',
          'carbon fiber dash trim',
        ], MODERN),
        sc('int-door-sill-plates', 'Door Sill Plates', [
          'door sill plates',
          'illuminated sill plates',
          'carbon fiber sill plates',
        ]),
        sc('int-floor-mats', 'Floor Mats', [
          'floor mats',
          'all-weather floor mats',
          'Lloyd embroidered mats',
          'WeatherTech floor mats',
        ]),
        sc('int-c8-engine-covers', 'Clear Engine Covers & Billet Caps', [
          'Clear engine bay cover (HTC)',
          'carbon fiber frunk cover',
          'billet coolant trim ring',
          'vented engine glass',
          'billet strut tower bars',
        ], ['c8'], 'C8 mid-engine display covers and billet dress-up'),
      ],
    },
    {
      name: 'Gauges & Displays',
      subComponents: [
        sc('int-digital-dash-bezels', 'Digital Dash Bezels', [
          'Digital dash conversion',
          'Holley 12.3" dash mount',
          'AutoMeter gauge conversion',
          '3D printed dash pod',
        ], ['c4'], 'C4 digital dash retrofit and modernization'),
        sc('int-aftermarket-gauge-pods', 'Aftermarket Gauge Pods', [
          'gauge pod',
          'A-pillar gauge pod',
          'triple gauge pod',
          'boost gauge pod',
        ]),
        sc('int-heads-up-display', 'Heads-Up Display', [
          'heads-up display',
          'HUD unit',
          'aftermarket HUD',
        ], ['c5', 'c6', 'c7', 'c8']),
      ],
    },
  ],

  // =========================================================================
  // LIGHTS
  // =========================================================================
  lights: [
    {
      name: 'Headlights',
      subComponents: [
        sc('lights-led-headlight-conversions', 'LED Headlight Conversions', [
          'LED headlight conversion',
          'LED headlight bulbs',
          'projector headlight kit',
        ]),
        sc('lights-electric-headlight-actuators', 'Electric Headlight Actuator Kits', [
          'Electric headlight conversion',
          'vacuum delete',
          'headlight actuator motors',
          'Detroit Speed headlight kit',
        ], ['c3'], 'Replaces failure-prone C3 vacuum headlight system with electric motors'),
        sc('lights-projector-retrofits', 'Projector Retrofits', [
          'projector headlight retrofit',
          'HID projector',
          'bi-LED projector',
        ], ['c3', 'c4', 'c5']),
      ],
    },
    {
      name: 'Taillights & Signals',
      subComponents: [
        sc('lights-led-taillight-kits', 'LED Taillight Kits', [
          'LED taillight kit',
          'sequential LED taillights',
          'LED tail lamp conversion',
        ]),
        sc('lights-led-side-markers', 'LED Side Markers', [
          'LED side markers',
          'smoked side markers',
          'clear side marker lenses',
        ]),
      ],
    },
    {
      name: 'Accent & Interior Lighting',
      subComponents: [
        sc('lights-underbody', 'Underbody Lighting', [
          'underbody lighting',
          'LED underglow kit',
          'rock lights',
        ]),
        sc('lights-interior-led', 'Interior LED Kits', [
          'interior LED kit',
          'LED dome light',
          'LED footwell lights',
          'LED trunk light',
        ]),
      ],
    },
  ],

  // =========================================================================
  // GLASS
  // =========================================================================
  glass: [
    {
      name: 'Windshield & Windows',
      subComponents: [
        sc('glass-windshield', 'Windshield Replacement', [
          'windshield',
          'laminated windshield',
          'OEM windshield',
        ]),
        sc('glass-tint', 'Window Tint', [
          'window tint',
          'ceramic tint',
          '3M Crystalline tint',
          'XPEL Prime XR Plus',
        ]),
        sc('glass-rear-window', 'Rear Window', [
          'rear window',
          'rear hatch glass',
          'heated rear window',
        ]),
      ],
    },
    {
      name: 'Specialty Glass',
      subComponents: [
        sc('glass-t-tops', 'T-Top Panels', [
          'T-top panels',
          'T-top seals',
          'T-top storage bags',
          'smoked T-top panels',
        ], ['c3', 'c4'], 'T-tops were a signature C3/C4 feature'),
        sc('glass-targa-top', 'Targa Top Panel', [
          'targa top panel',
          'roof panel',
          'transparent roof panel',
          'carbon fiber roof panel',
        ], ['c5', 'c6', 'c7', 'c8']),
        sc('glass-c8-engine-cover', 'Engine Bay Glass', [
          'vented engine glass',
          'Clear engine bay cover (HTC)',
          'engine window tint',
        ], ['c8'], 'C8 rear engine display window'),
      ],
    },
  ],

  // =========================================================================
  // TURBO / SUPERCHARGER
  // =========================================================================
  'turbo-supercharger': [
    {
      name: 'Supercharger Systems',
      subComponents: [
        sc('centrifugal-superchargers', 'Centrifugal Superchargers', [
          'centrifugal supercharger',
          'Procharger',
          'Vortech supercharger',
          'Paxton supercharger',
        ], LS_ERA),
        sc('positive-displacement-sc', 'Positive Displacement Superchargers', [
          'positive displacement supercharger',
          'Magnuson supercharger',
          'Edelbrock E-Force',
          'Whipple supercharger',
        ], LS_ERA),
        sc('supercharger-pulleys', 'Supercharger Pulleys', [
          'supercharger pulley',
          'smaller SC pulley',
          'underdrive supercharger pulley',
        ], ['c6', 'c7', 'c8'], 'For factory-supercharged ZR1/Z06 models'),
      ],
    },
    {
      name: 'Turbo Systems',
      subComponents: [
        sc('turbo-kits', 'Turbo Kits', [
          'turbo kit',
          'twin turbo kit',
          'single turbo kit',
          'turbocharger system',
        ], LS_ERA),
        sc('turbo-manifolds', 'Turbo Manifolds', [
          'turbo manifold',
          'turbo headers',
          'log style turbo manifold',
          'equal length turbo manifold',
        ], LS_ERA),
        sc('wastegates-bov', 'Wastegates & BOVs', [
          'wastegate',
          'blow off valve',
          'BOV',
          'external wastegate',
          'TiAL wastegate',
        ], LS_ERA),
      ],
    },
  ],
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns sub-component groups for a given generation and part category.
 * Groups and sub-components are filtered to only include items relevant
 * to the requested generation.
 */
export function getSubComponents(
  generation: GenerationCode,
  partSlug: PartSlug,
): SubComponentGroup[] {
  const groups = REGISTRY[partSlug]
  if (!groups) return []

  const filtered: SubComponentGroup[] = []

  for (const group of groups) {
    const matchingSubs: SubComponent[] = group.subComponents
      .filter((s) => s.gens.includes(generation))
      .map(({ gens: _gens, ...rest }) => rest)

    if (matchingSubs.length > 0) {
      filtered.push({ name: group.name, subComponents: matchingSubs })
    }
  }

  return filtered
}

/**
 * Returns every PartSlug that has at least one sub-component for the given generation.
 */
export function getAvailablePartSlugs(generation: GenerationCode): PartSlug[] {
  return (Object.keys(REGISTRY) as PartSlug[]).filter(
    (slug) => getSubComponents(generation, slug).length > 0,
  )
}

/**
 * Flat list of all sub-components for a generation + part slug (no grouping).
 */
export function getSubComponentsFlat(
  generation: GenerationCode,
  partSlug: PartSlug,
): SubComponent[] {
  return getSubComponents(generation, partSlug).flatMap((g) => g.subComponents)
}
