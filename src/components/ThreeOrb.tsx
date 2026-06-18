"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeOrb() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Orb creation
    // We create an Icosahedron to look like a modern low-poly orb or a highly tessellated orb
    const geometry = new THREE.IcosahedronGeometry(2, 4); // radius 2, detail 4

    // Wireframe material for the high-tech look
    const material = new THREE.MeshBasicMaterial({
      color: 0xbc0100,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });

    const orb = new THREE.Mesh(geometry, material);
    scene.add(orb);

    // Add some inner core or secondary layers
    const coreGeometry = new THREE.IcosahedronGeometry(1.5, 2);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xaa3000,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    camera.position.z = 5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate the orb
      orb.rotation.x += 0.001;
      orb.rotation.y += 0.002;

      core.rotation.x -= 0.002;
      core.rotation.y += 0.001;

      // Slight floating effect
      orb.position.y = Math.sin(Date.now() * 0.001) * 0.2;
      core.position.y = Math.sin(Date.now() * 0.001) * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none flex items-center justify-center opacity-70"
    />
  );
}
