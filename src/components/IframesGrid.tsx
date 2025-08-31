import { For } from 'solid-js';
import type { Engine } from '../types';

export type IframesGridProps = {
    engines: Engine[];
    query: string; // submitted query
    onRemove: (id: string) => void;
    minWidth: number;
    minHeight: number;
};

const buildUrl = (tpl: string, q: string) => {
    if (!tpl) return '';
    if (!q) return tpl.replaceAll('{q}', '');
    if (tpl.includes('{q}')) return tpl.replaceAll('{q}', encodeURIComponent(q));
    const sep = tpl.includes('?') ? '&' : '?';
    return `${tpl}${sep}q=${encodeURIComponent(q)}`;
};

export function IframesGrid(props: IframesGridProps) {
    return (
        <div class="p-3 flex flex-wrap gap-3">
            <For each={props.engines}>
                {(engine) => (
                    <div
                        class="border rounded overflow-hidden"
                        style={{
                            flex: `1 1 ${props.minWidth}px`,
                            'min-width': `${props.minWidth}px`,
                        }}
                    >
                        <div class="flex items-center justify-between px-2 py-1 border-b bg-gray-50">
                            <a
                                href={buildUrl(engine.urlTemplate, props.query)}
                                target="_blank"
                                rel="noreferrer noopener"
                                class="text-sm font-medium truncate hover:underline"
                                title="Open in new tab"
                            >
                                {engine.name}
                            </a>
                            <button
                                type="button"
                                class="text-xs text-red-600 hover:underline"
                                onClick={() => props.onRemove(engine.id)}
                                aria-label={`Remove ${engine.name}`}
                            >
                                Remove
                            </button>
                        </div>
                        <iframe
                            title={engine.name}
                            src={buildUrl(engine.urlTemplate, props.query)}
                            class="w-full bg-white"
                            style={{ height: `${props.minHeight}px` }}
                        />
                    </div>
                )}
            </For>
        </div>
    );
}

export default IframesGrid;
