import { vi } from 'vitest'

// Mock Wails runtime
vi.mock('../../wailsjs/runtime/runtime', () => ({
  EventsOn: vi.fn(),
  EventsOff: vi.fn(),
  EventsEmit: vi.fn(),
  WindowShow: vi.fn(),
  WindowHide: vi.fn(),
  WindowSetPosition: vi.fn(),
  WindowSetSize: vi.fn(),
  Quit: vi.fn(),
}))

// Mock Wails Go bindings
vi.mock('../../wailsjs/go/main/App', () => ({
  ExecuteAction: vi.fn().mockResolvedValue(undefined),
  ExecuteActionWithPath: vi.fn().mockResolvedValue(undefined),
  OpenFolderDialog: vi.fn().mockResolvedValue(''),
  HidePanel: vi.fn().mockResolvedValue(undefined),
  GetAutoStartEnabled: vi.fn().mockResolvedValue(false),
  SetAutoStart: vi.fn().mockResolvedValue(undefined),
  GetConfig: vi.fn().mockResolvedValue({
    theme: 'dark',
    hotkey: 'ctrl+space',
    startWithWindows: false,
    animation: true,
    blur: true,
    recentFoldersLimit: 5,
  }),
  SaveConfig: vi.fn().mockResolvedValue(undefined),
  UpdateConfig: vi.fn().mockResolvedValue(undefined),
}))

// Mock matchMedia for theme detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
