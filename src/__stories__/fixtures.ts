import { Bell, Calendar, Home, Inbox, Settings, Users } from 'lucide-react';
import type { Turn } from '../chat/types.js';
import type {
  ShellModuleDefinition,
  ShellNavItem,
  ShellPanelDefinition,
  ShellRailItem,
  ShellTab,
} from '../shell/types.js';
import type { ScrubMark, TimelineEvent } from '../timeline/types.js';

// Frozen instant used everywhere — keeps Chromatic snapshots stable.
export const NOW_MS = new Date('2026-04-26T15:24:09Z').getTime();

export const SAMPLE_TURNS: Turn[] = [
  {
    id: 't1',
    speaker: 'user',
    text: 'What time is my next call?',
    startedAt: NOW_MS - 60_000,
  },
  {
    id: 't2',
    speaker: 'assistant',
    speakerLabel: 'Morpheus',
    modelLabel: 'claude-opus-4-7',
    text: 'Your next call is at 16:00 with the design team.',
    startedAt: NOW_MS - 50_000,
    latency: { sttMs: 240, claudeMs: 1400, ttsMs: 380 },
  },
  {
    id: 't3',
    speaker: 'user',
    text: 'Cancel it.',
    startedAt: NOW_MS - 20_000,
    spokenSeconds: 0.7,
  },
  {
    id: 't4',
    speaker: 'assistant',
    speakerLabel: 'Morpheus',
    text: 'Cancelled. I let the team know.',
    startedAt: NOW_MS - 10_000,
    latency: { sttMs: 210, claudeMs: 1100, ttsMs: 320 },
    toolCalls: [
      {
        id: 'tc1',
        name: 'cancel_event',
        args: { eventId: 'evt_42' },
        resultSummary: 'cancelled',
        latencyMs: 92,
      },
    ],
  },
];

export const SAMPLE_EVENTS: TimelineEvent[] = [
  {
    id: 'e1',
    startedAt: NOW_MS - 3 * 60 * 60 * 1000,
    endedAt: NOW_MS - 2.5 * 60 * 60 * 1000,
    kind: 'session',
    primary: 'Onboarding',
    secondary: '12 turns · $0.18',
  },
  {
    id: 'e2',
    startedAt: NOW_MS - 90 * 60 * 1000,
    endedAt: NOW_MS - 80 * 60 * 1000,
    kind: 'session',
    primary: 'Standup',
    secondary: '6 turns · $0.07',
  },
  {
    id: 'e3',
    startedAt: NOW_MS - 60_000,
    isLive: true,
    kind: 'session',
    primary: 'Morpheus',
    secondary: '4 turns · live',
  },
  {
    id: 'e4',
    startedAt: NOW_MS - 30 * 60 * 1000,
    endedAt: NOW_MS - 29 * 60 * 1000,
    kind: 'error',
    primary: 'Connection dropped',
    secondary: 'TLS handshake failed',
  },
];

export const SAMPLE_MARKS: ScrubMark[] = [
  { id: 'm1', positionPct: 18, kind: 'turn', label: 'User: hi' },
  { id: 'm2', positionPct: 35, kind: 'tool', label: 'cancel_event' },
  { id: 'm3', positionPct: 62, kind: 'barge', label: 'barge-in' },
  { id: 'm4', positionPct: 84, kind: 'error', label: 'mic dropout' },
];

export const SHELL_RAIL_MAIN: ShellRailItem[] = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/inbox', label: 'Inbox', icon: Inbox },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/people', label: 'People', icon: Users },
];

export const SHELL_RAIL_UTIL: ShellRailItem[] = [
  { to: '/notifications', label: 'Alerts', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const SHELL_NAV_ITEMS: ShellNavItem[] = [
  { to: '/inbox', label: 'Inbox', description: '12 unread', icon: Inbox, shortcut: 'I' },
  { to: '/sent', label: 'Sent', icon: Calendar },
  { to: '/archive', label: 'Archive', icon: Settings, shortcut: 'A' },
];

export const SHELL_MODULE: ShellModuleDefinition = {
  id: 'mail',
  label: 'Mail',
  description: 'Inbox and threads',
  items: SHELL_NAV_ITEMS,
};

export const SHELL_PANELS: ShellPanelDefinition[] = [
  { id: 'details', label: 'Details', icon: Inbox },
  { id: 'history', label: 'History', icon: Calendar },
];

export const SHELL_TABS: ShellTab[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'flagged', label: 'Flagged' },
];
