export const createClassWithName = (function () {
    let classesSupported = false;
    try {
        Function('class Test{};')();
        classesSupported = true;
    } catch (e) {
    }

    if (classesSupported)
        return function createClassWithName(name: string, actualConstructor: (...args: any[]) => void, ext?: Function) {
            if (ext)
                return Function('Parent', 'ConstructorFnc', 'return class ' + name + ' extends Parent { constructor(...args){ super(); ConstructorFnc.apply(this, args); } };')(ext, actualConstructor);
            else
                return Function('ConstructorFnc', 'return class ' + name + '{ constructor(...args) { ConstructorFnc.apply(this, args);} };')(actualConstructor);
        };
    else
        return function createClassWithName(name: string, actualConstructor: (...args: any[]) => void, ext?: Function) {
            if (ext)
                return Function('Parent', 'ConstructorFnc', 'function ' + name + ' (...args){ Parent.call(this); ConstructorFnc.apply(this, args); }; ' + name + '.prototype = Object.create(Parent.prototype); ' + name + '.prototype.constructor = ' + name + '; return ' + name + ';')(ext, actualConstructor);
            else
                return Function('ConstructorFnc', 'return function ' + name + ' (...args){ ConstructorFnc.apply(this, args); };')(actualConstructor);
        };
})();