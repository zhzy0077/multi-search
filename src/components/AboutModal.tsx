export type AboutModalProps = {
    onClose: () => void;
};

export function AboutModal(props: AboutModalProps) {
    return (
        <div class="fixed inset-0 bg-black/40 flex items-center justify-center p-4" onClick={props.onClose}>
            <div class="w-full max-w-lg bg-white rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div class="flex items-center justify-between px-4 py-3 border-b">
                    <h2 class="font-semibold">About</h2>
                    <button type="button" class="text-sm px-2 py-1 border rounded" onClick={props.onClose}>
                        Close
                    </button>
                </div>
                <div class="p-4 space-y-3">
                    <p class="text-sm">
                        Many search engines block embedding via iframes. To view results here, install a browser
                        extension that ignores X-Frame headers:
                    </p>
                    <ul class="list-disc pl-5 text-sm space-y-1">
                        <li>
                            <a
                                href="https://chromewebstore.google.com/detail/ignore-x-frame-headers/ohgdnhkppgeemnmjebhedjneajcedppf"
                                target="_blank"
                                rel="noreferrer noopener"
                                class="text-blue-600 hover:underline"
                            >
                                Chrome: Ignore X-Frame headers
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://addons.mozilla.org/firefox/addon/ignore-x-frame-options-header/"
                                target="_blank"
                                rel="noreferrer noopener"
                                class="text-blue-600 hover:underline"
                            >
                                Firefox: Ignore X-Frame-Options Header
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default AboutModal;
