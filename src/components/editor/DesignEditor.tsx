import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, RoundedBox, Text, useTexture } from "@react-three/drei";
import { ImagePlus, Rotate3D, ShoppingBag, Upload, X } from "lucide-react";
import { toast } from "sonner";
import * as THREE from "three";

type Props = { background: string; accent: string; onExport: (png: string, json: string) => void };
type ProductKind = "card" | "mug" | "hoodie" | "tote";

const products: { id: ProductKind; label: string; subtitle: string }[] = [
  { id: "card", label: "Visiting card", subtitle: "Premium matte stock" },
  { id: "mug", label: "Ceramic mug", subtitle: "11 oz studio white" },
  { id: "hoodie", label: "Classic hoodie", subtitle: "Heavyweight cotton" },
  { id: "tote", label: "Canvas tote", subtitle: "Natural cotton canvas" },
];

function LogoTexture({ url, position, scale }: { url: string; position: [number, number, number]; scale: [number, number, number] }) {
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  return <mesh position={position} scale={scale}><planeGeometry args={[1, 1]} /><meshBasicMaterial map={texture} transparent /></mesh>;
}

function ProductModel({ kind, logo, label, accent }: { kind: ProductKind; logo: string | null; label: string; accent: string }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => { if (group.current) group.current.rotation.y += delta * 0.12; });
  const logoPosition: [number, number, number] = kind === "mug" ? [0, 0.15, 0.52] : kind === "hoodie" ? [0, 0.05, 0.57] : [0, 0, kind === "card" ? 0.055 : 0.34];
  const logoScale: [number, number, number] = kind === "card" ? [1.5, 0.8, 1] : kind === "hoodie" ? [0.75, 0.75, 1] : [0.8, 0.8, 1];
  return <group ref={group}>
    {kind === "card" && <RoundedBox args={[3.2, 1.9, 0.08]} radius={0.12} smoothness={5}><meshStandardMaterial color="#f8fafc" roughness={0.28} /></RoundedBox>}
    {kind === "mug" && <><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.86, 0.76, 1.35, 48]} /><meshStandardMaterial color="#f5f3ef" roughness={0.2} /></mesh><mesh position={[0.88, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.35, 0.12, 20, 40]} /><meshStandardMaterial color="#f5f3ef" /></mesh></>}
    {kind === "hoodie" && <><RoundedBox args={[2.5, 2.25, 0.48]} radius={0.35} smoothness={5}><meshStandardMaterial color={accent} roughness={0.8} /></RoundedBox><mesh position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.45, 0.16, 24, 40]} /><meshStandardMaterial color={accent} /></mesh></>}
    {kind === "tote" && <><RoundedBox args={[2.55, 2.35, 0.22]} radius={0.08} smoothness={4}><meshStandardMaterial color="#c7a87b" roughness={0.9} /></RoundedBox><mesh position={[-0.65, 1.35, 0]} rotation={[0, 0, -0.2]}><torusGeometry args={[0.68, 0.08, 16, 30, Math.PI]} /><meshStandardMaterial color="#876b48" /></mesh><mesh position={[0.65, 1.35, 0]} rotation={[0, 0, 0.2]}><torusGeometry args={[0.68, 0.08, 16, 30, Math.PI]} /><meshStandardMaterial color="#876b48" /></mesh></>}
    {logo ? <LogoTexture url={logo} position={logoPosition} scale={logoScale} /> : <Text position={logoPosition} fontSize={kind === "card" ? 0.3 : 0.22} color={kind === "card" ? "#172033" : "#ffffff"} anchorX="center" anchorY="middle">{label}</Text>}
  </group>;
}

export function DesignEditor({ background, accent, onExport }: Props) {
  const [kind, setKind] = useState<ProductKind>("card");
  const [logo, setLogo] = useState<string | null>(null);
  const [label, setLabel] = useState("YOUR BRAND");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File) {
    if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type)) return toast.error("Choose a PNG, JPG, WebP, or SVG logo.");
    if (file.size > 10 * 1024 * 1024) return toast.error("Logo files must be smaller than 10 MB.");
    setLogo(URL.createObjectURL(file));
    toast.success("Logo added to your 3D mockup");
  }

  function saveToCart() {
    const json = JSON.stringify({ product: kind, label, logo });
    onExport(background, json);
  }

  return <div className="overflow-hidden rounded-[28px] border border-[#243048] bg-[#0b1020] text-white shadow-[0_24px_80px_rgba(5,10,25,.25)]">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#202b43] px-5 py-4 sm:px-7">
      <div><p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#91a7d6]">Omnibrand studio</p><h2 className="mt-1 text-xl font-semibold tracking-tight">Build your product mockup</h2></div>
      <div className="flex items-center gap-2 rounded-full border border-[#2b3b60] bg-[#121a30] px-3 py-2 text-xs text-[#a9b9d8]"><Rotate3D size={15} /> Drag to rotate · Scroll to zoom</div>
    </div>
    <div className="grid lg:grid-cols-[minmax(0,1fr)_310px]">
      <div className="relative min-h-[440px] overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#273b64_0%,#121a2d_46%,#080c17_100%)]">
        <Canvas camera={{ position: [0, 0.35, 5.2], fov: 32 }} dpr={[1, 2]} gl={{ preserveDrawingBuffer: true }}>
          <color attach="background" args={["#0d1425"]} /><ambientLight intensity={1.5} /><directionalLight position={[3, 4, 5]} intensity={3} color="#ffffff" /><pointLight position={[-4, 1, 2]} intensity={4} color="#567cff" /><Environment preset="studio" />
          <ProductModel kind={kind} logo={logo} label={label} accent={accent} /><ContactShadows position={[0, -1.45, 0]} opacity={0.5} scale={5} blur={2.5} far={4} /><OrbitControls enablePan={false} minDistance={3.5} maxDistance={7} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.7} />
        </Canvas>
        <div className="pointer-events-none absolute bottom-5 left-5 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/60">Live 3D preview</div>
      </div>
      <aside className="space-y-6 border-t border-[#202b43] bg-[#0f172b] p-5 sm:p-7 lg:border-l lg:border-t-0">
        <section><p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#91a7d6]">1. Choose product</p><div className="grid grid-cols-2 gap-2">{products.map((item) => <button key={item.id} onClick={() => setKind(item.id)} className={`rounded-xl border px-3 py-3 text-left transition ${kind === item.id ? "border-[#6d8dff] bg-[#23335c]" : "border-[#283651] bg-[#121b31] hover:border-[#506698]"}`}><span className="block text-sm font-semibold">{item.label}</span><span className="mt-1 block text-[11px] text-[#8d9bb9]">{item.subtitle}</span></button>)}</div></section>
        <section><p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#91a7d6]">2. Add your identity</p><label className="mb-2 block text-sm text-[#dce6ff]">Brand name</label><input value={label} onChange={(e) => setLabel(e.target.value.toUpperCase())} className="w-full rounded-xl border border-[#304263] bg-[#0a1222] px-3 py-2.5 text-sm outline-none focus:border-[#7190ff]" /><input ref={fileRef} type="file" hidden accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(e) => { const file = e.target.files?.[0]; if (file) void onFile(file); }} /><button onClick={() => fileRef.current?.click()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#526790] bg-[#182441] px-3 py-3 text-sm font-medium text-[#d8e2ff] transition hover:bg-[#203054]"><Upload size={16} /> {logo ? "Replace logo" : "Upload logo"}</button>{logo && <button onClick={() => setLogo(null)} className="mt-2 flex items-center gap-1 text-xs text-[#8d9bb9] hover:text-white"><X size={13} /> Remove logo</button>}</section>
        <div className="rounded-xl border border-[#273754] bg-[#121d35] p-3 text-xs leading-5 text-[#9eacce]"><ImagePlus size={16} className="mb-2 text-[#7d9aff]" />Your artwork is mapped directly onto the 3D surface. Orbit the product to inspect every angle before saving.</div>
        <button onClick={saveToCart} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6f8fff] px-4 py-3 text-sm font-semibold text-[#081020] transition hover:bg-[#87a2ff]"><ShoppingBag size={17} /> Save custom design</button>
      </aside>
    </div>
  </div>;
}
