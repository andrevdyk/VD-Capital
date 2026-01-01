/* eslint-disable react/no-unknown-property */
'use client';
import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer, Html } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  RigidBodyProps
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import NavBar from '@/components/wrapper/navbar';
import { loginWithGoogle, loginWithApple, login } from './actions'


// Use public assets paths
const cardGLB = "/assets/card.glb";
const cardGLBdark = "/assets/card_dark.glb";
const lanyardTexture = "/assets/lanyard.png";

extend({ MeshLineGeometry, MeshLineMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any;
      meshLineMaterial: any;
    }
  }
}

interface LanyardLoginProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  bandPosition?: [number, number, number];
}

export default function LanyardLogin({
  position = [0, 0, 15],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  bandPosition = [0, 5, 0]
}: LanyardLoginProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

        return (
        <div className="w-full h-screen relative overflow-hidden">
          <NavBar />
          {/* Background Image */}
          ${
          isDark ?
          <Image
            src="/assets/background.png"
            alt="Trading Terminal Dashboard Preview"
            fill
            priority
            className="object-cover object-center mt-12"
          /> : 
          <Image
            src="/assets/background_light.png"
            alt="Trading Terminal Dashboard Preview"
            fill
            priority
            className="object-cover object-center mt-12"
          />
          }

          {/* Overlay Layer */}
          <div
            className={`absolute inset-0 ${
              isDark
                ? 'bg-black/70 backdrop-blur-md' // darker, slightly blurred for dark mode
                : 'bg-white/60 backdrop-blur-md' // lighter overlay for light mode
            }`}
          />

          {/* 3D Canvas */}
          <Canvas
            camera={{ position, fov }}
            gl={{ alpha: transparent }}
            onCreated={({ gl }) =>
              gl.setClearColor(new THREE.Color(isDark ? 0x111827 : 0xf9fafb), transparent ? 0 : 1)
            }
          >


        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={1 / 60}>
          <Band isDark={isDark} bandPosition={bandPosition} />
        </Physics>
        <Environment blur={0.9}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  isDark: boolean;
  bandPosition?: [number, number, number];
}

function Band({ maxSpeed = 50, minSpeed = 0, isDark, bandPosition = [0, 25, 0] }: BandProps) {
  const band = useRef<any>(null);
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps: any = {
    type: 'dynamic' as RigidBodyProps['type'],
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4
  };

  const gltf = useGLTF(isDark ? cardGLBdark : cardGLB) as any;
  const { nodes, materials } = gltf;
  const texture = useTexture(lanyardTexture);
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3()
      ])
  );
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);
  const [lastSignedInMethod, setLastSignedInMethod] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isSmall, setIsSmall] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = (): void => {
      setIsSmall(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return (): void => window.removeEventListener('resize', handleResize);
  }, []);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 0.83, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => {
        document.body.style.cursor = 'auto';
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== 'boolean') {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z
      });
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation()))
        );
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  const handleGoogleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLastSignedInMethod('google');
    console.log('Google sign in');
  };

  const handleAppleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLastSignedInMethod('apple');
    console.log('Apple sign in');
  };

  const handleEmailSignIn = async () => {
    setLastSignedInMethod('email');
    console.log('Email sign in', { email, password });
  };

  return (
    <>
      <group position={bandPosition}>
        <RigidBody ref={fixed} {...segmentProps} type={'fixed' as RigidBodyProps['type']} />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[1, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? ('kinematicPosition' as RigidBodyProps['type']) : ('dynamic' as RigidBodyProps['type'])}
        >
          <CuboidCollider args={[1, 1, 0.001]} />
          <group
            scale={2.2}
            position={[0, -1.8, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: any) => {
              e.target.releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e: any) => {
              e.target.setPointerCapture(e.pointerId);
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={materials.base.map}
                map-anisotropy={16}
                clearcoat={1}
                clearcoatRoughness={0}
                roughness={0.5}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
            
            <Html
              transform
              distanceFactor={1}
              position={[0, 0.24, 0]}
              style={{
                transition: 'none',
                userSelect: 'none'
              }}
            >
              <div
                className={`rounded-lg shadow-2xl border-4 overflow-hidden ${
                  isDark ? 'bg-black bg-opacity-90 border-black' : 'bg-zinc-50 bg-opacity-95 border-white'
                }`}
                style={{ 
                  width: '280px',
                  backdropFilter: 'blur(10px)'
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`py-1 px-4 ${isDark ? 'bg-black' : 'bg-white'}`}>
                  <div className="text-center relative">
                    <div className="relative w-48 h-8 mx-auto">
                      {isDark ? (
                        <Image
                          src="/assets/Design 1 (1).png"
                          alt="Dark Logo"
                          fill
                          priority
                          className="object-contain object-top"
                        />
                      ) : (
                        <Image
                          src="/assets/Design 1.png"
                          alt="Trading Terminal Dashboard Preview"
                          fill
                          priority
                          className="object-contain object-top"
                        />
                      )}
                    </div>

                    <p className="text-xs font-medium mt-2">AUTHORIZED ACCESS</p>
                  </div>
                </div>


                <div className="p-5">
                  <div className="mb-4 text-center">
                    <div className={`text-xs font-semibold tracking-widest mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                      AUTHENTICATION
                    </div>
                    <div className={`h-px w-full ${isDark ? 'bg-white' : 'bg-black'} mb-3`} />
                  </div>

                  <div className="space-y-2 mb-3">
                    <form action={loginWithGoogle}>
                      <Button
                        type="submit"
                        variant="outline"
                        className={`relative w-full flex items-center gap-2 h-9 text-xs font-semibold ${
                          isDark
                            ? 'border-black bg-black hover:border-white hover:bg-black text-white hover:text-white'
                            : 'border-white bg-white hover:border-white hover:bg-black text-black hover:text-white'
                        }`}
                      >
                        <GoogleIcon />
                        <span className="flex-1 text-left">Google</span>
                      </Button>
                    </form>


                    <form action={loginWithApple}>
                      <Button
                        type="submit"
                        variant="outline"
                        className={`relative w-full flex items-center gap-2 h-9 text-xs font-semibold ${
                          isDark
                            ? 'border-black bg-black hover:border-white hover:bg-black text-white hover:text-white'
                            : 'border-white bg-white hover:border-white hover:bg-black text-black hover:text-white'
                        }`}
                      >
                        <AppleIcon isDark={isDark} />
                        <span className="flex-1 text-left">Apple</span>
                      </Button>
                    </form>
                  </div>

                  <div className="mb-4 text-center">
                    <div className={`text-xs font-semibold tracking-widest mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                      CREDENTIALS
                    </div>
                    <div className={`h-px w-full ${isDark ? 'bg-white' : 'bg-black'} mb-3`} />
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label 
                        htmlFor="email"
                        className={`text-xs font-bold tracking-wide ${isDark ? 'text-white' : 'text-black'}`}
                      >
                        ID / EMAIL
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="user@vdcapital.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={`h-9 text-xs font-mono ${
                          isDark
                            ? 'bg-black border-black text-white placeholder-zinc-200 focus:border-black'
                            : 'bg-white border-white text-black placeholder-zinc-800 focus:border-white'
                        }`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label 
                        htmlFor="password"
                        className={`text-xs font-bold tracking-wide ${isDark ? 'text-white' : 'text-black'}`}
                      >
                        PIN / PASSWORD
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={`h-9 text-xs font-mono ${
                          isDark
                            ? 'bg-black border-black text-white placeholder-zinc-200 focus:border-black'
                            : 'bg-white border-white text-black placeholder-zinc-800 focus:border-white'
                        }`}
                      />
                    </div>
                    <form action={login}>
                      <input type="hidden" name="email" value={email} />
                      <input type="hidden" name="password" value={password} />
                      <Button
                        type="submit"
                        className={`relative w-full h-10 font-bold shadow-lg text-xs tracking-widest mt-3 ${
                          isDark 
                            ? 'bg-black text-white hover:bg-white hover:text-black border border-white'
                            : 'bg-white text-black hover:bg-black hover:text-white border border-black'
                        }`}
                      >
                        GRANT ACCESS
                      </Button>
                    </form>

                  </div>

                  <div className={`text-center text-xs mt-4 pt-3 border-t ${isDark ? 'border-slate-700 text-slate-500' : 'border-zinc-200 text-zinc-800'}`}>
                    <div className="font-mono text-xs mb-1">SEC-ID: VDC-2025-AUTH</div>
                    <div className="text-xs">
                      <a href="#" className={`font-semibold ${isDark ? 'text-zinc-500' : 'text-zinc-500 hover:text-black'}`}>
                        Request Access
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Html>
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isSmall ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon({ isDark }: { isDark: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={isDark ? '#fff' : '#000'}>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

useGLTF.preload(cardGLB);
useGLTF.preload(cardGLBdark);
useTexture.preload(lanyardTexture);