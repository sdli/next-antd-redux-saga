/// <reference types="next" />
/// <reference types="next/types/global" />


declare module '*.svg' {
    const svg: any;
    export default svg;
}

declare module "*.less"{
    const less: any;
    export default less;
}

declare module "*.css"{
    const css: any;
    export default css;
}

declare module "*.less?local"{
    const content: { [className: string]: string };
    export default content;
}