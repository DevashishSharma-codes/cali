'use client';

import { useParams } from 'next/navigation';
import { Canvas } from '../../../components/Canvas';

export default function CanvasRoomPage() {
  const params = useParams();
  const roomId = params?.roomId as string;

  return (
    <main style={{ margin: 0, padding: 0, width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <Canvas roomId={roomId} />
    </main>
  );
}
