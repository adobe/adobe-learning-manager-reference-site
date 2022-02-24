
export function getALMObject() {
    return (window as any).alm;
}

export function setALMKeyValue(key: string, value: any) {
    if (!(window as any).alm) { (window as any).alm = {} }
    (window as any).alm[key] = value
}

export function getALMKeyValue(key: string) {
    return (window as any).alm[key];
}