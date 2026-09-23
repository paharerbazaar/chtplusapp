import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal, View, Text, StyleSheet, Pressable, PanResponder, useWindowDimensions,
  type GestureResponderEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Common';
import { colors, spacing } from '@/constants/theme';

// The area the user framed, as 0–1 fractions of the full image. Sent as
// cropX/cropY/cropWidth/cropHeight; the server does the actual cut.
export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

function distance(e: GestureResponderEvent) {
  const [a, b] = e.nativeEvent.touches;
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
}

// Full-screen editor shown after a profile/cover photo is picked: drag to
// move, pinch (or the +/− buttons) to zoom, "Update" to save. The image
// always covers the frame, so the saved photo never has empty edges.
export function PhotoCropModal({
  image,
  aspect,
  round = false,
  title,
  saving = false,
  onCancel,
  onConfirm,
}: {
  image: { uri: string; width: number; height: number } | null;
  aspect: number; // frame width / height
  round?: boolean;
  title: string;
  saving?: boolean;
  onCancel: () => void;
  onConfirm: (crop: CropRect) => void;
}) {
  const { width: screenW } = useWindowDimensions();
  const frameW = Math.min(screenW - spacing.lg * 2, 480);
  const frameH = frameW / aspect;

  const imgW = image?.width || 1;
  const imgH = image?.height || 1;
  const baseScale = Math.max(frameW / imgW, frameH / imgH);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // image centre relative to frame centre

  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [image?.uri]);

  const clampOffset = (o: { x: number; y: number }, z: number) => {
    const maxX = (imgW * baseScale * z - frameW) / 2;
    const maxY = (imgH * baseScale * z - frameH) / 2;
    return { x: Math.max(-maxX, Math.min(maxX, o.x)), y: Math.max(-maxY, Math.min(maxY, o.y)) };
  };

  const applyZoom = (z: number, from = offset) => {
    const next = Math.max(1, Math.min(MAX_ZOOM, z));
    setZoom(next);
    setOffset(clampOffset(from, next));
  };

  // Gesture state lives in a ref because PanResponder's callbacks are created once.
  const live = useRef({ zoom, offset, clampOffset, applyZoom });
  live.current = { zoom, offset, clampOffset, applyZoom };
  const gesture = useRef({ startOffset: { x: 0, y: 0 }, startZoom: 1, startDist: 0, pinching: false });

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          const g = gesture.current;
          g.startOffset = live.current.offset;
          g.startZoom = live.current.zoom;
          g.pinching = false;
        },
        onPanResponderMove: (e, s) => {
          const g = gesture.current;
          if (e.nativeEvent.touches.length >= 2) {
            if (!g.pinching) {
              g.pinching = true;
              g.startDist = distance(e);
              g.startZoom = live.current.zoom;
            }
            live.current.applyZoom((g.startZoom * distance(e)) / g.startDist, live.current.offset);
            return;
          }
          if (g.pinching) {
            // Lifted one finger: continue as a drag from where the pinch left off.
            g.pinching = false;
            g.startOffset = { x: live.current.offset.x - s.dx, y: live.current.offset.y - s.dy };
          }
          const next = live.current.clampOffset({ x: g.startOffset.x + s.dx, y: g.startOffset.y + s.dy }, live.current.zoom);
          setOffset(next);
        },
      }),
    []
  );

  const dispW = imgW * baseScale * zoom;
  const dispH = imgH * baseScale * zoom;
  const left = frameW / 2 + offset.x - dispW / 2;
  const top = frameH / 2 + offset.y - dispH / 2;

  const confirm = () => {
    onConfirm({
      x: Math.max(0, -left / dispW),
      y: Math.max(0, -top / dispH),
      width: Math.min(1, frameW / dispW),
      height: Math.min(1, frameH / dispH),
    });
  };

  // A thick translucent ring inside the square frame dims its corners, leaving a clear circle.
  const ring = Math.max(frameW, frameH);

  return (
    <Modal visible={!!image} animationType="slide" onRequestClose={saving ? undefined : onCancel}>
      <SafeAreaView style={styles.root}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.hint}>Drag to move · pinch or use + / − to zoom</Text>

        <View style={styles.stage}>
          <View style={[styles.frame, { width: frameW, height: frameH }]} {...responder.panHandlers}>
            {image && (
              <Image
                source={{ uri: image.uri }}
                style={{ position: 'absolute', left, top, width: dispW, height: dispH }}
                contentFit="fill"
              />
            )}
            {round ? (
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: -ring / 2,
                  top: (frameH - frameW - ring) / 2,
                  width: frameW + ring,
                  height: frameH + ring,
                  borderRadius: (frameW + ring) / 2,
                  borderWidth: ring / 2,
                  borderColor: 'rgba(0,0,0,0.55)',
                }}
              />
            ) : null}
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.frameBorder, round && { borderRadius: frameW / 2 }]} />
          </View>
        </View>

        <View style={styles.zoomRow}>
          <Pressable style={styles.zoomBtn} onPress={() => applyZoom(zoom - ZOOM_STEP)} disabled={zoom <= 1} hitSlop={8}>
            <Ionicons name="remove" size={22} color={zoom <= 1 ? '#666' : '#fff'} />
          </Pressable>
          <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
          <Pressable style={styles.zoomBtn} onPress={() => applyZoom(zoom + ZOOM_STEP)} disabled={zoom >= MAX_ZOOM} hitSlop={8}>
            <Ionicons name="add" size={22} color={zoom >= MAX_ZOOM ? '#666' : '#fff'} />
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Button title="Cancel" variant="outline" onPress={onCancel} disabled={saving} style={styles.actionBtn} />
          <Button title="Update" onPress={confirm} loading={saving} style={styles.actionBtn} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#111', paddingHorizontal: spacing.lg },
  title: { color: '#fff', fontSize: 17, fontWeight: '700', textAlign: 'center', marginTop: spacing.lg },
  hint: { color: '#aaa', fontSize: 12.5, textAlign: 'center', marginTop: 4 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: { overflow: 'hidden', backgroundColor: '#000' },
  frameBorder: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)' },
  zoomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg, marginBottom: spacing.lg },
  zoomBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' },
  zoomText: { color: '#fff', fontSize: 14, minWidth: 48, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  actionBtn: { flex: 1 },
});
