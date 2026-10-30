import { Component, ReactNode, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, OrbitControls, RoundedBox } from '@react-three/drei'
import { ArrowDownToLine, ArrowUpFromLine, Minus, Plus, RotateCcw } from 'lucide-react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

type Vec3 = [number, number, number]
type PartId = 'strips' | 'card' | 'vials' | 'sachets' | 'pouches' | 'booklet'
interface Part {
  id: PartId
  name: string
  desc: string
  position: Vec3
  exploded: Vec3
  color: string
}

const PARTS: Part[] = [
  {
    id: 'strips',
    name: 'μPAD Test Strips',
    desc: 'A concept model of the paper-based strip format. This visualization does not represent a validated test or clinical result.',
    position: [-1.4, 0.4, 0.59],
    exploded: [-2.5, 2.35, 0.8],
    color: '#FBF5F2',
  },
  {
    id: 'card',
    name: 'Colour Calibration Card',
    desc: 'A separate reference card concept with printed colour patches. It does not calibrate or validate an unapproved test.',
    position: [-1.35, 0.4, -0.83],
    exploded: [-1.45, 2.52, -1.65],
    color: '#FFFCF8',
  },
  {
    id: 'vials',
    name: 'Sample Collection Vials',
    desc: 'Small capped vial concepts with translucent bodies. Contents, capacities and intended use are not specified.',
    position: [0.1, 0.4, 0.62],
    exploded: [0.15, 2.75, -1.55],
    color: '#DDEBE3',
  },
  {
    id: 'sachets',
    name: 'Daily Nutrient Sachets',
    desc: 'Individual single-use sachet concepts. Ingredients, directions and formulation are not specified in this visualization.',
    position: [0.69, 0.4, 0.74],
    exploded: [1.65, 2.3, 0.05],
    color: '#D8899D',
  },
  {
    id: 'pouches',
    name: 'Sanitary Disposal Pouches',
    desc: 'Folded disposal-pouch concepts with a sealed edge. The geometry is illustrative and not a packaging specification.',
    position: [1.55, 0.4, 0.62],
    exploded: [2.55, 2.1, 1.65],
    color: '#F3E9E0',
  },
  {
    id: 'booklet',
    name: 'Quick-Start Booklet',
    desc: 'A folded booklet concept for instructions. Use the actual product instructions for any real test or product.',
    position: [1.17, 0.4, -0.83],
    exploded: [-2.6, 2.36, -0.65],
    color: '#FFF9F6',
  },
]

const PATCH_COLORS = ['#F1C55D', '#E9946B', '#C95F78', '#86A99A', '#6C819B', '#75506D']
const CAMERA_HOME: Vec3 = [6.8, 6.1, 7.6]

function makeLabelTexture(kind: 'box' | 'inside' | 'card' | 'sachet' | 'booklet') {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = kind === 'box' ? 768 : 512
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Unable to create the Zoe kit concept label.')

  const width = canvas.width
  const height = canvas.height
  const background = kind === 'card' ? '#FFFCF8' : kind === 'sachet' ? '#F8E3E8' : '#FFF9F6'
  context.fillStyle = background
  context.fillRect(0, 0, width, height)

  if (kind === 'box') {
    context.strokeStyle = '#E8C9CF'
    context.lineWidth = 8
    context.strokeRect(34, 34, width - 68, height - 68)
    context.fillStyle = '#AD536F'
    context.font = 'italic 168px Georgia, serif'
    context.textAlign = 'center'
    context.fillText('Zoe', width / 2, 337)
    context.fillStyle = '#856773'
    context.font = 'bold 37px Arial, sans-serif'
    context.letterSpacing = '8px'
    context.fillText('WELLNESS KIT', width / 2, 423)
    context.letterSpacing = '0px'
    context.fillStyle = '#A98B92'
    context.font = '25px Arial, sans-serif'
    context.fillText('CONCEPT VISUALIZATION', width / 2, 676)
  } else if (kind === 'inside') {
    context.fillStyle = '#AD536F'
    context.font = 'italic 138px Georgia, serif'
    context.textAlign = 'center'
    context.fillText('Zoe', width / 2, 214)
    context.fillStyle = '#856773'
    context.font = 'bold 29px Arial, sans-serif'
    context.letterSpacing = '6px'
    context.fillText('WELLNESS KIT', width / 2, 282)
    context.letterSpacing = '0px'
    context.strokeStyle = '#E8C9CF'
    context.lineWidth = 3
    context.beginPath()
    context.moveTo(238, 325)
    context.lineTo(786, 325)
    context.stroke()
    context.fillStyle = '#A98B92'
    context.font = '22px Arial, sans-serif'
    context.fillText('CONCEPT DESIGN · FINAL PRODUCT DETAILS TO BE CONFIRMED', width / 2, 368)
  } else if (kind === 'card') {
    context.fillStyle = '#AD536F'
    context.font = 'bold 34px Arial, sans-serif'
    context.fillText('Zoe  ·  COLOUR REFERENCE', 42, 63)
    context.fillStyle = '#856773'
    context.font = '22px Arial, sans-serif'
    context.fillText('Illustrative colour patches', 42, 98)
  } else if (kind === 'sachet') {
    context.fillStyle = '#AD536F'
    context.font = 'italic 74px Georgia, serif'
    context.textAlign = 'center'
    context.fillText('Zoe', width / 2, 226)
    context.fillStyle = '#856773'
    context.font = 'bold 20px Arial, sans-serif'
    context.letterSpacing = '3px'
    context.fillText('SINGLE-USE CONCEPT', width / 2, 277)
    context.letterSpacing = '0px'
  } else {
    context.fillStyle = '#AD536F'
    context.font = 'italic 112px Georgia, serif'
    context.textAlign = 'center'
    context.fillText('Zoe', width / 2, 205)
    context.fillStyle = '#856773'
    context.font = 'bold 27px Arial, sans-serif'
    context.letterSpacing = '5px'
    context.fillText('QUICK-START GUIDE', width / 2, 276)
    context.letterSpacing = '0px'
    context.fillStyle = '#C88D9D'
    context.beginPath()
    context.arc(width / 2, 383, 48, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = '#FFF9F6'
    context.beginPath()
    context.arc(width / 2, 383, 27, 0, Math.PI * 2)
    context.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function ZoeMark({ scale = 1 }: { scale?: number }) {
  return <group scale={scale}>
    <RoundedBox args={[0.48, 0.055, 0.05]} radius={0.022} smoothness={3} position={[-0.48, 0.22, 0.025]}>
      <meshStandardMaterial color="#AD536F" roughness={0.48} />
    </RoundedBox>
    <RoundedBox args={[0.48, 0.055, 0.05]} radius={0.022} smoothness={3} position={[-0.48, -0.22, 0.025]}>
      <meshStandardMaterial color="#AD536F" roughness={0.48} />
    </RoundedBox>
    <RoundedBox args={[0.66, 0.055, 0.05]} radius={0.022} smoothness={3} position={[-0.48, 0, 0.025]} rotation={[0, 0, 0.72]}>
      <meshStandardMaterial color="#AD536F" roughness={0.48} />
    </RoundedBox>
    <mesh position={[0.03, 0, 0.025]}>
      <torusGeometry args={[0.155, 0.034, 8, 24]} />
      <meshStandardMaterial color="#AD536F" roughness={0.48} />
    </mesh>
    <mesh position={[0.51, 0, 0.025]}>
      <torusGeometry args={[0.155, 0.034, 8, 24, Math.PI * 1.72]} />
      <meshStandardMaterial color="#AD536F" roughness={0.48} />
    </mesh>
    <RoundedBox args={[0.23, 0.045, 0.05]} radius={0.018} smoothness={3} position={[0.5, -0.025, 0.04]}>
      <meshStandardMaterial color="#AD536F" roughness={0.48} />
    </RoundedBox>
  </group>
}

function FittedTray() {
  return <group>
    <RoundedBox args={[4.45, 0.12, 3.15]} radius={0.09} smoothness={3} position={[0, 0.31, 0]} receiveShadow castShadow>
      <meshStandardMaterial color="#F9F1EC" roughness={0.82} />
    </RoundedBox>
    {[
      { position: [0, 0.53, -0.13] as Vec3, size: [4.23, 0.32, 0.075] as Vec3 },
      { position: [0, 0.53, 1.42] as Vec3, size: [4.23, 0.32, 0.075] as Vec3 },
      { position: [0, 0.53, -0.85] as Vec3, size: [0.075, 0.32, 1.35] as Vec3 },
      { position: [-0.28, 0.53, 0.645] as Vec3, size: [0.075, 0.32, 1.52] as Vec3 },
      { position: [0.35, 0.53, 0.645] as Vec3, size: [0.075, 0.32, 1.52] as Vec3 },
      { position: [1.04, 0.53, 0.645] as Vec3, size: [0.075, 0.32, 1.52] as Vec3 },
    ].map((wall, index) => <RoundedBox key={index} args={wall.size} radius={0.025} smoothness={2} position={wall.position}>
      <meshStandardMaterial color="#F6E9E7" roughness={0.76} />
    </RoundedBox>)}
  </group>
}

function KitBox({ open }: { open: boolean }) {
  const lidRef = useRef<THREE.Group>(null)
  const angle = useRef(0)
  const texture = useMemo(() => makeLabelTexture('box'), [])
  const insideTexture = useMemo(() => makeLabelTexture('inside'), [])
  useEffect(() => () => {
    texture.dispose()
    insideTexture.dispose()
  }, [insideTexture, texture])
  useFrame((_, delta) => {
    const lid = lidRef.current
    if (!lid) return
    angle.current = THREE.MathUtils.damp(angle.current, open ? -Math.PI * 0.47 : 0, 5, delta)
    lid.rotation.x = angle.current
  })

  return <group>
    <RoundedBox args={[4.8, 0.24, 3.5]} radius={0.1} smoothness={4} position={[0, 0.13, 0]} receiveShadow castShadow>
      <meshStandardMaterial color="#EBD9C9" roughness={0.72} />
    </RoundedBox>
    <RoundedBox args={[4.78, 0.65, 0.16]} radius={0.055} smoothness={3} position={[0, 0.565, 1.67]} receiveShadow castShadow>
      <meshStandardMaterial color="#FFF9F6" roughness={0.7} />
    </RoundedBox>
    <RoundedBox args={[4.78, 0.65, 0.16]} radius={0.055} smoothness={3} position={[0, 0.565, -1.67]} receiveShadow castShadow>
      <meshStandardMaterial color="#FFF9F6" roughness={0.7} />
    </RoundedBox>
    <RoundedBox args={[0.16, 0.65, 3.22]} radius={0.055} smoothness={3} position={[-2.31, 0.565, 0]} receiveShadow castShadow>
      <meshStandardMaterial color="#FFF9F6" roughness={0.7} />
    </RoundedBox>
    <RoundedBox args={[0.16, 0.65, 3.22]} radius={0.055} smoothness={3} position={[2.31, 0.565, 0]} receiveShadow castShadow>
      <meshStandardMaterial color="#FFF9F6" roughness={0.7} />
    </RoundedBox>
    <group ref={lidRef} position={[0, 0.87, -1.67]}>
      <RoundedBox args={[4.8, 0.2, 3.5]} radius={0.11} smoothness={4} position={[0, 0.11, 1.67]} castShadow receiveShadow>
        <meshStandardMaterial color="#FFF9F6" roughness={0.58} />
      </RoundedBox>
      <mesh position={[0, 0.218, 1.67]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.2, 3.05]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <group position={[0, 0.222, 1.67]} rotation={[-Math.PI / 2, 0, 0]}>
        <ZoeMark scale={0.92} />
        <RoundedBox args={[0.9, 0.018, 0.035]} radius={0.008} smoothness={2} position={[0, -0.34, 0.025]}>
          <meshStandardMaterial color="#D8B1B8" roughness={0.6} />
        </RoundedBox>
      </group>
      <mesh position={[0, 0.012, 1.67]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.15, 2.96]} />
        <meshBasicMaterial map={insideTexture} toneMapped={false} />
      </mesh>
      <group position={[0, 0.012, 1.67]} rotation={[Math.PI / 2, 0, 0]}>
        <ZoeMark scale={0.88} />
        <RoundedBox args={[0.9, 0.018, 0.035]} radius={0.008} smoothness={2} position={[0, -0.34, 0.025]}>
          <meshStandardMaterial color="#D8B1B8" roughness={0.6} />
        </RoundedBox>
      </group>
      <RoundedBox args={[4.35, 0.09, 0.08]} radius={0.03} smoothness={2} position={[0, -0.025, 3.35]}>
        <meshStandardMaterial color="#D9A6B1" roughness={0.62} />
      </RoundedBox>
      <RoundedBox args={[4.28, 0.06, 0.07]} radius={0.025} smoothness={2} position={[0, -0.035, -0.01]}>
        <meshStandardMaterial color="#E8C9CF" roughness={0.74} />
      </RoundedBox>
    </group>
    <FittedTray />
  </group>
}

function Strip({ position, selected }: Pick<ItemProps, 'position' | 'selected'>) {
  return <group position={position}>
    <RoundedBox args={[0.98, 0.045, 0.19]} radius={0.035} smoothness={3} castShadow>
      <meshStandardMaterial color={selected ? '#FFF7F8' : '#FCF8F5'} roughness={0.7} />
    </RoundedBox>
    {[-0.27, 0, 0.27].map((x, index) => <RoundedBox key={index} args={[0.12, 0.012, 0.12]} radius={0.025} smoothness={2} position={[x, 0.03, 0]} castShadow>
      <meshStandardMaterial color={index === 1 ? '#D8899D' : '#E8B6C2'} roughness={0.52} />
    </RoundedBox>)}
    <RoundedBox args={[0.13, 0.013, 0.15]} radius={0.02} smoothness={2} position={[0.4, 0.03, 0]}>
      <meshStandardMaterial color="#AD536F" roughness={0.56} />
    </RoundedBox>
  </group>
}

function CalibrationCard({ selected }: Pick<ItemProps, 'selected'>) {
  const patches = useMemo(() => PATCH_COLORS.map((color, index) => ({
    color,
    x: -0.55 + (index % 3) * 0.55,
    z: -0.17 + Math.floor(index / 3) * 0.34,
  })), [])
  return <group>
    <RoundedBox args={[1.78, 0.055, 1.06]} radius={0.055} smoothness={3} castShadow>
      <meshStandardMaterial color={selected ? '#FFFFFF' : '#FFFCF8'} roughness={0.72} />
    </RoundedBox>
    {patches.map((patch, index) => <mesh key={index} position={[patch.x, 0.03, patch.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.42, 0.24]} />
      <meshBasicMaterial color={patch.color} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>)}
    <RoundedBox args={[0.62, 0.016, 0.035]} radius={0.012} smoothness={2} position={[0, 0.034, 0.43]}>
      <meshStandardMaterial color="#AD536F" roughness={0.64} />
    </RoundedBox>
  </group>
}

function Vial({ x, selected }: { x: number; selected: boolean }) {
  return <group position={[x, 0, 0]}>
    <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.073, 0.082, 0.27, 24]} />
      <meshPhysicalMaterial color={selected ? '#E6CCD2' : '#C7D9CF'} transparent opacity={0.72} roughness={0.22} metalness={0.02} clearcoat={0.34} clearcoatRoughness={0.24} depthWrite={false} />
    </mesh>
    <mesh position={[0, -0.01, 0]} castShadow>
      <cylinderGeometry args={[0.077, 0.082, 0.035, 24]} />
      <meshStandardMaterial color="#B5C9BE" roughness={0.3} />
    </mesh>
    <mesh position={[0, 0.275, 0]} castShadow>
      <cylinderGeometry args={[0.066, 0.071, 0.055, 24]} />
      <meshStandardMaterial color="#D8899D" roughness={0.42} />
    </mesh>
    <mesh position={[0, 0.335, 0]} castShadow>
      <cylinderGeometry args={[0.089, 0.089, 0.085, 24]} />
      <meshStandardMaterial color="#AD536F" roughness={0.46} />
    </mesh>
    {[0.27, 0.37].map(y => <mesh key={y} position={[0, y, 0]}>
      <torusGeometry args={[0.073, 0.007, 8, 24]} />
      <meshStandardMaterial color="#CE8999" roughness={0.5} />
    </mesh>)}
  </group>
}

function Sachet({ position, selected, texture }: Pick<ItemProps, 'position' | 'selected'> & { texture: THREE.Texture }) {
  return <group position={position}>
    <RoundedBox args={[0.38, 0.055, 0.34]} radius={0.045} smoothness={4} castShadow>
      <meshStandardMaterial color={selected ? '#C9788D' : '#DFA2B0'} roughness={0.66} />
    </RoundedBox>
    <mesh position={[0, 0.029, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.35, 0.31]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
    <group position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.2}><ZoeMark /></group>
    {[-0.155, 0.155].map(z => <RoundedBox key={z} args={[0.38, 0.014, 0.035]} radius={0.009} smoothness={2} position={[0, 0.03, z]}>
      <meshStandardMaterial color="#A95870" roughness={0.66} />
    </RoundedBox>)}
    <RoundedBox args={[0.3, 0.012, 0.018]} radius={0.006} smoothness={2} position={[0, 0.03, -0.1]}>
      <meshStandardMaterial color="#D89AA8" roughness={0.66} />
    </RoundedBox>
  </group>
}

function DisposalPouch({ selected }: Pick<ItemProps, 'selected'>) {
  return <group>
    <RoundedBox args={[0.82, 0.055, 0.82]} radius={0.095} smoothness={5} castShadow>
      <meshStandardMaterial color={selected ? '#F8ECE8' : '#E9DCD3'} roughness={0.82} />
    </RoundedBox>
    <RoundedBox args={[0.72, 0.018, 0.24]} radius={0.04} smoothness={3} position={[0, 0.035, -0.24]}>
      <meshStandardMaterial color="#EADBD2" roughness={0.78} />
    </RoundedBox>
    <RoundedBox args={[0.68, 0.012, 0.025]} radius={0.008} smoothness={2} position={[0, 0.035, 0.31]}>
      <meshStandardMaterial color="#D9BDB7" roughness={0.7} />
    </RoundedBox>
    {[-0.3, 0.3].map(x => <mesh key={x} position={[x, 0.031, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.1, 0.008, 6, 16, Math.PI]} />
      <meshStandardMaterial color="#DEC9C2" roughness={0.78} />
    </mesh>)}
  </group>
}

function Booklet({ selected, texture }: Pick<ItemProps, 'selected'> & { texture: THREE.Texture }) {
  return <group>
    <RoundedBox args={[1.62, 0.12, 1.02]} radius={0.055} smoothness={3} position={[0, 0.035, 0]} castShadow>
      <meshStandardMaterial color="#F7EEE8" roughness={0.86} />
    </RoundedBox>
    <RoundedBox args={[1.66, 0.055, 1.06]} radius={0.06} smoothness={4} position={[0, 0.115, 0]} castShadow>
      <meshStandardMaterial color={selected ? '#F6D7DE' : '#EFCBD4'} roughness={0.63} />
    </RoundedBox>
    <mesh position={[0, 0.145, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.56, 0.98]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
    <group position={[0, 0.148, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.86}><ZoeMark /></group>
    <RoundedBox args={[0.7, 0.018, 0.035]} radius={0.008} smoothness={2} position={[0, 0.15, 0.31]}>
      <meshStandardMaterial color="#AD536F" roughness={0.62} />
    </RoundedBox>
    <RoundedBox args={[0.07, 0.052, 1.03]} radius={0.02} smoothness={2} position={[-0.79, 0.12, 0]}>
      <meshStandardMaterial color="#AD536F" roughness={0.56} />
    </RoundedBox>
  </group>
}

interface ItemProps {
  position: Vec3
  selected: boolean
  onSelect: () => void
}

function KitItem({ part, selected, exploded, onSelect, textures }: {
  part: Part
  selected: boolean
  exploded: boolean
  onSelect: () => void
  textures: { sachet: THREE.Texture; booklet: THREE.Texture }
}) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    const group = ref.current
    if (!group) return
    const destination = exploded ? part.exploded : part.position
    group.position.x = THREE.MathUtils.damp(group.position.x, destination[0], 6, delta)
    group.position.y = THREE.MathUtils.damp(group.position.y, destination[1], 6, delta)
    group.position.z = THREE.MathUtils.damp(group.position.z, destination[2], 6, delta)
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, exploded ? 0.08 : 0, 6, delta)
  })

  return <group ref={ref} position={part.position} onClick={event => { event.stopPropagation(); onSelect() }}>
    {part.id === 'strips' && <group>
      {[-0.2, 0, 0.2].map((offset, index) => <group key={index} position={[0, index * 0.022, offset]}><Strip position={[0, 0, 0]} selected={selected} /></group>)}
    </group>}
    {part.id === 'card' && <CalibrationCard selected={selected} />}
    {part.id === 'vials' && <group><Vial x={-0.11} selected={selected} /><Vial x={0.11} selected={selected} /></group>}
    {part.id === 'sachets' && <group>
      {[-0.37, 0, 0.37].map((offset, index) => <group key={index} position={[0, index * 0.008, offset]}><Sachet position={[0, 0, 0]} selected={selected} texture={textures.sachet} /></group>)}
    </group>}
    {part.id === 'pouches' && <DisposalPouch selected={selected} />}
    {part.id === 'booklet' && <Booklet selected={selected} texture={textures.booklet} />}
  </group>
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
  } catch {
    return false
  }
}

export default function Kit() {
  const [lidOpen, setLidOpen] = useState(false)
  const [exploded, setExploded] = useState(false)
  const [selectedId, setSelectedId] = useState<PartId | null>(null)
  const [canRender, setCanRender] = useState(true)
  const controls = useRef<OrbitControlsImpl | null>(null)
  const camera = useRef<THREE.PerspectiveCamera | null>(null)
  const selected = PARTS.find(part => part.id === selectedId)
  const textures = useMemo(() => ({
    sachet: makeLabelTexture('sachet'),
    booklet: makeLabelTexture('booklet'),
  }), [])

  useEffect(() => {
    for (const texture of Object.values(textures)) texture.anisotropy = 4
    return () => { for (const texture of Object.values(textures)) texture.dispose() }
  }, [textures])

  useEffect(() => { setCanRender(supportsWebGL()) }, [])

  const setSelection = (id: PartId) => {
    setSelectedId(id)
    setLidOpen(true)
  }
  const zoom = (direction: 'in' | 'out') => {
    const activeControls = controls.current
    if (!activeControls) return
    if (direction === 'in') activeControls.dollyIn(1.18)
    else activeControls.dollyOut(1.18)
    activeControls.update()
  }
  const resetView = () => {
    const activeCamera = camera.current
    const activeControls = controls.current
    if (!activeCamera || !activeControls) return
    activeControls.target.set(0, 0.92, 0)
    activeCamera.position.set(...CAMERA_HOME)
    activeCamera.zoom = 1
    activeCamera.updateProjectionMatrix()
    activeControls.update()
  }

  const fallback = <div className="card flex h-96 items-center justify-center text-center text-mauve">
    <div><p className="font-bold text-plum">3D view is not available on this device.</p><p className="mt-2">The component descriptions and kit controls remain available below.</p></div>
  </div>

  return <div className="grid gap-6">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="mb-2 text-sm font-bold text-mauve">A considered concept, made tangible</p><h1 className="text-4xl">The Zoe wellness kit</h1></div>
      <span className="demo">Concept visualization · not to scale</span>
    </header>
    <p className="max-w-3xl text-sm text-mauve">Custom 3D concept geometry, created without product reference images. Contents, sizes, materials and test performance are illustrative and are not final product specifications.</p>

    <div className="grid gap-6 md:grid-cols-[1.55fr_1fr]">
      <div className="overflow-hidden rounded-3xl border border-warm bg-[#F7E8E8]">
        <div className="h-[24rem] sm:h-[30rem] md:h-[36rem]" aria-label="Interactive 3D concept visualization of the Zoe wellness kit">
          {canRender ? <SceneBoundary fallback={fallback}>
            <Canvas
              shadows
              dpr={[1, 1.5]}
              camera={{ position: CAMERA_HOME, fov: 36, near: 0.1, far: 80 }}
              gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
              onCreated={({ camera: activeCamera, gl, scene }) => {
                if (activeCamera instanceof THREE.PerspectiveCamera) camera.current = activeCamera
                gl.toneMapping = THREE.ACESFilmicToneMapping
                gl.toneMappingExposure = 0.94
                gl.outputColorSpace = THREE.SRGBColorSpace
                scene.background = new THREE.Color('#F7E8E8')
              }}
            >
              <Suspense fallback={null}>
                <hemisphereLight args={['#FFFDFC', '#C99DA5', 0.95]} />
                <ambientLight intensity={0.24} />
                <directionalLight position={[4.5, 8, 5]} intensity={1.7} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-near={0.5} shadow-camera-far={18} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-bias={-0.00015} />
                <directionalLight position={[-5, 4, -3]} intensity={0.7} color="#FFE7EA" />
                <pointLight position={[0, 5, 3]} intensity={0.32} color="#FFF8F1" />
                <KitBox open={lidOpen || exploded} />
                {PARTS.map(part => <KitItem key={part.id} part={part} selected={selectedId === part.id} exploded={exploded} onSelect={() => setSelection(part.id)} textures={textures} />)}
                <ContactShadows position={[0, -0.005, 0]} opacity={0.1} color="#9B7880" blur={3.8} scale={5.3} far={4.5} />
                <OrbitControls
                  ref={controls}
                  makeDefault
                  target={[0, 0.92, 0]}
                  enablePan={false}
                  enableDamping
                  dampingFactor={0.08}
                  rotateSpeed={0.72}
                  zoomSpeed={0.8}
                  minDistance={5}
                  maxDistance={13}
                  minPolarAngle={0.16}
                  maxPolarAngle={Math.PI / 2.04}
                  touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }}
                />
              </Suspense>
            </Canvas>
          </SceneBoundary> : fallback}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-warm bg-white/80 px-4 py-3">
          <p className="text-xs text-mauve">Drag to rotate · pinch or scroll to zoom</p>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-full border border-warm p-2 text-rose-deep hover:bg-blush disabled:opacity-40" onClick={() => zoom('out')} disabled={!canRender} aria-label="Zoom out"><Minus size={17} /></button>
            <button type="button" className="rounded-full border border-warm p-2 text-rose-deep hover:bg-blush disabled:opacity-40" onClick={() => zoom('in')} disabled={!canRender} aria-label="Zoom in"><Plus size={17} /></button>
            <button type="button" className="btn2 px-3 py-2" onClick={resetView} disabled={!canRender}><RotateCcw size={15} /> Reset view</button>
          </div>
        </div>
      </div>

      <aside className="grid content-start gap-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn" onClick={() => setLidOpen(value => !value)} aria-pressed={lidOpen}>
            {lidOpen ? <><ArrowDownToLine size={17} /> Close lid</> : <><ArrowUpFromLine size={17} /> Open lid</>}
          </button>
          <button type="button" className="btn2" onClick={() => { setExploded(value => !value); if (!exploded) setLidOpen(true) }} aria-pressed={exploded}>
            {exploded ? 'Assemble kit' : 'Exploded view'}
          </button>
        </div>
        <p className="text-sm text-mauve">The lid opens on a rear hinge. Exploded view arranges each component around the kit; select a component in the model or list to learn about it.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-2">
          {PARTS.map(part => <button key={part.id} type="button" onClick={() => setSelection(part.id)} aria-pressed={selectedId === part.id} className={`rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${selectedId === part.id ? 'border-rose-deep bg-blush text-rose-deep' : 'border-warm bg-white hover:bg-blush'}`}>{part.name}</button>)}
        </div>
        <div className="card min-h-36" aria-live="polite">
          {selected ? <><span className="demo">Concept component</span><h2 className="mt-2 text-xl">{selected.name}</h2><p className="mt-2 text-sm leading-relaxed text-mauve">{selected.desc}</p></> : <><span className="demo">Concept design</span><p className="mt-2 text-sm leading-relaxed text-mauve">Select an item to see its name and purpose. Actual kit contents, proportions and specifications will depend on a finalized product.</p></>}
        </div>
        <Link className="btn justify-center" to="/store">Explore the store</Link>
      </aside>
    </div>
  </div>
}
