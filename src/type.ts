export interface Prefs {
  airpodsIndex: number | string; // Can be auto-detected or manually set
  soundLoc: string;
  ccLoc: string;
  optionOne?: string; // Optional, will use defaults based on AirPods type
  optionTwo?: string; // Optional, will use defaults based on AirPods type
  showHudNC: boolean;
  showHudCA: boolean;
  airpodsType?: string; // Optional, will be auto-detected
}
