import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Filter, BrainCircuit, Rows3, PanelLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { AIChat } from '@/components/ai-chat';
import { useSidebar, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
const BTN_SQUARE = "size-10 aspect-square p-0 rounded-md grid place-items-center";

interface AppSidebarProps {
  onFileImport: (file: File) => void;
  workspace: 'raw' | 'clustered' | 'filtered';
  onWorkspaceChange: (value: 'raw' | 'clustered' | 'filtered') => void;
  filterTerm: string;
  onFilterChange: (value: string) => void;
  activeLogContent: string;
  onHighlightLines: (lines: number[]) => void;
  hasLogs: boolean;
}

export default function AppSidebar({
  onFileImport,
  workspace,
  onWorkspaceChange,
  filterTerm,
  onFilterChange,
  activeLogContent,
  onHighlightLines,
  hasLogs,
}: AppSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state, toggleSidebar } = useSidebar();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileImport(event.target.files[0]);
      event.target.value = ''; // Reset for same-file uploads
    }
  };

  return (
    <>
      <SidebarHeader>
        <div
          className={`flex w-full items-center ${
            state === "collapsed" ? "justify-center" : "justify-between"
          }`}
        >
          {state !== "collapsed" && <h2 className="text-lg font-semibold">Controls</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={BTN_SQUARE}
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="size-6" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-0 pt-0 flex flex-col gap-6">
        <div className={state === "collapsed" ? "flex justify-center px-0" : "px-4"}>
          {state === "collapsed" ? (
            <Button
              variant="default"
              size="icon"
              onClick={handleFileSelect}
              className={`${BTN_SQUARE} h-9 w-9`}
              aria-label="Import log"
            >
              <Upload className="size-5" />
            </Button>
          ) : (
            <Button onClick={handleFileSelect} className="w-full">
              <Upload className="mr-2 size-5" />
              Import Log
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".log,.txt,.*"
            onChange={handleFileChange}
          />
        </div>
     

        {hasLogs && (
            <>
                <Separator />
                <div className={`px-4 ${state === 'collapsed' ? 'hidden' : ''}`}>
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">Workspace</Label>
                    <RadioGroup value={workspace} onValueChange={onWorkspaceChange as (value: string) => void}>
                        <div className="flex items-center space-x-2">
                        <RadioGroupItem value="raw" id="r1" />
                        <Label htmlFor="r1" className="font-normal flex items-center gap-2"><Rows3 size={20}/> Raw</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                        <RadioGroupItem value="clustered" id="r2" />
                        <Label htmlFor="r2" className="font-normal flex items-center gap-2"><Filter size={20}/> Clustered</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                        <RadioGroupItem value="filtered" id="r3" />
                        <Label htmlFor="r3" className="font-normal flex items-center gap-2"><BrainCircuit size={20}/> Filtered</Label>
                        </div>
                    </RadioGroup>
                </div>
                
                <div className={`px-4 ${state === 'expanded' ? '' : 'hidden'}`}>
                    <Label htmlFor="search" className="text-sm font-medium text-muted-foreground">Search & Filter</Label>
                    <Input
                    id="search"
                    placeholder="Filter logs..."
                    value={filterTerm}
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="mt-2"
                    />
                </div>
            </>
        )}
      </SidebarContent>
      {hasLogs && (
        <>
            <Separator className="my-2"/>
            <SidebarFooter className={`p-4 pt-0 mt-auto flex-grow-0 flex-shrink-0 basis-1/3 min-h-0 ${state === 'collapsed' ? 'hidden' : ''}`}>
                <AIChat activeLogContent={activeLogContent} onHighlightLines={onHighlightLines}/>
            </SidebarFooter>
        </>
      )}
    </>
  );
}
