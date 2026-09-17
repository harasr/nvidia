import React, { useEffect, useRef, useState } from 'react';
import { EditorEngine, EditorTool } from '../../editor/EditorEngine.ts';
import { GameMode, SpeedMultiplier } from '../../types/game.ts';
import { DifficultyLevel, LevelData, LevelMeta, LevelObjectType } from '../../types/level.ts';
import { useEditorStore } from '../../store/editorStore.ts';
import { useUIStore } from '../../store/uiStore.ts';
import {
  MousePointer,
  Plus,
  Move,
  Trash2,
  Hand,
  RotateCw,
  Copy,
  Undo2,
  Redo2,
  Grid,
  Play,
  Share2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { GameView } from '../game/GameView.tsx';

interface EditorViewProps {
  onPublishClick: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({ onPublishClick }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const editorEngineRef = useRef<EditorEngine | null>(null);

  const {
    activeTool,
    setActiveTool,
    selectedCategory,
    setSelectedCategory,
    selectedSubtype,
    setSelectedSubtype,
    snapGrid,
    setSnapGrid,
    levelData,
    setLevelData,
    isPlayingTest,
    setIsPlayingTest,
  } = useEditorStore();

  const { showNotification } = useUIStore();
  const [, setUpdateTrigger] = useState<number>(0);

  // Initialize Editor Engine on canvas
  useEffect(() => {
    if (isPlayingTest) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.parentElement?.clientWidth || 960;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    const engine = new EditorEngine(canvas, () => {
      setUpdateTrigger((prev) => prev + 1);
    });

    engine.setObjects(levelData.objects || []);
    engine.tool = activeTool;
    engine.activeObjectType = selectedCategory;
    engine.activeSubtype = selectedSubtype;
    engine.snapEnabled = snapGrid;

    editorEngineRef.current = engine;

    return () => {
      if (editorEngineRef.current) {
        // Save objects back to store on cleanup
        const objs = editorEngineRef.current.getObjects();
        setLevelData({
          ...levelData,
          objects: objs,
        });
        editorEngineRef.current.detach();
        editorEngineRef.current = null;
      }
    };
  }, [isPlayingTest]);

  // Synchronize tools & palette with engine
  useEffect(() => {
    if (!editorEngineRef.current) return;
    editorEngineRef.current.tool = activeTool;
    editorEngineRef.current.activeObjectType = selectedCategory;
    editorEngineRef.current.activeSubtype = selectedSubtype;
    editorEngineRef.current.snapEnabled = snapGrid;
  }, [activeTool, selectedCategory, selectedSubtype, snapGrid]);

  const handleToolChange = (tool: EditorTool) => {
    setActiveTool(tool);
    if (editorEngineRef.current) {
      editorEngineRef.current.tool = tool;
    }
  };

  const handleCategorySelect = (category: LevelObjectType, subtype?: string) => {
    setSelectedCategory(category);
    setSelectedSubtype(subtype);
    setActiveTool('PLACE');
    if (editorEngineRef.current) {
      editorEngineRef.current.tool = 'PLACE';
      editorEngineRef.current.activeObjectType = category;
      editorEngineRef.current.activeSubtype = subtype;
    }
  };

  const handleRotate = () => {
    editorEngineRef.current?.rotateSelected();
  };

  const handleDuplicate = () => {
    editorEngineRef.current?.duplicateSelected();
  };

  const handleDelete = () => {
    editorEngineRef.current?.deleteSelected();
  };

  const handleUndo = () => {
    editorEngineRef.current?.undo();
  };

  const handleRedo = () => {
    editorEngineRef.current?.redo();
  };

  const handleToggleSnap = () => {
    const next = !snapGrid;
    setSnapGrid(next);
    if (editorEngineRef.current) {
      editorEngineRef.current.snapEnabled = next;
    }
    showNotification(next ? 'Grid Snapping Enabled (30px)' : 'Free Placement Mode', 'info');
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all objects from level?')) {
      if (editorEngineRef.current) {
        editorEngineRef.current.setObjects([]);
        setLevelData({ ...levelData, objects: [] });
      }
    }
  };

  const handleStartPlaytest = () => {
    if (editorEngineRef.current) {
      const currentObjs = editorEngineRef.current.getObjects();
      setLevelData({
        ...levelData,
        objects: currentObjs,
      });
    }
    setIsPlayingTest(true);
  };

  // Convert current edited level to LevelMeta for testing
  const playtestLevelMeta: LevelMeta = {
    id: 'lvl_test_draft',
    title: 'Playtest: Custom Level',
    description: 'Level Editor Playtest Run',
    creatorId: 'local_tester',
    creatorName: 'You',
    difficulty: DifficultyLevel.MEDIUM,
    starsReward: 5,
    songTitle: levelData.settings.songTitle || 'Custom Beat',
    bpm: levelData.settings.bpm || 140,
    plays: 0,
    likes: 0,
    isVerified: false,
    levelData: levelData,
    createdAt: new Date().toISOString(),
  };

  if (isPlayingTest) {
    return (
      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-5xl px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-t-xl flex items-center justify-between text-xs text-amber-300 font-semibold mb-[-8px] z-10">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            PLAYTESTING MODE — Complete 100% to verify your level for community publishing!
          </span>
          <button
            id="btn-stop-playtest"
            onClick={() => setIsPlayingTest(false)}
            className="px-2.5 py-1 rounded bg-amber-400 text-black font-bold hover:brightness-110"
          >
            Exit Playtest
          </button>
        </div>
        <GameView level={playtestLevelMeta} onExit={() => setIsPlayingTest(false)} />
      </div>
    );
  }

  return (
    <div id="editor-workspace" className="w-full max-w-5xl mx-auto flex flex-col gap-2 select-none py-2 px-2">
      {/* Top Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#121424] rounded-xl border border-white/10 text-xs">
        {/* Tool Selectors */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
          <button
            id="tool-place"
            onClick={() => handleToolChange('PLACE')}
            className={`p-1.5 rounded flex items-center gap-1 ${
              activeTool === 'PLACE' ? 'bg-[#00F0FF] text-black font-bold' : 'text-slate-300 hover:text-white'
            }`}
            title="Place Object"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Place</span>
          </button>

          <button
            id="tool-select"
            onClick={() => handleToolChange('SELECT')}
            className={`p-1.5 rounded flex items-center gap-1 ${
              activeTool === 'SELECT' ? 'bg-[#00F0FF] text-black font-bold' : 'text-slate-300 hover:text-white'
            }`}
            title="Select & Drag"
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Select</span>
          </button>

          <button
            id="tool-pan"
            onClick={() => handleToolChange('PAN')}
            className={`p-1.5 rounded flex items-center gap-1 ${
              activeTool === 'PAN' ? 'bg-[#00F0FF] text-black font-bold' : 'text-slate-300 hover:text-white'
            }`}
            title="Pan Camera (Right Click + Drag)"
          >
            <Hand className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pan</span>
          </button>

          <button
            id="tool-delete"
            onClick={() => handleToolChange('DELETE')}
            className={`p-1.5 rounded flex items-center gap-1 ${
              activeTool === 'DELETE' ? 'bg-rose-500 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
            title="Eraser Tool"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Erase</span>
          </button>
        </div>

        {/* Object Operations */}
        <div className="flex items-center gap-1">
          <button
            id="btn-rotate-obj"
            onClick={handleRotate}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center gap-1"
            title="Rotate 90°"
          >
            <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Rotate</span>
          </button>

          <button
            id="btn-duplicate-obj"
            onClick={handleDuplicate}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center gap-1"
            title="Duplicate Object"
          >
            <Copy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden md:inline">Clone</span>
          </button>

          <button
            id="btn-del-selected"
            onClick={handleDelete}
            className="p-1.5 rounded bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-white/10"
            title="Delete Selected"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          <button
            id="btn-undo"
            onClick={handleUndo}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-redo"
            onClick={handleRedo}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-toggle-snap"
            onClick={handleToggleSnap}
            className={`p-1.5 rounded border flex items-center gap-1 ${
              snapGrid ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 text-slate-400 border-white/10'
            }`}
            title="Snap to Grid (30px)"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Snap</span>
          </button>
        </div>

        {/* Playtest & Publish */}
        <div className="flex items-center gap-2">
          <button
            id="btn-playtest"
            onClick={handleStartPlaytest}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold tracking-wide flex items-center gap-1.5 shadow-md shadow-emerald-500/25 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            PLAYTEST
          </button>

          <button
            id="btn-publish-level-modal"
            onClick={onPublishClick}
            className="px-3 py-1.5 rounded-lg bg-[#FFE600] hover:bg-amber-400 text-black font-bold tracking-wide flex items-center gap-1.5 shadow-md shadow-yellow-500/25 active:scale-95 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            PUBLISH
          </button>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="relative w-full bg-[#0D0E15] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
        <canvas ref={canvasRef} id="editor-canvas" className="w-full h-auto block" />
      </div>

      {/* Object Palette Selector */}
      <div className="p-3 bg-[#121424] rounded-xl border border-white/10 flex flex-col gap-2">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Object Palette</span>
          <span className="text-slate-500">Left click on grid to place. Right-click / Middle-drag to Pan.</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2">
          {/* Spikes */}
          <button
            id="palette-spike"
            onClick={() => handleCategorySelect(LevelObjectType.SPIKE)}
            className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
              selectedCategory === LevelObjectType.SPIKE
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="w-5 h-5 border-b-2 border-r-2 border-l-2 border-rose-500 clip-triangle" />
            <span className="text-[10px] font-bold">Spike</span>
          </button>

          {/* Block */}
          <button
            id="palette-block"
            onClick={() => handleCategorySelect(LevelObjectType.BLOCK)}
            className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
              selectedCategory === LevelObjectType.BLOCK
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="w-5 h-5 bg-[#171B2F] border border-cyan-400" />
            <span className="text-[10px] font-bold">Solid Block</span>
          </button>

          {/* Yellow Pad */}
          <button
            id="palette-pad-yellow"
            onClick={() => handleCategorySelect(LevelObjectType.PAD, 'YELLOW')}
            className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
              selectedCategory === LevelObjectType.PAD && selectedSubtype === 'YELLOW'
                ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="w-6 h-2 bg-[#FFE600] rounded-t-sm" />
            <span className="text-[10px] font-bold">Yellow Pad</span>
          </button>

          {/* Pink Pad */}
          <button
            id="palette-pad-pink"
            onClick={() => handleCategorySelect(LevelObjectType.PAD, 'PINK')}
            className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
              selectedCategory === LevelObjectType.PAD && selectedSubtype === 'PINK'
                ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="w-6 h-2 bg-[#FF4694] rounded-t-sm" />
            <span className="text-[10px] font-bold">Pink Pad</span>
          </button>

          {/* Yellow Orb */}
          <button
            id="palette-orb-yellow"
            onClick={() => handleCategorySelect(LevelObjectType.ORB, 'YELLOW')}
            className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
              selectedCategory === LevelObjectType.ORB && selectedSubtype === 'YELLOW'
                ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="w-4 h-4 rounded-full border-2 border-[#FFE600] bg-yellow-400/50" />
            <span className="text-[10px] font-bold">Yellow Orb</span>
          </button>

          {/* Gravity Orb */}
          <button
            id="palette-orb-gravity"
            onClick={() => handleCategorySelect(LevelObjectType.ORB, 'GRAVITY')}
            className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
              selectedCategory === LevelObjectType.ORB && selectedSubtype === 'GRAVITY'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="w-4 h-4 rounded-full border-2 border-[#00F0FF] bg-cyan-400/50" />
            <span className="text-[10px] font-bold">Gravity Orb</span>
          </button>

          {/* Ship Portal */}
          <button
            id="palette-portal-ship"
            onClick={() => handleCategorySelect(LevelObjectType.PORTAL, 'GAMEMODE_SHIP')}
            className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
              selectedCategory === LevelObjectType.PORTAL && selectedSubtype === 'GAMEMODE_SHIP'
                ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="w-2.5 h-5 rounded-full border-2 border-[#FF007F]" />
            <span className="text-[10px] font-bold">Ship Portal</span>
          </button>

          {/* Ball Portal */}
          <button
            id="palette-portal-ball"
            onClick={() => handleCategorySelect(LevelObjectType.PORTAL, 'GAMEMODE_BALL')}
            className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
              selectedCategory === LevelObjectType.PORTAL && selectedSubtype === 'GAMEMODE_BALL'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="w-2.5 h-5 rounded-full border-2 border-amber-400" />
            <span className="text-[10px] font-bold">Ball Portal</span>
          </button>

          {/* Wave Portal */}
          <button
            id="palette-portal-wave"
            onClick={() => handleCategorySelect(LevelObjectType.PORTAL, 'GAMEMODE_WAVE')}
            className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
              selectedCategory === LevelObjectType.PORTAL && selectedSubtype === 'GAMEMODE_WAVE'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="w-2.5 h-5 rounded-full border-2 border-[#00F0FF]" />
            <span className="text-[10px] font-bold">Wave Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
