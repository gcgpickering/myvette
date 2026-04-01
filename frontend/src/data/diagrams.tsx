import React from 'react'

const S = 'rgba(196,30,42,0.8)'    // main stroke (Corvette Torch Red)
const G = 'rgba(245,197,24,0.8)'  // accent (Racing Yellow)
const L = '#ffffff80'  // label color
const W = 1.5          // stroke width

function Label({ x, y, children }: { x: number; y: number; children: string }) {
  return <text x={x} y={y} fill={L} fontSize="10" fontFamily="'DM Mono', monospace">{children}</text>
}

function EngineDiagram() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Block */}
      <rect x="80" y="60" width="240" height="180" rx="4" stroke={S} strokeWidth={W} />
      {/* Cylinders */}
      {[120, 180, 240, 300].map((cx, i) => (
        <g key={i}>
          <rect x={cx - 20} y="80" width="40" height="80" rx="2" stroke={S} strokeWidth={W} />
          {/* Piston */}
          <rect x={cx - 14} y="110" width="28" height="16" rx="2" stroke={G} strokeWidth={W} />
          {/* Valve */}
          <line x1={cx} y1="60" x2={cx} y2="80" stroke={S} strokeWidth={W} />
          <circle cx={cx} cy="60" r="4" stroke={G} strokeWidth={W} />
        </g>
      ))}
      {/* Crankshaft */}
      <line x1="90" y1="220" x2="310" y2="220" stroke={G} strokeWidth={2} />
      <circle cx="120" cy="220" r="8" stroke={S} strokeWidth={W} />
      <circle cx="180" cy="220" r="8" stroke={S} strokeWidth={W} />
      <circle cx="240" cy="220" r="8" stroke={S} strokeWidth={W} />
      <circle cx="300" cy="220" r="8" stroke={S} strokeWidth={W} />
      {/* Camshaft */}
      <line x1="90" y1="50" x2="310" y2="50" stroke={S} strokeWidth={W} strokeDasharray="4 2" />
      {/* Labels */}
      <Label x={330} y={55}>Camshaft</Label>
      <Label x={330} y={130}>Cylinders</Label>
      <Label x={330} y={225}>Crankshaft</Label>
      <Label x={125} y={125}>Pistons</Label>
      <Label x={245} y={65}>Valves</Label>
    </svg>
  )
}

function TransmissionDiagram() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Housing */}
      <path d="M60 80 Q60 60 80 60 L320 60 Q340 60 340 80 L340 220 Q340 240 320 240 L80 240 Q60 240 60 220 Z" stroke={S} strokeWidth={W} />
      {/* Input shaft */}
      <line x1="20" y1="150" x2="100" y2="150" stroke={G} strokeWidth={2} />
      {/* Output shaft */}
      <line x1="300" y1="150" x2="380" y2="150" stroke={G} strokeWidth={2} />
      {/* Gear sets */}
      <circle cx="130" cy="120" r="25" stroke={S} strokeWidth={W} />
      <circle cx="130" cy="120" r="8" stroke={S} strokeWidth={W} />
      <circle cx="130" cy="180" r="18" stroke={S} strokeWidth={W} />
      <circle cx="200" cy="120" r="20" stroke={S} strokeWidth={W} />
      <circle cx="200" cy="180" r="22" stroke={S} strokeWidth={W} />
      <circle cx="270" cy="120" r="15" stroke={S} strokeWidth={W} />
      <circle cx="270" cy="180" r="28" stroke={S} strokeWidth={W} />
      {/* Torque converter */}
      <circle cx="80" cy="150" r="20" stroke={G} strokeWidth={W} />
      {/* Labels */}
      <Label x={10} y={135}>Input</Label>
      <Label x={350} y={135}>Output</Label>
      <Label x={55} y={195}>Torque Conv.</Label>
      <Label x={110} y={90}>Gear Sets</Label>
      <Label x={250} y={260}>Housing</Label>
    </svg>
  )
}

function SuspensionDiagram() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Strut tower mount */}
      <rect x="170" y="20" width="60" height="20" rx="4" stroke={S} strokeWidth={W} />
      {/* Shock absorber tube */}
      <rect x="185" y="40" width="30" height="120" rx="2" stroke={S} strokeWidth={W} />
      {/* Spring coils */}
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <ellipse key={i} cx="200" cy={55 + i * 16} rx="30" ry="6" stroke={G} strokeWidth={W} />
      ))}
      {/* Knuckle */}
      <rect x="175" y="165" width="50" height="40" rx="6" stroke={S} strokeWidth={W} />
      {/* Control arm */}
      <line x1="80" y1="240" x2="175" y2="200" stroke={S} strokeWidth={2} />
      <line x1="320" y1="240" x2="225" y2="200" stroke={S} strokeWidth={2} />
      {/* Bushing mounts */}
      <circle cx="80" cy="240" r="6" stroke={G} strokeWidth={W} />
      <circle cx="320" cy="240" r="6" stroke={G} strokeWidth={W} />
      {/* Wheel hub */}
      <circle cx="200" cy="230" r="15" stroke={S} strokeWidth={W} />
      <circle cx="200" cy="230" r="4" stroke={S} strokeWidth={W} />
      {/* Labels */}
      <Label x={240} y={35}>Strut Mount</Label>
      <Label x={230} y={100}>Spring</Label>
      <Label x={230} y={155}>Shock</Label>
      <Label x={230} y={190}>Knuckle</Label>
      <Label x={100} y={265}>Control Arm</Label>
    </svg>
  )
}

function BrakesDiagram() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rotor disc */}
      <circle cx="200" cy="150" r="100" stroke={S} strokeWidth={W} />
      <circle cx="200" cy="150" r="80" stroke={S} strokeWidth={W} strokeDasharray="6 4" />
      <circle cx="200" cy="150" r="30" stroke={S} strokeWidth={W} />
      {/* Bolt holes */}
      {[0, 1, 2, 3, 4].map(i => {
        const a = (i * 72 - 90) * Math.PI / 180
        return <circle key={i} cx={200 + 22 * Math.cos(a)} cy={150 + 22 * Math.sin(a)} r="3" stroke={S} strokeWidth={1} />
      })}
      {/* Caliper */}
      <path d="M290 110 Q330 110 330 140 L330 160 Q330 190 290 190 L280 190 L280 110 Z" stroke={G} strokeWidth={W} fill="rgba(68,255,136,0.03)" />
      {/* Brake pads */}
      <rect x="275" y="115" width="8" height="70" rx="1" stroke={G} strokeWidth={W} />
      <rect x="265" y="115" width="8" height="70" rx="1" stroke={G} strokeWidth={W} />
      {/* Hydraulic line */}
      <path d="M330 130 Q360 130 360 100 L360 40" stroke={S} strokeWidth={W} />
      {/* Labels */}
      <Label x={50} y={155}>Rotor</Label>
      <Label x={335} y={155}>Caliper</Label>
      <Label x={240} y={100}>Pads</Label>
      <Label x={365} y={45}>Hydraulic Line</Label>
      <Label x={180} y={155}>Hub</Label>
    </svg>
  )
}

function ExhaustDiagram() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Header pipes */}
      <path d="M30 80 Q30 120 50 120" stroke={S} strokeWidth={W} />
      <path d="M30 100 Q30 130 50 130" stroke={S} strokeWidth={W} />
      <path d="M30 120 Q30 140 50 140" stroke={S} strokeWidth={W} />
      <path d="M30 140 Q30 150 50 150" stroke={S} strokeWidth={W} />
      {/* Collector */}
      <path d="M50 115 L70 130 L70 145 L50 155" stroke={S} strokeWidth={W} />
      {/* Downpipe */}
      <line x1="70" y1="137" x2="110" y2="137" stroke={S} strokeWidth={W} />
      {/* Catalytic converter */}
      <rect x="110" y="122" width="50" height="30" rx="10" stroke={G} strokeWidth={W} fill="rgba(68,255,136,0.03)" />
      {/* Mid pipe */}
      <line x1="160" y1="137" x2="200" y2="137" stroke={S} strokeWidth={W} />
      {/* Resonator */}
      <rect x="200" y="127" width="40" height="20" rx="8" stroke={S} strokeWidth={W} />
      {/* Pipe */}
      <line x1="240" y1="137" x2="270" y2="137" stroke={S} strokeWidth={W} />
      {/* Muffler */}
      <rect x="270" y="117" width="70" height="40" rx="10" stroke={S} strokeWidth={W} />
      <line x1="280" y1="117" x2="280" y2="157" stroke={S} strokeWidth={1} strokeDasharray="3 3" />
      <line x1="330" y1="117" x2="330" y2="157" stroke={S} strokeWidth={1} strokeDasharray="3 3" />
      {/* Tailpipe */}
      <line x1="340" y1="137" x2="390" y2="137" stroke={S} strokeWidth={W} />
      <circle cx="390" cy="137" r="5" stroke={G} strokeWidth={W} />
      {/* Flow arrows */}
      <path d="M85 160 L95 155 L95 165 Z" fill={G} />
      <path d="M175 160 L185 155 L185 165 Z" fill={G} />
      <path d="M255 160 L265 155 L265 165 Z" fill={G} />
      <path d="M355 160 L365 155 L365 165 Z" fill={G} />
      {/* Labels */}
      <Label x={10} y={70}>Headers</Label>
      <Label x={110} y={115}>Cat. Conv.</Label>
      <Label x={200} y={118}>Resonator</Label>
      <Label x={280} y={110}>Muffler</Label>
      <Label x={360} y={125}>Tail</Label>
      <Label x={100} y={180}>Exhaust Flow →</Label>
    </svg>
  )
}

function TiresWheelsDiagram() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer tire */}
      <ellipse cx="200" cy="150" rx="150" ry="130" stroke={S} strokeWidth={W} />
      {/* Inner tire wall */}
      <ellipse cx="200" cy="150" rx="95" ry="80" stroke={S} strokeWidth={W} />
      {/* Tread pattern (top arc) */}
      {[-60, -40, -20, 0, 20, 40, 60].map(a => {
        const rad = a * Math.PI / 180
        const x1 = 200 + 140 * Math.cos(rad - Math.PI / 2)
        const y1 = 150 + 120 * Math.sin(rad - Math.PI / 2)
        const x2 = 200 + 125 * Math.cos(rad - Math.PI / 2)
        const y2 = 150 + 108 * Math.sin(rad - Math.PI / 2)
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={G} strokeWidth={1} />
      })}
      {/* Wheel rim */}
      <ellipse cx="200" cy="150" rx="70" ry="58" stroke={G} strokeWidth={W} />
      {/* Hub */}
      <circle cx="200" cy="150" r="15" stroke={S} strokeWidth={W} />
      {/* Spokes */}
      {[0, 1, 2, 3, 4].map(i => {
        const a = (i * 72 - 90) * Math.PI / 180
        return <line key={i} x1={200 + 15 * Math.cos(a)} y1={150 + 12 * Math.sin(a)} x2={200 + 65 * Math.cos(a)} y2={150 + 53 * Math.sin(a)} stroke={S} strokeWidth={1} />
      })}
      {/* Bead */}
      <ellipse cx="200" cy="150" rx="88" ry="74" stroke={S} strokeWidth={1} strokeDasharray="4 3" />
      {/* Labels */}
      <Label x={290} y={40}>Tread</Label>
      <line x1="288" y1="42" x2="260" y2="55" stroke={L} strokeWidth={0.5} />
      <Label x={300} y={100}>Sidewall</Label>
      <Label x={275} y={155}>Rim</Label>
      <Label x={155} y={155}>Hub</Label>
      <Label x={80} y={220}>Belt/Carcass</Label>
      <line x1="130" y1="215" x2="155" y2="200" stroke={L} strokeWidth={0.5} />
    </svg>
  )
}

function AirIntakeDiagram() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Airbox */}
      <rect x="20" y="100" width="70" height="60" rx="6" stroke={S} strokeWidth={W} />
      {/* Filter element */}
      <rect x="30" y="110" width="50" height="40" rx="2" stroke={G} strokeWidth={W} strokeDasharray="2 2" />
      {/* Intake tube */}
      <path d="M90 130 Q120 130 130 120 L190 120" stroke={S} strokeWidth={W} />
      <path d="M90 130 Q120 130 130 140 L190 140" stroke={S} strokeWidth={W} />
      {/* MAF sensor */}
      <rect x="140" y="112" width="15" height="36" rx="2" stroke={G} strokeWidth={W} />
      {/* Throttle body */}
      <rect x="190" y="108" width="40" height="44" rx="4" stroke={S} strokeWidth={W} />
      <ellipse cx="210" cy="130" rx="12" ry="16" stroke={G} strokeWidth={1} />
      {/* Intake manifold */}
      <path d="M230 115 L280 80 L340 80" stroke={S} strokeWidth={W} />
      <path d="M230 125 L280 110 L340 110" stroke={S} strokeWidth={W} />
      <path d="M230 135 L280 140 L340 140" stroke={S} strokeWidth={W} />
      <path d="M230 145 L280 170 L340 170" stroke={S} strokeWidth={W} />
      {/* Runners to engine */}
      {[80, 110, 140, 170].map(y => (
        <circle key={y} cx="345" cy={y} r="6" stroke={G} strokeWidth={W} />
      ))}
      {/* Flow arrows */}
      <path d="M10 130 L20 125 L20 135 Z" fill={G} />
      <path d="M110 125 L118 120 L118 130 Z" fill={G} />
      {/* Labels */}
      <Label x={25} y={95}>Airbox</Label>
      <Label x={30} y={170}>Filter</Label>
      <Label x={130} y={160}>MAF</Label>
      <Label x={190} y={170}>Throttle</Label>
      <Label x={270} y={70}>Intake Manifold</Label>
      <Label x={355} y={130}>To Cylinders</Label>
    </svg>
  )
}

function EcuElectronicsDiagram() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ECU box */}
      <rect x="145" y="100" width="110" height="70" rx="6" stroke={G} strokeWidth={2} fill="rgba(68,255,136,0.03)" />
      <Label x={175} y={140}>ECU</Label>
      {/* Sensors (left side) */}
      {['O2 Sensor', 'MAP', 'Crank Pos', 'Knock', 'Coolant T'].map((name, i) => {
        const y = 40 + i * 50
        return (
          <g key={name}>
            <rect x="10" y={y - 12} width="70" height="24" rx="4" stroke={S} strokeWidth={W} />
            <Label x={15} y={y + 4}>{name}</Label>
            <line x1="80" y1={y} x2="145" y2={135} stroke={S} strokeWidth={1} strokeDasharray="3 3" />
          </g>
        )
      })}
      {/* Actuators (right side) */}
      {['Injectors', 'Ign. Coils', 'Idle Valve', 'VVT', 'EGR'].map((name, i) => {
        const y = 40 + i * 50
        return (
          <g key={name}>
            <rect x="320" y={y - 12} width="70" height="24" rx="4" stroke={S} strokeWidth={W} />
            <Label x={325} y={y + 4}>{name}</Label>
            <line x1="255" y1={135} x2="320" y2={y} stroke={G} strokeWidth={1} />
            <path d={`M314 ${y - 3} L320 ${y} L314 ${y + 3}`} fill={G} />
          </g>
        )
      })}
      {/* Section labels */}
      <Label x={20} y={20}>SENSORS</Label>
      <Label x={330} y={20}>ACTUATORS</Label>
    </svg>
  )
}

function TurboSuperchargerDiagram() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Center housing */}
      <rect x="155" y="100" width="90" height="80" rx="8" stroke={S} strokeWidth={W} />
      {/* Shaft */}
      <line x1="120" y1="140" x2="280" y2="140" stroke={G} strokeWidth={2} />
      {/* Turbine side (left) */}
      <path d="M60 70 Q60 140 120 140 Q60 140 60 210" stroke={S} strokeWidth={W} />
      <path d="M120 90 L120 190" stroke={S} strokeWidth={W} />
      {/* Turbine blades */}
      {[105, 120, 135, 150, 165].map(y => (
        <line key={y} x1="80" y1={y} x2="115" y2={y - 5} stroke={S} strokeWidth={1} />
      ))}
      {/* Compressor side (right) */}
      <path d="M340 70 Q340 140 280 140 Q340 140 340 210" stroke={S} strokeWidth={W} />
      <path d="M280 90 L280 190" stroke={S} strokeWidth={W} />
      {/* Compressor blades */}
      {[105, 120, 135, 150, 165].map(y => (
        <line key={y} x1="285" y1={y - 5} x2="320" y2={y} stroke={S} strokeWidth={1} />
      ))}
      {/* Exhaust in arrow */}
      <path d="M20 140 L55 140" stroke={G} strokeWidth={W} />
      <path d="M48 135 L58 140 L48 145" fill={G} />
      {/* Exhaust out */}
      <path d="M60 70 L60 40 L120 40" stroke={S} strokeWidth={W} />
      {/* Compressed air out */}
      <path d="M340 70 L340 40 L380 40" stroke={G} strokeWidth={W} />
      <path d="M374 35 L384 40 L374 45" fill={G} />
      {/* Wastegate */}
      <rect x="70" y="220" width="40" height="20" rx="4" stroke={G} strokeWidth={W} />
      <line x1="90" y1="210" x2="90" y2="220" stroke={G} strokeWidth={1} />
      {/* Labels */}
      <Label x={70} y={85}>Turbine</Label>
      <Label x={280} y={85}>Compressor</Label>
      <Label x={170} y={95}>Bearing Housing</Label>
      <Label x={10} y={130}>Exhaust In</Label>
      <Label x={340} y={30}>Boost Out</Label>
      <Label x={65} y={255}>Wastegate</Label>
    </svg>
  )
}

function FuelSystemDiagram() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fuel tank */}
      <rect x="20" y="180" width="80" height="60" rx="8" stroke={S} strokeWidth={W} />
      <line x1="30" y1="210" x2="90" y2="210" stroke={S} strokeWidth={1} strokeDasharray="4 2" />
      {/* Fuel pump */}
      <circle cx="55" cy="200" r="12" stroke={G} strokeWidth={W} />
      <Label x={43} y={204}>P</Label>
      {/* Line from tank */}
      <line x1="100" y1="200" x2="140" y2="200" stroke={S} strokeWidth={W} />
      <path d="M130 195 L140 200 L130 205" fill={G} />
      {/* Fuel filter */}
      <rect x="140" y="188" width="40" height="24" rx="4" stroke={S} strokeWidth={W} />
      <line x1="150" y1="188" x2="150" y2="212" stroke={S} strokeWidth={1} strokeDasharray="2 2" />
      <line x1="160" y1="188" x2="160" y2="212" stroke={S} strokeWidth={1} strokeDasharray="2 2" />
      <line x1="170" y1="188" x2="170" y2="212" stroke={S} strokeWidth={1} strokeDasharray="2 2" />
      {/* Line to rail */}
      <line x1="180" y1="200" x2="220" y2="200" stroke={S} strokeWidth={W} />
      <path d="M210 195 L220 200 L210 205" fill={G} />
      {/* Fuel rail */}
      <rect x="220" y="80" width="20" height="160" rx="4" stroke={G} strokeWidth={W} />
      {/* Injectors */}
      {[100, 130, 160, 190].map(y => (
        <g key={y}>
          <rect x="240" y={y - 6} width="30" height="12" rx="2" stroke={S} strokeWidth={W} />
          <line x1="270" y1={y} x2="290" y2={y} stroke={G} strokeWidth={1} />
          <path d={`M285 ${y - 4} L295 ${y} L285 ${y + 4}`} fill={G} />
        </g>
      ))}
      {/* Pressure regulator */}
      <circle cx="230" cy="60" r="12" stroke={S} strokeWidth={W} />
      {/* Return line */}
      <path d="M218 60 L160 60 Q140 60 140 80 L140 180" stroke={S} strokeWidth={1} strokeDasharray="4 2" />
      {/* Labels */}
      <Label x={30} y={175}>Fuel Tank</Label>
      <Label x={140} y={182}>Filter</Label>
      <Label x={200} y={75}>Rail</Label>
      <Label x={300} y={130}>Injectors</Label>
      <Label x={245} y={55}>Reg.</Label>
      <Label x={100} y={55}>Return</Label>
    </svg>
  )
}

function CoolingSystemDiagram() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Radiator */}
      <rect x="30" y="40" width="40" height="200" rx="4" stroke={S} strokeWidth={W} />
      {/* Radiator fins */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <line key={i} x1="35" y1={60 + i * 22} x2="65" y2={60 + i * 22} stroke={S} strokeWidth={1} />
      ))}
      {/* Top hose */}
      <path d="M70 70 Q120 70 120 80 L240 80" stroke={S} strokeWidth={W} />
      {/* Engine block */}
      <rect x="240" y="60" width="100" height="100" rx="6" stroke={S} strokeWidth={W} />
      <Label x={260} y={115}>Engine</Label>
      {/* Water channels in engine */}
      <path d="M250 80 L250 140 L330 140 L330 80" stroke={G} strokeWidth={1} strokeDasharray="3 3" />
      {/* Bottom hose */}
      <path d="M70 200 Q120 200 120 190 L240 190" stroke={S} strokeWidth={W} />
      {/* Water pump */}
      <circle cx="200" cy="190" r="16" stroke={G} strokeWidth={W} />
      <path d="M192 184 L200 190 L192 196" fill={G} />
      <path d="M200 182 L208 190 L200 198" fill={G} />
      {/* Thermostat */}
      <rect x="140" y="65" width="24" height="24" rx="12" stroke={G} strokeWidth={W} />
      <Label x={143} y={82}>T</Label>
      {/* Flow arrows on hoses */}
      <path d="M90 65 L100 70 L90 75" fill={G} />
      <path d="M160 195 L150 200 L160 205" fill={G} />
      {/* Fan */}
      <path d="M30 260 L50 250 L70 260" stroke={S} strokeWidth={W} />
      <line x1="50" y1="240" x2="50" y2="255" stroke={S} strokeWidth={W} />
      {/* Expansion tank */}
      <rect x="300" y="180" width="40" height="30" rx="4" stroke={S} strokeWidth={W} />
      <line x1="300" y1="195" x2="260" y2="160" stroke={S} strokeWidth={1} strokeDasharray="3 3" />
      {/* Labels */}
      <Label x={15} y={35}>Radiator</Label>
      <Label x={100} y={55}>Hot Out</Label>
      <Label x={100} y={215}>Cool In</Label>
      <Label x={180} y={220}>Water Pump</Label>
      <Label x={128} y={58}>Thermostat</Label>
      <Label x={300} y={175}>Overflow</Label>
      <Label x={30} y={280}>Fan</Label>
    </svg>
  )
}

function SteeringDiagram() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Steering wheel */}
      <circle cx="200" cy="40" r="25" stroke={S} strokeWidth={W} />
      <circle cx="200" cy="40" r="5" stroke={S} strokeWidth={W} />
      <line x1="175" y1="40" x2="195" y2="40" stroke={S} strokeWidth={W} />
      <line x1="205" y1="40" x2="225" y2="40" stroke={S} strokeWidth={W} />
      <line x1="200" y1="55" x2="200" y2="65" stroke={S} strokeWidth={W} />
      {/* Steering column */}
      <rect x="195" y="65" width="10" height="60" rx="2" stroke={S} strokeWidth={W} />
      {/* U-joint */}
      <circle cx="200" cy="130" r="6" stroke={G} strokeWidth={W} />
      {/* Intermediate shaft */}
      <line x1="200" y1="136" x2="200" y2="160" stroke={S} strokeWidth={W} />
      {/* Rack housing */}
      <rect x="60" y="160" width="280" height="24" rx="12" stroke={S} strokeWidth={W} />
      {/* Pinion gear */}
      <circle cx="200" cy="172" r="10" stroke={G} strokeWidth={W} />
      {/* Rack teeth */}
      {[90, 110, 130, 150, 250, 270, 290, 310].map(x => (
        <line key={x} x1={x} y1="165" x2={x} y2="179" stroke={S} strokeWidth={1} />
      ))}
      {/* Tie rods */}
      <line x1="60" y1="172" x2="30" y2="220" stroke={S} strokeWidth={W} />
      <line x1="340" y1="172" x2="370" y2="220" stroke={S} strokeWidth={W} />
      {/* Tie rod ends (ball joints) */}
      <circle cx="30" cy="220" r="5" stroke={G} strokeWidth={W} />
      <circle cx="370" cy="220" r="5" stroke={G} strokeWidth={W} />
      {/* Knuckles */}
      <rect x="15" y="228" width="30" height="40" rx="4" stroke={S} strokeWidth={W} />
      <rect x="355" y="228" width="30" height="40" rx="4" stroke={S} strokeWidth={W} />
      {/* Labels */}
      <Label x={235} y={40}>Steering Wheel</Label>
      <Label x={210} y={100}>Column</Label>
      <Label x={210} y={175}>Rack & Pinion</Label>
      <Label x={40} y={215}>Tie Rod</Label>
      <Label x={290} y={215}>Tie Rod</Label>
      <Label x={10} y={285}>Knuckle</Label>
      <Label x={350} y={285}>Knuckle</Label>
    </svg>
  )
}

export const partDiagrams: Record<string, () => React.ReactElement> = {
  'engine': EngineDiagram,
  'transmission': TransmissionDiagram,
  'suspension': SuspensionDiagram,
  'brakes': BrakesDiagram,
  'exhaust': ExhaustDiagram,
  'tires-wheels': TiresWheelsDiagram,
  'air-intake': AirIntakeDiagram,
  'ecu-electronics': EcuElectronicsDiagram,
  'turbo-supercharger': TurboSuperchargerDiagram,
  'fuel-system': FuelSystemDiagram,
  'cooling-system': CoolingSystemDiagram,
  'steering': SteeringDiagram,
}
