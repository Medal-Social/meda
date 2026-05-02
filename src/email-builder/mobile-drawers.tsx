'use client';

import type { ReactNode } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../components/ui/drawer.js';

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}

/** Generic bottom-sheet drawer used for the mobile palette/inspector. */
export function MobileDrawer({ open, onOpenChange, title, children }: MobileDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="max-h-[70vh] overflow-y-auto px-4 pb-6">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
