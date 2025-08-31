export type Engine = {
    id: string;
    name: string;
    urlTemplate: string; // use {q} as placeholder
};

export type Profile = {
    id: string;
    name: string;
    engines: Engine[];
    minWidth?: number;
    minHeight?: number;
};
