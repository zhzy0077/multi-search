import type { Component } from 'solid-js';
import { createSignal, Show, onMount, createEffect } from 'solid-js';
import type { Engine, Profile } from './types';
import IframesGrid from './components/IframesGrid';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';
import { AiOutlineSetting } from 'solid-icons/ai';
import { HiOutlineInformationCircle } from 'solid-icons/hi';

const initialEngines: Engine[] = [
  { id: 'ddg-lite', name: 'DuckDuckGo Lite', urlTemplate: 'https://lite.duckduckgo.com/lite?q={q}' },
  { id: 'google', name: 'Google', urlTemplate: 'https://www.google.com/search?q={q}' },
  { id: 'bing', name: 'Bing', urlTemplate: 'https://www.bing.com/search?q={q}' },
  { id: 'brave', name: 'Brave', urlTemplate: 'https://search.brave.com/search?q={q}' },
];

const initialProfiles: Profile[] = [
  { id: 'p1', name: 'Profile 1', engines: initialEngines },
  { id: 'p2', name: 'Profile 2', engines: [initialEngines[0], initialEngines[3]] },
  { id: 'p3', name: 'Profile 3', engines: [initialEngines[1], initialEngines[2]] },
];

const App: Component = () => {
  const [query, setQuery] = createSignal('');
  const [submitted, setSubmitted] = createSignal('');
  const [profiles, setProfiles] = createSignal<Profile[]>(initialProfiles);
  const [selectedProfileId, setSelectedProfileId] = createSignal<string>(initialProfiles[0].id);
  const [showSettings, setShowSettings] = createSignal(false);
  const [showAbout, setShowAbout] = createSignal(false);

  const PROFILES_KEY = 'multi-search.profiles';
  const SELECTED_KEY = 'multi-search.selectedProfile';

  onMount(() => {
    try {
      const profilesRaw = localStorage.getItem(PROFILES_KEY);
      if (profilesRaw) {
        const parsed = JSON.parse(profilesRaw) as Profile[];
        if (Array.isArray(parsed) && parsed.length) {
          setProfiles(
            parsed
              .filter((p) => p && typeof p.id === 'string' && typeof p.name === 'string' && Array.isArray((p as any).engines))
              .map((p) => ({
                id: p.id,
                name: p.name,
                engines: (p.engines || []).filter(
                  (e: any) => e && typeof e.id === 'string' && typeof e.name === 'string' && typeof e.urlTemplate === 'string',
                ),
                minWidth: typeof (p as any).minWidth === 'number' ? (p as any).minWidth : undefined,
                minHeight: typeof (p as any).minHeight === 'number' ? (p as any).minHeight : undefined,
              })),
          );
        }
      }

      const selectedRaw = localStorage.getItem(SELECTED_KEY);
      if (selectedRaw) setSelectedProfileId(selectedRaw);

    } catch { }
  });

  createEffect(() => {
    try {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles()));
      localStorage.setItem(SELECTED_KEY, selectedProfileId());
    } catch { }
  });

  const selectedProfile = () => profiles().find((p) => p.id === selectedProfileId()) || profiles()[0];

  const onSubmit = (e: Event) => {
    e.preventDefault();
    setSubmitted(query().trim());
  };

  const removeEngineFrom = (profileId: string, id: string) => {
    setProfiles((prev) => prev.map((p) => (p.id === profileId ? { ...p, engines: p.engines.filter((e) => e.id !== id) } : p)));
  };

  const updateEngineIn = (profileId: string, id: string, patch: Partial<Engine>) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, engines: p.engines.map((e) => (e.id === id ? { ...e, ...patch } : e)) } : p)),
    );
  };

  const addEngineTo = (profileId: string) => {
    const id = `eng-${Date.now()}`;
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === profileId
          ? { ...p, engines: [...p.engines, { id, name: 'New Engine', urlTemplate: 'https://example.com/search?q={q}' }] }
          : p,
      ),
    );
  };

  const renameProfile = (profileId: string, name: string) => {
    setProfiles((prev) => prev.map((p) => (p.id === profileId ? { ...p, name } : p)));
  };

  const exportConfig = () => {
    const data = {
      profiles: profiles(),
      selectedProfileId: selectedProfileId(),
      version: 1,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'multi-search-config.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const importConfig = (config: unknown) => {
    try {
      const obj = config as any;
      if (!obj || !Array.isArray(obj.profiles)) return;
      const importedProfiles: Profile[] = obj.profiles
        .filter((p: any) => p && typeof p.id === 'string' && typeof p.name === 'string' && Array.isArray(p.engines))
        .map((p: any) => ({
          id: p.id,
          name: p.name,
          engines: (p.engines || []).filter(
            (e: any) => e && typeof e.id === 'string' && typeof e.name === 'string' && typeof e.urlTemplate === 'string',
          ),
        }));
      if (!importedProfiles.length) return;
      setProfiles(importedProfiles);
      if (typeof obj.selectedProfileId === 'string' && importedProfiles.some((p) => p.id === obj.selectedProfileId)) {
        setSelectedProfileId(obj.selectedProfileId);
      } else {
        setSelectedProfileId(importedProfiles[0].id);
      }
    } catch {
      // ignore invalid
    }
  };

  return (
    <div class="min-h-screen flex flex-col">
      <form onSubmit={onSubmit} class="p-3 border-b flex items-center gap-2">
        <div class="flex items-center gap-2">
          {profiles().map((p) => (
            <label
              class={`cursor-pointer px-3 py-1 rounded border text-sm select-none ${selectedProfileId() === p.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white hover:bg-gray-50'
                }`}
              title={p.name}
            >
              <input
                type="radio"
                name="profile"
                value={p.id}
                checked={selectedProfileId() === p.id}
                onChange={() => setSelectedProfileId(p.id)}
                class="sr-only"
              />
              {p.name}
            </label>
          ))}
        </div>
        <input
          type="text"
          placeholder="Enter search query"
          value={query()}
          onInput={(e) => setQuery(e.currentTarget.value)}
          class="flex-1 px-3 py-2 border rounded outline-none focus:ring"
        />
        {/* per-profile min sizes moved into Settings */}
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">
          Search
        </button>
        <button
          type="button"
          class="px-2 py-2 border rounded"
          title="Settings"
          onClick={() => setShowSettings(true)}
          aria-label="Open settings"
        >
          <AiOutlineSetting size={18} />
        </button>
        <button
          type="button"
          class="px-2 py-2 border rounded"
          title="About"
          onClick={() => setShowAbout(true)}
          aria-label="Open about"
        >
          <HiOutlineInformationCircle size={18} />
        </button>
      </form>

      <IframesGrid
        engines={selectedProfile().engines}
        query={submitted()}
        onRemove={(id) => removeEngineFrom(selectedProfileId(), id)}
        minWidth={Math.max(100, selectedProfile().minWidth ?? 500)}
        minHeight={Math.max(100, selectedProfile().minHeight ?? 500)}
      />

      <Show when={showSettings()}>
        <SettingsModal
          profiles={profiles()}
          initialActiveProfileId={selectedProfileId()}
          onClose={() => setShowSettings(false)}
          onAdd={(profileId) => addEngineTo(profileId)}
          onUpdate={(profileId, id, patch) => updateEngineIn(profileId, id, patch)}
          onRemove={(profileId, id) => removeEngineFrom(profileId, id)}
          onRename={(profileId, name) => renameProfile(profileId, name)}
          onExport={exportConfig}
          onImport={importConfig}
          onUpdateProfile={(profileId, patch) =>
            setProfiles((prev) => prev.map((p) => (p.id === profileId ? { ...p, ...patch } : p)))
          }
        />
      </Show>
      <Show when={showAbout()}>
        <AboutModal onClose={() => setShowAbout(false)} />
      </Show>
    </div>
  );
};

export default App;
