import { For, createSignal, Show, createEffect } from 'solid-js';
import type { Engine, Profile } from '../types';

export type SettingsModalProps = {
    profiles: Profile[];
    initialActiveProfileId?: string;
    onClose: () => void;
    onAdd: (profileId: string) => void;
    onUpdate: (profileId: string, id: string, patch: Partial<Engine>) => void;
    onRemove: (profileId: string, id: string) => void;
    onRename: (profileId: string, name: string) => void;
    onExport: () => void;
    onImport: (config: unknown) => void;
    onUpdateProfile: (profileId: string, patch: Partial<Profile>) => void;
};

export function SettingsModal(props: SettingsModalProps) {
    const firstId = () => props.initialActiveProfileId || props.profiles[0]?.id || '';
    const [activeId, setActiveId] = createSignal(firstId());
    // Draft sizing so user can type numbers like 400 without early clamping back to 100
    const [draftMinWidth, setDraftMinWidth] = createSignal('');
    const [draftMinHeight, setDraftMinHeight] = createSignal('');

    // Sync drafts when active profile changes or profiles list updates
    createEffect(() => {
        const ap = props.profiles.find((p) => p.id === activeId());
        if (ap) {
            setDraftMinWidth(String(ap.minWidth ?? 500));
            setDraftMinHeight(String(ap.minHeight ?? 500));
        }
    });

    const activeProfile = () => props.profiles.find((p) => p.id === activeId()) || props.profiles[0];

    return (
        <div class="fixed inset-0 bg-black/40 flex items-center justify-center p-4" onClick={props.onClose}>
            <div class="w-full max-w-3xl bg-white rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div class="flex items-center justify-between px-4 py-3 border-b">
                    <h2 class="font-semibold">Search Engines</h2>
                    <div class="flex items-center gap-2">
                        <button type="button" class="text-sm px-2 py-1 border rounded" onClick={props.onExport}>
                            Export
                        </button>
                        <label class="text-sm px-2 py-1 border rounded cursor-pointer">
                            Import
                            <input
                                type="file"
                                accept="application/json,.json"
                                class="hidden"
                                onChange={async (e) => {
                                    const file = e.currentTarget.files && e.currentTarget.files[0];
                                    if (!file) return;
                                    try {
                                        const text = await file.text();
                                        const parsed = JSON.parse(text);
                                        props.onImport(parsed);
                                    } catch {
                                        // ignore invalid files
                                    } finally {
                                        e.currentTarget.value = '';
                                    }
                                }}
                            />
                        </label>
                        <button
                            type="button"
                            class="text-sm px-2 py-1 border rounded"
                            onClick={props.onClose}
                            aria-label="Close settings"
                        >
                            Close
                        </button>
                    </div>
                </div>
                <div class="px-4 py-2 border-b flex gap-2 overflow-x-auto">
                    <For each={props.profiles}>
                        {(p) => (
                            <button
                                type="button"
                                class={`px-3 py-1 rounded border ${activeId() === p.id ? 'bg-blue-600 text-white' : ''}`}
                                onClick={() => setActiveId(p.id)}
                                aria-pressed={activeId() === p.id}
                            >
                                {p.name}
                            </button>
                        )}
                    </For>
                </div>
                <div class="p-4 space-y-3 max-h-[60vh] overflow-auto">
                    <Show when={activeProfile()}>
                        <div class="flex items-center gap-2">
                            <label class="text-sm w-28">Profile name</label>
                            <input
                                class="flex-1 px-2 py-1 border rounded"
                                value={activeProfile()!.name}
                                // Use onChange so typing doesn't continuously update all dependent components
                                onChange={(e) => props.onRename(activeId(), e.currentTarget.value)}
                            />
                        </div>
                        <div class="flex items-center gap-4">
                            <label class="flex items-center gap-2 text-sm">
                                Min width
                                <input
                                    type="number"
                                    min="100"
                                    class="w-24 px-2 py-1 border rounded"
                                    value={draftMinWidth()}
                                    onInput={(e) => setDraftMinWidth(e.currentTarget.value)}
                                    onBlur={() => {
                                        const raw = parseInt(draftMinWidth() || '0', 10);
                                        const clamped = isFinite(raw) ? Math.max(100, raw) : 100;
                                        props.onUpdateProfile(activeId(), { minWidth: clamped });
                                        setDraftMinWidth(String(clamped));
                                    }}
                                />
                            </label>
                            <label class="flex items-center gap-2 text-sm">
                                Min height
                                <input
                                    type="number"
                                    min="100"
                                    class="w-24 px-2 py-1 border rounded"
                                    value={draftMinHeight()}
                                    onInput={(e) => setDraftMinHeight(e.currentTarget.value)}
                                    onBlur={() => {
                                        const raw = parseInt(draftMinHeight() || '0', 10);
                                        const clamped = isFinite(raw) ? Math.max(100, raw) : 100;
                                        props.onUpdateProfile(activeId(), { minHeight: clamped });
                                        setDraftMinHeight(String(clamped));
                                    }}
                                />
                            </label>
                        </div>
                        <For each={activeProfile()?.engines || []}>
                            {(engine) => (
                                <div class="border rounded p-3 space-y-2">
                                    <div class="flex items-center gap-2">
                                        <label class="text-sm w-16">Name</label>
                                        <input
                                            class="flex-1 px-2 py-1 border rounded"
                                            value={engine.name}
                                            // Defer updates until change commit to prevent iframe grid re-renders on each keystroke
                                            onChange={(e) => props.onUpdate(activeId(), engine.id, { name: e.currentTarget.value })}
                                        />
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <label class="text-sm w-16">URL</label>
                                        <input
                                            class="flex-1 px-2 py-1 border rounded"
                                            value={engine.urlTemplate}
                                            placeholder="Use {q} for the query"
                                            // Use onChange instead of onInput so we don't re-render & reload iframes on every keystroke
                                            // (which caused the window/iframes to constantly reload and the input to lose focus).
                                            onChange={(e) => props.onUpdate(activeId(), engine.id, { urlTemplate: e.currentTarget.value })}
                                        />
                                    </div>
                                    <div class="flex justify-end">
                                        <button
                                            type="button"
                                            class="text-sm text-red-600 hover:underline"
                                            onClick={() => props.onRemove(activeId(), engine.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </For>
                        <div>
                            <button type="button" class="px-3 py-1 border rounded" onClick={() => props.onAdd(activeId())}>
                                Add engine
                            </button>
                        </div>
                    </Show>
                </div>
            </div>
        </div>
    );
}

export default SettingsModal;
