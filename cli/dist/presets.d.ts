import type { Preset, PresetName } from "./types.js";
export declare const PRESETS: Record<PresetName, Preset>;
export declare function getPreset(name: string): Preset | undefined;
