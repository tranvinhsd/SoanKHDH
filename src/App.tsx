import React, { useState, useEffect } from 'react';
import { Grade, ModuleType, SourceDocument, SourceLockSettings } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HomeDashboard } from './components/HomeDashboard';
import { PPCTModule } from './components/modules/PPCTModule';
import { LessonPlan5512Module } from './components/modules/LessonPlan5512Module';
import { WorksheetModule } from './components/modules/WorksheetModule';
import { ReviewOutlineModule } from './components/modules/ReviewOutlineModule';
import { Exam7991Wizard } from './components/modules/Exam7991Wizard';
import { DocumentManager } from './components/DocumentManager';
import { HistoryView } from './components/modules/HistoryView';
import { SettingsView } from './components/modules/SettingsView';
import {
  loadDocuments,
  saveDocuments,
  clearAllDocuments,
  loadSettings,
  saveSettings,
  getSavedGrade,
  saveGrade,
  SAMPLE_SOURCE_DOCUMENTS,
} from './services/storageService';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('home');
  // Load persisted grade, documents, and settings from computer cache
  const [grade, setGrade] = useState<Grade>(() => getSavedGrade());
  const [sourceDocs, setSourceDocs] = useState<SourceDocument[]>(() => loadDocuments());
  const [settings, setSettings] = useState<SourceLockSettings>(() => loadSettings());

  // Automatically persist documents whenever they change
  const handleDocumentsChange = (updatedDocs: SourceDocument[]) => {
    setSourceDocs(updatedDocs);
    saveDocuments(updatedDocs);
  };

  const handleGradeChange = (newGrade: Grade) => {
    setGrade(newGrade);
    saveGrade(newGrade);
  };

  const handleToggleSourceLock = () => {
    const updated = { ...settings, sourceLock: !settings.sourceLock };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleUpdateSettings = (newSettings: SourceLockSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleClearAllDocs = () => {
    clearAllDocuments();
    setSourceDocs([]);
  };

  const handleLoadSamples = () => {
    const samples = SAMPLE_SOURCE_DOCUMENTS;
    handleDocumentsChange(samples);
  };

  const handleLoadWorkspace = (id: string, type: ModuleType) => {
    setActiveModule(type);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Main Navigation */}
      <Header
        grade={grade}
        onGradeChange={handleGradeChange}
        settings={settings}
        onToggleSourceLock={handleToggleSourceLock}
        onOpenDocuments={() => setActiveModule('documents')}
        documentCount={sourceDocs.length}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 lg:px-6 py-6 gap-6">
        {/* Left Sticky Sidebar */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={(mod) => setActiveModule(mod)}
          grade={grade}
          documentCount={sourceDocs.length}
          sourceLockActive={settings.sourceLock}
        />

        {/* Right Dynamic Content Workspace */}
        <main className="flex-1 min-w-0">
          {activeModule === 'home' && (
            <HomeDashboard
              onSelectModule={(mod) => setActiveModule(mod)}
              grade={grade}
              documentCount={sourceDocs.length}
            />
          )}

          {activeModule === 'ppct' && (
            <PPCTModule
              currentGrade={grade}
              sourceDocs={sourceDocs}
              settings={settings}
            />
          )}

          {activeModule === 'lesson-plan-5512' && (
            <LessonPlan5512Module
              currentGrade={grade}
              sourceDocs={sourceDocs}
              settings={settings}
            />
          )}

          {activeModule === 'worksheet' && (
            <WorksheetModule
              currentGrade={grade}
              sourceDocs={sourceDocs}
              settings={settings}
            />
          )}

          {activeModule === 'review-outline' && (
            <ReviewOutlineModule
              currentGrade={grade}
              sourceDocs={sourceDocs}
              settings={settings}
            />
          )}

          {activeModule === 'exam-7991' && (
            <Exam7991Wizard
              currentGrade={grade}
              sourceDocs={sourceDocs}
              settings={settings}
            />
          )}

          {activeModule === 'documents' && (
            <DocumentManager
              documents={sourceDocs}
              onAddDocument={(doc) => {
                const list = sourceDocs.filter((d) => d.id !== doc.id);
                const updated = [doc, ...list];
                handleDocumentsChange(updated);
              }}
              onRemoveDocument={(id) => {
                const updated = sourceDocs.filter((d) => d.id !== id);
                handleDocumentsChange(updated);
              }}
              onClearAll={handleClearAllDocs}
              onLoadSamples={handleLoadSamples}
              settings={settings}
            />
          )}

          {activeModule === 'history' && (
            <HistoryView onLoadWorkspace={handleLoadWorkspace} />
          )}

          {activeModule === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onClearAllDocs={handleClearAllDocs}
              onReloadDocs={(docs) => setSourceDocs(docs)}
              documentCount={sourceDocs.length}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <p>
          TRỢ LÝ AI GIÁO VIÊN KHOA HỌC TỰ NHIÊN THCS • Tuân thủ chuẩn mực Công văn 5512/BGDĐT & Công văn 7991/BGDĐT
        </p>
      </footer>
    </div>
  );
}
