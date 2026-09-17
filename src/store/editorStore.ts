import { create } from 'zustand';
import { GameMode, SpeedMultiplier } from '../types/game.ts';
import { LevelData, LevelObjectType } from '../types/level.ts';
import { EditorTool } from '../editor/EditorEngine.ts';

interface EditorStoreState {
  activeTool: EditorTool;
  selectedCategory: LevelObjectType;
  selectedSubtype: string | undefined;
  snapGrid: boolean;
  zoom: number;
  levelData: LevelData;
  isPlayingTest: boolean;

  setActiveTool: (tool: EditorTool) => void;
  setSelectedCategory: (category: LevelObjectType) => void;
  setSelectedSubtype: (subtype: string | undefined) => void;
  setSnapGrid: (snap: boolean) => void;
  setZoom: (zoom: number) => void;
  setLevelData: (data: LevelData) => void;
  setIsPlayingTest: (playing: boolean) => void;
}

const defaultLevelData: LevelData = {
  version: 1,
  settings: {
    initialSpeed: SpeedMultiplier.SPEED_1X,
    initialMode: GameMode.CUBE,
    initialGravity: 1,
    bpm: 140,
    songTitle: 'Neon Overdrive',
  },
  objects: [
    { id: 'init_1', type: LevelObjectType.SPIKE, x: 500, y: 450, rotation: 0, scale: 1 },
    { id: 'init_2', type: LevelObjectType.SPIKE, x: 530, y: 450, rotation: 0, scale: 1 },
    { id: 'init_3', type: LevelObjectType.BLOCK, x: 720, y: 450, rotation: 0, scale: 1 },
    { id: 'init_4', type: LevelObjectType.PAD, subtype: 'YELLOW', x: 720, y: 420, rotation: 0, scale: 1 },
    { id: 'init_5', type: LevelObjectType.SPIKE, x: 960, y: 450, rotation: 0, scale: 1 },
    { id: 'init_6', type: LevelObjectType.ORB, subtype: 'YELLOW', x: 1100, y: 390, rotation: 0, scale: 1 },
    { id: 'init_7', type: LevelObjectType.SPIKE, x: 1100, y: 450, rotation: 0, scale: 1 },
    { id: 'init_8', type: LevelObjectType.PORTAL, subtype: 'GAMEMODE_SHIP', x: 1350, y: 330, rotation: 0, scale: 1 },
  ],
};

export const useEditorStore = create<EditorStoreState>((set) => ({
  activeTool: 'PLACE',
  selectedCategory: LevelObjectType.SPIKE,
  selectedSubtype: undefined,
  snapGrid: true,
  zoom: 1.0,
  levelData: defaultLevelData,
  isPlayingTest: false,

  setActiveTool: (activeTool) => set({ activeTool }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory, selectedSubtype: undefined }),
  setSelectedSubtype: (selectedSubtype) => set({ selectedSubtype }),
  setSnapGrid: (snapGrid) => set({ snapGrid }),
  setZoom: (zoom) => set({ zoom }),
  setLevelData: (levelData) => set({ levelData }),
  setIsPlayingTest: (isPlayingTest) => set({ isPlayingTest }),
}));
