export interface MedaRecipeFile {
    path: string;
    target: string;
    type: 'registry:block' | 'registry:component' | 'registry:hook' | 'registry:lib';
    content: string;
}
export interface MedaRecipe {
    name: string;
    title: string;
    description: string;
    dependencies: string[];
    peerDependencies: string[];
    cssVars: string[];
    files: MedaRecipeFile[];
    accessibility: string[];
    composition: string[];
}
export declare const nextAppShellRecipe: {
    name: string;
    title: string;
    description: string;
    dependencies: string[];
    peerDependencies: string[];
    cssVars: string[];
    files: {
        path: string;
        target: string;
        type: "registry:block";
        content: string;
    }[];
    accessibility: string[];
    composition: string[];
};
export declare const nextRecipes: {
    name: string;
    title: string;
    description: string;
    dependencies: string[];
    peerDependencies: string[];
    cssVars: string[];
    files: {
        path: string;
        target: string;
        type: "registry:block";
        content: string;
    }[];
    accessibility: string[];
    composition: string[];
}[];
