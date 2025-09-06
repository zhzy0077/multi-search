import { For, createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import type { Engine } from '../types';

export type IframesGridProps = {
    engines: Engine[];
    query: string; // submitted query
    onHide: (id: string) => void; // hide for current search session only
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
    let gridEl: HTMLDivElement | undefined;
    const [tileHeight, setTileHeight] = createSignal(props.minHeight);

    const recalc = () => {
        if (!gridEl) {
            setTileHeight(props.minHeight);
            return;
        }
        const tiles = Array.from(gridEl.querySelectorAll<HTMLDivElement>('[data-tile="1"]'));
        if (!tiles.length) {
            setTileHeight(props.minHeight);
            return;
        }
        const tops = new Set(tiles.map(t => t.offsetTop));
        const singleRow = tops.size === 1;

        if (!singleRow) {
            setTileHeight(props.minHeight);
            return;
        }

        const gridRect = gridEl.getBoundingClientRect();
        const available = Math.max(0, window.innerHeight - gridRect.top - 12);
        const headerEl = tiles[0].querySelector<HTMLElement>('[data-header="1"]');
        const headerH = headerEl?.offsetHeight ?? 32;
        const computed = Math.max(props.minHeight, Math.floor(available - headerH - 8));
        setTileHeight(computed);
    };

    onMount(() => {
        recalc();
        const onResize = () => recalc();
        window.addEventListener('resize', onResize);
        onCleanup(() => window.removeEventListener('resize', onResize));
    });

    createEffect(() => {
        // react when engines count or minHeight changes
        void props.engines.length;
        void props.minHeight;
        requestAnimationFrame(recalc);
    });

    return (
        <div ref={gridEl} class="px-3 pt-3 flex flex-wrap gap-3">
            <For each={props.engines}>
                {(engine) => (
                    <div
                        class="border rounded overflow-hidden"
                        style={{
                            flex: `1 1 ${props.minWidth}px`,
                            'min-width': `${props.minWidth}px`,
                        }}
                        data-tile="1"
                    >
                        <div class="flex items-center justify-between px-2 py-1 border-b bg-gray-50" data-header="1">
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
                                onClick={() => props.onHide(engine.id)}
                                aria-label={`Hide ${engine.name} for this search`}
                            >
                                Hide
                            </button>
                        </div>
                        <iframe
                            title={engine.name}
                            src={buildUrl(engine.urlTemplate, props.query)}
                            class="w-full bg-white"
                            style={{ height: `${tileHeight()}px` }}
                        />
                    </div>
                )}
            </For>
        </div>
    );
}

export default IframesGrid;
