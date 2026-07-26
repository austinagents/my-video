import React, {useMemo} from "react";
import {ThreeCanvas} from "@remotion/three";
import {Environment} from "@react-three/drei";
import {useThree} from "@react-three/fiber";
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import * as THREE from "three";
import type {ProductVideoProps} from "./ProductVideo";

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const ease = (frame: number, input: number[], output: number[]) =>
  interpolate(frame, input, output, {...clamp, easing: (t) => t * t * (3 - 2 * t)});

const ids = [
  "porcelain-blossom",
  "optical-mesh",
  "mirror-dune",
  "water-glacier",
  "amber-forest",
  "glass-vortex",
  "cloud-portal",
  "opal-tunnel",
] as const;

const PreviewProduct: React.FC<{name: string}> = ({name}) => (
  <div
    style={{
      position: "relative",
      width: "54%",
      height: "88%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-end",
    }}
  >
    <div
      style={{
        width: "52%",
        height: "14%",
        borderRadius: "12px 12px 6px 6px",
        background: "linear-gradient(90deg,#343735,#777d79 48%,#2b2d2c)",
        boxShadow: "inset 5px 0 8px #ffffff1f, inset -6px 0 8px #0008",
      }}
    />
    <div
      style={{
        width: "100%",
        height: "78%",
        borderRadius: "24px 24px 30px 30px",
        background: "linear-gradient(100deg,#b8bbb7 0%,#f2f0e9 28%,#d5d8d4 62%,#7d827f 100%)",
        border: "1px solid #ffffff80",
        boxShadow: "inset 10px 0 18px #ffffff66, inset -12px 0 20px #30333155, 0 24px 28px #0006",
        display: "grid",
        placeItems: "center",
        color: "#1b1d1c",
        fontSize: 15,
        fontWeight: 750,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        writingMode: "vertical-rl",
      }}
    >
      {name}
    </div>
  </div>
);

const CameraDirector: React.FC<{id: ProductVideoProps["templateId"]; frame: number; vertical: boolean}> = ({
  id,
  frame,
  vertical,
}) => {
  const {camera} = useThree();
  const baseZ = vertical ? 10.7 : 8.8;
  let x = 0;
  let y = 0.1;
  let z = baseZ;
  if (id === "mirror-dune") {
    x = ease(frame, [0, 210], [-1.25, 0.75]);
    y = ease(frame, [0, 210], [-0.35, 0.28]);
    z = ease(frame, [0, 210], [baseZ + 2.7, baseZ - 1.1]);
  } else if (id === "water-glacier") {
    y = ease(frame, [0, 210], [-1.15, 1.15]);
    z = ease(frame, [0, 210], [baseZ + 3.2, baseZ - 1.5]);
  } else if (id === "amber-forest") {
    x = ease(frame, [0, 210], [-0.6, 0.55]);
    y = ease(frame, [0, 210], [-0.72, 0.82]);
    z = ease(frame, [0, 210], [baseZ + 3.4, baseZ - 1.2]);
  } else if (id === "cloud-portal") {
    y = ease(frame, [0, 210], [-0.2, 0.35]);
    z = ease(frame, [0, 210], [baseZ + 1.6, baseZ - 0.4]);
  } else if (id === "opal-tunnel") {
    z = ease(frame, [0, 210], [baseZ + 4.4, baseZ - 2.4]);
  } else if (id === "glass-vortex") {
    y = ease(frame, [0, 180], [-0.55, 0.55]);
    z = ease(frame, [0, 180], [baseZ + 2.2, baseZ - 0.8]);
  } else {
    z = ease(frame, [0, 190], [baseZ + 1.7, baseZ - 0.55]);
  }
  camera.position.set(x, y, z);
  camera.lookAt(0, id === "mirror-dune" ? -0.75 : -0.15, 0);
  camera.updateProjectionMatrix();
  return null;
};

const Floor: React.FC<{color?: string; roughness?: number; metalness?: number}> = ({
  color = "#151719",
  roughness = 0.5,
  metalness = 0.05,
}) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.75, 0]} receiveShadow>
    <planeGeometry args={[40, 40]} />
    <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
  </mesh>
);

const Pedestal: React.FC<{light?: boolean}> = ({light = false}) => (
  <mesh position={[0, -2.05, 0]} castShadow receiveShadow>
    <cylinderGeometry args={[2.25, 2.4, 1.35, 64]} />
    <meshStandardMaterial color={light ? "#d8d4cc" : "#262728"} roughness={0.72} />
  </mesh>
);

const terrainGeometry = (kind: "mirror" | "glacier") => {
  const size = kind === "glacier" ? 92 : 52;
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const indices: number[] = [];
  for (let zIndex = 0; zIndex < size; zIndex++) {
    for (let xIndex = 0; xIndex < size; xIndex++) {
      const x = (xIndex / (size - 1) - 0.5) * 15;
      const z = (zIndex / (size - 1) - 0.5) * 16;
      const wave =
        Math.sin(x * 1.16 + z * 0.34) * 0.42 +
        Math.sin(x * 0.38 - z * 0.76) * 0.34 +
        Math.cos(x * 1.7 + z * 0.12) * 0.14;
      const riverCenter = Math.sin(z * 0.44) * 0.72 + Math.sin(z * 0.17) * 0.42;
      const riverDistance = Math.abs(x - riverCenter);
      const glacierRidges =
        Math.abs(Math.sin(x * 1.62 + Math.sin(z * 0.5))) * 0.72 +
        Math.abs(Math.sin(x * 0.63 - z * 0.22)) * 0.36 +
        Math.pow(Math.abs(Math.sin(x * 3.15 + z * 0.58)), 4) * 0.48;
      const y =
        kind === "mirror"
          ? -1.82 + wave * 0.72
          : -1.98 + glacierRidges * Math.min(1.45, riverDistance * 0.62) - Math.exp(-riverDistance * 2.8) * 0.48;
      positions.push(x, y, z);
    }
  }
  for (let zIndex = 0; zIndex < size - 1; zIndex++) {
    for (let xIndex = 0; xIndex < size - 1; xIndex++) {
      const a = zIndex * size + xIndex;
      const b = a + 1;
      const c = a + size;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
};

const TerrainSheet: React.FC<{kind: "mirror" | "glacier"}> = ({kind}) => {
  const geometry = useMemo(() => terrainGeometry(kind), [kind]);
  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      {kind === "mirror" ? (
        <meshPhysicalMaterial color="#24292b" roughness={0.08} metalness={0.82} clearcoat={0.72} flatShading />
      ) : (
        <meshPhysicalMaterial color="#cbd8dc" roughness={0.3} clearcoat={0.22} flatShading />
      )}
    </mesh>
  );
};

const duneRibbonGeometry = (width: number, length: number, phase: number) => {
  const across = 18;
  const along = 64;
  const positions: number[] = [];
  const indices: number[] = [];
  for (let zIndex = 0; zIndex <= along; zIndex++) {
    const v = zIndex / along;
    for (let xIndex = 0; xIndex <= across; xIndex++) {
      const u = xIndex / across;
      const lateral = (u - 0.5) * width;
      const crest = Math.pow(Math.max(0, 1 - Math.abs(u - 0.5) * 2), 2.35);
      const longitudinal = Math.sin(v * Math.PI * 2.2 + phase) * 0.24 + Math.sin(v * Math.PI * 4.8 + phase * 0.7) * 0.08;
      const x = lateral + Math.sin(v * Math.PI * 1.45 + phase) * 0.62;
      const y = -1.95 + crest * (0.7 + longitudinal);
      const z = (v - 0.5) * length;
      positions.push(x, y, z);
    }
  }
  for (let zIndex = 0; zIndex < along; zIndex++) {
    for (let xIndex = 0; xIndex < across; xIndex++) {
      const a = zIndex * (across + 1) + xIndex;
      const b = a + 1;
      const c = a + across + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
};

const DuneRibbon: React.FC<{width: number; length: number; phase: number; position: [number, number, number]; tone: string}> = ({
  width,
  length,
  phase,
  position,
  tone,
}) => {
  const geometry = useMemo(() => duneRibbonGeometry(width, length, phase), [length, phase, width]);
  return (
    <mesh geometry={geometry} position={position} castShadow receiveShadow>
      <meshPhysicalMaterial color={tone} roughness={0.13} metalness={0.82} clearcoat={0.68} side={THREE.DoubleSide} />
    </mesh>
  );
};

const CrystalForest: React.FC<{grow: number; opacity: number}> = ({grow, opacity}) => {
  const bodyRef = React.useRef<THREE.InstancedMesh>(null);
  const tipRef = React.useRef<THREE.InstancedMesh>(null);
  const crystals = useMemo(
    () =>
      Array.from({length: 210}, (_, i) => {
        const row = Math.floor(i / 15);
        const column = i % 15;
        const corridor = column < 7 ? -1 : 1;
        const x = corridor * (0.95 + Math.abs(column - 7) * 0.52) + Math.sin(i * 1.71) * 0.24;
        const z = 5.8 - row * 0.9 + Math.cos(i * 0.83) * 0.24;
        const height = 0.65 + ((i * 29) % 37) / 9;
        const radius = 0.12 + ((i * 13) % 9) * 0.018;
        return {x, z, height, radius, rotation: (i * 0.73) % Math.PI};
      }),
    [],
  );
  React.useLayoutEffect(() => {
    const body = bodyRef.current;
    const tip = tipRef.current;
    if (!body || !tip) return;
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const position = new THREE.Vector3();
    crystals.forEach((crystal, index) => {
      quaternion.setFromEuler(new THREE.Euler(0, crystal.rotation, 0));
      scale.set(crystal.radius, crystal.height * grow, crystal.radius);
      position.set(crystal.x, -2.68 + crystal.height * grow * 0.5, crystal.z);
      matrix.compose(position, quaternion, scale);
      body.setMatrixAt(index, matrix);
      scale.set(crystal.radius * 1.08, crystal.radius * 2.8 * grow, crystal.radius * 1.08);
      position.set(crystal.x, -2.68 + crystal.height * grow + crystal.radius * 1.4 * grow, crystal.z);
      matrix.compose(position, quaternion, scale);
      tip.setMatrixAt(index, matrix);
    });
    body.instanceMatrix.needsUpdate = true;
    tip.instanceMatrix.needsUpdate = true;
  }, [crystals, grow]);
  return (
    <>
      <instancedMesh ref={bodyRef} args={[undefined, undefined, crystals.length]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshPhysicalMaterial color="#74401f" roughness={0.16} metalness={0.08} transmission={0.2} thickness={0.8} flatShading transparent opacity={opacity} />
      </instancedMesh>
      <instancedMesh ref={tipRef} args={[undefined, undefined, crystals.length]} castShadow>
        <coneGeometry args={[1, 1, 6]} />
        <meshPhysicalMaterial color="#c4873f" roughness={0.12} metalness={0.05} transmission={0.3} thickness={0.6} flatShading transparent opacity={opacity} />
      </instancedMesh>
    </>
  );
};

const PorcelainBlossom: React.FC<{frame: number}> = ({frame}) => {
  const rise = ease(frame, [28, 92], [0.02, 1]);
  const petals = useMemo(
    () =>
      Array.from({length: 32}, (_, i) => ({
        ring: i < 14 ? 0 : 1,
        angle: (i / (i < 14 ? 14 : 18)) * Math.PI * 2,
      })),
    [],
  );
  const stems = useMemo(
    () =>
      Array.from({length: 11}, (_, i) => {
        const angle = (i / 11) * Math.PI * 2;
        const points = Array.from({length: 24}, (_, j) => {
          const t = j / 23;
          const twist = angle + t * Math.PI * 1.18;
          const radius = 0.52 * (1 - t * 0.72);
          return new THREE.Vector3(Math.cos(twist) * radius, t * 3.38, Math.sin(twist) * radius);
        });
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 60, 0.075, 8, false);
      }),
    [],
  );
  const petalGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.72);
    shape.bezierCurveTo(0.52, -0.42, 0.64, 0.25, 0, 0.92);
    shape.bezierCurveTo(-0.64, 0.25, -0.52, -0.42, 0, -0.72);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.045,
      bevelThickness: 0.04,
      curveSegments: 18,
    });
    geometry.center();
    return geometry;
  }, []);
  return (
    <>
      <color attach="background" args={["#272b2c"]} />
      <fog attach="fog" args={["#272b2c", 8, 20]} />
      <Floor />
      <Pedestal />
      <group position={[0, -1.32, 0]}>
        <group scale={[1 - rise * 0.72, 1 - rise * 0.72, 1 - rise * 0.72]}>
          {Array.from({length: 11}, (_, i) => (
            <mesh key={i} rotation={[0, (i / 11) * Math.PI * 2, 0]}>
            <torusGeometry args={[0.66 + i * 0.018, 0.055, 10, 90]} />
            <meshPhysicalMaterial color="#eee7dc" roughness={0.42} clearcoat={0.22} />
          </mesh>
          ))}
        </group>
        <group scale={[1, rise, 1]}>
          {stems.map((geometry, i) => (
            <mesh key={i} geometry={geometry} castShadow>
              <meshPhysicalMaterial color={i % 3 === 0 ? "#ddd4c6" : "#eee7dc"} roughness={0.38} clearcoat={0.18} />
            </mesh>
          ))}
        </group>
        <group position={[0, 3.38 * rise, 0]} scale={0.7}>
          {petals.map((p, i) => {
            const r = p.ring === 0 ? 0.96 : 1.56;
            const open = ease(frame, [82 + i * 1.8, 130 + i * 1.8], [0.01, 1]);
            return (
              <mesh
                key={i}
                position={[Math.cos(p.angle) * r, Math.sin(p.angle) * r, p.ring * -0.22]}
                rotation={[0.15, 0, p.angle - Math.PI / 2]}
                scale={[0.72 * open, 0.92 * open, 0.72 * open]}
                castShadow
                geometry={petalGeometry}
              >
                <meshPhysicalMaterial
                  color={p.ring ? "#d9d7d3" : "#f1ebe2"}
                  roughness={p.ring ? 0.12 : 0.38}
                  metalness={0}
                  transmission={p.ring ? 0.3 : 0}
                  thickness={0.25}
                />
              </mesh>
            );
          })}
        </group>
      </group>
    </>
  );
};

const OpticalMesh: React.FC<{frame: number}> = ({frame}) => {
  const form = ease(frame, [20, 145], [0, 1]);
  const geometry = useMemo(() => {
    const columns = 34;
    const rows = 20;
    const positions: number[] = [];
    const indices: number[] = [];
    for (let row = 0; row <= rows; row++) {
      for (let column = 0; column <= columns; column++) {
        const u = column / columns;
        const v = row / rows;
        const planeX = (u - 0.5) * 6.8;
        const planeY = -2.42;
        const planeZ = (v - 0.5) * 4.5;
        const theta = u * Math.PI * 2;
        const phi = v * Math.PI;
        const radius = 2.55;
        const sphereX = Math.sin(phi) * Math.cos(theta) * radius;
        const sphereY = Math.cos(phi) * radius - 0.05;
        const sphereZ = Math.sin(phi) * Math.sin(theta) * radius;
        positions.push(
          THREE.MathUtils.lerp(planeX, sphereX, form),
          THREE.MathUtils.lerp(planeY, sphereY, form),
          THREE.MathUtils.lerp(planeZ, sphereZ, form),
        );
      }
    }
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const a = row * (columns + 1) + column;
        const b = a + 1;
        const c = a + columns + 1;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
    const next = new THREE.BufferGeometry();
    next.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    next.setIndex(indices);
    next.computeVertexNormals();
    return next;
  }, [form]);
  return (
    <>
      <color attach="background" args={["#11181c"]} />
      <fog attach="fog" args={["#11181c", 8, 18]} />
      <Floor color="#10161a" roughness={0.28} metalness={0.18} />
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#d8dedc" wireframe roughness={0.18} metalness={0.78} />
      </mesh>
      <mesh geometry={geometry} scale={0.987}>
        <meshPhysicalMaterial color="#182229" transparent opacity={form * 0.17} roughness={0.14} metalness={0.62} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, -0.1, 0]} intensity={80 * form} color="#d6a468" distance={10} />
    </>
  );
};

const MirrorDune: React.FC<{frame: number}> = ({frame}) => {
  const travel = ease(frame, [0, 205], [2.2, -3.1]);
  const ribbons = useMemo(
    () =>
      Array.from({length: 13}, (_, i) => ({
        width: 2.4 + (i % 4) * 0.48,
        length: 10.5 + (i % 3) * 1.3,
        phase: i * 0.68,
        position: [((i % 5) - 2) * 2.25, 0, -Math.floor(i / 5) * 3.4 + 0.8] as [number, number, number],
        tone: i % 3 === 0 ? "#31383b" : i % 3 === 1 ? "#202628" : "#40484b",
      })),
    [],
  );
  return (
    <>
      <color attach="background" args={["#697175"]} />
      <fog attach="fog" args={["#697175", 7, 17]} />
      <Floor color="#4d5457" roughness={0.08} metalness={0.82} />
      <group position={[travel, 0, -0.5]} rotation={[0, -0.08, 0]}>
        {ribbons.map((ribbon, i) => (
          <DuneRibbon key={i} {...ribbon} />
        ))}
      </group>
      <pointLight position={[0, -0.8, -7]} intensity={34} color="#cbb89f" distance={16} />
    </>
  );
};

const Glacier: React.FC<{frame: number}> = ({frame}) => {
  const reveal = ease(frame, [48, 92], [0, 1]);
  const riverGeometries = useMemo(
    () =>
      [
        {offset: 0, start: 0, radius: 0.16},
        {offset: -1.15, start: 5, radius: 0.095},
        {offset: 1.28, start: 7, radius: 0.082},
      ].map(
        ({offset, start, radius}) =>
          new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(
              Array.from({length: 16 - start}, (_, i) => {
                const z = 7 - (i + start) * 0.92;
                const merge = i / Math.max(1, 15 - start);
                const x =
                  Math.sin(z * 0.44) * 0.72 +
                  Math.sin(z * 0.17) * 0.42 +
                  offset * (1 - merge);
                return new THREE.Vector3(x, -2.08, z);
              }),
            ),
            120,
            radius,
            10,
            false,
          ),
      ),
    [],
  );
  return (
    <>
      <color attach="background" args={["#778991"]} />
      <fog attach="fog" args={["#778991", 7, 17]} />
      <Floor color="#aeb9bd" roughness={0.42} />
      <mesh position={[0, -2.18, 0.8]} scale={[2.1 + reveal * 2.8, 0.24, 1.35 + reveal * 0.45]} rotation={[0, 0.2, 0]} visible={reveal < 0.99}>
        <sphereGeometry args={[1, 64, 40]} />
        <meshPhysicalMaterial color="#d7e5e8" transmission={0.68} thickness={0.8} roughness={0.035} transparent opacity={1 - reveal} />
      </mesh>
      <group scale={[0.35 + reveal * 0.65, 0.35 + reveal * 0.65, 0.35 + reveal * 0.65]} visible={reveal > 0.01}>
        <TerrainSheet kind="glacier" />
        {riverGeometries.map((geometry, index) => (
          <mesh geometry={geometry} key={index}>
            <meshPhysicalMaterial color="#93cbd3" roughness={0.08} transmission={0.48} thickness={0.5} transparent opacity={reveal} />
          </mesh>
        ))}
      </group>
    </>
  );
};

const AmberForest: React.FC<{frame: number}> = ({frame}) => {
  const transition = ease(frame, [42, 78], [0, 1]);
  const grow = ease(frame, [62, 154], [0.02, 1]);
  return (
    <>
      <color attach="background" args={["#17130f"]} />
      <fog attach="fog" args={["#17130f", 8, 19]} />
      <Floor color="#11100e" roughness={0.2} metalness={0.35} />
      <mesh position={[0, -1.32, 0.7]} scale={1.15 + ease(frame, [0, 44], [0, 0.72])} rotation={[frame * 0.003, frame * 0.006, -0.18]} visible={transition < 0.99} castShadow>
        <dodecahedronGeometry args={[1.45, 0]} />
        <meshPhysicalMaterial color="#b96724" roughness={0.06} transmission={0.34} thickness={1.5} clearcoat={0.72} flatShading transparent opacity={1 - transition} />
      </mesh>
      <CrystalForest grow={grow} opacity={transition} />
      <pointLight position={[0, 0, -2]} color="#e9a24b" intensity={75 * grow} distance={11} />
    </>
  );
};

const GlassVortex: React.FC<{frame: number}> = ({frame}) => {
  const turn = ease(frame, [0, 190], [0, Math.PI * 1.45]);
  const form = ease(frame, [12, 126], [0, 1]);
  const settle = ease(frame, [142, 210], [0, 1]);
  const threads = useMemo(
    () =>
      Array.from({length: 24}, (_, i) => {
        const pts = Array.from({length: 40}, (_, j) => {
          const t = j / 39;
          const a = t * Math.PI * 3.4 + i * 0.41;
          const r = 0.55 + t * 3.5;
          const flat = new THREE.Vector3(-4.8 + t * 9.6, -2.15, (i - 12) * 0.11);
          const vortex = new THREE.Vector3(Math.cos(a) * r, -2 + t * 2.7, Math.sin(a) * r);
          const ringRadius = 0.85 + t * 3.2;
          const ring = new THREE.Vector3(Math.cos(a) * ringRadius, -1.82 + i * 0.002, Math.sin(a) * ringRadius);
          return flat.lerp(vortex, form).lerp(ring, settle);
        });
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 70, 0.018 + (i % 3) * 0.008, 6, false);
      }),
    [form, settle],
  );
  return (
    <>
      <color attach="background" args={["#34393b"]} />
      <fog attach="fog" args={["#34393b", 8, 18]} />
      <Floor color="#34393b" roughness={0.26} metalness={0.25} />
      <group position={[0, -0.05, 0]} scale={0.82} rotation={[0.22, turn, 0]}>
        {threads.map((geometry, i) => (
          <mesh key={i} geometry={geometry}>
            <meshPhysicalMaterial color={i % 4 === 0 ? "#b88752" : "#d8d9d7"} roughness={0.12} metalness={i % 4 === 0 ? 0.65 : 0.25} clearcoat={0.65} />
          </mesh>
        ))}
      </group>
    </>
  );
};

const CloudPortal: React.FC<{frame: number}> = ({frame}) => {
  const world = ease(frame, [44, 84], [0, 1]);
  const push = ease(frame, [72, 205], [0.42, 1.34]);
  return (
    <>
      <color attach="background" args={["#b8b3a9"]} />
      <fog attach="fog" args={["#b8b3a9", 8, 18]} />
      <mesh position={[0, -0.25, 0.8]} scale={1.1 + ease(frame, [0, 44], [0, 1.1])} visible={world < 0.99}>
        <sphereGeometry args={[1.65, 64, 40]} />
        <meshPhysicalMaterial color="#d8d6cf" transmission={0.88} thickness={1.3} roughness={0.03} transparent opacity={1 - world} depthWrite={false} />
      </mesh>
      <group scale={ease(frame, [48, 176], [0.48, 1.08])} position={[0, 0.55, 0]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <torusGeometry args={[2.55, 0.3, 16, 96]} />
          <meshStandardMaterial color="#393a37" roughness={0.92} transparent opacity={world} />
        </mesh>
        {Array.from({length: 76}, (_, i) => {
          const a = (i / 76) * Math.PI * 2;
          const irregular = 2.55 + Math.sin(i * 2.17) * 0.1 + Math.cos(i * 0.73) * 0.07;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * irregular, Math.sin(a) * irregular + 0.2, 0.12 + Math.sin(i * 1.31) * 0.14]}
              rotation={[i * 0.31, i * 0.17, a]}
              scale={[0.58 + (i % 5) * 0.045, 0.5 + (i % 4) * 0.055, 0.46 + (i % 3) * 0.06]}
            >
              <dodecahedronGeometry args={[0.72, 0]} />
              <meshStandardMaterial color="#4a4b47" roughness={0.86} transparent opacity={world} />
            </mesh>
          );
        })}
      </group>
      <group position={[0, -2.25, -1.5]} scale={[1, 0.52, 1]} visible={world > 0.01}>
        {Array.from({length: 128}, (_, i) => (
          <mesh
            key={i}
            position={[((i * 37) % 211) / 14 - 7.5, ((i * 17) % 11) * 0.065, -((i * 29) % 173) / 13 + 4.8]}
            scale={0.42 + ((i * 13) % 11) * 0.065}
          >
            <sphereGeometry args={[1, 18, 12]} />
            <meshStandardMaterial color={i % 4 === 0 ? "#c8c9c5" : "#deddd7"} roughness={1} transparent opacity={world * (0.28 + (i % 5) * 0.055)} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <Floor color="#9c9890" roughness={0.9} />
      <directionalLight position={[0, 3, -4]} intensity={3.5} color="#d5b887" />
      <pointLight position={[0, -0.4, -6]} intensity={48 * world} color="#d8b47e" distance={18} />
    </>
  );
};

const OpalTunnel: React.FC<{frame: number}> = ({frame}) => {
  const enter = ease(frame, [38, 74], [0, 1]);
  const travel = ease(frame, [62, 215], [0.72, 3.4]);
  return (
    <>
      <color attach="background" args={["#0b0c0d"]} />
      <fog attach="fog" args={["#0b0c0d", 6, 17]} />
      <Floor color="#17191a" roughness={0.58} />
      <group position={[0, -1.95, 0.8]} visible={enter < 0.99}>
        <mesh scale={[1.42, 0.55, 1.08]}>
          <sphereGeometry args={[1.35, 64, 40]} />
          <meshPhysicalMaterial color="#cfd8d6" transmission={0.78} thickness={1.2} roughness={0.04} iridescence={0.58} transparent opacity={1 - enter} />
        </mesh>
        {Array.from({length: 22}, (_, i) => (
          <mesh key={i} position={[((i * 37) % 101) / 12 - 4.2, 0.05 + ((i * 13) % 7) * 0.12, -((i * 23) % 53) / 13]}>
            <sphereGeometry args={[0.13 + (i % 4) * 0.06, 20, 14]} />
            <meshPhysicalMaterial color="#d9dfdd" transmission={0.84} thickness={0.5} roughness={0.04} transparent opacity={1 - enter} />
          </mesh>
        ))}
      </group>
      <group scale={travel * 0.72} position={[0, 0.45, 0]} rotation={[0, 0, frame * 0.0034]} visible={enter > 0.01}>
        {Array.from({length: 22}, (_, i) => (
          <mesh
            key={i}
            position={[Math.sin(i * 0.71) * 0.08, Math.cos(i * 0.53) * 0.08, -i * 0.66]}
            rotation={[0.12 + i * 0.073, i * 0.11, i * 0.095]}
            scale={1 + i * 0.068}
          >
            <torusGeometry args={[1.1 + Math.sin(i * 0.61) * 0.06, 0.055 + (i % 3) * 0.012, 3, 5 + (i % 5)]} />
            <meshPhysicalMaterial color={i % 3 === 0 ? "#d7c6b3" : "#b8c7c4"} roughness={0.04} metalness={0.08} transmission={0.8} thickness={0.42} iridescence={0.68} iridescenceIOR={1.35} transparent opacity={enter} />
          </mesh>
        ))}
        {Array.from({length: 42}, (_, i) => {
          const angle = (i / 42) * Math.PI * 2 + (i % 4) * 0.21;
          const radius = 1.25 + (i % 7) * 0.16;
          return (
            <mesh
              key={`shard-${i}`}
              position={[Math.cos(angle) * radius, Math.sin(angle) * radius, -(i % 14) * 0.82]}
              rotation={[i * 0.27, i * 0.19, angle]}
              scale={[0.12, 0.42 + (i % 5) * 0.08, 0.08]}
            >
              <tetrahedronGeometry args={[1, 0]} />
              <meshPhysicalMaterial color={i % 2 ? "#c8d1ce" : "#e0cdb7"} roughness={0.03} transmission={0.76} thickness={0.24} iridescence={0.52} transparent opacity={enter} />
            </mesh>
          );
        })}
      </group>
      <pointLight position={[0, 0, 2]} intensity={70} color="#e7d0b3" distance={12} />
    </>
  );
};

const World: React.FC<{id: ProductVideoProps["templateId"]; frame: number}> = ({id, frame}) => {
  if (id === "porcelain-blossom") return <PorcelainBlossom frame={frame} />;
  if (id === "optical-mesh") return <OpticalMesh frame={frame} />;
  if (id === "mirror-dune") return <MirrorDune frame={frame} />;
  if (id === "water-glacier") return <Glacier frame={frame} />;
  if (id === "amber-forest") return <AmberForest frame={frame} />;
  if (id === "glass-vortex") return <GlassVortex frame={frame} />;
  if (id === "cloud-portal") return <CloudPortal frame={frame} />;
  return <OpalTunnel frame={frame} />;
};

const productMotion = (id: ProductVideoProps["templateId"], frame: number) => {
  const land = (from: number, to: number) => ease(frame, [from, to], [0, 1]);
  if (id === "porcelain-blossom") {
    const p = land(130, 174);
    return {
      opacity: p,
      transform: `translate(-50%, -50%) translateY(${(1 - p) * 170}px) scale(${0.34 + p * 0.66})`,
      clipPath: `circle(${p * 72}% at 50% 70%)`,
      filter: `drop-shadow(0 30px 24px rgba(0,0,0,.4)) brightness(${0.82 + p * 0.18})`,
    };
  }
  if (id === "optical-mesh") {
    const p = land(122, 166);
    return {
      opacity: p,
      transform: `translate(-50%, -50%) scale(${0.04 + p * 0.96}) rotate(${(1 - p) * -12}deg)`,
      clipPath: `circle(${p * 72}% at 50% 50%)`,
      filter: `drop-shadow(0 28px 24px rgba(0,0,0,.45)) contrast(${1.25 - p * 0.25})`,
    };
  }
  if (id === "mirror-dune") {
    const p = land(138, 178);
    return {
      opacity: p,
      transform: `translate(-50%, -50%) translateY(${(1 - p) * 105}px) scale(${0.42 + p * 0.58})`,
      clipPath: `inset(${(1 - p) * 100}% 0 0 0 round 24px)`,
      filter: "drop-shadow(0 30px 26px rgba(0,0,0,.48))",
    };
  }
  if (id === "water-glacier") {
    const p = land(144, 182);
    return {
      opacity: p,
      transform: `translate(-50%, -50%) translateY(${(1 - p) * 210}px) scale(${0.7 + p * 0.3})`,
      clipPath: `polygon(0 ${100 - p * 100}%,100% ${100 - p * 100}%,100% 100%,0 100%)`,
      filter: `drop-shadow(0 28px 20px rgba(24,45,52,.42)) saturate(${0.72 + p * 0.28})`,
    };
  }
  if (id === "amber-forest") {
    const p = land(132, 174);
    return {
      opacity: p,
      transform: `translate(-50%, -50%) scale(${0.08 + p * 0.92})`,
      clipPath: `polygon(50% ${50 - p * 50}%,${50 + p * 50}% 50%,50% ${50 + p * 50}%,${50 - p * 50}% 50%)`,
      filter: `drop-shadow(0 30px 24px rgba(0,0,0,.46)) brightness(${1.55 - p * 0.55})`,
    };
  }
  if (id === "glass-vortex") {
    const p = land(140, 184);
    return {
      opacity: p,
      transform: `translate(-50%, -50%) scale(${0.22 + p * 0.78}) rotate(${(1 - p) * 150}deg)`,
      clipPath: `circle(${p * 74}% at 50% 50%)`,
      filter: `drop-shadow(0 30px 24px rgba(0,0,0,.4)) blur(${(1 - p) * 3}px)`,
    };
  }
  if (id === "cloud-portal") {
    const p = land(126, 174);
    return {
      opacity: p,
      transform: `translate(-50%, -50%) scale(${0.06 + p * 0.94})`,
      clipPath: `circle(${p * 72}% at 50% 50%)`,
      filter: `drop-shadow(0 32px 24px rgba(0,0,0,.38)) blur(${(1 - p) * 7}px)`,
    };
  }
  const p = land(142, 184);
  return {
    opacity: p,
    transform: `translate(-50%, -50%) scale(${2.35 - p * 1.35})`,
    clipPath: `circle(${p * 74}% at 50% 50%)`,
    filter: `drop-shadow(0 30px 24px rgba(0,0,0,.5)) blur(${(1 - p) * 12}px)`,
  };
};

export const ProductTemplateBatch19: React.FC<ProductVideoProps> = (props) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const isVertical = height / width > 1.55;
  const motion = productMotion(props.templateId, frame);
  const copyOpacity = ease(frame, [186, 210], [0, 1]);
  const landing = {
    "porcelain-blossom": {width: 27, top: 53},
    "optical-mesh": {width: 29, top: 53},
    "mirror-dune": {width: 34, top: 55},
    "water-glacier": {width: 31, top: 53},
    "amber-forest": {width: 29, top: 53},
    "glass-vortex": {width: 30, top: 52},
    "cloud-portal": {width: 30, top: 53},
    "opal-tunnel": {width: 28, top: 53},
  }[props.templateId as (typeof ids)[number]];
  const productWidth = landing.width + (isVertical ? 8 : 0);
  const upperCopy = ["mirror-dune", "water-glacier", "amber-forest"].includes(props.templateId);
  const cameraZ = isVertical ? 10.3 : 8.6;

  if (!ids.includes(props.templateId as (typeof ids)[number])) return null;

  return (
    <AbsoluteFill style={{background: "#0b0d0e", overflow: "hidden", color: "#f4f1ea", fontFamily: 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'}}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        gl={{antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping}}
        camera={{position: [0, 0.1, cameraZ], fov: isVertical ? 43 : 48}}
      >
        <CameraDirector id={props.templateId} frame={frame} vertical={isVertical} />
        <Environment files={staticFile("advanced-studio2-assets/polyhaven/studio_small_08-environment-de3ba64222895aca876b1d1c2e0cf81a.hdr")} environmentIntensity={0.78} />
        <ambientLight intensity={0.52} />
        <directionalLight position={[-4, 7, 5]} intensity={3.2} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[5, 2, 1]} intensity={1.2} color="#d2c4b0" />
        <World id={props.templateId} frame={frame} />
      </ThreeCanvas>

      <div style={{position: "absolute", left: "50%", top: `${landing.top}%`, width: `${productWidth}%`, height: isVertical ? "43%" : "48%", ...motion, display: "grid", placeItems: "end center"}}>
        <div style={{position: "absolute", width: "66%", height: "7%", bottom: "-1%", borderRadius: "50%", background: "rgba(0,0,0,.32)", filter: "blur(10px)", transform: "scaleX(1.15)"}} />
        {props.imageSrc ? <Img src={props.imageSrc} style={{maxWidth: "100%", maxHeight: "100%", objectFit: "contain", objectPosition: "center bottom", position: "relative"}} /> : <PreviewProduct name={props.productName} />}
      </div>

      <div style={{position: "absolute", left: isVertical ? "8%" : "7%", right: isVertical ? "8%" : "7%", ...(upperCopy ? {top: isVertical ? "7%" : "6%"} : {bottom: isVertical ? "6.5%" : "6%"}), opacity: copyOpacity, display: "flex", alignItems: "end", justifyContent: "space-between", gap: 28, textShadow: "0 2px 18px rgba(0,0,0,.65)"}}>
        <div>
          <div style={{fontSize: isVertical ? 21 : 18, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.74}}>{props.eyebrow || "FORM / MATERIAL / PRESENCE"}</div>
          <div style={{fontSize: isVertical ? 58 : 52, fontWeight: 650, lineHeight: 0.96, marginTop: 12, letterSpacing: "-0.045em"}}>{props.headline || props.productName}</div>
        </div>
        <div style={{fontSize: 17, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.8}}>{props.cta || "Discover"}</div>
      </div>
    </AbsoluteFill>
  );
};
